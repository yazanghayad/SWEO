/**
 * MongoDB Atlas client – singleton connection pool.
 *
 * Uses the official MongoDB Node.js driver. The `MongoClient` instance is
 * cached in a module-level variable so that hot-reloads in development don't
 * create multiple connections.
 *
 * Atlas Vector Search requires:
 *   1. An M10+ cluster (free-tier M0 does **not** support vector indexes).
 *   2. A vector search index created on the `vectors` collection.
 *      See `scripts/setup-atlas-vector-index.mjs` for automated setup.
 */

import { MongoClient, type Db } from 'mongodb';

// ---------------------------------------------------------------------------
// Connection URI
// ---------------------------------------------------------------------------

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to .env.local — ' +
        'e.g. mongodb+srv://user:pass@cluster.mongodb.net/?appName=MyApp'
    );
  }
  return uri;
}

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

export function getClientPromise(): Promise<MongoClient> {
  if (globalForMongo._mongoClientPromise) {
    return globalForMongo._mongoClientPromise;
  }

  const client = new MongoClient(getMongoUri(), {
    // Pool size tuned for serverless / edge — adjust if needed
    maxPoolSize: 10,
    minPoolSize: 1,
    // Timeout after 10s on initial connect
    serverSelectionTimeoutMS: 10_000
  });

  globalForMongo._mongoClientPromise = client.connect().catch((err) => {
    // Reset the cached promise so the next call retries
    globalForMongo._mongoClientPromise = undefined;
    globalForMongo._mongoClient = undefined;
    throw err;
  });
  globalForMongo._mongoClient = client;
  return globalForMongo._mongoClientPromise;
}

// ---------------------------------------------------------------------------
// Database helper
// ---------------------------------------------------------------------------

const DB_NAME = process.env.MONGODB_DB_NAME ?? 'fin_ai';

/**
 * Returns the default database handle. Await once, then use freely.
 */
export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}

// ---------------------------------------------------------------------------
// Collection & index constants
// ---------------------------------------------------------------------------

/** MongoDB collection that stores embedding vectors. */
export const VECTORS_COLLECTION = 'vectors';

/**
 * Name of the Atlas Vector Search index.
 * Must match the index created in Atlas (see setup script).
 */
export const VECTOR_INDEX_NAME = 'vector_index';
