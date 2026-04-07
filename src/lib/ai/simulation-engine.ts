/**
 * Simulation engine – runs test conversations in dry-run mode.
 *
 * Used to verify AI behaviour before deploying changes to knowledge
 * base, procedures, or policies.
 */

import { vectorSearch, normalizeScore, type SearchResult } from '@/lib/ai/retrieval';
import { generateCompletion, type RAGContext } from '@/lib/ai/llm';
import {
  loadTenantPolicies,
  validatePolicies,
  redactPII
} from '@/lib/ai/policy-engine';
import {
  findMatchingProcedure,
  executeProcedure,
  type ProcedureResult
} from '@/lib/ai/procedure-executor';
import {
  getGuidanceRules,
  getTenantGuidancePreferences
} from '@/features/guidance/actions';
import type { Policy, Citation, KnowledgeSource } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SimulationInput {
  tenantId: string;
  messages: string[];
  /** If true, also test procedure matching. */
  testProcedures?: boolean;
  /** If true, always call the LLM even when RAG confidence is low (for preview chat). */
  preview?: boolean;
}

export interface SimulationTurn {
  userMessage: string;
  assistantResponse: string | null;
  confidence: number;
  citations: Citation[];
  procedureTriggered: string | null;
  procedureResult: ProcedureResult | null;
  policyBlocked: boolean;
  policyViolations: string[];
  escalated: boolean;
}

export interface SimulationResult {
  success: boolean;
  turns: SimulationTurn[];
  metrics: {
    avgConfidence: number;
    resolutionRate: number;
    escalationRate: number;
    proceduresUsed: string[];
    totalTurns: number;
  };
  error?: string;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CONFIDENCE_THRESHOLD = 0.7;
const TOP_K = 5;

/** Per-step timeout in milliseconds. */
const STEP_TIMEOUT_MS = 25_000;
/** Global simulation timeout in milliseconds. */
const SIMULATION_TIMEOUT_MS = 55_000;

/**
 * Run a promise with a timeout. Returns the result or throws on timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_resolve, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)), ms)
    )
  ]);
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/**
 * Run a simulated multi-turn conversation without saving anything to the DB.
 */
export async function runSimulation(
  input: SimulationInput
): Promise<SimulationResult> {
  // Wrap the entire simulation in a global timeout
  try {
    return await withTimeout(
      _runSimulationInner(input),
      SIMULATION_TIMEOUT_MS,
      'simulation'
    );
  } catch (err) {
    logger.error('Simulation timed out or failed', { err });
    return {
      success: false,
      turns: [],
      metrics: {
        avgConfidence: 0,
        resolutionRate: 0,
        escalationRate: 0,
        proceduresUsed: [],
        totalTurns: 0
      },
      error: err instanceof Error ? err.message : 'Simulation failed'
    };
  }
}

async function _runSimulationInner(
  input: SimulationInput
): Promise<SimulationResult> {
  const { tenantId, messages, testProcedures = false, preview = false } = input;
  const turns: SimulationTurn[] = [];

  // Resolve tenant name so the LLM knows whose agent it is.
  // Prefer botName from config (the configured display name) over the
  // raw workspace name which may be a personal name.
  let tenantName: string | undefined;
  try {
    const { databases } = createAdminClient();
    const tenant = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenantId
    );
    const cfg = typeof tenant.config === 'string'
      ? JSON.parse(tenant.config)
      : (tenant.config ?? {});
    tenantName = cfg.botName || (tenant as { name?: string }).name || undefined;
  } catch {
    // Continue without tenant name
  }

  // Load policies once
  let policies: Policy[] = [];
  try {
    policies = await loadTenantPolicies(tenantId);
  } catch {
    // Continue without policies
  }

  // Load tenant guidance preferences and custom rules
  let guidancePrompt = '';
  try {
    const [prefs, rules] = await Promise.all([
      getTenantGuidancePreferences(tenantId, 'chat-email'),
      getGuidanceRules(tenantId, 'chat-email')
    ]);

    const parts: string[] = [];

    if (prefs) {
      parts.push(`Tone of voice: ${prefs.tone}`);
      parts.push(`Answer length: ${prefs.length}`);
    }

    // Collect enabled custom rules (skip the __preferences__ meta-rule)
    const enabledRules = rules.filter(
      (r) => r.enabled && r.name !== '__preferences__'
    );
    if (enabledRules.length > 0) {
      parts.push('\nCustom guidance rules:');
      for (const rule of enabledRules) {
        parts.push(`- [${rule.category}] ${rule.name}: ${rule.ruleContent}`);
      }
    }

    if (parts.length > 0) {
      guidancePrompt = `## Agent Guidance\n${parts.join('\n')}`;
    }
  } catch (err) {
    logger.warn('Failed to load guidance for simulation', { err });
    // Continue without guidance
  }

