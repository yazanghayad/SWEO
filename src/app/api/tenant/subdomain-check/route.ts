import { NextRequest, NextResponse } from 'next/server';
import {
  validateSubdomain,
  normalizeSubdomain,
  isSubdomainAvailable
} from '@/lib/tenant/subdomain';
import { subdomainCheckSchema, formatZodError } from '@/lib/api-schemas';

/**
 * GET /api/tenant/subdomain-check?slug=my-company
 *
 * Publicly accessible endpoint to check subdomain availability
 * before or during signup.
 */
export async function GET(request: NextRequest) {
  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const parsedSlug = subdomainCheckSchema.safeParse({
    slug: request.nextUrl.searchParams.get('slug')
  });
  if (!parsedSlug.success) {
    return NextResponse.json(
      { error: formatZodError(parsedSlug.error) },
      { status: 400 }
    );
  }

  const normalized = normalizeSubdomain(parsedSlug.data.slug);
  const validationError = validateSubdomain(normalized);

  if (validationError) {
    return NextResponse.json({
      available: false,
      error: validationError
    });
  }

  const available = await isSubdomainAvailable(normalized);

  return NextResponse.json({
    available,
    subdomain: normalized,
    error: available ? null : 'This subdomain is already taken.'
  });
}
