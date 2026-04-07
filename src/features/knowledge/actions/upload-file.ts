'use server';

import { APPWRITE_BUCKET, APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID } from 'node-appwrite';
import { splitTextIntoChunks } from '@/lib/ai/chunking';
import { extractTextFromFile } from '@/lib/ai/extraction';
import { generateEmbeddings, upsertVectors } from '@/lib/ai/retrieval';
import type { ChunkVector } from '@/lib/ai/retrieval';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { type ActionResult, CONTENT_PATH, toErrorMessage } from './helpers';
import { safeError } from '@/lib/safe-error';

/**
 * Upload a file to Appwrite Storage and create a knowledge_source record.
 * Then triggers the background embedding process via the API route.
 */
export async function uploadFileAction(
  tenantId: string,
  formData: FormData
): Promise<ActionResult<{ sourceId: string }>> {
  try {
    const { account } = await createSessionClient();
    await account.get();

    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'text/csv'
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      return {
        success: false,
        error: 'Unsupported file type. Allowed: PDF, DOCX, TXT, MD, CSV'
      };
    }

    // Size limit: 20 MB
    if (file.size > 20 * 1024 * 1024) {
      return {
        success: false,
        error: 'File too large. Maximum size is 20 MB.'
      };
    }

    const admin = createAdminClient();

    // Upload file to Appwrite Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { Storage } = await import('node-appwrite');
    const { InputFile } = require('node-appwrite/file') as {
      InputFile: {
        fromBuffer: (data: Buffer | Blob, name: string) => File;
      };
    };
    const storage = new Storage(admin.client);

    const uploaded = await storage.createFile(
      APPWRITE_BUCKET,
      ID.unique(),
      InputFile.fromBuffer(buffer, file.name)
    );

    // Create knowledge_source document
    const source = await admin.databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      ID.unique(),
      {
        tenantId,
        type: 'file',
        url: null,
        fileId: uploaded.$id,
        status: 'processing',
        version: 1,
        metadata: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        }),
        targets: JSON.stringify(['AI Agent', 'Copilot', 'Help Center'])
      }
    );

    // Trigger background embedding asynchronously
    triggerEmbeddingJob(source.$id, tenantId, uploaded.$id, file.name).catch(
      (err) => logger.error('Failed to trigger embedding job', { err })
    );

    revalidatePath(CONTENT_PATH);
    return { success: true, data: { sourceId: source.$id } };
  } catch (err) {
    logger.error('uploadFileAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

/**
 * Trigger the embedding job via Inngest (preferred) or fallback to inline processing.
 */
async function triggerEmbeddingJob(
  sourceId: string,
  tenantId: string,
  fileId: string,
  fileName: string
): Promise<void> {
  try {
    const { inngest } = await import('@/lib/inngest/client');
    await inngest.send({
      name: 'knowledge/chunk-and-embed',
      data: {
        sourceId,
        tenantId,
        type: 'file' as const,
        fileId,
        title: fileName,
        version: 1
      }
    });
    return;
  } catch {
    // Inngest not available, fall back to inline processing
  }

  // Inline fallback: download file, extract, chunk, embed directly
  await processFileContent(sourceId, tenantId, fileId, fileName);
}

// ---------------------------------------------------------------------------
// Inline processing fallback (same pattern as manual-source)
// ---------------------------------------------------------------------------

async function processFileContent(
  sourceId: string,
  tenantId: string,
  fileId: string,
  fileName: string
): Promise<void> {
  const admin = createAdminClient();

  try {
    // 1. Download file from Appwrite Storage
    const { Storage } = await import('node-appwrite');
    const storage = new Storage(admin.client);
    const fileBuffer = await storage.getFileDownload(APPWRITE_BUCKET, fileId);
    const buffer = Buffer.from(fileBuffer);

    // 2. Extract text from file
    const text = await extractTextFromFile(buffer, fileName);
    if (!text || text.trim().length < 20) {
      throw new Error('Extracted text is too short or empty');
    }

    // 3. Chunk text
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 1000,
      chunkOverlap: 200
    });

    if (chunks.length === 0) {
      throw new Error('Text splitting produced no chunks');
    }

    // 4. Generate embeddings in batches
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
            title: fileName
          }
        });
      }
    }

    // 5. Upsert vectors into Appwrite
    await upsertVectors(tenantId, allVectors);

    // 6. Mark as ready
    await admin.databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      sourceId,
      {
        status: 'ready',
        metadata: JSON.stringify({
          fileName,
          fileId,
          chunksCount: chunks.length,
          vectorsCount: allVectors.length,
          textLength: text.length,
          processedAt: new Date().toISOString()
        })
      }
    );

    logger.info('File content processed inline', {
      sourceId,
      tenantId,
      fileName,
      chunks: chunks.length
    });
  } catch (err) {
    logger.error('File content inline processing error', {
      err,
      sourceId,
      fileId,
      fileName
    });

    try {
      await admin.databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.KNOWLEDGE_SOURCES,
        sourceId,
        {
          status: 'failed',
          metadata: JSON.stringify({
            fileName,
            fileId,
            error: safeError(err, 'Processing failed'),
            failedAt: new Date().toISOString()
          })
        }
      );
    } catch (updateErr) {
      logger.error('Failed to mark file source as failed', {
        err: updateErr
      });
    }
  }
}
