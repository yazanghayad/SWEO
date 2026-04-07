import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { logger } from '@/lib/logger';
import { corsHeaders, handlePreflight } from '@/lib/cors';
import type { Conversation } from '@/types/appwrite';
// api-schemas available for future validation: csatBodySchema, formatZodError

/**
 * POST /api/conversations/csat
 *
 * Submits a Customer Satisfaction (CSAT) score for a resolved conversation.
 *
 * Body:
 *   { conversationId: string, score: number (1-5), feedback?: string }
 *
 * The endpoint is called by the embeddable chat widget after a conversation
 * is resolved, presenting the user with a 1-5 star rating.
 */
export async function POST(request: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { conversationId, score, feedback } = body as {
      conversationId?: string;
      score?: number;
      feedback?: string;
    };

    // ── Validation ──────────────────────────────────────────────────
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid conversationId' },
        { status: 400 }
      );
    }

    if (
      score === undefined ||
      typeof score !== 'number' ||
      score < 1 ||
      score > 5 ||
      !Number.isInteger(score)
    ) {
      return NextResponse.json(
        { error: 'Score must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    const { databases } = createAdminClient();

    // ── Fetch conversation ──────────────────────────────────────────
    let conversation: Conversation;
    try {
      conversation = await databases.getDocument<Conversation>(
        APPWRITE_DATABASE,
        COLLECTION.CONVERSATIONS,
        conversationId
      );
    } catch {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Only allow CSAT on resolved conversations
    if (conversation.status !== 'resolved') {
      return NextResponse.json(
        { error: 'CSAT can only be submitted for resolved conversations' },
        { status: 400 }
      );
    }

    // Prevent duplicate CSAT submissions
    if (conversation.csatScore !== null) {
      return NextResponse.json(
        { error: 'CSAT score already submitted for this conversation' },
        { status: 409 }
      );
    }

    // ── Update conversation with CSAT score ─────────────────────────
    const metadataRaw = conversation.metadata;
    const existingMeta =
      typeof metadataRaw === 'string'
        ? JSON.parse(metadataRaw)
        : metadataRaw ?? {};

    const updatedMetadata = {
      ...existingMeta,
      csatFeedback: feedback?.trim() || undefined,
      csatSubmittedAt: new Date().toISOString()
    };

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId,
      {
        csatScore: score,
        metadata: JSON.stringify(updatedMetadata)
      }
    );

    logger.info('[csat] Score submitted', {
      conversationId,
      score,
      tenantId: conversation.tenantId
    });

    return NextResponse.json({
      success: true,
      conversationId,
      score
    }, { headers: corsHeaders(request) });
  } catch (err) {
    logger.error('[csat] Error submitting score', { err });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

/**
 * GET /api/conversations/csat?conversationId=xxx
 *
 * Check if a CSAT score has been submitted for a conversation.
 */
export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Missing conversationId' },
      { status: 400 }
    );
  }

  try {
    const { databases } = createAdminClient();
    const conversation = await databases.getDocument<Conversation>(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );

    return NextResponse.json({
      conversationId,
      hasScore: conversation.csatScore !== null,
      score: conversation.csatScore
    }, { headers: corsHeaders(request) });
  } catch {
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404, headers: corsHeaders(request) }
    );
  }
}

/** CORS preflight for cross-origin widget requests. */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
