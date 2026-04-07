/**
 * Vector search – NVIDIA embeddings + MongoDB Atlas Vector Search.
 *
 * Stores embedding vectors in a MongoDB Atlas collection and uses the
 * native `$vectorSearch` aggregation stage for approximate nearest-neighbour
 * lookups. This eliminates the previous in-memory cosine similarity approach
 * and removes the 10K-vector OOM ceiling.
 *
 * Requirements:
 *   - An Atlas M10+ cluster (free-tier M0 does NOT support vector indexes).
 *   - A vector search index named `vector_index` on the `vectors` collection.
 *     See `scripts/setup-atlas-vector-index.mjs` for automated setup.
 *   - MONGODB_URI set in .env.local.
 */

import { getAIClient, getEmbeddingModel } from './client';
import {
  getDatabase,
  VECTORS_COLLECTION,
  VECTOR_INDEX_NAME
} from '@/lib/mongodb/client';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Embedding dimensions (NVIDIA nv-embedqa-e5-v5 = 1024)
// ---------------------------------------------------------------------------

const EMBEDDING_DIMENSIONS = 1024;

// ---------------------------------------------------------------------------
// Embeddings (NVIDIA API – OpenAI-compatible)
// ---------------------------------------------------------------------------

/**
 * Generate an embedding vector for the given text.
 */
export async function generateEmbedding(
  text: string,
  inputType: 'query' | 'passage' = 'query'
): Promise<number[]> {
  const client = getAIClient();
  const model = getEmbeddingModel();
  const isNvidia = model.startsWith('nvidia/');

  const params: Record<string, unknown> = {
    model,
    input: text
  };

  // NVIDIA asymmetric models require input_type but don't support dimensions
  if (isNvidia) {
    params.input_type = inputType;
  } else {
    params.dimensions = EMBEDDING_DIMENSIONS;
  }

  const response = await client.embeddings.create(
    params as unknown as Parameters<typeof client.embeddings.create>[0]
  );
  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in a single API call.
 */
export async function generateEmbeddings(
  texts: string[],
  inputType: 'query' | 'passage' = 'passage'
): Promise<number[][]> {
  const client = getAIClient();
  const model = getEmbeddingModel();
  const isNvidia = model.startsWith('nvidia/');

  const params: Record<string, unknown> = {
    model,
    input: texts
  };

  // NVIDIA asymmetric models require input_type but don't support dimensions
  if (isNvidia) {
    params.input_type = inputType;
  } else {
    params.dimensions = EMBEDDING_DIMENSIONS;
  }

  const response = await client.embeddings.create(
    params as unknown as Parameters<typeof client.embeddings.create>[0]
  );
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

// ---------------------------------------------------------------------------
// MongoDB Atlas vector storage
// ---------------------------------------------------------------------------

export interface ChunkVector {
  /** Unique identifier for the vector (e.g. `sourceId#chunk-0`). */
  id: string;
  /** The embedding vector. */
  values: number[];
  /** Metadata stored alongside the vector. */
  metadata: Record<
    string,
    string | number | boolean | string[] | number[] | boolean[]
  >;
}

/**
 * Upsert chunk vectors into MongoDB Atlas under a tenant.
 *
 * Uses `bulkWrite` with `updateOne + upsert` for idempotent writes.
 */
export async function upsertVectors(
  tenantId: string,
  vectors: ChunkVector[]
): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection(VECTORS_COLLECTION);

  // Batch writes – MongoDB supports up to 100K ops per bulkWrite, but we
  // chunk to 500 to keep memory pressure low for large ingests.
  const BATCH_SIZE = 500;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    const ops = batch.map((v) => ({
      updateOne: {
        filter: { tenantId, vectorId: v.id },
        update: {
          $set: {
            tenantId,
            vectorId: v.id,
            sourceId: String(v.metadata.sourceId ?? ''),
            text: String(v.metadata.text ?? '').slice(0, 10_000),
            embedding: v.values, // native array – required for $vectorSearch
            metadata: v.metadata
          }
        },
        upsert: true
      }
    }));

    await collection.bulkWrite(ops, { ordered: false });
  }
}

/**
 * Delete all vectors for a specific knowledge source.
 */
export async function deleteVectorsBySource(
  tenantId: string,
  sourceId: string
): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection(VECTORS_COLLECTION);
  const result = await collection.deleteMany({ tenantId, sourceId });
  logger.info(
    `Deleted ${result.deletedCount} vectors for source ${sourceId} (tenant ${tenantId})`
  );
}

