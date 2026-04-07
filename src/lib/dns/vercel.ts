/**
 * Vercel Domains API client.
 * Adds tenant subdomains to the Vercel project so it can serve them.
 */

import { logger } from '@/lib/logger';

const VERCEL_API = 'https://api.vercel.com';

function getConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    throw new Error('VERCEL_API_TOKEN and VERCEL_PROJECT_ID are required');
  }

  return { token, projectId };
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Add a domain to the Vercel project: {subdomain}.sweo.se
 */
export async function addVercelDomain(subdomain: string): Promise<void> {
  const { token, projectId } = getConfig();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se';
  const domain = `${subdomain}.${rootDomain}`;

  const res = await fetch(
    `${VERCEL_API}/v10/projects/${projectId}/domains`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ name: domain })
    }
  );

  const data = await res.json();

  if (res.ok) {
    logger.info('Vercel domain added', { domain });
    return;
  }

  // Domain already exists on this project — that's fine
  if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'domain_already_added') {
    logger.info('Vercel domain already exists', { domain });
    return;
  }

  logger.error('Vercel domain creation failed', { domain, error: data.error });
  throw new Error(`Vercel domain error: ${data.error?.message ?? 'unknown'}`);
}

/**
 * Remove a domain from the Vercel project.
 */
export async function removeVercelDomain(subdomain: string): Promise<void> {
  const { token, projectId } = getConfig();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se';
  const domain = `${subdomain}.${rootDomain}`;

  const res = await fetch(
    `${VERCEL_API}/v9/projects/${projectId}/domains/${domain}`,
    {
      method: 'DELETE',
      headers: headers(token)
    }
  );

  if (res.ok || res.status === 404) {
    logger.info('Vercel domain removed', { domain });
    return;
  }

  const data = await res.json();
  logger.error('Vercel domain removal failed', { domain, error: data.error });
}
