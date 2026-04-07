import { NextRequest, NextResponse } from 'next/server';
import {
  slackAdapter,
  SlackAdapter,
  type SlackEventPayload
} from '@/lib/channels/slack-adapter';
import { logger } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';
import { safeError } from '@/lib/safe-error';

/**
 * POST /api/webhooks/slack
 *
 * Slack Events API webhook. Handles:
 *   1. URL verification challenge (type: url_verification)
 *   2. Event callbacks (type: event_callback) for messages
 *
 * Query params:
 *   ?key=<tenant-api-key>
 *
 * Body: JSON – Slack Events API payload
 */
export async function POST(request: NextRequest) {
  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  // ── Read raw body for signature verification ────────────────────────
  let rawBody: string;
  let body: SlackEventPayload;
  try {
    rawBody = await request.text();
    body = JSON.parse(rawBody) as SlackEventPayload;
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse request body' },
      { status: 400 }
    );
  }

  // ── Verify Slack signature (BEFORE url_verification) ────────────────
  const signingSecret = process.env.SLACK_SIGNING_SECRET ?? '';
  const timestamp = request.headers.get('x-slack-request-timestamp') ?? '';
  const slackSignature = request.headers.get('x-slack-signature') ?? '';

  if (!signingSecret) {
    // Fail closed in all environments — require signing secret
    logger.error(
      '[webhook/slack] SLACK_SIGNING_SECRET not configured — rejecting request. ' +
      'Set SLACK_SIGNING_SECRET even in development.'
    );
    return new Response('Server misconfigured', { status: 500 });
  } else if (
    !SlackAdapter.verifySignature(rawBody, timestamp, slackSignature, signingSecret)
  ) {
    logger.warn('[webhook/slack] Signature verification failed');
    return new Response('Unauthorized', { status: 403 });
  }

  // ── Handle URL verification (after signature check) ─────────────────
  if (body.type === 'url_verification') {
    logger.info('[webhook/slack] URL verification challenge received');
    return NextResponse.json({ challenge: body.challenge });
  }

  // ── Tenant API key ──────────────────────────────────────────────────
  const tenantApiKey =
    request.headers.get('x-tenant-api-key');

  if (!tenantApiKey) {
    return NextResponse.json(
      {
        error:
          'Missing tenant API key (x-tenant-api-key header)'
      },
      { status: 401 }
    );
  }

  // ── Parse event ─────────────────────────────────────────────────────
  if (body.type !== 'event_callback') {
    return NextResponse.json({ received: true });
  }

  const parsed = SlackAdapter.parseEventPayload(body);

  if (!parsed) {
    // Likely a bot message or unsupported event type
    return NextResponse.json({ received: true });
  }

  // ── Process message ─────────────────────────────────────────────────
  try {
    const sanitizedText = sanitizeText(parsed.text);
    if (!sanitizedText) {
      return NextResponse.json({ received: true });
    }

    const incoming = await slackAdapter.receiveMessage({
      ...parsed,
      text: sanitizedText,
      tenantApiKey
    });

    await slackAdapter.handleIncoming(incoming);
  } catch (err) {
    logger.error('[webhook/slack] Error processing event', {
      error: safeError(err, 'Webhook processing failed'),
      userId: parsed.userId,
      channelId: parsed.channelId
    });
  }

  // Slack expects 200 within 3 seconds
  return NextResponse.json({ received: true });
}
