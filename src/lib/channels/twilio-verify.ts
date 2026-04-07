/**
 * Twilio webhook signature verification.
 *
 * Validates that incoming webhook requests actually originated from Twilio
 * by checking the `X-Twilio-Signature` header against the request URL + params.
 *
 * In production, verification is REQUIRED — requests are rejected if
 * TWILIO_AUTH_TOKEN is not set. In development, it logs a warning and allows
 * through.
 */

import twilio from 'twilio';
import { logger } from '@/lib/logger';

/**
 * Verify a Twilio webhook request signature.
 *
 * @param params   – The form/body params (key-value pairs)
 * @param signature – The `X-Twilio-Signature` header value
 * @param url       – The full request URL (including query params)
 * @returns true if valid, false if invalid
 */
export function verifyTwilioSignature(
  params: Record<string, string>,
  signature: string,
  url: string
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    // ALWAYS reject when auth token is missing — never silently accept
    // unauthenticated webhooks in any environment
    logger.error(
      'TWILIO_AUTH_TOKEN not set — rejecting webhook. ' +
        'Set TWILIO_AUTH_TOKEN to verify Twilio webhook signatures.',
      { module: 'twilio-verify' }
    );
    return false;
  }

  if (!signature) {
    return false;
  }

  return twilio.validateRequest(authToken, signature, url, params);
}

/**
 * Check whether Twilio signature verification is enabled.
 */
export function isTwilioVerificationEnabled(): boolean {
  return !!process.env.TWILIO_AUTH_TOKEN;
}

/**
 * Build the full webhook URL from a Next.js request.
 * Twilio signs the complete URL including query parameters.
 */
export function buildWebhookUrl(request: Request, pathname: string): string {
  const url = new URL(request.url);

  // Use the public-facing URL if configured, otherwise reconstruct
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${url.protocol}//${url.host}`;

  // Include the full path with query string (Twilio signs the complete URL)
  return `${baseUrl}${pathname}${url.search}`;
}
