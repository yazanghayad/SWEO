/**
 * Inngest background functions.
 *
 * Durable, retryable functions that replace fire-and-forget fetch calls
 * for long-running operations (chunking, embedding, cache invalidation).
 */

import { inngest } from './client';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { splitTextIntoChunks } from '@/lib/ai/chunking';
import {
  generateEmbeddings,
  upsertVectors,
  deleteVectorsBySource,
  type ChunkVector
} from '@/lib/ai/retrieval';
import { extractTextFromFile, extractTextFromURL } from '@/lib/ai/extraction';
import { invalidateTenantCache } from '@/lib/cache/semantic-cache';
import { logAuditEventAsync } from '@/lib/audit/logger';

// ---------------------------------------------------------------------------
// Types for events
// ---------------------------------------------------------------------------

type KnowledgeChunkEmbedEvent = {
  name: 'knowledge/chunk-and-embed';
  data: {
    sourceId: string;
    tenantId: string;
    type: 'url' | 'file' | 'manual';
    url?: string;
    fileId?: string;
    content?: string;
    title?: string;
    version?: number;
  };
};

type CacheInvalidateEvent = {
  name: 'cache/invalidate-tenant';
  data: {
    tenantId: string;
  };
};

type GapDetectionEvent = {
  name: 'cron/detect-gaps';
  data: {
    tenantId?: string;
  };
};

type CaseSLAReminderEvent = {
  name: 'cron/case-sla-check';
  data: Record<string, never>;
};

type CaseAutoCloseEvent = {
  name: 'cron/case-auto-close';
  data: Record<string, never>;
};

// Union type for all events
export type SupportAIEvents =
  | KnowledgeChunkEmbedEvent
  | CacheInvalidateEvent
  | GapDetectionEvent
  | CaseSLAReminderEvent
  | CaseAutoCloseEvent;

// ---------------------------------------------------------------------------
// Function: knowledge/chunk-and-embed
// ---------------------------------------------------------------------------

export const chunkAndEmbed = inngest.createFunction(
  {
    id: 'knowledge-chunk-and-embed',
    retries: 3,
    concurrency: [{ limit: 5 }]
  },
  { event: 'knowledge/chunk-and-embed' },
  async ({ event, step }) => {
    const { sourceId, tenantId, type, url, fileId, content, title, version } =
      event.data;

    const admin = createAdminClient();

    // Step 1: Extract text
    const text = await step.run('extract-text', async () => {
      switch (type) {
        case 'url': {
          if (!url) throw new Error('URL is required for url type');
          return extractTextFromURL(url);
        }
        case 'file': {
          if (!fileId) throw new Error('fileId is required for file type');
          // Download file from Appwrite Storage, then extract text
          const { Storage } = await import('node-appwrite');
          const { APPWRITE_BUCKET } = await import('@/lib/appwrite/constants');
          const storage = new Storage(admin.client);
          const fileData = await storage.getFileDownload(
            APPWRITE_BUCKET,
            fileId
          );
          const buffer = Buffer.from(
            fileData instanceof ArrayBuffer ? fileData : fileData
          );
          const fileName = title ?? 'unknown.txt';
          return extractTextFromFile(buffer, fileName);
        }
        case 'manual': {
          if (!content) throw new Error('Content is required for manual type');
          return content;
        }
        default:
          throw new Error(`Unknown source type: ${type}`);
      }
    });

    // Step 2: Chunk text
    const chunks = await step.run('chunk-text', async () => {
      const result = splitTextIntoChunks(text, {
        chunkSize: 1000,
        chunkOverlap: 200
      });

      if (result.length === 0) {
        throw new Error('Text splitting produced no chunks');
      }

      return result;
    });

    // Step 3: Delete old vectors (if re-processing)
    await step.run('delete-old-vectors', async () => {
      await deleteVectorsBySource(tenantId, sourceId);
    });

    // Step 4: Generate embeddings and upsert in batches
    const vectorCount = await step.run('embed-and-upsert', async () => {
      const BATCH_SIZE = 20;
      const allVectors: ChunkVector[] = [];

      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const embeddings = await generateEmbeddings(batch);

        for (let j = 0; j < batch.length; j++) {
          const vectorId = version
            ? `${sourceId}#v${version}#chunk-${i + j}`
            : `${sourceId}#chunk-${i + j}`;

          allVectors.push({
            id: vectorId,
            values: embeddings[j],
            metadata: {
              sourceId,
              tenantId,
              chunkIndex: i + j,
              text: batch[j].slice(0, 1000),
              ...(version != null ? { version } : {}),
              ...(title ? { title } : {}),
              ...(url ? { url } : {})
            }
          });
        }
      }

      await upsertVectors(tenantId, allVectors);
      return allVectors.length;
    });

    // Step 5: Update source status to ready
    await step.run('update-status', async () => {
      await admin.databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.KNOWLEDGE_SOURCES,
        sourceId,
        {
          status: 'ready',
          metadata: JSON.stringify({
            title: title ?? url ?? 'file',
            chunksCount: chunks.length,
            vectorsCount: vectorCount,
            processedAt: new Date().toISOString()
          })
        }
      );

      logAuditEventAsync(tenantId, 'knowledge.processed', {
        sourceId,
        type,
        chunks: chunks.length,
        vectors: vectorCount
      });
    });

    // Step 6: Invalidate semantic cache
    await step.run('invalidate-cache', async () => {
      await invalidateTenantCache(tenantId);
    });

    return {
      sourceId,
      chunks: chunks.length,
      vectors: vectorCount
    };
  }
);

