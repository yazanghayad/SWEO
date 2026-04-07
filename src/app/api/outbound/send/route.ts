import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import { sendCampaign } from '@/lib/outbound/campaign-sender';
import { logger } from '@/lib/logger';
import type { OutboundMessage, Tenant } from '@/types/appwrite';

/**
 * POST /api/outbound/send — Send or schedule an outbound campaign.
 *
 * Body: { messageId: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const { account } = await createSessionClient();
    const user = await account.get();
    const { databases } = createAdminClient();

    // Find tenant
    const tenants = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );
    if (tenants.documents.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    const tenantId = tenants.documents[0].$id;

    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const message = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );
    if (message.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check schedule
    const schedule = JSON.parse(message.schedule);

    if (schedule.type === 'scheduled' && schedule.sendAt) {
      const sendAt = new Date(schedule.sendAt);
      if (sendAt > new Date()) {
        // Future schedule — just mark as active (cron will pick it up)
        await databases.updateDocument(
          APPWRITE_DATABASE,
          COLLECTION.OUTBOUND_MESSAGES,
          messageId,
          { status: 'active' }
        );
        return NextResponse.json({
          success: true,
          scheduled: true,
          sendAt: schedule.sendAt
        });
      }
    }

    // Send immediately
    const result = await sendCampaign(messageId);

    return NextResponse.json({
      success: true,
      scheduled: false,
      result: {
        sent: result.sent,
        failed: result.failed,
        totalRecipients: result.totalRecipients
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Send failed';
    logger.error('Outbound send failed', { err });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
