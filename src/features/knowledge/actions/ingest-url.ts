'use server';

import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID } from 'node-appwrite';
import { splitTextIntoChunks } from '@/lib/ai/chunking';
import { extractTextFromURL } from '@/lib/ai/extraction';
import { generateEmbeddings, upsertVectors } from '@/lib/ai/retrieval';
import type { ChunkVector } from '@/lib/ai/retrieval';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { type ActionResult, CONTENT_PATH, toErrorMessage } from './helpers';
import { safeError } from '@/lib/safe-error';

/**
 * Ingest a URL: create knowledge_source record and trigger background
 * scraping + embedding.
 */
export async function ingestUrlAction(
  tenantId: string,
  url: string
): Promise<ActionResult<{ sourceId: string }>> {
  try {
    const { account } = await createSessionClient();
    await account.get();

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return { success: false, error: 'Invalid URL' };
    }

    const admin = createAdminClient();

    // Create knowledge_source document
    const source = await admin.databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      ID.unique(),
      {
        tenantId,
        type: 'url',
        url,
        fileId: null,
        status: 'processing',
        version: 1,
        metadata: JSON.stringify({ originalUrl: url }),
        targets: JSON.stringify(['AI Agent', 'Copilot', 'Help Center'])
      }
    );

    // Trigger background embedding job
    triggerEmbeddingJob(source.$id, tenantId, url).catch((err) =>
      logger.error('Failed to trigger embedding job', { err })
    );

    revalidatePath(CONTENT_PATH);
    return { success: true, data: { sourceId: source.$id } };
  } catch (err) {
    logger.error('ingestUrlAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

/**
 * Trigger the embedding job via Inngest (preferred) or fallback to inline processing.
 */
async function triggerEmbeddingJob(
  sourceId: string,
  tenantId: string,
  url: string
): Promise<void> {
  try {
    const { inngest } = await import('@/lib/inngest/client');
    await inngest.send({
      name: 'knowledge/chunk-and-embed',
      data: {
        sourceId,
        tenantId,
        type: 'url' as const,
        url,
        version: 1
      }
    });
    return;
  } catch {
    // Inngest not available, fall back to inline processing
  }

  // Inline fallback: extract, chunk, embed directly
  await processUrlContent(sourceId, tenantId, url);
}

// ---------------------------------------------------------------------------
// Inline processing fallback (same pattern as manual-source)
// ---------------------------------------------------------------------------

async function processUrlContent(
  sourceId: string,
  tenantId: string,
  url: string
): Promise<void> {
  const admin = createAdminClient();

  try {
    // 1. Extract text from URL
    const text = await extractTextFromURL(url);
    if (!text || text.trim().length < 20) {
      throw new Error('Extracted text is too short or empty');
    }

    // 2. Chunk text
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 1000,
      chunkOverlap: 200
    });

    if (chunks.length === 0) {
      throw new Error('Text splitting produced no chunks');
    }

    // 3. Generate embeddings in batches
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
            title: url
          }
        });
      }
    }

    // 4. Upsert vectors into Appwrite
    await upsertVectors(tenantId, allVectors);

    // 5. Mark as ready
    await admin.databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      sourceId,
      {
        status: 'ready',
        metadata: JSON.stringify({
          originalUrl: url,
          chunksCount: chunks.length,
          vectorsCount: allVectors.length,
          textLength: text.length,
          processedAt: new Date().toISOString()
        })
      }
    );

    logger.info('URL content processed inline', {
      sourceId,
      tenantId,
      chunks: chunks.length
    });
  } catch (err) {
    logger.error('URL content inline processing error', { err, sourceId, url });

    try {
      await admin.databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.KNOWLEDGE_SOURCES,
        sourceId,
        {
          status: 'failed',
          metadata: JSON.stringify({
            originalUrl: url,
            error: safeError(err, 'Processing failed'),
            failedAt: new Date().toISOString()
          })
        }
      );
    } catch (updateErr) {
      logger.error('Failed to mark URL source as failed', { err: updateErr });
    }
  }
}
