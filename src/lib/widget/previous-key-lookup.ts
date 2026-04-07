/**
 * Grace-period tenant lookup by previously-rotated API key.
 *
 * Uses the indexed `previousApiKey` top-level field on the tenants collection
 * instead of `Query.contains('config', apiKey)` which causes full table scans.
 */

import { Query } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { safeCompare } from '@/lib/security/timing-safe-compare';
import type { Tenant } from '@/types/appwrite';

/**
 * Look up a tenant whose `previousApiKey` matches the given key and whose
 * grace-period has not yet expired. Returns null if no valid match.
 */
export async function findTenantByPreviousApiKey(
  apiKey: string
): Promise<Tenant | null> {
  const { databases } = createAdminClient();

  const result = await databases.listDocuments<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('previousApiKey', apiKey), Query.limit(1)]
  );

  if (result.documents.length === 0) return null;

  const tenant = result.documents[0];

  // Verify using timing-safe comparison and check expiry
  const expiresAt = tenant.previousApiKeyExpiresAt;
  if (
    safeCompare(tenant.previousApiKey ?? '', apiKey) &&
    expiresAt &&
    new Date(expiresAt) > new Date()
  ) {
    return tenant;
  }

  return null;
}