// ---------------------------------------------------------------------------
// Function: cache/invalidate-tenant
// ---------------------------------------------------------------------------

export const invalidateCache = inngest.createFunction(
  {
    id: 'cache-invalidate-tenant',
    retries: 2
  },
  { event: 'cache/invalidate-tenant' },
  async ({ event }) => {
    const { tenantId } = event.data;
    const deleted = await invalidateTenantCache(tenantId);
    return { tenantId, keysDeleted: deleted };
  }
);

// ---------------------------------------------------------------------------
// Function: cron/case-sla-check — runs daily, flags overdue cases
// ---------------------------------------------------------------------------

export const caseSLACheck = inngest.createFunction(
  {
    id: 'case-sla-check',
    retries: 2
  },
  { cron: '0 8 * * *' }, // Daily at 08:00 UTC
  async ({ step }) => {
    const { Query } = await import('node-appwrite');

    const admin = createAdminClient();
    const now = new Date().toISOString();

    // Find active cases with a dueDate in the past
    const overdue = await step.run('find-overdue-cases', async () => {
      const result = await admin.databases.listDocuments(
        APPWRITE_DATABASE,
        COLLECTION.CASES,
        [
          Query.lessThan('dueDate', now),
          Query.notEqual('status', 'resolved'),
          Query.notEqual('status', 'closed'),
          Query.limit(200)
        ]
      );
      return result.documents;
    });

    // Mark each overdue case with high priority if not already urgent
    let escalated = 0;
    for (const doc of overdue) {
      if (doc.priority !== 'urgent') {
        await step.run(`escalate-${doc.$id}`, async () => {
          await admin.databases.updateDocument(
            APPWRITE_DATABASE,
            COLLECTION.CASES,
            doc.$id,
            { priority: 'urgent' }
          );

          // Add timeline event
          const { ID } = await import('node-appwrite');
          await admin.databases.createDocument(
            APPWRITE_DATABASE,
            COLLECTION.CASE_TIMELINE,
            ID.unique(),
            {
              tenantId: doc.tenantId,
              caseId: doc.$id,
              eventType: 'priority_changed',
              actorId: null,
              actorName: 'System (SLA)',
              description: `Auto-escalated to Urgent — case overdue since ${new Date(doc.dueDate).toLocaleDateString()}`,
              metadata: JSON.stringify({
                from: doc.priority,
                to: 'urgent',
                reason: 'sla_breach'
              })
            }
          );
        });
        escalated++;
      }
    }

    await logAuditEventAsync(
      'system',
      'case.sla_check',
      { overdue: overdue.length, escalated },
      'system'
    );

    return { overdue: overdue.length, escalated };
  }
);

// ---------------------------------------------------------------------------
// Function: cron/case-auto-close — auto-close resolved cases after 7 days
// ---------------------------------------------------------------------------

export const caseAutoClose = inngest.createFunction(
  {
    id: 'case-auto-close',
    retries: 2
  },
  { cron: '0 2 * * *' }, // Daily at 02:00 UTC
  async ({ step }) => {
    const { Query } = await import('node-appwrite');

    const admin = createAdminClient();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Find cases resolved more than 7 days ago
    const stale = await step.run('find-stale-resolved', async () => {
      const result = await admin.databases.listDocuments(
        APPWRITE_DATABASE,
        COLLECTION.CASES,
        [
          Query.equal('status', 'resolved'),
          Query.lessThan('resolvedAt', sevenDaysAgo),
          Query.limit(200)
        ]
      );
      return result.documents;
    });

    let closed = 0;
    for (const doc of stale) {
      await step.run(`close-${doc.$id}`, async () => {
        await admin.databases.updateDocument(
          APPWRITE_DATABASE,
          COLLECTION.CASES,
          doc.$id,
          { status: 'closed' }
        );

        const { ID } = await import('node-appwrite');
        await admin.databases.createDocument(
          APPWRITE_DATABASE,
          COLLECTION.CASE_TIMELINE,
          ID.unique(),
          {
            tenantId: doc.tenantId,
            caseId: doc.$id,
            eventType: 'status_changed',
            actorId: null,
            actorName: 'System (Auto-close)',
            description:
              'Automatically closed — resolved for more than 7 days',
            metadata: JSON.stringify({
              from: 'resolved',
              to: 'closed',
              reason: 'auto_close'
            })
          }
        );
      });
      closed++;
    }

    await logAuditEventAsync(
      'system',
      'case.auto_close',
      { candidates: stale.length, closed },
      'system'
    );

    return { candidates: stale.length, closed };
  }
);

// ---------------------------------------------------------------------------
// Exported list of all functions for the serve handler
// ---------------------------------------------------------------------------

export const inngestFunctions = [
  chunkAndEmbed,
  invalidateCache,
  caseSLACheck,
  caseAutoClose
];
