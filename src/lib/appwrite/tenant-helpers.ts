import { Query } from 'node-appwrite';
import type { Models } from 'node-appwrite';
import { createSessionClient, createAdminClient } from './server';
import { APPWRITE_DATABASE } from './constants';
import { COLLECTION } from './collections';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Tenant-scoped reads
// ---------------------------------------------------------------------------

/**
 * List documents for a tenant (server-side, uses current session).
 */
export async function getTenantDocuments<T extends Models.Document>(
  collectionId: string,
  tenantId: string,
  queries: string[] = [],
  limit = 25
): Promise<Models.DocumentList<T>> {
  const { databases } = await createSessionClient();
  return databases.listDocuments<T>(APPWRITE_DATABASE, collectionId, [
    Query.equal('tenantId', tenantId),
    Query.limit(limit),
    ...queries
  ]);
}

/**
 * List documents for a tenant (admin client - for server actions).
 */
export async function getTenantDocumentsAdmin<T extends Models.Document>(
  collectionId: string,
  tenantId: string,
  queries: string[] = [],
  limit = 25
): Promise<Models.DocumentList<T>> {
  const { databases } = createAdminClient();
  return databases.listDocuments<T>(APPWRITE_DATABASE, collectionId, [
    Query.equal('tenantId', tenantId),
    Query.limit(limit),
    ...queries
  ]);
}

/**
 * Get a single document by ID (server-side, uses current session).
 */
export async function getTenantDocument<T extends Models.Document>(
  collectionId: string,
  documentId: string
): Promise<T> {
  const { databases } = await createSessionClient();
  return databases.getDocument<T>(APPWRITE_DATABASE, collectionId, documentId);
}

/**
 * Get a single document by ID (admin client - for server actions).
 */
export async function getTenantDocumentAdmin<T extends Models.Document>(
  collectionId: string,
  documentId: string
): Promise<T> {
  const { databases } = createAdminClient();
  return databases.getDocument<T>(APPWRITE_DATABASE, collectionId, documentId);
}

// ---------------------------------------------------------------------------
// Tenant-scoped writes (admin client – bypasses document-level permissions)
// ---------------------------------------------------------------------------

/**
 * Create a document scoped to a tenant.
 */
export async function createTenantDocument<T extends Models.Document>(
  collectionId: string,
  tenantId: string,
  data: Record<string, unknown>
): Promise<T> {
  const { databases } = createAdminClient();
  const { ID } = await import('node-appwrite');
  return databases.createDocument(
    APPWRITE_DATABASE,
    collectionId,
    ID.unique(),
    { tenantId, ...data } as any
  ) as Promise<T>;
}

/**
 * Update an existing document.
 * Verifies the document belongs to the given tenant before updating
 * (prevents cross-tenant writes). The tenant check is mandatory.
 */
export async function updateTenantDocument<T extends Models.Document>(
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>,
  expectedTenantId: string
): Promise<T> {
  const { databases } = createAdminClient();

  // Always verify ownership before mutating
  const existing = await databases.getDocument(
    APPWRITE_DATABASE,
    collectionId,
    documentId
  );
  if ((existing as Record<string, unknown>).tenantId !== expectedTenantId) {
    throw new Error('Forbidden: document does not belong to this tenant');
  }

  return databases.updateDocument(
    APPWRITE_DATABASE,
    collectionId,
    documentId,
    data as any
  ) as Promise<T>;
}

/**
 * Delete a document.
 * Verifies the document belongs to the given tenant before deleting
 * (prevents cross-tenant deletes). The tenant check is mandatory.
 */
export async function deleteTenantDocument(
  collectionId: string,
  documentId: string,
  expectedTenantId: string
): Promise<void> {
  const { databases } = createAdminClient();

  // Always verify ownership before deleting
  const existing = await databases.getDocument(
    APPWRITE_DATABASE,
    collectionId,
    documentId
  );
  if ((existing as Record<string, unknown>).tenantId !== expectedTenantId) {
    throw new Error('Forbidden: document does not belong to this tenant');
  }

  await databases.deleteDocument(APPWRITE_DATABASE, collectionId, documentId);
}

// ---------------------------------------------------------------------------
// Convenience: get or create tenant for current user
// ---------------------------------------------------------------------------

export async function getOrCreateTenant(userId: string, name: string) {
  const { databases } = createAdminClient();
  const { ID } = await import('node-appwrite');

  const existing = await databases.listDocuments(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('userId', userId), Query.limit(1)]
  );

  if (existing.documents.length > 0) {
    return existing.documents[0];
  }

  // Create team for the new tenant
  let teamId: string | undefined;
  try {
    const { createTeam } = await import('./teams');
    teamId = await createTeam(name, userId);
  } catch (err) {
    logger.warn('Failed to create team for new tenant', { err });
  }

  return databases.createDocument(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    ID.unique(),
    {
      name,
      plan: 'trial',
      config: JSON.stringify({ teamId }),
      apiKey: crypto.randomUUID().replace(/-/g, ''),
      userId
    }
  );
}
