import { NextRequest, NextResponse } from 'next/server';

/**
 * Health check endpoint that verifies if a tenant subdomain is reachable.
 * Used by the "preparing" page to poll until the subdomain is live.
 *
 * GET /api/tenant/subdomain-health?subdomain=acme
 */
export async function GET(req: NextRequest) {
  const subdomain = req.nextUrl.searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json({ ready: false, error: 'Missing subdomain' }, { status: 400 });
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se';
  const url = `https://${subdomain}.${rootDomain}/`;

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000)
    });

    // Any 2xx or 3xx means the domain is live
    const ready = res.status < 400;
    return NextResponse.json({ ready, status: res.status });
  } catch {
    return NextResponse.json({ ready: false, error: 'unreachable' });
  }
}
