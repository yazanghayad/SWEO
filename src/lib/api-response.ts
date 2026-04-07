/**
 * Standardised API response helpers.
 *
 * Every JSON API route should use these helpers so that consumers always
 * receive a consistent shape:
 *
 *   Success → { ok: true, data: T }
 *   Error   → { ok: false, error: string, code?: string }
 *
 * Streaming (SSE) routes are exempt — they have their own event format.
 *
 * Migration note: legacy routes that already return `{ error: '...' }`
 * still work — the `ok` field lets callers distinguish old vs new format
 * without breaking changes.
 */

import { NextResponse } from 'next/server';
import { safeError } from '@/lib/safe-error';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return a JSON success response.
 *
 * @param data   – payload
 * @param status – HTTP status (default 200)
 */
export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    { ok: true, data },
    { status }
  );
}

/**
 * Return a JSON error response.
 *
 * @param error  – human-readable message (already sanitised by caller)
 * @param status – HTTP status (default 400)
 * @param code   – optional machine-readable code, e.g. 'RATE_LIMITED'
 */
export function apiError(error: string, status = 400, code?: string) {
  const body: ApiErrorResponse = { ok: false, error };
  if (code) body.code = code;
  return NextResponse.json<ApiErrorResponse>(body, { status });
}

/**
 * Catch-all error handler for route `catch` blocks.
 *
 * Logs the raw error, returns a safe message to the client.
 *
 * @param err      – caught error
 * @param fallback – generic message like "Failed to save"
 * @param status   – HTTP status (default 500)
 * @param code     – optional machine-readable code
 */
export function apiCatchError(
  err: unknown,
  fallback: string,
  status = 500,
  code?: string
) {
  const msg = safeError(err, fallback);
  return apiError(msg, status, code);
}
