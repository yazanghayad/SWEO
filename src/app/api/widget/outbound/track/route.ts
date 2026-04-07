import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { OutboundMessage } from '@/types/appwrite';
import { authenticateWidgetRequest } from '@/lib/widget/auth';
import { applyIpRateLimit } from '@/lib/rate-limit/middleware';
import { corsHeaders, handlePreflight } from '@/lib/cors';

/**
 * POST /api/widget/outbound/track
 *
 * Records impression, click, or dismiss events for outbound messages.
 * Auth via Bearer API key (same as /api/chat/* endpoints).
 */
export async function POST(request: NextRequest) {
  // Rate limit
  const rl = await applyIpRateLimit(request);
  if (rl) return rl;

  // Auth
  const auth = await authenticateWidgetRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: corsHeaders(request) }
    );
  }

  let body: { messageId?: string; event?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const { messageId, event } = body;
  if (!messageId || !event || !['impression', 'click', 'dismiss'].includes(event)) {
    return NextResponse.json(
      { error: 'messageId and event (impression|click|dismiss) are required' },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  try {
    const { databases } = createAdminClient();

    // Verify message belongs to this tenant
    const doc = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );

    if (doc.tenantId !== auth.tenant.$id) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: corsHeaders(request) }
      );
    }

    // Update counters
    if (event === 'impression') {
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.OUTBOUND_MESSAGES,
        messageId,
        { sentCount: doc.sentCount + 1 }
      );
    } else if (event === 'click') {
      const newClicks = (doc.clickRate || 0) + 1;
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.OUTBOUND_MESSAGES,
        messageId,
        { clickRate: doc.sentCount > 0 ? Math.min(100, (newClicks / doc.sentCount) * 100) : 0 }
      );
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders(request) });
  } catch {
    return NextResponse.json(
      { error: 'Tracking failed' },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

/** CORS preflight */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
