import { NextRequest, NextResponse } from 'next/server';
import { processScheduledCampaigns } from '@/lib/outbound/campaign-sender';
import { safeCompare } from '@/lib/security/timing-safe-compare';
import { logger } from '@/lib/logger';

/**
 * POST /api/outbound/cron — Process scheduled campaigns.
 *
 * Called by an external cron service (e.g., Vercel Cron, Inngest, or a simple
 * setInterval). Protected by a shared secret.
 *
 * Headers: { Authorization: Bearer <CRON_SECRET> }
 */
export async function POST(req: NextRequest) {
  // Verify cron secret using timing-safe comparison
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  if (cronSecret) {
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : '';
    if (!safeCompare(token, cronSecret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const sentIds = await processScheduledCampaigns();

    return NextResponse.json({
      success: true,
      processed: sentIds.length,
      messageIds: sentIds
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cron error';
    logger.error('Outbound cron processing failed', { err });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
