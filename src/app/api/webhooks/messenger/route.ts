import { NextRequest, NextResponse } from 'next/server';
import {
  facebookMessengerAdapter,
  FacebookMessengerAdapter,
  type MessengerWebhookPayload
} from '@/lib/channels/facebook-messenger-adapter';
import { logger } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';
import { safeCompare as timingSafeCompare } from '@/lib/security/timing-safe-compare';
import { safeError } from '@/lib/safe-error';

/**
 * GET /api/webhooks/messenger
 *
 * Meta Webhook verification challenge for Facebook Messenger.
 */
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN ?? '';

  if (mode === 'subscribe' && verifyToken && timingSafeCompare(token ?? '', verifyToken)) {
    logger.info('[webhook/messenger] Verification challenge accepted');
    return new Response(challenge ?? '', { status: 200 });
  }

  logger.warn('[webhook/messenger] Verification challenge rejected', {
    mode,
    tokenMatch: token === verifyToken
  });
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST /api/webhooks/messenger
 *
 * Receives Facebook Messenger events from Meta.
 *
 * Query params:
 *   ?key=<tenant-api-key>
 *
 * Body: JSON – Meta webhook payload
 */
export async function POST(request: NextRequest) {
  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

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

  // ── Read raw body for signature verification ────────────────────────
  let rawBody: string;
  let body: MessengerWebhookPayload;
  try {
    rawBody = await request.text();
    body = JSON.parse(rawBody) as MessengerWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse request body' },
      { status: 400 }
    );
  }

  // ── Verify Meta signature ──────────────────────────────────────────
  const signature = request.headers.get('x-hub-signature-256') ?? '';
  const appSecret = process.env.META_APP_SECRET ?? '';

  if (!appSecret) {
    // Fail closed in all environments — require app secret
    logger.error(
      '[webhook/messenger] META_APP_SECRET not configured — rejecting request. ' +
      'Set META_APP_SECRET even in development.'
    );
    return new Response('Server misconfigured', { status: 500 });
  } else if (
    !FacebookMessengerAdapter.verifySignature(rawBody, signature, appSecret)
  ) {
    logger.warn('[webhook/messenger] Signature verification failed');
    return new Response('Unauthorized', { status: 403 });
  }

  // ── Ensure correct object type ─────────────────────────────────────
  if (body.object !== 'page') {
    return NextResponse.json(
      { error: 'Not a Messenger event' },
      { status: 400 }
    );
  }

  // ── Parse messages ─────────────────────────────────────────────────
  const messages = FacebookMessengerAdapter.parseWebhookPayload(body);

  if (messages.length === 0) {
    return NextResponse.json({ received: true });
  }

  // ── Process each message ───────────────────────────────────────────
  for (const msg of messages) {
    try {
      const sanitizedText = sanitizeText(msg.text);
      if (!sanitizedText) continue;

      const incoming = await facebookMessengerAdapter.receiveMessage({
        ...msg,
        text: sanitizedText,
        tenantApiKey
      });

      await facebookMessengerAdapter.handleIncoming(incoming);
    } catch (err) {
      logger.error('[webhook/messenger] Error processing message', {
        error: safeError(err, 'Webhook processing failed'),
        senderId: msg.senderId
      });
    }
  }

  // Meta expects a 200 within 20 seconds
  return NextResponse.json({ received: true });
}
