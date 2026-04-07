import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Conversation } from '@/types/appwrite';
import { Query } from 'node-appwrite';
import { authenticateWidgetRequest } from '@/lib/widget/auth';
import { chatQueueStatusQuerySchema, formatZodError } from '@/lib/api-schemas';
import { corsHeaders, handlePreflight } from '@/lib/cors';
import { toWidgetConversationStatus } from '@/lib/conversation/contracts';

function parseMeta(metadata: unknown): Record<string, unknown> {
  try {
    return typeof metadata === 'string'
      ? (JSON.parse(metadata) as Record<string, unknown>)
      : ((metadata ?? {}) as Record<string, unknown>);
  } catch {
    return {};
  }
}

function hasQueuedState(conv: Conversation): boolean {
  const meta = parseMeta(conv.metadata);
  const handoff = meta.handoff as Record<string, unknown> | undefined;
  return handoff?.queueState === 'queued';
}

/**
 * GET /api/chat/queue-status?conversationId=xxx
 *
 * Returns the current queue position and conversation status for the
 * embeddable widget. Polled while the customer waits for a human agent.
 */
export async function GET(request: NextRequest) {
  // Authenticate
  const auth = await authenticateWidgetRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: corsHeaders(request) }
    );
  }
  const { tenant } = auth;

  // Parse query params
  const { searchParams } = new URL(request.url);
  const parsed = chatQueueStatusQuerySchema.safeParse({
    conversationId: searchParams.get('conversationId') ?? undefined
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const { conversationId } = parsed.data;

  try {
    const { databases } = createAdminClient();

    // Verify conversation belongs to tenant
    const conv = await databases.getDocument<Conversation>(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );

    if (conv.tenantId !== tenant.$id) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404, headers: corsHeaders(request) }
      );
    }

    const isQueued =
      conv.status === 'queued' ||
      (conv.status === 'escalated' && hasQueuedState(conv));

    // If not queued, return current status directly
    if (!isQueued) {
      return NextResponse.json(
        {
          conversationId,
          status: toWidgetConversationStatus(conv.status),
          queuePosition: null,
          assignedTo: conv.assignedTo
        },
        { headers: corsHeaders(request) }
      );
    }

    // Calculate queue position
    const queueStoredAs = conv.status === 'queued' ? 'queued' : 'escalated';
    const queuedConvos = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      [
        Query.equal('tenantId', tenant.$id),
        Query.equal('status', queueStoredAs),
        Query.orderAsc('$updatedAt'),
        Query.limit(100)
      ]
    );

    const queueDocs =
      queueStoredAs === 'queued'
        ? queuedConvos.documents
        : queuedConvos.documents.filter((doc) =>
            hasQueuedState(doc as unknown as Conversation)
          );

    let position = 1;
    for (const doc of queueDocs) {
      if (doc.$id === conversationId) break;
      position++;
    }

    return NextResponse.json(
      {
        conversationId,
        status: 'queued',
        queuePosition: position,
        totalInQueue: queueDocs.length
      },
      { headers: corsHeaders(request) }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

/** CORS preflight */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
