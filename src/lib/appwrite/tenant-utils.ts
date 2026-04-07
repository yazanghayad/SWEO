/**
 * Tenant resolution utilities shared across webhooks and server actions.
 */

import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/appwrite';

/**
 * Look up a tenant by its API key.
 * Returns the tenant document or null.
 */
export async function resolveTenantByApiKey(
  apiKey: string
): Promise<Tenant | null> {
  const { databases } = createAdminClient();
  const result = await databases.listDocuments<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('apiKey', apiKey), Query.limit(1)]
  );
  return result.documents[0] ?? null;
}
