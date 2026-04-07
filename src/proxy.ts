import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy that:
 * 1. Protects authenticated routes (redirect to sign-in if no session).
 * 2. Redirects already-authenticated users away from auth pages.
 * 3. Sets the x-locale header based on URL prefix.
 * 4. Generates a per-request nonce for Content-Security-Policy so that
 *    inline scripts (e.g. the theme-color snippet in layout.tsx) can run
 *    without the blanket 'unsafe-inline' directive.
 */

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/setup'];

// Routes that should redirect TO dashboard if already authenticated
const AUTH_ROUTES = ['/auth/sign-in', '/auth/sign-up'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') ?? '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se';

  // ── Subdomain routing ─────────────────────────────────────────────
  const appHost = `app.${rootDomain}`;
  const docsHost = `docs.${rootDomain}`;

  if (process.env.NODE_ENV === 'production') {
    // sweo.se/docs → redirect to docs.sweo.se
    if (hostname === rootDomain && pathname.startsWith('/docs')) {
      const docsUrl = new URL(pathname, `https://${docsHost}`);
      docsUrl.search = request.nextUrl.search;
      return NextResponse.redirect(docsUrl, 307);
    }

    // docs.sweo.se → rewrite to /docs routes
    if (hostname === docsHost) {
      const docsPath = pathname === '/' ? '/docs' : pathname.startsWith('/docs') ? pathname : `/docs${pathname}`;
      const rewriteUrl = new URL(docsPath, request.url);
      rewriteUrl.search = request.nextUrl.search;
      return NextResponse.rewrite(rewriteUrl);
    }

    // sweo.se/auth|dashboard|setup → redirect to app.sweo.se
    if (
      hostname === rootDomain &&
      (pathname.startsWith('/dashboard') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/setup'))
    ) {
      const appUrl = new URL(pathname, `https://${appHost}`);
      appUrl.search = request.nextUrl.search;
      return NextResponse.redirect(appUrl, 307);
    }

    // app.sweo.se/ → redirect to dashboard if authenticated, sign-in if not
    if (hostname === appHost && pathname === '/') {
      const session = request.cookies.get('appwrite_session');
      if (session?.value) {
        return NextResponse.redirect(
          new URL('/dashboard/overview', request.url)
        );
      }
      return NextResponse.redirect(
        new URL('/auth/sign-in', request.url)
      );
    }

    // Tenant subdomains: acme.sweo.se
    // - /dashboard, /auth, /setup → serve app routes directly (tenant dashboard)
    // - everything else → rewrite to /portal/acme (public portal)
    if (
      hostname !== rootDomain &&
      hostname !== appHost &&
      hostname !== docsHost &&
      hostname.endsWith(`.${rootDomain}`)
    ) {
      const tenantSlug = hostname.replace(`.${rootDomain}`, '');

      // Dashboard/auth/setup routes serve the app directly (cookie auth handles tenant)
      if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/setup') ||
        pathname.startsWith('/api')
      ) {
        // Let the request through — it will be handled by normal app routes
        // Auth protection below will redirect to sign-in if needed
      } else if (pathname === '/') {
        // Root of tenant subdomain → redirect to dashboard
        return NextResponse.redirect(
          new URL('/dashboard/overview', request.url)
        );
      } else {
        // Public pages → portal
        const portalUrl = new URL(`/portal/${tenantSlug}${pathname}`, request.url);
        portalUrl.search = request.nextUrl.search;
        return NextResponse.rewrite(portalUrl);
      }
    }
  }

  // ── Auth route protection ───────────────────────────────────────────
  const sessionCookie = request.cookies.get('appwrite_session');
  const isAuthenticated = !!sessionCookie?.value;

  // Protect dashboard and setup routes
  if (
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) &&
    !isAuthenticated
  ) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from auth pages
  // But NOT on app.sweo.se — that's the auth hub, preparing page handles redirect
  if (
    AUTH_ROUTES.some((r) => pathname.startsWith(r)) &&
    isAuthenticated &&
    hostname !== appHost
  ) {
    return NextResponse.redirect(
      new URL('/dashboard/overview', request.url)
    );
  }

  // ── Locale detection ─────────────────────────────────────────────────
  const locale = pathname.startsWith('/sv') ? 'sv' : 'en';

  // ── CSP nonce generation ─────────────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // CSP nonce is generated per-request and forwarded to layout.tsx via
  // x-nonce header.  All inline <script> tags must carry nonce={nonce}.
  //
  // 'strict-dynamic' already makes 'unsafe-inline' a no-op in CSP3
  // browsers, so we drop it entirely—older CSP2 browsers will block
  // un-nonced inline scripts, which is the desired secure behaviour.
  //
  // style-src still needs 'unsafe-inline' because Tailwind, Radix UI,
  // and Next.js inject inline styles that cannot practically be nonced.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https:`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.sweo.se https://*.appwrite.io https://*.sentry.io https://*.upstash.io https://integrate.api.nvidia.com https://api.openai.com https://api.resend.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  // Forward the nonce to server components via a custom request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders }
  });

  response.headers.set('x-locale', locale);
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  // Run on pages, not on static files or API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon|robots|assets|images|img|icons|favicons|fin|fin-assets|widget|public|.*\\..*).*)'],
};
