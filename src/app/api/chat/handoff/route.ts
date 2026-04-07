import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Conversation, Message } from '@/types/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateWidgetRequest } from '@/lib/widget/auth';
import { generateHandoffSummary } from '@/lib/ai/summarize';
import { chatHandoffBodySchema, formatZodError } from '@/lib/api-schemas';
import { corsHeaders, handlePreflight } from '@/lib/cors';
import { logAuditEventAsync } from '@/lib/audit/logger';
import { logger } from '@/lib/logger';
import { toWidgetConversationStatus } from '@/lib/conversation/contracts';

function isLegacyStatusEnumError(err: unknown): boolean {
  const msg =
    err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  return (
    msg.includes('Attribute "status" has invalid format') &&
    msg.includes('(active, resolved, escalated)')
  );
}

function parseMeta(metadata: unknown): Record<string, unknown> {
  try {
    return typeof metadata === 'string'
      ? (JSON.parse(metadata) as Record<string, unknown>)
      : ((metadata ?? {}) as Record<string, unknown>);
  } catch {
    return {};
  }
}

function hasQueuedState(metadata: unknown): boolean {
  const meta = parseMeta(metadata);
  const handoff = meta.handoff as Record<string, unknown> | undefined;
  return handoff?.queueState === 'queued';
}

/**
 * POST /api/chat/handoff
 *
 * Customer-initiated handoff to a human agent.
 *
 * 1. Validates the conversation belongs to the authenticated tenant.
 * 2. Generates a structured summary (no full transcript).
 * 3. Transitions conversation to 'queued' status.
 * 4. Saves a system message visible to the customer.
 * 5. Returns the queue position.
 */
export async function POST(request: NextRequest) {
  // Authenticate
  const auth = await authenticateWidgetRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: corsHeaders(request) }
    );
  }
  const { tenant } = auth;

  // Parse body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const parsed = chatHandoffBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const { conversationId, reason } = parsed.data;

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

    // Don't allow handoff if already in human/closed state
    if (
      ['human_active', 'resolved', 'closed', 'queued'].includes(
        conv.status as string
      )
    ) {
      return NextResponse.json(
        {
          error: 'Conversation is already being handled',
          status: toWidgetConversationStatus(conv.status)
        },
        { status: 409, headers: corsHeaders(request) }
      );
    }

    // Load conversation messages for summarization
    const messagesResult = await databases.listDocuments<Message>(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      [
        Query.equal('conversationId', conversationId),
        Query.orderAsc('$createdAt'),
        Query.limit(50)
      ]
    );

    const messagePairs = messagesResult.documents.map((m) => ({
      role: m.role,
      content: m.content
    }));

    // Generate structured summary (async, non-blocking for the response)
    let summary;
    try {
      summary = await generateHandoffSummary(messagePairs, reason);
    } catch (err) {
      logger.error('Summary generation failed, using fallback', { err });
      summary = {
        userIntent: reason ?? 'Customer requested human assistance',
        accountDetails: 'None provided',
        relevantContext: `Conversation with ${messagePairs.length} messages`,
        actionsAttempted: 'AI attempted to assist',
        urgency: 'medium' as const,
        suggestedNextStep: 'Review and respond to customer',
        requestedAt: new Date().toISOString()
      };
    }

    // Update conversation metadata with summary and transition to 'queued'
    const existingMeta =
      typeof conv.metadata === 'string'
        ? JSON.parse(conv.metadata)
        : conv.metadata ?? {};

    const updatedMeta = {
      ...existingMeta,
      handoff: {
        summary,
        reason: reason ?? null,
        queuedAt: new Date().toISOString(),
        queueState: 'queued',
        assignedTo: null,
        assignedAt: null
      }
    };

    let queueStatusStoredAs: 'queued' | 'escalated' = 'queued';
    try {
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.CONVERSATIONS,
        conversationId,
        {
          status: 'queued',
          metadata: JSON.stringify(updatedMeta)
        }
      );
    } catch (err) {
      if (!isLegacyStatusEnumError(err)) throw err;
      queueStatusStoredAs = 'escalated';
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.CONVERSATIONS,
        conversationId,
        {
          status: 'escalated',
          metadata: JSON.stringify(updatedMeta)
        }
      );
    }

    // Save a system message visible to the customer
    await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      ID.unique(),
      {
        conversationId,
        role: 'system',
        content:
          "You've been connected to our support queue. A human agent will be with you shortly.",
        confidence: null,
        citations: JSON.stringify([]),
        metadata: JSON.stringify({ senderType: 'system' })
      }
    );

    // Calculate queue position
    const queuedConvos = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      [
        Query.equal('tenantId', tenant.$id),
        Query.equal('status', queueStatusStoredAs),
        Query.orderAsc('$updatedAt'),
        Query.limit(100)
      ]
    );

    const queueDocs =
      queueStatusStoredAs === 'queued'
        ? queuedConvos.documents
        : queuedConvos.documents.filter((doc) => hasQueuedState(doc.metadata));

    let position = 1;
    for (const doc of queueDocs) {
      if (doc.$id === conversationId) break;
      position++;
    }

    logAuditEventAsync(tenant.$id, 'conversation.handoff_requested', {
      conversationId,
      reason,
      queuePosition: position
    });

    return NextResponse.json(
      {
        success: true,
        conversationId,
        status: 'queued',
        queuePosition: position,
        queueStoredAs: queueStatusStoredAs,
        message:
          "You're in our support queue. A human agent will be with you shortly."
      },
      { headers: corsHeaders(request) }
    );
  } catch (err) {
    logger.error('Handoff request failed', { conversationId, err });
    return NextResponse.json(
      { error: 'Failed to process handoff request' },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

/** CORS preflight */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
