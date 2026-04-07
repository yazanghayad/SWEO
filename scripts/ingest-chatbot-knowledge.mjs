#!/usr/bin/env node

/**
 * Ingest docs-data.json into MongoDB Atlas vectors for AI chat.
 *
 * Reads the documentation JSON, strips HTML, chunks each article section,
 * generates embeddings via the AI client, and upserts into MongoDB Atlas
 * `vectors` collection (used by the vectorSearch retrieval layer).
 *
 * Usage:
 *   node scripts/ingest-chatbot-knowledge.mjs
 *   node scripts/ingest-chatbot-knowledge.mjs --tenant-id=69928ef900113477e565
 *
 * Required env vars (reads from .env.local):
 *   MONGODB_URI
 *   NVIDIA_API_KEY or OPENAI_API_KEY  (for embeddings)
 */

import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envFile = resolve(process.cwd(), '.env.local');
  try {
    const content = readFileSync(envFile, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local is optional
  }
}

loadEnv();

// ── Config ───────────────────────────────────────────────────────────────────
// Accept --tenant-id=<id> from CLI, else fall back to TENANT_ID env or 'sweo-public'
const TENANT_ID = (() => {
  const flag = process.argv.find((a) => a.startsWith('--tenant-id='));
  if (flag) return flag.split('=')[1];
  return process.env.TENANT_ID || 'sweo-public';
})();

const SOURCE_ID = 'docs-data';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'fin_ai';
const VECTORS_COLLECTION = 'vectors';
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;
const EMBEDDING_BATCH_SIZE = 20;
const EMBEDDING_DIMENSIONS = 1024;

// ── Clients ──────────────────────────────────────────────────────────────────
const mongoClient = new MongoClient(process.env.MONGODB_URI);

function getAIClient() {
  if (process.env.NVIDIA_API_KEY) {
    return new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1'
    });
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getEmbeddingModel() {
  return process.env.NVIDIA_API_KEY
    ? 'nvidia/nv-embedqa-e5-v5'
    : 'text-embedding-3-large';
}

