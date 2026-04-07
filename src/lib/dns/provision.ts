/**
 * Subdomain provisioner.
 * Creates both a Cloudflare DNS record and a Vercel domain
 * when a tenant registers a subdomain.
 *
 * Runs fire-and-forget after signup so it doesn't block the user.
 */

import { createSubdomainRecord, deleteSubdomainRecord } from './cloudflare';
import { addVercelDomain, removeVercelDomain } from './vercel';
import { logger } from '@/lib/logger';

/**
 * Provision a subdomain: Cloudflare CNAME + Vercel domain.
 * Idempotent — safe to retry if partially completed.
 */
export async function provisionSubdomain(subdomain: string): Promise<void> {
  // Skip in development or if not configured
  if (
    process.env.NODE_ENV !== 'production' ||
    !process.env.CLOUDFLARE_API_TOKEN ||
    !process.env.VERCEL_API_TOKEN
  ) {
    logger.info('Subdomain provisioning skipped (not configured)', { subdomain });
    return;
  }

  logger.info('Provisioning subdomain', { subdomain });

  // Step 1: Cloudflare DNS CNAME
  await createSubdomainRecord(subdomain);

  // Step 2: Vercel domain
  await addVercelDomain(subdomain);

  logger.info('Subdomain provisioned successfully', { subdomain });
}

/**
 * Deprovision a subdomain: remove from both Vercel and Cloudflare.
 */
export async function deprovisionSubdomain(subdomain: string): Promise<void> {
  if (
    process.env.NODE_ENV !== 'production' ||
    !process.env.CLOUDFLARE_API_TOKEN ||
    !process.env.VERCEL_API_TOKEN
  ) {
    return;
  }

  logger.info('Deprovisioning subdomain', { subdomain });

  await removeVercelDomain(subdomain);
  await deleteSubdomainRecord(subdomain);

  logger.info('Subdomain deprovisioned', { subdomain });
}
