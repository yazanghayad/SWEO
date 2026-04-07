'use server';

import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID } from 'node-appwrite';
import { splitTextIntoChunks } from '@/lib/ai/chunking';
import { generateEmbeddings, upsertVectors } from '@/lib/ai/retrieval';
import type { ChunkVector } from '@/lib/ai/retrieval';
import { logAuditEventAsync } from '@/lib/audit/logger';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { type ActionResult, CONTENT_PATH, toErrorMessage } from './helpers';
import { safeError } from '@/lib/safe-error';

/**
 * Create a manual knowledge source from user-provided text content.
 * Immediately processes the text through chunking → embedding → vector upsert.
 */
export async function createManualSourceAction(
  tenantId: string,
  title: string,
  content: string
): Promise<ActionResult<{ sourceId: string }>> {
  try {
    const { account } = await createSessionClient();
    await account.get();

    if (!title || title.trim().length === 0) {
      return { success: false, error: 'Title is required' };
    }

    if (!content || content.trim().length < 10) {
      return {
        success: false,
        error: 'Content must be at least 10 characters'
      };
    }

    const admin = createAdminClient();

    // Create knowledge_source document
    const source = await admin.databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      ID.unique(),
      {
        tenantId,
        type: 'manual',
        url: null,
        fileId: null,
        status: 'processing',
        version: 1,
        metadata: JSON.stringify({ title }),
        targets: JSON.stringify(['AI Agent', 'Copilot', 'Help Center'])
      }
    );

    // Process via Inngest (preferred) or inline fallback
    triggerManualProcessing(source.$id, tenantId, title, content).catch((err) =>
      logger.error('Manual content processing failed', { err })
    );

    logAuditEventAsync(tenantId, 'knowledge.created', {
      sourceId: source.$id,
      type: 'manual',
      title
    });

    revalidatePath(CONTENT_PATH);
    return { success: true, data: { sourceId: source.$id } };
  } catch (err) {
    logger.error('createManualSourceAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

/**
 * Update an existing manual knowledge source with new content.
 * Increments the version and re-processes embeddings.
 */
export async function updateManualSourceAction(
  sourceId: string,
  tenantId: string,
  title: string,
  content: string
): Promise<ActionResult> {
  try {
    const { account } = await createSessionClient();
    await account.get();

    const admin = createAdminClient();

    // Fetch current source
    const source = await admin.databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      sourceId
    );

    if (source.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    if (source.type !== 'manual') {
      return { success: false, error: 'Source is not a manual type' };
    }

    // Update status and increment version
    await admin.databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      sourceId,
      {
        status: 'processing',
        version: (source.version ?? 1) + 1,
        metadata: JSON.stringify({ title })
      }
    );

    // Re-process via Inngest (preferred) or inline fallback
    triggerManualProcessing(sourceId, tenantId, title, content).catch((err) =>
      logger.error('Manual content re-processing failed', { err })
    );

    revalidatePath(CONTENT_PATH);
    return { success: true };
  } catch (err) {
    logger.error('updateManualSourceAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Inngest trigger (preferred) with inline fallback
// ---------------------------------------------------------------------------

async function triggerManualProcessing(
  sourceId: string,
  tenantId: string,
  title: string,
  content: string
): Promise<void> {
  try {
    const { inngest } = await import('@/lib/inngest/client');
    await inngest.send({
      name: 'knowledge/chunk-and-embed',
      data: {
        sourceId,
        tenantId,
        type: 'manual' as const,
        content,
        title,
        version: 1
      }
    });
    return;
  } catch {
    // Inngest not available, fall back to inline processing
  }
  await processManualContent(sourceId, tenantId, title, content);
}

// ---------------------------------------------------------------------------
// Background processing
// ---------------------------------------------------------------------------

async function processManualContent(
  sourceId: string,
  tenantId: string,
  title: string,
  content: string
): Promise<void> {
  const admin = createAdminClient();

  try {
    // 1. Chunk text
    const chunks = splitTextIntoChunks(content, {
      chunkSize: 1000,
      chunkOverlap: 200
    });

    if (chunks.length === 0) {
      throw new Error('Text splitting produced no chunks');
    }

    // 2. Generate embeddings in batches
    const BATCH_SIZE = 20;
    const allVectors: ChunkVector[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await generateEmbeddings(batch);

      for (let j = 0; j < batch.length; j++) {
        allVectors.push({
          id: `${sourceId}#chunk-${i + j}`,
          values: embeddings[j],
          metadata: {
            sourceId,
            tenantId,
            chunkIndex: i + j,
            text: batch[j].slice(0, 1000),
            title
          }
        });
      }
    }

    // 3. Upsert vectors into Appwrite
    await upsertVectors(tenantId, allVectors);

    // 4. Mark as ready
    await admin.databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      sourceId,
      {
        status: 'ready',
        metadata: JSON.stringify({
          title,
          chunksCount: chunks.length,
          vectorsCount: allVectors.length,
          processedAt: new Date().toISOString()
        })
      }
    );

    logAuditEventAsync(tenantId, 'knowledge.processed', {
      sourceId,
      type: 'manual',
      chunks: chunks.length
    });
  } catch (err) {
    logger.error('Manual content processing error', { err });

    try {
      await admin.databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.KNOWLEDGE_SOURCES,
        sourceId,
        {
          status: 'failed',
          metadata: JSON.stringify({
            title,
            error: safeError(err, 'Processing failed'),
            failedAt: new Date().toISOString()
          })
        }
      );
    } catch (updateErr) {
      logger.error('Failed to mark source as failed', { err: updateErr });
    }
  }
}
