'use server';

/**
 * Seed demo knowledge for a tenant by copying vectors from 'sweo-public'.
 * This avoids expensive embedding API calls since embeddings already exist.
 */

import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID, Query } from 'node-appwrite';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { type ActionResult, TESTING_PATH, toErrorMessage } from './helpers';

const SOURCE_TENANT = 'sweo-public';
const BATCH_SIZE = 100;

export async function seedDemoKnowledgeAction(
  tenantId: string
): Promise<ActionResult<{ copied: number }>> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();

    // Check if tenant already has vectors
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.VECTORS,
      [Query.equal('tenantId', tenantId), Query.limit(1)]
    );

    if (existing.total > 10) {
      return {
        success: true,
        data: { copied: 0 },
        error: `Tenant already has ${existing.total} vectors`
      };
    }

    // Load all sweo-public vectors
    let cursor: string | undefined;
    let copied = 0;
    const allVectors: Array<Record<string, unknown>> = [];

    // Paginate through source vectors
    while (true) {
      const queries = [
        Query.equal('tenantId', SOURCE_TENANT),
        Query.limit(BATCH_SIZE)
      ];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const batch = await databases.listDocuments(
        APPWRITE_DATABASE,
        COLLECTION.VECTORS,
        queries
      );

      if (batch.documents.length === 0) break;

      for (const doc of batch.documents) {
        allVectors.push({
          tenantId,
          vectorId: doc.vectorId,
          sourceId: doc.sourceId,
          text: doc.text,
          embedding: doc.embedding,
          metadata: doc.metadata
        });
      }

      cursor = batch.documents[batch.documents.length - 1].$id;

      if (batch.documents.length < BATCH_SIZE) break;
    }

    // Create vectors for the target tenant in batches
    const CREATE_BATCH = 25;
    for (let i = 0; i < allVectors.length; i += CREATE_BATCH) {
      const slice = allVectors.slice(i, i + CREATE_BATCH);
      await Promise.all(
        slice.map((v) =>
          databases.createDocument(
            APPWRITE_DATABASE,
            COLLECTION.VECTORS,
            ID.unique(),
            v
          )
        )
      );
      copied += slice.length;
    }

    logger.info('Seeded demo knowledge', { tenantId, copied });
    revalidatePath(TESTING_PATH);
    return { success: true, data: { copied } };
  } catch (err) {
    logger.error('seedDemoKnowledgeAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}
