import { NextRequest, NextResponse } from 'next/server';
import { emailAdapter } from '@/lib/channels/email-adapter';
import { logger } from '@/lib/logger';
import { timingSafeEqual, createHmac } from 'crypto';

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? 'sweo.se';

/**
 * Mailgun email domain used for inbound routing.
 * Default: app.sweo.se  →  emails like  acme@app.sweo.se
 */
const MAIL_DOMAIN = process.env.MAILGUN_DOMAIN ?? `app.${ROOT_DOMAIN}`;

/**
 * Extract tenant subdomain from a recipient address.
 *
 * Supports two patterns (checked in order):
 *
 * 1. **Local-part routing** (primary, current Mailgun setup)
 *    `acme@app.sweo.se`  →  tenant subdomain "acme"
 *    The local part (before @) IS the tenant slug when the domain matches
 *    the configured MAILGUN_DOMAIN (app.sweo.se).
 *
 * 2. **Subdomain routing** (if you later add wildcard MX for *.sweo.se)
 *    `support@acme.sweo.se`  →  tenant subdomain "acme"
 *
 * Also handles comma-separated recipient lists and "Name <email>" format.
 */
function extractSubdomainFromRecipient(
  recipient: string | undefined
): string | null {
  if (!recipient) return null;

  // Take first address if comma-separated
  const addr = recipient.split(',')[0].trim();
  // Strip "Name <email>" format → just email
  const match = addr.match(/<([^>]+)>/) ?? [null, addr];
  const email = (match[1] ?? addr).toLowerCase();

  const atIdx = email.indexOf('@');
  if (atIdx < 0) return null;

  const localPart = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);

  // ── Pattern 1: local-part routing (acme@app.sweo.se) ──────────────
  if (domain === MAIL_DOMAIN.toLowerCase() && localPart) {
    // Strip common prefixes: support+acme → acme, noreply+beta → beta
    const plusIdx = localPart.indexOf('+');
    const slug = plusIdx >= 0 ? localPart.slice(plusIdx + 1) : localPart;
    // Ignore generic local parts that aren't tenant slugs
    const genericParts = new Set([
      'postmaster', 'abuse', 'noreply', 'no-reply',
      'mailer-daemon', 'support', 'info', 'help', 'admin'
    ]);
    if (slug && !genericParts.has(slug)) return slug;
  }

  // ── Pattern 2: subdomain routing (support@acme.sweo.se) ───────────
  const rootWithoutPort = ROOT_DOMAIN.split(':')[0];
  if (domain !== rootWithoutPort && domain.endsWith(`.${rootWithoutPort}`)) {
    const sub = domain.replace(`.${rootWithoutPort}`, '');
    // Don't match the mail subdomain itself (app.sweo.se)
    if (sub && sub !== 'app' && sub !== 'www' && sub !== 'mail') return sub;
  }

  return null;
}

/**
 * Verify webhook signature (if configured).
 *
 * Supports two modes:
 *
 * 1. **HMAC-SHA256** (WEBHOOK_EMAIL_SECRET set):
 *    Checks `x-webhook-signature` header against HMAC of raw body.
 *    Used with SendGrid Signed Webhooks, CloudMailin, etc.
 *
 * 2. **Mailgun Inbound Parse** (no secret set):
 *    Mailgun's `forward()` action does NOT sign the payload.
 *    Security is provided by:
 *    - IP-based rate limiting (prevents abuse)
 *    - Tenant lookup via recipient address (only valid tenants are served)
 *    - HTTPS-only endpoint (prevents interception)
 *
 * When `WEBHOOK_EMAIL_SECRET` is not set, signature check is skipped.
 */
function verifyEmailSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  // A webhook secret MUST be configured in all environments
  if (!secret) {
    logger.error(
      '[webhook/email] WEBHOOK_EMAIL_SECRET is not configured — rejecting request. ' +
      'Set WEBHOOK_EMAIL_SECRET even in development to avoid training insecure habits.'
    );
    return false;
  }

  if (!signatureHeader) return false;

  const expected = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected)
    );
  } catch {
    return false; // length mismatch etc.
  }
}