// ── HTML stripping ───────────────────────────────────────────────────────────
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Chunking ─────────────────────────────────────────────────────────────────
function splitIntoChunks(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  if (text.length <= chunkSize) return [text.trim()].filter(Boolean);

  const separators = ['\n\n', '\n', '. ', ' ', ''];
  let chosenSep = '';
  for (const sep of separators) {
    if (sep === '' || text.includes(sep)) {
      chosenSep = sep;
      break;
    }
  }

  const parts = chosenSep === '' ? text.split('') : text.split(chosenSep);
  const chunks = [];
  let current = '';

  for (const part of parts) {
    const candidate = current ? current + chosenSep + part : part;
    if (candidate.length > chunkSize && current) {
      chunks.push(current.trim());
      const overlapStart = Math.max(0, current.length - overlap);
      current = current.slice(overlapStart) + chosenSep + part;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// ── Extract documents from docs-data.json ────────────────────────────────────
function extractDocuments() {
  const docsPath = resolve(process.cwd(), 'src/config/docs-data.json');
  const data = JSON.parse(readFileSync(docsPath, 'utf-8'));

  const documents = [];

  for (const category of data) {
    for (const article of category.articles ?? []) {
      for (const section of article.sections ?? []) {
        const text = stripHtml(section.content);
        if (!text || text.length < 20) continue;

        // Prefix with hierarchy for better retrieval context
        const prefix = `${category.title} > ${article.title} > ${section.title}`;
        const fullText = `${prefix}\n\n${text}`;

        documents.push({
          categorySlug: category.slug,
          articleSlug: article.slug,
          sectionId: section.id,
          title: section.title,
          text: fullText
        });
      }
    }
  }

  return documents;
}

// ── Generate embeddings in batches ───────────────────────────────────────────
async function generateEmbeddings(texts) {
  const client = getAIClient();
  const model = getEmbeddingModel();
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
    console.log(
      `  Embedding batch ${Math.floor(i / EMBEDDING_BATCH_SIZE) + 1}/${Math.ceil(texts.length / EMBEDDING_BATCH_SIZE)} (${batch.length} texts)…`
    );

    const createParams = {
      model,
      input: batch
    };

    // NVIDIA asymmetric models require input_type but don't support dimensions
    if (process.env.NVIDIA_API_KEY) {
      createParams.input_type = 'passage';
    } else {
      createParams.dimensions = EMBEDDING_DIMENSIONS;
    }

    const response = await client.embeddings.create(createParams);

    const embeddings = response.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);

    allEmbeddings.push(...embeddings);

    // Small delay to avoid rate limits
    if (i + EMBEDDING_BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return allEmbeddings;
}

// ── Delete existing vectors ──────────────────────────────────────────────────
async function deleteExistingVectors(db) {
  console.log(`Deleting existing vectors for tenant "${TENANT_ID}" from MongoDB…`);
  const collection = db.collection(VECTORS_COLLECTION);
  const result = await collection.deleteMany({ tenantId: TENANT_ID, sourceId: SOURCE_ID });
  console.log(`  Deleted ${result.deletedCount} existing vectors.`);
}

// ── Upsert vectors to MongoDB Atlas ─────────────────────────────────────────
async function upsertVectors(db, chunks, embeddings, documents) {
  console.log(`Upserting ${chunks.length} vectors to MongoDB Atlas…`);
  const collection = db.collection(VECTORS_COLLECTION);
  const BATCH_SIZE = 500;
  let created = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const ops = batch.map((chunk, j) => {
      const idx = i + j;
      const doc = documents[chunk._docIndex];
      const vectorId = `${SOURCE_ID}#${doc.categorySlug}#${doc.articleSlug}#${doc.sectionId}#chunk-${chunk._chunkIndex}`;

      return {
        updateOne: {
          filter: { tenantId: TENANT_ID, vectorId },
          update: {
            $set: {
              tenantId: TENANT_ID,
              vectorId,
              sourceId: SOURCE_ID,
              text: chunk.text.slice(0, 10000),
              embedding: embeddings[idx], // native array for $vectorSearch
              metadata: {
                sourceId: SOURCE_ID,
                text: chunk.text.slice(0, 500),
                category: doc.categorySlug,
                article: doc.articleSlug,
                section: doc.sectionId,
                title: doc.title,
                chunkIndex: chunk._chunkIndex
              }
            }
          },
          upsert: true
        }
      };
    });

    await collection.bulkWrite(ops, { ordered: false });
    created += batch.length;
    process.stdout.write(`  ${created}/${chunks.length} vectors upserted\r`);
  }

  console.log(`\n  ✓ ${created} vectors upserted.`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== SWEO Chatbot Knowledge Ingestion (MongoDB Atlas) ===\n');
  console.log(`Tenant ID: ${TENANT_ID}`);
  console.log(`MongoDB DB: ${MONGODB_DB_NAME}\n`);

  // Connect to MongoDB
  await mongoClient.connect();
  const db = mongoClient.db(MONGODB_DB_NAME);

  try {
    // 1. Extract documents from docs-data.json
    console.log('Step 1: Extracting documents from docs-data.json…');
    const documents = extractDocuments();
    console.log(`  Found ${documents.length} sections.\n`);

    // 2. Chunk each document
    console.log('Step 2: Chunking documents…');
    const allChunks = [];
    for (let docIdx = 0; docIdx < documents.length; docIdx++) {
      const doc = documents[docIdx];
      const chunks = splitIntoChunks(doc.text);
      for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
        allChunks.push({
          text: chunks[chunkIdx],
          _docIndex: docIdx,
          _chunkIndex: chunkIdx
        });
      }
    }
    console.log(`  Created ${allChunks.length} chunks.\n`);

    // 3. Generate embeddings
    console.log('Step 3: Generating embeddings…');
    const embeddings = await generateEmbeddings(allChunks.map((c) => c.text));
    console.log(`  Generated ${embeddings.length} embeddings.\n`);

    // 4. Delete existing vectors
    await deleteExistingVectors(db);

    // 5. Upsert new vectors
    console.log('\nStep 5: Upserting vectors to MongoDB Atlas…');
    await upsertVectors(db, allChunks, embeddings, documents);

    // 6. Ensure indexes (skip if they already exist)
    console.log('\nStep 6: Ensuring indexes…');
    const collection = db.collection(VECTORS_COLLECTION);
    try {
      await collection.createIndex({ tenantId: 1, vectorId: 1 }, { unique: true });
    } catch (e) {
      if (e.code !== 85) throw e; // 85 = IndexOptionsConflict (already exists)
      console.log('  Index {tenantId, vectorId} already exists, skipping.');
    }
    try {
      await collection.createIndex({ tenantId: 1, sourceId: 1 });
    } catch (e) {
      if (e.code !== 85) throw e;
      console.log('  Index {tenantId, sourceId} already exists, skipping.');
    }
    console.log('  ✓ Indexes ensured.');

    console.log('\n✅ Chatbot knowledge ingestion complete!');
    console.log(`   Tenant ID: ${TENANT_ID}`);
    console.log(`   Source ID: ${SOURCE_ID}`);
    console.log(`   Total vectors: ${allChunks.length}`);
  } finally {
    await mongoClient.close();
  }
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
