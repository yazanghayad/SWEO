import { NextRequest, NextResponse } from 'next/server';
import { APPWRITE_BUCKET, APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { createAdminClient } from '@/lib/appwrite/server';
import { COLLECTION } from '@/lib/appwrite/collections';
import { extractTextFromFile, extractTextFromURL } from '@/lib/ai/extraction';
import { splitTextIntoChunks } from '@/lib/ai/chunking';
import {
  generateEmbeddings,
  upsertVectors,
  type ChunkVector
} from '@/lib/ai/retrieval';
import { Storage } from 'node-appwrite';
import { safeCompare } from '@/lib/security/timing-safe-compare';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';
import { embeddingJobSchema, formatZodError } from '@/lib/api-schemas';

// EmbeddingJobBody type is inferred from embeddingJobSchema

/**
 * POST /api/embeddings
 *
 * Background embedding job: extracts text from a file or URL, chunks it,
 * generates embeddings via NVIDIA/OpenAI, and upserts them into Appwrite.
 *
 * Updates the knowledge_source status to 'ready' or 'failed'.
 */
export async function POST(request: NextRequest) {
  // ── Auth: require internal CRON_SECRET bearer token ───────────────
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (
    !cronSecret ||
    !authHeader ||
    !safeCompare(authHeader, `Bearer ${cronSecret}`)
  ) {
    return NextResponse.json(
      { error: 'Unauthorized – invalid or missing bearer token' },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = embeddingJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { sourceId, tenantId, type, fileId, fileName, url } = parsed.data;

  const admin = createAdminClient();

  try {
    // 1. Extract text
    let text: string;

    if (type === 'file') {
      if (!fileId || !fileName) {
        throw new Error('fileId and fileName required for file type');
      }

      const storage = new Storage(admin.client);
      const fileBuffer = await storage.getFileDownload(APPWRITE_BUCKET, fileId);

      // The SDK returns an ArrayBuffer
      const buffer = Buffer.from(fileBuffer);
      text = await extractTextFromFile(buffer, fileName);
    } else if (type === 'url') {
      if (!url) {
        throw new Error('url required for url type');
      }
      text = await extractTextFromURL(url);
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the source');
    }

    // 2. Chunk the text
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 1000,
      chunkOverlap: 200
    });

    if (chunks.length === 0) {
      throw new Error('Text splitting produced no chunks');
    }

    // 3. Generate embeddings (batch – max ~8k tokens per batch for safety)
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
            text: batch[j].slice(0, 1000), // store truncated text for retrieval
            ...(fileName ? { fileName } : {}),
            ...(url ? { url } : {})
          }
        });
      }
    }

    // 4. Upsert vectors into Appwrite (tenant-scoped)
    await upsertVectors(tenantId, allVectors);

    // 5. Update source status to 'ready'
    await admin.databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      sourceId,
      {
        status: 'ready',
        metadata: JSON.stringify({
          ...(fileName ? { fileName } : {}),
          ...(url ? { originalUrl: url } : {}),
          chunksCount: chunks.length,
          vectorsCount: allVectors.length,
          processedAt: new Date().toISOString()
        })
      }
    );

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      vectors: allVectors.length
    });
  } catch (err) {
    logger.error('Embedding job failed', { sourceId, tenantId, err });

    // Mark source as failed
    try {
      await admin.databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.KNOWLEDGE_SOURCES,
        sourceId,
        {
          status: 'failed',
          metadata: JSON.stringify({
            error: safeError(err, 'Unknown error'),
            failedAt: new Date().toISOString()
          })
        }
      );
    } catch (updateErr) {
      logger.error('Failed to update source status', { sourceId, err: updateErr });
    }

    return NextResponse.json(
      {
        error: 'Embedding job failed'
      },
      { status: 500 }
    );
  }
}
