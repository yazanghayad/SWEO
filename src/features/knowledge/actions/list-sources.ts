'use server';

import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { createAdminClient } from '@/lib/appwrite/server';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { KnowledgeSource } from '@/types/appwrite';
import { deleteVectorsBySource } from '@/lib/ai/retrieval';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { getAuthenticatedTenantId } from '@/lib/appwrite/get-authenticated-tenant';
import {
  type ActionResult,
  CONTENT_PATH,
  serialize,
  toErrorMessage
} from './helpers';

// Re-export ActionResult for consumers
export type { ActionResult } from './helpers';

// ── List ─────────────────────────────────────────────────────────────────

/**
 * List knowledge sources for a tenant (server action).
 * Uses admin client because documents are created via admin SDK —
 * session-scoped reads may not have permissions to see them.
 */
export async function listSourcesAction(
  tenantId: string
): Promise<ActionResult<KnowledgeSource[]>> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId();
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }

    const admin = createAdminClient();
    const result = await admin.databases.listDocuments<KnowledgeSource>(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      [
        Query.equal('tenantId', tenantId),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
    );

    return {
      success: true,
      data: result.documents.map((d) => serialize(d))
    };
  } catch (err) {
    logger.error('listSourcesAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

// ── Delete ───────────────────────────────────────────────────────────────

/**
 * Delete a knowledge source and its associated vectors.
 */
export async function deleteSourceAction(
  sourceId: string,
  tenantId: string
): Promise<ActionResult> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId();
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }

    const admin = createAdminClient();

    const source = await admin.databases.getDocument<KnowledgeSource>(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      sourceId
    );

    if (source.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    // Delete vectors from Appwrite
    try {
      await deleteVectorsBySource(tenantId, sourceId);
    } catch (err) {
      logger.error('Failed to delete vectors', { err });
    }

    // Delete file from storage if it exists
    if (source.fileId) {
      try {
        const { Storage } = await import('node-appwrite');
        const storage = new Storage(admin.client);
        const { APPWRITE_BUCKET } = await import('@/lib/appwrite/constants');
        await storage.deleteFile(APPWRITE_BUCKET, source.fileId);
      } catch (err) {
        logger.error('Failed to delete file from storage', { err });
      }
    }

    await admin.databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      sourceId
    );

    revalidatePath(CONTENT_PATH);
    return { success: true };
  } catch (err) {
    logger.error('deleteSourceAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}
