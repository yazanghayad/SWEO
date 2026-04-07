import { NextRequest, NextResponse } from 'next/server';
import { whatsappAdapter } from '@/lib/channels/whatsapp-adapter';
import { logger } from '@/lib/logger';
import {
  verifyTwilioSignature,
  buildWebhookUrl
} from '@/lib/channels/twilio-verify';
import { sanitizeText } from '@/lib/sanitize';

/**
 * POST /api/webhooks/whatsapp
 *
 * Twilio WhatsApp webhook. Receives inbound WhatsApp messages and
 * routes them through the AI pipeline.
 *
 * Query params:
 *   ?key=<tenant-api-key>
 *
 * Body: URL-encoded Twilio webhook payload
 */
export async function POST(request: NextRequest) {
  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  // Accept API key from header only (no query params for security)
  const tenantApiKey =
    request.headers.get('x-tenant-api-key');

  if (!tenantApiKey) {
    return NextResponse.json(
      { error: 'Missing tenant API key (x-tenant-api-key header)' },
      { status: 401 }
    );
  }

  let payload: Record<string, unknown>;
  try {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries()) as Record<
        string,
        unknown
      >;
    } else {
      payload = await request.json();
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse request body' },
      { status: 400 }
    );
  }

  // Validate required Twilio fields
  if (!payload.From || !payload.Body) {
    return NextResponse.json(
      { error: 'Missing required Twilio fields: From, Body' },
      { status: 400 }
    );
  }

  // Verify Twilio webhook signature (always — required in production)
  const signature = request.headers.get('x-twilio-signature') ?? '';
  const webhookUrl = buildWebhookUrl(request, '/api/webhooks/whatsapp');
  const isValid = verifyTwilioSignature(
    payload as Record<string, string>,
    signature,
    webhookUrl
  );
  if (!isValid) {
    logger.warn('Twilio signature verification failed', { channel: 'whatsapp' });
    return new Response('Unauthorized', { status: 403 });
  }

  // Sanitize user input
  payload.Body = sanitizeText(payload.Body as string);

  // Inject tenant key into payload
  payload.tenantApiKey = tenantApiKey;

  try {
    await whatsappAdapter.handleIncoming(payload);

    // Twilio expects a 200 with TwiML or empty body
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  } catch (err) {
    logger.error('[webhook/whatsapp] Processing failed — returning 500 to trigger Twilio retry', { err });
    // Return 500 so Twilio retries the webhook delivery.
    // Twilio retries up to 3 times with exponential backoff.
    return new Response(
      '<Response><Message>An error occurred processing your message. Please try again.</Message></Response>',
      {
        status: 500,
        headers: { 'Content-Type': 'text/xml' }
      }
    );
  }
}
