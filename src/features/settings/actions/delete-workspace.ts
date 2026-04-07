'use server';

import { cookies } from 'next/headers';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE, APPWRITE_SESSION_COOKIE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';
import { requirePermission } from '@/lib/rbac/actions';

/**
 * Permanently deletes the current user's workspace (tenant) and all
 * associated data, then signs the user out.
 *
 * Security: The tenant is derived server-side from the session — no
 * client-supplied tenantId is trusted.
 */
export async function deleteWorkspaceAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 1. Authenticate and resolve tenant
    const { account } = await createSessionClient();
    const user = await account.get();

    const { databases } = createAdminClient();

    const tenants = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    if (tenants.documents.length === 0) {
      return { success: false, error: 'Not found' };
    }

    const tenant = tenants.documents[0];

    // RBAC: only owner can delete workspace
    await requirePermission(tenant.$id, 'workspace.delete');
    const tenantId = tenant.$id;

    // 2. Delete all tenant-scoped documents across collections
    const tenantCollections = [
      COLLECTION.KNOWLEDGE_SOURCES,
      COLLECTION.CONVERSATIONS,
      COLLECTION.MESSAGES,
      COLLECTION.POLICIES,
      COLLECTION.AUDIT_EVENTS,
      COLLECTION.PROCEDURES,
      COLLECTION.DATA_CONNECTORS,
      COLLECTION.TEST_SCENARIOS,
      COLLECTION.CONTENT_SUGGESTIONS,
      COLLECTION.VECTORS,
      COLLECTION.CHATBOT_CONVERSATIONS,
      COLLECTION.CHATBOT_MESSAGES,
      COLLECTION.MACROS,
      COLLECTION.TAGS,
      COLLECTION.WEBHOOKS,
      COLLECTION.AUTOMATION_RULES,
      COLLECTION.TEAM_INBOXES,
      COLLECTION.GUIDANCE_RULES,
      COLLECTION.CONTACTS,
      COLLECTION.CASES,
      COLLECTION.CASE_DOCUMENTS,
      COLLECTION.CASE_NOTES,
      COLLECTION.CASE_TIMELINE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      COLLECTION.HELPDESK_SYNC_LOG,
      COLLECTION.OUTBOUND_MESSAGES
    ];

    for (const collectionId of tenantCollections) {
      try {
        await deleteAllDocumentsInCollection(databases, collectionId, tenantId);
      } catch (err) {
        // Log but continue — best effort cleanup
        logger.error(`Failed to clean collection ${collectionId}`, { err });
      }
    }

    // 3. Delete the tenant document itself
    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenantId
    );

    // 4. Delete the Appwrite user account
    try {
      const { users: usersService } = createAdminClient();
      await usersService.delete(user.$id);
    } catch (err) {
      logger.error('Failed to delete Appwrite user account', { err });
    }

    // 5. Clear session cookie
    (await cookies()).delete(APPWRITE_SESSION_COOKIE);

    logger.info('Workspace deleted', { tenantId, userId: user.$id });

    return { success: true };
  } catch (err) {
    logger.error('deleteWorkspaceAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to delete workspace')
    };
  }
}

/**
 * Batch-deletes all documents in a collection that belong to a tenant.
 * Uses pagination to handle large datasets.
 */
async function deleteAllDocumentsInCollection(
  databases: ReturnType<typeof createAdminClient>['databases'],
  collectionId: string,
  tenantId: string
) {
  const batchSize = 100;
  let hasMore = true;

  while (hasMore) {
    const batch = await databases.listDocuments(
      APPWRITE_DATABASE,
      collectionId,
      [Query.equal('tenantId', tenantId), Query.limit(batchSize)]
    );

    if (batch.documents.length === 0) {
      hasMore = false;
      break;
    }

    await Promise.all(
      batch.documents.map((doc) =>
        databases.deleteDocument(APPWRITE_DATABASE, collectionId, doc.$id)
      )
    );

    // If we got fewer than batchSize, we're done
    if (batch.documents.length < batchSize) {
      hasMore = false;
    }
  }
}
