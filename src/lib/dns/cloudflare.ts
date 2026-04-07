/**
 * Cloudflare DNS API client.
 * Creates CNAME records for tenant subdomains → cname.vercel-dns.com.
 */

import { logger } from '@/lib/logger';

const CF_API = 'https://api.cloudflare.com/client/v4';

function getConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!apiToken || !zoneId) {
    throw new Error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required');
  }

  return { apiToken, zoneId };
}

function headers(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Create a CNAME record: {subdomain}.sweo.se → cname.vercel-dns.com
 * Proxy is disabled (DNS-only / grey cloud) so Vercel can issue SSL.
 */
export async function createSubdomainRecord(subdomain: string): Promise<void> {
  const { apiToken, zoneId } = getConfig();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se';

  const res = await fetch(`${CF_API}/zones/${zoneId}/dns_records`, {
    method: 'POST',
    headers: headers(apiToken),
    body: JSON.stringify({
      type: 'CNAME',
      name: `${subdomain}.${rootDomain}`,
      content: 'cname.vercel-dns.com',
      ttl: 1, // Auto
      proxied: false // DNS-only — required for Vercel SSL
    })
  });

  const data = await res.json();

  if (!data.success) {
    // If record already exists, that's fine
    const alreadyExists = data.errors?.some(
      (e: { code: number }) => e.code === 81057
    );
    if (alreadyExists) {
      logger.info('Cloudflare DNS record already exists', { subdomain });
      return;
    }
    logger.error('Cloudflare DNS creation failed', { subdomain, errors: data.errors });
    throw new Error(`Cloudflare DNS error: ${JSON.stringify(data.errors)}`);
  }

  logger.info('Cloudflare DNS record created', { subdomain, recordId: data.result?.id });
}

/**
 * Delete a CNAME record for a tenant subdomain.
 */
export async function deleteSubdomainRecord(subdomain: string): Promise<void> {
  const { apiToken, zoneId } = getConfig();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se';
  const fqdn = `${subdomain}.${rootDomain}`;

  // Find the record first
  const listRes = await fetch(
    `${CF_API}/zones/${zoneId}/dns_records?type=CNAME&name=${fqdn}`,
    { headers: headers(apiToken) }
  );
  const listData = await listRes.json();

  const record = listData.result?.[0];
  if (!record) {
    logger.info('Cloudflare DNS record not found, nothing to delete', { subdomain });
    return;
  }

  await fetch(`${CF_API}/zones/${zoneId}/dns_records/${record.id}`, {
    method: 'DELETE',
    headers: headers(apiToken)
  });

  logger.info('Cloudflare DNS record deleted', { subdomain, recordId: record.id });
}
