#!/usr/bin/env node
/**
 * scripts/get-e2e-env.mjs
 *
 * Fetches the first tenant's API key from Appwrite and prints the
 * E2E environment variables you need to run inbox-escalation tests.
 *
 * Usage:
 *   node scripts/get-e2e-env.mjs
 *
 * Then copy the output into your .env.local or export the vars.
 */

import { Client, Databases, Query } from 'node-appwrite';
import { config } from 'dotenv';

config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const apiKey = process.env.APPWRITE_API_KEY;
const database = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;

if (!endpoint || !project || !apiKey || !database) {
  console.error(
    'Missing Appwrite env vars (NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT, APPWRITE_API_KEY, NEXT_PUBLIC_APPWRITE_DATABASE)'
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project)
  .setKey(apiKey);

const db = new Databases(client);

async function main() {
  try {
    const tenants = await db.listDocuments(database, 'tenants', [
      Query.limit(1)
    ]);

    if (tenants.documents.length === 0) {
      console.error('No tenants found. Create a tenant first.');
      process.exit(1);
    }

    const tenant = tenants.documents[0];
    console.log('# ── E2E Test Environment Variables ──────────────────────');
    console.log(`# Tenant: ${tenant.name} (${tenant.$id})`);
    console.log(`E2E_TENANT_API_KEY=${tenant.apiKey}`);
    console.log('');
    console.log('# Add your dashboard agent credentials:');
    console.log('E2E_AGENT_EMAIL=');
    console.log('E2E_AGENT_PASSWORD=');
    console.log('');
    console.log('# Append these to your .env.local to enable E2E tests');
  } catch (err) {
    console.error('Failed to fetch tenants:', err.message);
    process.exit(1);
  }
}

main();
