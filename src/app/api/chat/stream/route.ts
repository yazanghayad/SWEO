import { NextRequest } from 'next/server';
import { vectorSearch, normalizeScore } from '@/lib/ai/retrieval';
import { generateCompletionStream, type RAGContext } from '@/lib/ai/llm';
import { corsHeaders, handlePreflight } from '@/lib/cors';
import {
  loadTenantPolicies,
  validatePolicies,
  redactPII
} from '@/lib/ai/policy-engine';
import {
  createTenantDocument,
  updateTenantDocument
} from '@/lib/appwrite/tenant-helpers';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type {
  Tenant,
  Conversation,
  Message,
  Citation,
  TenantConfig
} from '@/types/appwrite';
import { ID, Query } from 'node-appwrite';
import { logAuditEventAsync } from '@/lib/audit/logger';
import { applyRateLimits } from '@/lib/rate-limit/middleware';
import { sanitizeText } from '@/lib/sanitize';
import { logger } from '@/lib/logger';
import { findTenantByPreviousApiKey } from '@/lib/widget/previous-key-lookup';
import { chatStreamBodySchema, formatZodError } from '@/lib/api-schemas';
import { toWidgetConversationStatus } from '@/lib/conversation/contracts';

/**
 * POST /api/chat/stream
 *
 * Streaming chat endpoint (Server-Sent Events).
 * Authenticated via tenant API key (Bearer token).
 *
 * Same auth flow as /api/chat/message but returns a text/event-stream.
 *
 * SSE events:
 *   data: {"type":"delta","content":"..."}
 *   data: {"type":"done","conversationId":"...","confidence":0.9,"citations":[...]}
 *   data: {"type":"error","message":"..."}
 *   data: {"type":"blocked","message":"..."}
 *   data: {"type":"escalated","message":"...","conversationId":"..."}
 */

const RAG_HIGH_THRESHOLD = 0.7;
const RAG_LOW_THRESHOLD = 0.4;
const TOP_K = 5;
const MAX_HISTORY_MESSAGES = 10;

const POLICY_BLOCKED_MESSAGE =
  "I'm unable to process that request due to our content policies. Please rephrase your question or contact our support team directly.";

// ── Policy-based routing ──────────────────────────────────────────────────

type RouteDecision =
  | { mode: 'rag'; caution: false }
  | { mode: 'rag'; caution: true }
  | { mode: 'no_rag'; askClarify: boolean }
  | { mode: 'escalate'; reason: string };

/**
 * Phrases that signal the user wants a human agent.
 * Checked case-insensitively against the user's message.
 */
const HUMAN_REQUEST_PATTERNS = [
  /\b(talk|speak|chat)\s+(to|with)\s+(a\s+)?(human|person|agent|someone|real person|representative|support)/i,
  /\b(connect|transfer)\s+(me\s+)?(to|with)\s+(a\s+)?(human|person|agent|support)/i,
  /\bhuman\s+(agent|support|help)/i,
  /\breal\s+person/i,
  /\bi\s+(want|need)\s+(a\s+)?(human|person|agent)/i,
  /\beskaler/i, // Swedish: "eskalera"
  /\bprata\s+med\s+(en\s+)?(människa|person|agent)/i, // Swedish
  /\bjag\s+vill\s+(ha\s+)?(en\s+)?(människa|person|support)/i // Swedish
];

function detectUserWantsHuman(message: string): boolean {
  return HUMAN_REQUEST_PATTERNS.some((p) => p.test(message));
}

function decideRoute(
  results: SearchResult[],
  topScore: number,
  userMessage: string
): RouteDecision {
  // 1. User explicitly asks for a human
  if (detectUserWantsHuman(userMessage)) {
    return { mode: 'escalate', reason: 'user_requested' };
  }

  const hasDocs = results.length > 0;

  // 2. High confidence → normal RAG answer
  if (hasDocs && topScore >= RAG_HIGH_THRESHOLD) {
    return { mode: 'rag', caution: false };
  }

  // 3. Medium confidence → RAG with caution
  if (hasDocs && topScore >= RAG_LOW_THRESHOLD) {
    return { mode: 'rag', caution: true };
  }

  // 4. Low / no results → answer generically, ask clarifying questions
  return { mode: 'no_rag', askClarify: true };
}

