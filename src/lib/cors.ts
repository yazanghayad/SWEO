import { NextRequest, NextResponse } from 'next/server';

/**
 * Allowed origin domain for widget CORS.
 *
 * The embeddable chat widget runs on arbitrary customer websites, so we
 * MUST allow any origin — the actual auth is via the tenant API key
 * (Bearer token), which is the same pattern Intercom / Crisp / Drift use.
 *
 * For non-widget (dashboard) API routes, callers should NOT use this
 * module — those are protected by session cookies + SameSite.
 */
/**
 * Validate an origin for widget CORS. Any non-empty origin is accepted
 * because the widget is intentionally embeddable on third-party sites.
 * Auth is enforced via the API key, not the origin.
 */
function isAllowedOrigin(origin: string | null): boolean {
  // Reject requests with no origin header (e.g. direct curl)
  if (!origin) return false;

  try {
    // Validate it's a real URL to avoid header-injection
    new URL(origin);
    return true;
  } catch {
    return false;
  }
}

/**
 * Standard CORS headers for widget-facing API routes.
 */
export function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin');
  const allowedOrigin = isAllowedOrigin(origin) ? (origin ?? '*') : '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400' // 24h preflight cache
  };
}

/**
 * Handle CORS preflight (OPTIONS) request.
 * Export this as the `OPTIONS` handler on widget-facing routes.
 */
export function handlePreflight(request: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request)
  });
}
