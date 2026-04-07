import { NextRequest, NextResponse } from 'next/server';
import {
  instagramAdapter,
  InstagramAdapter,
  type InstagramWebhookPayload
} from '@/lib/channels/instagram-adapter';
import { logger } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';
import { safeCompare as timingSafeCompare } from '@/lib/security/timing-safe-compare';
import { safeError } from '@/lib/safe-error';

/**
 * GET /api/webhooks/instagram
 *
 * Meta Webhook verification challenge.
 * Meta sends a GET request with hub.mode, hub.verify_token, hub.challenge.
 */
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN ?? '';

  if (mode === 'subscribe' && verifyToken && timingSafeCompare(token ?? '', verifyToken)) {
    logger.info('[webhook/instagram] Verification challenge accepted');
    return new Response(challenge ?? '', { status: 200 });
  }

  logger.warn('[webhook/instagram] Verification challenge rejected', {
    mode,
    tokenMatch: token === verifyToken
  });
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST /api/webhooks/instagram
 *
 * Receives Instagram DM events from Meta.
 *
 * Query params:
 *   ?key=<tenant-api-key>  (identifies which tenant this webhook belongs to)
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
  let body: InstagramWebhookPayload;
  try {
    rawBody = await request.text();
    body = JSON.parse(rawBody) as InstagramWebhookPayload;
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
      '[webhook/instagram] META_APP_SECRET not configured — rejecting request. ' +
      'Set META_APP_SECRET even in development.'
    );
    return new Response('Server misconfigured', { status: 500 });
  } else if (!InstagramAdapter.verifySignature(rawBody, signature, appSecret)) {
    logger.warn('[webhook/instagram] Signature verification failed');
    return new Response('Unauthorized', { status: 403 });
  }

  // ── Ensure correct object type ─────────────────────────────────────
  if (body.object !== 'instagram') {
    return NextResponse.json({ error: 'Not an Instagram event' }, { status: 400 });
  }

  // ── Parse messages ─────────────────────────────────────────────────
  const messages = InstagramAdapter.parseWebhookPayload(body);

  if (messages.length === 0) {
    // Acknowledge non-message events (e.g. seen, typing)
    return NextResponse.json({ received: true });
  }

  // ── Process each message ───────────────────────────────────────────
  for (const msg of messages) {
    try {
      const sanitizedText = sanitizeText(msg.text);
      if (!sanitizedText) continue;

      const incoming = await instagramAdapter.receiveMessage({
        ...msg,
        text: sanitizedText,
        tenantApiKey
      });

      await instagramAdapter.handleIncoming(incoming);
    } catch (err) {
      logger.error('[webhook/instagram] Error processing message', {
        error: safeError(err, 'Webhook processing failed'),
        senderId: msg.senderId
      });
    }
  }

  // Meta expects a 200 within 20 seconds
  return NextResponse.json({ received: true });
}