export async function POST(request: NextRequest) {
  // ── Authenticate ────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid Authorization header' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
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
        return new Response(JSON.stringify({ error: 'Invalid API key' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      tenant = match;
    } else {
      tenant = result.documents[0];
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const parsed = chatStreamBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: formatZodError(parsed.error) }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { message, userId } = parsed.data;
  const channel = (parsed.data.channel ?? 'web') as Conversation['channel'];
  let conversationId = parsed.data.conversationId ?? null;

  // Sanitize user input
  const cleanMessage = sanitizeText(message);

  // ── Rate limiting ───────────────────────────────────────────────────────
  const rateLimitResponse = await applyRateLimits(request, tenant);
  if (rateLimitResponse) return rateLimitResponse;

  // ── SSE stream ──────────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  function sseEvent(data: Record<string, unknown>): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Load policies
        let policies: Awaited<ReturnType<typeof loadTenantPolicies>> = [];
        try {
          policies = await loadTenantPolicies(tenant.$id);
        } catch {
          // Continue without policies
        }

        // Step 2: Pre-policy check
        const preCheck = validatePolicies(message, policies, 'pre');
        if (!preCheck.passed) {
          conversationId = await ensureConversation(
            conversationId,
            tenant.$id,
            channel,
            userId ?? null
          );
          await saveMessage(conversationId, 'user', message, null, []);

          logAuditEventAsync(tenant.$id, 'policy.violated', {
            conversationId,
            phase: 'pre',
            violations: preCheck.violations.map((v) => v.message)
          });

          controller.enqueue(
            sseEvent({ type: 'blocked', message: POLICY_BLOCKED_MESSAGE })
          );
          controller.close();
          return;
        }

        const cleanedMessage = redactPII(cleanMessage, policies);

        // Step 3: Ensure conversation
        conversationId = await ensureConversation(
          conversationId,
          tenant.$id,
          channel,
          userId ?? null
        );

        // Step 3.1: Check conversation status — reject AI if human is active or chat is closed
        try {
          const { databases: statusDb } = createAdminClient();
          const convDoc = await statusDb.getDocument(
            APPWRITE_DATABASE,
            COLLECTION.CONVERSATIONS,
            conversationId
          );
          const convStatus = (convDoc as Record<string, unknown>).status as string;

          if (
            [
              'human_active',
              'resolved',
              'closed',
              'queued',
              'handoff_requested',
              'escalated'
            ].includes(convStatus)
          ) {
            // AI must stop — conversation is not in AI_ACTIVE state
            const widgetStatus = toWidgetConversationStatus(convStatus);
            controller.enqueue(
              sseEvent({
                type: 'status',
                status: widgetStatus,
                message:
                  widgetStatus === 'closed'
                    ? 'This conversation has been closed.'
                    : 'A human agent is handling this conversation.'
              })
            );
            controller.close();
            return;
          }
        } catch {
          // Non-critical — continue with AI if status check fails
        }

        await saveMessage(conversationId, 'user', message, null, []);

        // Step 4: RAG retrieval
        let results: SearchResult[] = [];
        try {
          results = await vectorSearch(tenant.$id, cleanedMessage, TOP_K);
        } catch {
          // Continue with no results
        }

        // Use normalized best score so the 0.7 threshold works across models.
        const avgScore =
          results.length > 0
            ? normalizeScore(Math.max(...results.map((r) => r.score)))
            : 0;

        // Filter out low-relevance results (model-aware)
        results = results.filter((r) => normalizeScore(r.score) >= 0.15);

        // Step 5: Policy-based routing (replaces hard-threshold escalation)
        const route = decideRoute(results, avgScore, cleanedMessage);

        // Resolve tenant display name once
        const tenantName = (() => {
          try {
            const cfg = typeof tenant.config === 'string'
              ? JSON.parse(tenant.config)
              : (tenant.config ?? {});
            return cfg.botName || tenant.name || undefined;
          } catch {
            return tenant.name || undefined;
          }
        })();

        // ── ESCALATE: user explicitly asked for a human ──
        if (route.mode === 'escalate') {
          const escalateMsg =
            'Absolutely — I\'ll connect you with a human agent right away. ' +
            'I\'ll send them a brief summary of our conversation so they can pick up where we left off.';

          await saveMessage(conversationId, 'assistant', escalateMsg, avgScore, []);
          await updateConversationStatus(conversationId, 'escalated', tenant.$id);

          logAuditEventAsync(tenant.$id, 'conversation.escalated', {
            conversationId,
            confidence: avgScore,
            reason: route.reason
          });

          controller.enqueue(
            sseEvent({
              type: 'escalated',
              message: escalateMsg,
              conversationId,
              confidence: avgScore
            })
          );
          controller.close();
          return;
        }

        // Step 6: Build RAG context + stream LLM
        const history = await loadConversationHistory(conversationId);
        const historyWithoutCurrent = history.slice(0, -1);

        // Build system prompt adjustments based on route
        let systemPromptPrefix = '';
        if (route.mode === 'rag' && route.caution) {
          systemPromptPrefix =
            'IMPORTANT: The retrieved context has only moderate relevance to the user\'s question. ' +
            'Answer using the context if it seems applicable, but be transparent about uncertainty. ' +
            'If you are not confident in your answer, ask 1-2 brief clarifying questions to better understand what the user needs. ' +
            'Never invent tenant-specific facts (pricing, features, policies) that are not in the context.';
        } else if (route.mode === 'no_rag') {
          systemPromptPrefix =
            'IMPORTANT: No relevant knowledge base articles were found for this query. ' +
            'You must NOT invent or assume any tenant-specific facts (pricing, features, policies, account details). ' +
            'Instead: (1) respond warmly and helpfully with general guidance if the question is generic, ' +
            '(2) ask 1-2 brief clarifying questions to understand what the user needs, ' +
            '(3) if appropriate, let the user know they can ask to speak with a human agent for more specific help. ' +
            'Never say "I don\'t have enough information" and escalate automatically — try to help first.';
        }

        const ragContext: RAGContext = {
          query: cleanedMessage,
          chunks: route.mode === 'no_rag'
            ? [] // Don't pass irrelevant chunks
            : results.map((r) => ({
                text: r.text || ((r.metadata.text as string) ?? ''),
                sourceId: r.id,
                score: r.score
              })),
          conversationHistory:
            historyWithoutCurrent.length > 0 ? historyWithoutCurrent : undefined,
          tenantName,
          systemPromptPrefix: systemPromptPrefix || undefined
        };

        // Stream response to client
        let fullContent = '';

        const streamGenerator = generateCompletionStream(ragContext);
        const reader = streamGenerator.getReader();
        let readerDone = false;

        while (!readerDone) {
          const { value, done } = await reader.read();
          if (done) {
            readerDone = true;
            break;
          }
          if (value) {
            fullContent += value;
            controller.enqueue(sseEvent({ type: 'delta', content: value }));
          }
        }

        // Step 7: Post-policy check
        const postCheck = validatePolicies(fullContent, policies, 'post');
        if (!postCheck.passed) {
          const fallback =
            "I have an answer but it didn't pass our quality checks. Let me connect you with a human agent.";

          await saveMessage(
            conversationId,
            'assistant',
            fallback,
            avgScore,
            []
          );
          await updateConversationStatus(conversationId, 'escalated', tenant.$id);

          logAuditEventAsync(tenant.$id, 'policy.violated', {
            conversationId,
            phase: 'post',
            violations: postCheck.violations.map((v) => v.message)
          });

          controller.enqueue(
            sseEvent({
              type: 'escalated',
              message: fallback,
              conversationId
            })
          );
          controller.close();
          return;
        }

        // Step 8: Save response with citations
        const citations = extractCitations(results);
        const msgId = await saveMessage(
          conversationId,
          'assistant',
          fullContent,
          avgScore,
          citations
        );

        // Never auto-resolve after AI answers.
        // Conversation stays 'active' so user can continue chatting.
        // Only an explicit close action (by agent or system timeout) should resolve.

        logAuditEventAsync(tenant.$id, 'conversation.ai_reply', {
          conversationId,
          messageId: msgId,
          confidence: avgScore,
          route: route.mode
        });

        controller.enqueue(
          sseEvent({
            type: 'done',
            conversationId,
            confidence: avgScore,
            citations,
            status: 'active'
          })
        );
        controller.close();
      } catch (err) {
        logger.error('Streaming chat error', { conversationId, err });
        controller.enqueue(
          sseEvent({
            type: 'error',
            message: 'An error occurred while processing your request.'
          })
        );
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...corsHeaders(request)
    }
  });
}

