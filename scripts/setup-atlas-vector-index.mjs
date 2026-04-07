#!/usr/bin/env node
/**
 * Setup Atlas Vector Search index + standard indexes on the `vectors` collection.
 *
 * Prerequisites:
 *   - MONGODB_URI set in .env.local (M10+ cluster)
 *   - Atlas admin or Project Data Access Admin role for the DB user
 *
 * Usage:
 *   node scripts/setup-atlas-vector-index.mjs
 *
 * What it does:
 *   1. Creates standard indexes (tenantId, sourceId) for fast deletes/filters.
 *   2. Prints the Atlas Vector Search index definition you need to create
 *      via the Atlas UI or Atlas Admin API (cannot be created via the driver).
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME ?? 'fin_ai';
const COLLECTION = 'vectors';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local');
  process.exit(1);
}

async function main() {
  console.log('🔗 Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    // ------------------------------------------------------------------
    // 1. Standard indexes
    // ------------------------------------------------------------------
    console.log('\n📋 Creating standard indexes...');

    await collection.createIndex(
      { tenantId: 1, sourceId: 1 },
      { name: 'idx_tenant_source' }
    );
    console.log('  ✅ idx_tenant_source (tenantId + sourceId)');

    await collection.createIndex(
      { tenantId: 1, vectorId: 1 },
      { name: 'idx_tenant_vectorId', unique: true }
    );
    console.log('  ✅ idx_tenant_vectorId (unique)');

    // ------------------------------------------------------------------
    // 2. Atlas Vector Search index (must be created via Atlas UI / API)
    // ------------------------------------------------------------------
    console.log('\n🔍 Atlas Vector Search index definition:');
    console.log('─'.repeat(60));

    const indexDefinition = {
      name: 'vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: 1024,
            similarity: 'cosine'
          },
          {
            type: 'filter',
            path: 'tenantId'
          }
        ]
      }
    };

    console.log(JSON.stringify(indexDefinition, null, 2));
    console.log('─'.repeat(60));

    // Try to create the search index via the driver (requires Atlas 7.0+
    // and the appropriate role). If it fails, the user must create it
    // manually in the Atlas UI.
    try {
      console.log('\n🚀 Attempting to create vector search index via driver...');
      await collection.createSearchIndex(indexDefinition);
      console.log('  ✅ Vector search index created successfully!');
      console.log('  ⏳ Note: It may take 1-2 minutes for the index to become READY.');
    } catch (err) {
      console.log('  ⚠️  Could not create index via driver (this is normal for older clusters).');
      console.log('     Error:', err.message);
      console.log('\n📝 To create it manually:');
      console.log('   1. Go to Atlas → Database → Browse Collections');
      console.log(`   2. Select database "${DB_NAME}" → collection "${COLLECTION}"`);
      console.log('   3. Click "Search Indexes" tab → "Create Search Index"');
      console.log('   4. Choose "Atlas Vector Search" → "JSON Editor"');
      console.log('   5. Paste the JSON definition above and click "Next" → "Create"');
    }

    // ------------------------------------------------------------------
    // 3. Quick stats
    // ------------------------------------------------------------------
    const count = await collection.countDocuments();
    console.log(`\n📊 Current document count in ${DB_NAME}.${COLLECTION}: ${count}`);

    console.log('\n✅ Setup complete!');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
