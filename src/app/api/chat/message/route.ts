import { NextRequest, NextResponse } from 'next/server';
import { orchestrate } from '@/lib/ai/orchestrator';
import { chatRequestSchema } from '@/features/conversation/schemas';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID, Query } from 'node-appwrite';
import { applyRateLimits } from '@/lib/rate-limit/middleware';
import { sanitizeText } from '@/lib/sanitize';
import { logger } from '@/lib/logger';
import type { Conversation, Tenant } from '@/types/appwrite';
import { findTenantByPreviousApiKey } from '@/lib/widget/previous-key-lookup';
import { toWidgetConversationStatus } from '@/lib/conversation/contracts';
import { apiOk, apiError, apiCatchError } from '@/lib/api-response';

/**
 * POST /api/chat/message
 *
 * Public-facing chat endpoint for the embeddable widget and external
 * integrations. Authenticated via tenant API key (Bearer token).
 *
 * Headers:
 *   Authorization: Bearer <tenant-api-key>
 *
 * Body:
 *   { message: string, conversationId?: string, userId?: string, channel?: 'web' | 'email' }
 */
export async function POST(request: NextRequest) {
  // ── Authenticate via API key ────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return apiError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED');
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey) {
    return apiError('API key is required', 401, 'UNAUTHORIZED');
  }

  // Look up tenant by API key (with grace period for rotated keys)
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
        return apiError('Invalid API key', 401, 'INVALID_API_KEY');
      }
      tenant = match;
    } else {
      tenant = result.documents[0];
    }
  } catch (err) {
    logger.error('Tenant lookup failed', { err });
    return apiCatchError(err, 'Authentication failed');
  }

  // ── Rate limiting ───────────────────────────────────────────────────────
  const rateLimitResponse = await applyRateLimits(request, tenant);
  if (rateLimitResponse) return rateLimitResponse;

  // ── Parse request body ──────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400, 'INVALID_JSON');
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
        details: parsed.error.issues.map((i) => i.message)
      },
      { status: 400 }
    );
  }

  const { message, conversationId, userId, channel } = parsed.data;

  // Sanitize user input
  const cleanMessage = sanitizeText(message);

  // If this conversation is already in human handoff mode, never run AI.
  // Persist only the customer's message so human agents can read it.
  if (conversationId) {
    try {
      const { databases } = createAdminClient();
      const conversation = await databases.getDocument<Conversation>(
        APPWRITE_DATABASE,
        COLLECTION.CONVERSATIONS,
        conversationId
      );

      if (conversation.tenantId !== tenant.$id) {
        return apiError('Conversation not found', 404, 'NOT_FOUND');
      }

      const widgetStatus = toWidgetConversationStatus(conversation.status);

      if (widgetStatus === 'closed') {
        return NextResponse.json(
          {
            ok: false,
            error: 'Conversation is closed',
            code: 'CONVERSATION_CLOSED',
            status: widgetStatus
          },
          { status: 409 }
        );
      }

      if (
        ['human_active', 'queued', 'handoff_requested', 'escalated'].includes(
          conversation.status
        )
      ) {
        await databases.createDocument(
          APPWRITE_DATABASE,
          COLLECTION.MESSAGES,
          ID.unique(),
          {
            conversationId,
            role: 'user',
            content: cleanMessage,
            confidence: null,
            citations: JSON.stringify([]),
            metadata: JSON.stringify({
              senderType: 'user',
              routedTo: 'human_agent'
            })
          }
        );

        return NextResponse.json({
          ok: true,
          data: {
            resolved: false,
            content: null,
            conversationId,
            confidence: 0,
            citations: [],
            escalated: conversation.status === 'escalated',
            status: widgetStatus
          }
        });
      }
    } catch (err) {
      logger.error('Conversation lookup failed', { conversationId, err });
      return apiCatchError(err, 'Failed to process message');
    }
  }

  // ── Run orchestrator ────────────────────────────────────────────────────
  try {
    const result = await orchestrate({
      tenantId: tenant.$id,
      conversationId: conversationId ?? null,
      userMessage: cleanMessage,
      channel,
      userId: userId ?? undefined
    });

    return apiOk({
      resolved: result.resolved,
      content: result.content,
      conversationId: result.conversationId,
      confidence: result.confidence,
      citations: result.citations,
      escalated: result.escalated
    });
  } catch (err) {
    logger.error('Chat orchestration failed', { tenantId: tenant.$id, err });
    return apiCatchError(err, 'Failed to generate response');
  }
}