// ---------------------------------------------------------------------------
// Vector search (Atlas $vectorSearch)
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  score: number;
  /** Full chunk text stored in the document. */
  text: string;
  metadata: Record<string, unknown>;
}

/**
 * Query tenant vectors using Atlas Vector Search (`$vectorSearch` stage).
 *
 * The search index must be named `vector_index` and configured for the
 * `embedding` field with cosine similarity.  A pre-filter on `tenantId`
 * ensures strict tenant isolation.
 */
export async function vectorSearch(
  tenantId: string,
  query: string,
  topK = 5
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);

  const db = await getDatabase();
  const collection = db.collection(VECTORS_COLLECTION);

  // Atlas Vector Search aggregation pipeline
  // numCandidates should be 10-20× topK for good recall/speed tradeoff
  const numCandidates = Math.max(topK * 20, 100);

  const pipeline = [
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates,
        limit: topK,
        filter: {
          tenantId: { $eq: tenantId }
        }
      }
    },
    {
      $project: {
        _id: 0,
        vectorId: 1,
        text: 1,
        metadata: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ];

  const results = await collection.aggregate(pipeline).toArray();

  return results.map((doc) => ({
    id: String(doc.vectorId),
    score: Number(doc.score),
    text: String(doc.text ?? ''),
    metadata: (doc.metadata as Record<string, unknown>) ?? {}
  }));
}

// ---------------------------------------------------------------------------
// Score normalization
// ---------------------------------------------------------------------------

/**
 * Model-specific score ranges – calibrated empirically against
 * MongoDB Atlas `$vectorSearch` (cosine similarity).
 *
 * Atlas `$vectorSearch` returns cosine-similarity scores that differ from
 * raw dot-product / cosine values you might see locally.  The ranges below
 * were measured against real Atlas searches:
 *
 *   NVIDIA nv-embedqa-e5-v5 (E5 family) + Atlas cosine:
 *     highly relevant   ≈ 0.68 – 0.75+
 *     somewhat relevant ≈ 0.64 – 0.68
 *     not relevant      ≈ 0.58 – 0.64
 *     totally irrelevant < 0.58
 *
 *   OpenAI text-embedding-3-large:
 *     highly relevant  ≈ 0.65 – 0.95
 *     somewhat relevant ≈ 0.40 – 0.65
 *     not relevant      ≈ 0.00 – 0.40
 *
 * `normalizeScore()` maps raw cosine to a 0-1 confidence scale so that the
 * same threshold (0.7) works regardless of which model generated the vectors.
 */
interface ScoreRange {
  /** Raw score that maps to normalized 0. */
  floor: number;
  /** Raw score that maps to normalized 1. */
  ceiling: number;
}

const MODEL_SCORE_RANGES: Record<string, ScoreRange> = {
  // NVIDIA E5 family — Atlas $vectorSearch cosine scores.
  // Empirically: irrelevant ≈ 0.63, relevant ≈ 0.69, highly relevant ≈ 0.72+
  'nvidia/nv-embedqa-e5-v5': { floor: 0.58, ceiling: 0.72 },
  'nvidia/nv-embed-v2': { floor: 0.58, ceiling: 0.72 },
  // OpenAI models – higher raw cosine range
  'text-embedding-3-large': { floor: 0.20, ceiling: 0.90 },
  'text-embedding-3-small': { floor: 0.20, ceiling: 0.85 },
  'text-embedding-ada-002': { floor: 0.20, ceiling: 0.85 }
};

function getScoreRange(): ScoreRange {
  const model = getEmbeddingModel();
  if (MODEL_SCORE_RANGES[model]) return MODEL_SCORE_RANGES[model];
  // Heuristic: NVIDIA/E5 models on Atlas have higher score ranges
  if (model.startsWith('nvidia/') || model.toLowerCase().includes('e5')) {
    return { floor: 0.58, ceiling: 0.72 };
  }
  // Default (OpenAI-like)
  return { floor: 0.20, ceiling: 0.90 };
}

/**
 * Normalize a raw cosine similarity score to a 0-1 confidence value
 * that is comparable across different embedding models.
 *
 * @param rawScore  The raw cosine similarity (typically 0 – 1).
 * @returns         Normalized confidence in [0, 1].
 */
export function normalizeScore(rawScore: number): number {
  const { floor, ceiling } = getScoreRange();
  if (rawScore <= floor) return 0;
  if (rawScore >= ceiling) return 1;
  return (rawScore - floor) / (ceiling - floor);
}