/** CORS preflight for cross-origin widget requests. */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

// ---------------------------------------------------------------------------
// Helpers (same patterns as orchestrator.ts)
// ---------------------------------------------------------------------------

interface SearchResult {
  id: string;
  score: number;
  text: string;
  metadata: Record<string, unknown>;
}

async function ensureConversation(
  conversationId: string | null,
  tenantId: string,
  channel: Conversation['channel'],
  userId: string | null
): Promise<string> {
  if (conversationId) return conversationId;

  const doc = await createTenantDocument<Conversation>(
    COLLECTION.CONVERSATIONS,
    tenantId,
    {
      channel,
      status: 'active',
      userId: userId ?? null,
      metadata: JSON.stringify({}),
      resolvedAt: null,
      firstResponseAt: null,
      csatScore: null,
      assignedTo: null
    }
  );

  return doc.$id;
}

async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  confidence: number | null,
  citations: Citation[]
): Promise<string> {
  const { databases } = createAdminClient();
  const doc = await databases.createDocument(
    APPWRITE_DATABASE,
    COLLECTION.MESSAGES,
    ID.unique(),
    {
      conversationId,
      role,
      content,
      confidence,
      citations: JSON.stringify(citations),
      metadata: JSON.stringify({})
    }
  );

  // Track first response time
  if (role === 'assistant') {
    try {
      const conv = await databases.getDocument(
        APPWRITE_DATABASE,
        COLLECTION.CONVERSATIONS,
        conversationId
      );
      if (!(conv as Record<string, unknown>).firstResponseAt) {
        await databases.updateDocument(
          APPWRITE_DATABASE,
          COLLECTION.CONVERSATIONS,
          conversationId,
          { firstResponseAt: new Date().toISOString() }
        );
      }
    } catch {
      // Non-critical
    }
  }

  return doc.$id;
}

async function updateConversationStatus(
  conversationId: string,
  status: string,
  tenantId: string
): Promise<void> {
  try {
    const updates: Record<string, unknown> = { status };
    if (status === 'resolved') {
      updates.resolvedAt = new Date().toISOString();
    }
    await updateTenantDocument(
      COLLECTION.CONVERSATIONS,
      conversationId,
      updates,
      tenantId
    );
  } catch (err) {
    logger.error('Failed to update conversation status', { conversationId, err });
  }
}

async function loadConversationHistory(
  conversationId: string
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments<Message>(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      [
        Query.equal('conversationId', conversationId),
        Query.orderDesc('$createdAt'),
        Query.limit(MAX_HISTORY_MESSAGES)
      ]
    );
    return result.documents.reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
  } catch {
    return [];
  }
}

function extractCitations(results: SearchResult[]): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];
  for (const result of results) {
    const sourceId = result.metadata.sourceId as string;
    if (sourceId && !seen.has(sourceId)) {
      seen.add(sourceId);
      citations.push({ sourceId });
    }
  }
  return citations;
}
