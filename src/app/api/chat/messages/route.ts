import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Tenant, Message } from '@/types/appwrite';
import { Query } from 'node-appwrite';
import { findTenantByPreviousApiKey } from '@/lib/widget/previous-key-lookup';
import { chatMessagesQuerySchema, formatZodError } from '@/lib/api-schemas';
import { corsHeaders, handlePreflight } from '@/lib/cors';
import {
  CONVERSATION_EVENTS,
  toWidgetConversationStatus
} from '@/lib/conversation/contracts';

/**
 * GET /api/chat/messages?conversationId=xxx&after=ISO-timestamp
 *
 * Public endpoint for the embeddable widget to poll for new messages
 * (e.g. agent replies from the inbox). Authenticated via Bearer API key.
 *
 * Query params:
 *   conversationId - required
 *   after          - optional ISO timestamp; only returns messages created after this time
 *
 * Returns:
 *   { messages: Array<{ id, role, content, createdAt, confidence }> }
 */
export async function GET(request: NextRequest) {
  // ── Authenticate via API key ──────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json(
      { error: 'Missing or invalid Authorization header' },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey) {
    return Response.json({ error: 'API key is required' }, { status: 401 });
  }

  let tenant: Tenant;
  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('apiKey', apiKey), Query.limit(1)]
    );

    if (result.documents.length === 0) {
      // Grace-period check for rotated keys using indexed field
      const match = await findTenantByPreviousApiKey(apiKey);

      if (!match) {
        return Response.json({ error: 'Invalid API key' }, { status: 401 });
      }
      tenant = match;
    } else {
      tenant = result.documents[0];
    }
  } catch {
    return Response.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }

  // ── Parse query params ────────────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const parsedParams = chatMessagesQuerySchema.safeParse({
    conversationId: searchParams.get('conversationId'),
    after: searchParams.get('after') ?? undefined
  });
  if (!parsedParams.success) {
    return Response.json(
      { error: formatZodError(parsedParams.error) },
      { status: 400 }
    );
  }
  const { conversationId, after } = parsedParams.data;

  // ── Verify conversation belongs to this tenant ────────────────────────
  try {
    const { databases } = createAdminClient();
    const conv = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );

    if ((conv as Record<string, unknown>).tenantId !== tenant.$id) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // ── Fetch messages ──────────────────────────────────────────────────
    const queries = [
      Query.equal('conversationId', conversationId),
      Query.orderAsc('$createdAt'),
      Query.limit(50)
    ];

    if (after) {
      queries.push(Query.greaterThan('$createdAt', after));
    }

    const result = await databases.listDocuments<Message>(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      queries
    );

    const messages = result.documents.map((m) => {
      // Parse metadata to extract senderType for the widget
      let meta: Record<string, unknown> = {};
      try {
        meta =
          typeof m.metadata === 'string'
            ? JSON.parse(m.metadata)
            : m.metadata ?? {};
      } catch {
        /* ignore */
      }

      return {
        id: m.$id,
        role: m.role,
        content: m.content,
        createdAt: m.$createdAt,
        confidence: m.confidence,
        senderType: meta.senderType ?? (m.role === 'assistant' ? 'ai' : undefined),
        eventType:
          meta.eventType === CONVERSATION_EVENTS.CLOSED
            ? CONVERSATION_EVENTS.CLOSED
            : undefined
      };
    });

    // Include conversation status so the widget can react to state changes
    const convStatus = toWidgetConversationStatus(
      (conv as Record<string, unknown>).status as string
    );
    const convAssignedTo = (conv as Record<string, unknown>).assignedTo as string | null;

    return Response.json(
      { messages, conversationStatus: convStatus, assignedTo: convAssignedTo },
      { headers: corsHeaders(request) }
    );
  } catch {
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

/** CORS preflight for cross-origin widget polling. */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