  // Simulated conversation history
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const userMessage of messages) {
    const turn: SimulationTurn = {
      userMessage,
      assistantResponse: null,
      confidence: 0,
      citations: [],
      procedureTriggered: null,
      procedureResult: null,
      policyBlocked: false,
      policyViolations: [],
      escalated: false
    };

    // Pre-policy check
    const preCheck = validatePolicies(userMessage, policies, 'pre');
    if (!preCheck.passed) {
      turn.policyBlocked = true;
      turn.policyViolations = preCheck.violations.map((v) => v.message);
      turns.push(turn);
      continue;
    }

    const cleanedMessage = redactPII(userMessage, policies);

    // Check for procedure match
    if (testProcedures) {
      try {
        const procedure = await withTimeout(
          findMatchingProcedure(tenantId, cleanedMessage),
          STEP_TIMEOUT_MS,
          'findMatchingProcedure'
        );
        if (procedure) {
          turn.procedureTriggered = procedure.name;

          const result = await withTimeout(
            executeProcedure(procedure, {
              tenantId,
              conversationId: 'simulation',
              variables: {},
              dryRun: true
            }),
            STEP_TIMEOUT_MS,
            'executeProcedure'
          );

          turn.procedureResult = result;

          if (result.finalMessage) {
            turn.assistantResponse = result.finalMessage;
            turn.confidence = 1.0; // Procedure responses are always high confidence
            history.push({ role: 'user', content: userMessage });
            history.push({
              role: 'assistant',
              content: result.finalMessage
            });
            turns.push(turn);
            continue;
          }
        }
      } catch {
        // Procedure matching failed, fall through to RAG
      }
    }

    // RAG retrieval
    let results: SearchResult[] = [];
    try {
      results = await withTimeout(
        vectorSearch(tenantId, cleanedMessage, TOP_K),
        STEP_TIMEOUT_MS,
        'vectorSearch'
      );
    } catch (err) {
      logger.error('Vector search failed or timed out', { err });
    }

    // Use the best (max) score as confidence – averaging all top-K results
    // unfairly drags confidence down when only the top hit is relevant.
    // Normalize through model-aware mapping so the 0.7 threshold works for
    // both NVIDIA E5 (low raw range) and OpenAI (high raw range) embeddings.
    const rawBestScore =
      results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;
    turn.confidence = normalizeScore(rawBestScore);

    // Filter out very low-relevance results so the LLM gets cleaner context.
    // Use normalizeScore to apply a model-aware threshold.
    results = results.filter((r) => normalizeScore(r.score) >= 0.15);

    // Confidence check (use normalized score)
    const lowConfidence = results.length === 0 || turn.confidence < CONFIDENCE_THRESHOLD;
    if (lowConfidence && !preview) {
      // Strict mode: escalate when confidence is too low
      turn.escalated = true;
      turn.assistantResponse =
        "I'm sorry, I don't have enough information to answer that question confidently.";
      history.push({ role: 'user', content: userMessage });
      turns.push(turn);
      continue;
    }

    // LLM generation – in preview mode, always call the LLM so guidance
    // settings (tone, length, custom rules) are tested even for greetings
    // or queries without matching knowledge base content.
    const ragContext: RAGContext = {
      query: cleanedMessage,
      chunks: results.map((r) => ({
        text: (r.metadata.text as string) ?? '',
        sourceId: r.id,
        score: r.score
      })),
      conversationHistory: history.length > 0 ? [...history] : undefined,
      systemPromptPrefix: guidancePrompt || undefined,
      tenantName
    };

    try {
      const llmResponse = await withTimeout(
        generateCompletion(ragContext),
        STEP_TIMEOUT_MS,
        'generateCompletion'
      );
      turn.assistantResponse = llmResponse.content;

      // Post-policy check
      const postCheck = validatePolicies(llmResponse.content, policies, 'post');
      if (!postCheck.passed) {
        turn.policyBlocked = true;
        turn.policyViolations = postCheck.violations.map((v) => v.message);
        turn.escalated = true;
        turn.assistantResponse = null;
      }

      // Citations
      turn.citations = await enrichCitations(extractCitations(results));
    } catch {
      turn.escalated = true;
      turn.assistantResponse = null;
    }

    // Add to history
    history.push({ role: 'user', content: userMessage });
    if (turn.assistantResponse) {
      history.push({ role: 'assistant', content: turn.assistantResponse });
    }

    turns.push(turn);
  }

  // Compute metrics
  const totalTurns = turns.length;
  const resolvedTurns = turns.filter(
    (t) => t.assistantResponse && !t.escalated && !t.policyBlocked
  ).length;
  const escalatedTurns = turns.filter((t) => t.escalated).length;
  const procedures = turns
    .map((t) => t.procedureTriggered)
    .filter(Boolean) as string[];

  return {
    success: true,
    turns,
    metrics: {
      avgConfidence:
        totalTurns > 0
          ? turns.reduce((s, t) => s + t.confidence, 0) / totalTurns
          : 0,
      resolutionRate: totalTurns > 0 ? resolvedTurns / totalTurns : 0,
      escalationRate: totalTurns > 0 ? escalatedTurns / totalTurns : 0,
      proceduresUsed: Array.from(new Set(procedures)),
      totalTurns
    }
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Enrich citations with human-readable labels by looking up knowledge_sources.
 * Best-effort: if a source can't be found the citation keeps only its sourceId.
 */
async function enrichCitations(citations: Citation[]): Promise<Citation[]> {
  if (citations.length === 0) return citations;

  try {
    const { databases } = createAdminClient();
    const enriched = await Promise.all(
      citations.map(async (c) => {
        try {
          const doc = await databases.getDocument<KnowledgeSource>(
            APPWRITE_DATABASE,
            COLLECTION.KNOWLEDGE_SOURCES,
            c.sourceId
          );
          const meta = parseMetadata(doc.metadata);
          return {
            sourceId: c.sourceId,
            label: resolveSourceLabel(doc, meta),
            sourceType: doc.type,
          };
        } catch {
          return c; // Keep original on lookup failure
        }
      })
    );
    return enriched;
  } catch {
    return citations;
  }
}

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return (raw as Record<string, unknown>) ?? {};
}

function resolveSourceLabel(
  doc: KnowledgeSource,
  meta: Record<string, unknown>
): string {
  if (doc.type === 'file') {
    return (meta.fileName as string) ?? 'Uploaded file';
  }
  if (doc.type === 'url') {
    return doc.url ?? (meta.originalUrl as string) ?? 'URL source';
  }
  if (doc.type === 'manual') {
    return (meta.title as string) ?? 'Manual entry';
  }
  return 'Knowledge source';
}