/**
 * POST /api/webhooks/email
 *
 * Inbound email webhook. Receives parsed email from Mailgun, SendGrid
 * Inbound Parse, or CloudMailin and routes it through the AI pipeline.
 *
 * Tenant resolution (in priority order):
 *   1. `x-tenant-api-key` header or `?key=` query param
 *   2. Auto-detect from recipient address subdomain
 *      (e.g. support@acme.sweo.se → tenant with subdomain "acme")
 *
 * Body: JSON or multipart/form-data with { from, to/recipient, subject, text }
 */
export async function POST(request: NextRequest) {
  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  // ── Read raw body for signature verification ────────────────────────
  const rawBody = await request.text();
  const webhookSecret = process.env.WEBHOOK_EMAIL_SECRET ?? '';
  const signatureHeader = request.headers.get('x-webhook-signature') ?? '';

  if (!verifyEmailSignature(rawBody, signatureHeader, webhookSecret)) {
    logger.warn('[webhook/email] Signature verification failed');
    return new Response('Unauthorized', { status: 403 });
  }

  // ── Parse body (needed before tenant resolution for recipient field) ─
  let body: Record<string, unknown>;
  try {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      body = JSON.parse(rawBody);
    } else if (contentType.includes('multipart/form-data')) {
      const fakeReq = new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: rawBody
      });
      const formData = await fakeReq.formData();
      body = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    } else {
      body = JSON.parse(rawBody);
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse request body' },
      { status: 400 }
    );
  }

  // ── Resolve tenant ──────────────────────────────────────────────────
  // Priority 1: Explicit API key (header only — never from query params)
  let tenantApiKey =
    request.headers.get('x-tenant-api-key') ??
    null;

  // Priority 2: Auto-detect from recipient (e.g. acme@app.sweo.se or support@acme.sweo.se)
  let tenantSubdomain: string | null = null;
  if (!tenantApiKey) {
    const recipient =
      (body.recipient as string) ??
      (body.to as string) ??
      (body.To as string) ??
      '';
    tenantSubdomain = extractSubdomainFromRecipient(recipient);

    if (!tenantSubdomain) {
      logger.warn('[webhook/email] No API key and could not extract subdomain', {
        recipient
      });
      return NextResponse.json(
        {
          error:
            `Missing tenant identification. Provide x-tenant-api-key header, ?key= param, or send to <tenant>@${MAIL_DOMAIN}`
        },
        { status: 401 }
      );
    }

    // Look up tenant by subdomain
    const { createAdminClient: admin } = await import(
      '@/lib/appwrite/server'
    );
    const { APPWRITE_DATABASE: DB } = await import(
      '@/lib/appwrite/constants'
    );
    const { COLLECTION: COL } = await import('@/lib/appwrite/collections');
    const { Query } = await import('node-appwrite');

    const { databases } = admin();
    const result = await databases.listDocuments(DB, COL.TENANTS, [
      Query.equal('subdomain', tenantSubdomain),
      Query.limit(1)
    ]);

    if (result.documents.length === 0) {
      logger.warn('[webhook/email] No tenant for subdomain', {
        tenantSubdomain
      });
      return NextResponse.json(
        { error: `No tenant found for subdomain: ${tenantSubdomain}` },
        { status: 404 }
      );
    }

    tenantApiKey = result.documents[0].apiKey as string;
    logger.info('[webhook/email] Resolved tenant via subdomain', {
      tenantSubdomain,
      tenantId: result.documents[0].$id
    });
  }

  const payload = {
    from: (body.from as string) ?? (body.sender as string) ?? '',
    subject: (body.subject as string) ?? '',
    text: (body.text as string) ?? (body['stripped-text'] as string) ?? '',
    tenantApiKey,
    inReplyTo: body['In-Reply-To'] as string | undefined,
    messageId: body['Message-Id'] as string | undefined
  };

  if (!payload.from || !payload.text) {
    return NextResponse.json(
      { error: 'Missing required fields: from, text' },
      { status: 400 }
    );
  }

  try {
    const result = await emailAdapter.handleIncoming(payload);

    return NextResponse.json({
      success: true,
      conversationId: result.conversationId,
      resolved: result.resolved
    });
  } catch (err) {
    logger.error('Email webhook error', { err });
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
}
