import { NextRequest, NextResponse } from 'next/server';
import { voiceAdapter } from '@/lib/channels/voice-adapter';
import { logger } from '@/lib/logger';
import {
  verifyTwilioSignature,
  buildWebhookUrl
} from '@/lib/channels/twilio-verify';

/**
 * POST /api/webhooks/voice
 *
 * Twilio Voice webhook. Handles inbound phone calls.
 *
 * Two modes:
 *   1. Initial call (no SpeechResult) → return greeting TwiML with <Gather>
 *   2. Gather callback (SpeechResult present) → run orchestrator → return TwiML
 *
 * Query params:
 *   ?key=<tenant-api-key>
 *
 * Body: URL-encoded Twilio voice webhook payload
 */
export async function POST(request: NextRequest) {
  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  // Accept API key from header (preferred) or Redis cache (voice callback)
  let tenantApiKey =
    request.headers.get('x-tenant-api-key') ??
    null;

  // For voice callbacks, retrieve the API key stored server-side by CallSid
  if (!tenantApiKey) {
    try {
      const contentType = request.headers.get('content-type') ?? '';
      // Peek at CallSid without consuming the body (clone first)
      const cloned = request.clone();
      let callSid: string | null = null;
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const fd = await cloned.formData();
        callSid = fd.get('CallSid') as string | null;
      }
      if (callSid) {
        const { getRedis } = await import('@/lib/cache/redis');
        const redis = getRedis();
        if (redis) {
          tenantApiKey = await redis.get<string>(`voice:key:${callSid}`);
        }
      }
    } catch {
      // Ignore parse errors — will fail on the check below
    }
  }

  if (!tenantApiKey) {
    return NextResponse.json(
      { error: 'Missing tenant API key' },
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
  if (!payload.CallSid || !payload.From) {
    return NextResponse.json(
      { error: 'Missing required Twilio fields: CallSid, From' },
      { status: 400 }
    );
  }

  // Verify Twilio webhook signature
  const signature = request.headers.get('x-twilio-signature') ?? '';
  const webhookUrl = buildWebhookUrl(request, '/api/webhooks/voice');
  const isValid = verifyTwilioSignature(
    payload as Record<string, string>,
    signature,
    webhookUrl
  );
  if (!isValid) {
    logger.warn('Twilio signature verification failed', { channel: 'voice' });
    return new Response('Unauthorized', { status: 403 });
  }

  // Inject tenant key into payload
  payload.tenantApiKey = tenantApiKey;

  try {
    // Check if this is a <Gather> callback with speech results
    const hasSpeechResult =
      typeof payload.SpeechResult === 'string' &&
      (payload.SpeechResult as string).trim().length > 0;

    // Store API key server-side keyed by CallSid to avoid leaking it in URLs
    const callSid = payload.CallSid as string;
    const { getRedis } = await import('@/lib/cache/redis');
    const redis = getRedis();
    if (redis) {
      await redis.set(`voice:key:${callSid}`, tenantApiKey, { ex: 300 }); // 5 min TTL
    }

    const callbackUrl = buildWebhookUrl(request, '/api/webhooks/voice');

    if (!hasSpeechResult) {
      // Initial call → return greeting + gather
      const twiml = voiceAdapter.generateGreetingTwiml(callbackUrl);

      return new Response(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    // Gather callback → orchestrate and respond

    const result = await voiceAdapter.handleVoiceCall(
      payload as unknown as import('@/lib/channels/voice-adapter').TwilioVoicePayload,
      callbackUrl
    );

    return new Response(result.twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  } catch (err) {
    logger.error('[webhook/voice] Processing failed', { err });

    // DESIGN: Voice webhooks MUST return 200 with valid TwiML even on errors.
    // Returning non-200 causes Twilio to play a generic "application error"
    // robot voice, which is a worse user experience than a spoken apology.
    // Voice calls are not retryable (the caller is live on the line).
    const errorTwiml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Response>',
      '  <Say voice="Polly.Joanna" language="en-US">',
      '    I apologize, but I encountered an error. Please try again later.',
      '  </Say>',
      '</Response>'
    ].join('\n');

    return new Response(errorTwiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
