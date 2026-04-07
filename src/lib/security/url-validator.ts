/**
 * SSRF protection utility.
 *
 * Validates URLs before making server-side HTTP requests to prevent
 * Server-Side Request Forgery attacks where tenant-provided URLs could
 * access internal services (cloud metadata, local databases, etc.).
 */

import { lookup } from 'dns/promises';

// ---------------------------------------------------------------------------
// Blocked IP ranges (RFC 1918 / RFC 5735 / RFC 4193)
// ---------------------------------------------------------------------------

const BLOCKED_RANGES = [
  // IPv4 private / reserved
  { prefix: '10.', description: 'RFC 1918 class A private' },
  { prefix: '172.16.', description: 'RFC 1918 class B private' },
  { prefix: '172.17.', description: 'RFC 1918 class B private' },
  { prefix: '172.18.', description: 'RFC 1918 class B private' },
  { prefix: '172.19.', description: 'RFC 1918 class B private' },
  { prefix: '172.20.', description: 'RFC 1918 class B private' },
  { prefix: '172.21.', description: 'RFC 1918 class B private' },
  { prefix: '172.22.', description: 'RFC 1918 class B private' },
  { prefix: '172.23.', description: 'RFC 1918 class B private' },
  { prefix: '172.24.', description: 'RFC 1918 class B private' },
  { prefix: '172.25.', description: 'RFC 1918 class B private' },
  { prefix: '172.26.', description: 'RFC 1918 class B private' },
  { prefix: '172.27.', description: 'RFC 1918 class B private' },
  { prefix: '172.28.', description: 'RFC 1918 class B private' },
  { prefix: '172.29.', description: 'RFC 1918 class B private' },
  { prefix: '172.30.', description: 'RFC 1918 class B private' },
  { prefix: '172.31.', description: 'RFC 1918 class B private' },
  { prefix: '192.168.', description: 'RFC 1918 class C private' },
  { prefix: '127.', description: 'Loopback' },
  { prefix: '0.', description: 'Current network' },
  { prefix: '169.254.', description: 'Link-local / AWS metadata' },
  { prefix: '100.64.', description: 'Shared Address Space (CGN)' },
  // IPv6 private / reserved
  { prefix: '::1', description: 'IPv6 loopback' },
  { prefix: 'fc', description: 'IPv6 unique local (fc00::/7)' },
  { prefix: 'fd', description: 'IPv6 unique local (fc00::/7)' },
  { prefix: 'fe80:', description: 'IPv6 link-local' },
  { prefix: '::ffff:10.', description: 'IPv4-mapped private' },
  { prefix: '::ffff:127.', description: 'IPv4-mapped loopback' },
  { prefix: '::ffff:169.254.', description: 'IPv4-mapped link-local' },
  { prefix: '::ffff:192.168.', description: 'IPv4-mapped private' }
];

/** Blocked hostnames that could expose internal services. */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.google',
  'kubernetes.default.svc',
  'kubernetes.default'
]);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isBlockedIp(ip: string): boolean {
  const normalised = ip.toLowerCase().trim();
  return BLOCKED_RANGES.some((r) => normalised.startsWith(r.prefix));
}

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return BLOCKED_HOSTNAMES.has(lower);
}

/**
 * Validate that a URL string is safe for server-side fetching.
 *
 * 1. Must be http or https
 * 2. Hostname must not be a blocked internal hostname
 * 3. Resolved IP must not be a private / loopback / link-local address
 *
 * @throws Error if the URL is unsafe
 */
export async function validateExternalUrl(urlString: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error(`Invalid URL: ${urlString}`);
  }

  // Only allow HTTP(S)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `Blocked URL scheme "${parsed.protocol}" – only http/https allowed`
    );
  }

  // Check hostname against blocklist
  if (isBlockedHost(parsed.hostname)) {
    throw new Error(`Blocked hostname: ${parsed.hostname}`);
  }

  // DNS resolution check – resolve hostname to IP and test against ranges
  try {
    const { address } = await lookup(parsed.hostname);
    if (isBlockedIp(address)) {
      throw new Error(
        `URL "${parsed.hostname}" resolves to a blocked private IP (${address})`
      );
    }
  } catch (err) {
    // Re-throw our own errors
    if (err instanceof Error && err.message.includes('blocked')) {
      throw err;
    }
    // DNS resolution failure → block to be safe
    throw new Error(`DNS resolution failed for ${parsed.hostname}: ${err}`);
  }
}
