#!/usr/bin/env node

/**
 * Seed script – creates test outbound messages for widget testing.
 *
 * Usage:
 *   node scripts/seed-outbound-test.mjs
 *
 * Looks up the first tenant and inserts sample outbound messages
 * (banner, chat popup, post) with status=active so the widget
 * renders them on /test-widget.html.
 */

import { Client, Databases, ID, Query } from 'node-appwrite';
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
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* optional */ }
}

loadEnv();

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const DB_ID    = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const API_KEY  = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT || !DB_ID || !API_KEY) {
  console.error('❌ Missing required env vars. Check .env.local');
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY);
const db = new Databases(client);

const COLLECTION_OUTBOUND = 'outbound_messages';
const COLLECTION_TENANTS  = 'tenants';

async function main() {
  // Find first tenant
  const tenants = await db.listDocuments(DB_ID, COLLECTION_TENANTS, [Query.limit(1)]);
  if (tenants.documents.length === 0) {
    console.error('❌ No tenants found. Create one via the dashboard first.');
    process.exit(1);
  }
  const tenantId = tenants.documents[0].$id;
  const tenantName = tenants.documents[0].name || tenantId;
  console.log(`✅ Using tenant: ${tenantName} (${tenantId})\n`);

  const messages = [
    {
      title: 'Välkomstbanner',
      channel: 'banner',
      status: 'active',
      content: JSON.stringify({
        body: 'Vi har lanserat en ny funktion!',
        subject: 'Nyhet',
        position: 'top',
        style: 'info',
        ctaText: 'Läs mer',
        ctaUrl: 'https://example.com'
      }),
      audience: JSON.stringify({ type: 'all', rules: [] }),
      schedule: JSON.stringify({ type: 'immediate' }),
      sentCount: 0, openRate: 0, clickRate: 0,
      metadata: '{}'
    },
    {
      title: 'Proaktiv chatt – hälsa besökare',
      channel: 'chat',
      status: 'active',
      content: JSON.stringify({
        body: 'Hej! 👋 Behöver du hjälp med något? Vi finns här för dig.',
        ctaText: 'Svara'
      }),
      audience: JSON.stringify({
        type: 'rules',
        rules: [{ field: 'time_on_page', operator: 'greater_than', value: '3' }]
      }),
      schedule: JSON.stringify({ type: 'immediate' }),
      sentCount: 0, openRate: 0, clickRate: 0,
      metadata: '{}'
    },
    {
      title: 'Ny funktion: Outbound Messaging',
      channel: 'post',
      status: 'active',
      content: JSON.stringify({
        body: 'Nu kan du skicka proaktiva meddelanden till dina användare direkt i appen. Skapa banners, tooltips, chatmeddelanden och mycket mer!',
        ctaText: 'Utforska',
        ctaUrl: 'https://example.com/outbound'
      }),
      audience: JSON.stringify({ type: 'all', rules: [] }),
      schedule: JSON.stringify({ type: 'immediate' }),
      sentCount: 0, openRate: 0, clickRate: 0,
      metadata: '{}'
    }
  ];

  for (const msg of messages) {
    try {
      const doc = await db.createDocument(
        DB_ID,
        COLLECTION_OUTBOUND,
        ID.unique(),
        { tenantId, ...msg }
      );
      console.log(`✅ Created: [${msg.channel}] "${msg.title}" → ${doc.$id}`);
    } catch (err) {
      console.error(`❌ Failed: "${msg.title}" →`, err.message || err);
    }
  }

  console.log('\n🎉 Done! Open /test-widget.html to see them in action.');
}

main().catch(console.error);
