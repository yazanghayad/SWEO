#!/usr/bin/env node

/**
 * Appwrite database setup script.
 *
 * Creates the database, all collections, attributes and indexes defined in the
 * project plan (Fas 2). Safe to run multiple times – existing resources are
 * silently skipped.
 *
 * Usage:
 *   node scripts/setup-appwrite-db.mjs
 *
 * Required env vars (reads from .env.local via dotenv-style parsing):
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT
 *   NEXT_PUBLIC_APPWRITE_PROJECT
 *   NEXT_PUBLIC_APPWRITE_DATABASE
 *   APPWRITE_API_KEY
 */

import { Client, Databases, ID, Storage } from 'node-appwrite';
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
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local is optional when env vars are already set
  }
}

loadEnv();

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const DB_ID    = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const API_KEY  = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT || !DB_ID || !API_KEY) {
  console.error('Missing required env vars. Check .env.local');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT)
  .setKey(API_KEY);

const db = new Databases(client);
const storage = new Storage(client);

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET || 'knowledge_files';

// ── Helpers ──────────────────────────────────────────────────────────────────
async function safe(fn) {
  try { await fn(); }
  catch (e) {
    if (e?.code === 409) return; // resource already exists
    throw e;
  }
}

async function ensureDatabase() {
  await safe(() => db.create(DB_ID, 'support-ai'));
  console.log('✓ Database ready');
}

async function ensureBucket() {
  await safe(() =>
    storage.createBucket(
      BUCKET_ID,
      'Knowledge Files',
      undefined, // permissions – inherit project defaults
      false,     // fileSecurity
      true,      // enabled
      50 * 1024 * 1024, // maxFileSize: 50 MB
      [
        'pdf',
        'txt',
        'html',
        'md',
        'csv',
        'docx',
        'xlsx',
        'json',
      ],
      'gzip',    // compression
      false,     // encryption
      false      // antivirus
    )
  );
  console.log('✓ Storage bucket ready');
}

async function ensureCollection(id, name) {
  await safe(() => db.createCollection(DB_ID, id, name));
  console.log(`  ✓ Collection: ${name}`);
}

async function attr(type, collId, key, opts = {}) {
  const map = {
    string:   () => db.createStringAttribute(DB_ID, collId, key, opts.size ?? 255, opts.required ?? false, opts.default, opts.array ?? false),
    longtext: () => db.createLongtextAttribute(DB_ID, collId, key, opts.required ?? false, opts.default, opts.array ?? false),
    enum:     () => db.createEnumAttribute(DB_ID, collId, key, opts.elements, opts.required ?? false, opts.default, opts.array ?? false),
    boolean:  () => db.createBooleanAttribute(DB_ID, collId, key, opts.required ?? false, opts.default, opts.array ?? false),
    integer:  () => db.createIntegerAttribute(DB_ID, collId, key, opts.required ?? false, opts.min, opts.max, opts.default, opts.array ?? false),
    float:    () => db.createFloatAttribute(DB_ID, collId, key, opts.required ?? false, opts.min, opts.max, opts.default, opts.array ?? false),
    datetime: () => db.createDatetimeAttribute(DB_ID, collId, key, opts.required ?? false, opts.default, opts.array ?? false),
    url:      () => db.createUrlAttribute(DB_ID, collId, key, opts.required ?? false, opts.default, opts.array ?? false),
  };
  await safe(map[type]);
}

/** Wait for all attributes in a collection to become 'available'. */
async function waitForAttributes(collId, maxWait = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const result = await db.listAttributes(DB_ID, collId);
      const attrs = result.attributes ?? result;
      const pending = (Array.isArray(attrs) ? attrs : []).filter(a => a.status !== 'available');
      if (pending.length === 0) return;
    } catch {
      // If listAttributes fails fall back to a fixed delay
      await new Promise(r => setTimeout(r, 3000));
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Timed out waiting for attributes in ${collId}`);
}

async function idx(collId, key, type, attributes, orders) {
  await safe(() => db.createIndex(DB_ID, collId, key, type, attributes, orders));
}

// ── Schema definition ────────────────────────────────────────────────────────

async function setupTenants() {
  const C = 'tenants';
  await ensureCollection(C, 'Tenants');
  await attr('string',  C, 'name',   { required: true });
  await attr('enum',    C, 'plan',   { elements: ['trial', 'growth', 'enterprise'], required: true });
  await attr('longtext',C, 'config');
  await attr('string',  C, 'apiKey', { size: 64, required: true });
  await attr('string',  C, 'userId', { required: true });
  await attr('string',  C, 'subdomain', { size: 63 });
  await attr('string',  C, 'previousApiKey', { size: 64 });
  await attr('string',  C, 'previousApiKeyExpiresAt', { size: 30 });
  await waitForAttributes(C);
  await idx(C, 'apiKey_unique',    'unique', ['apiKey']);
  await idx(C, 'userId_idx',      'key',    ['userId']);
  await idx(C, 'subdomain_unique', 'unique', ['subdomain']);
  await idx(C, 'previousApiKey_idx', 'key', ['previousApiKey']);
}

async function setupKnowledgeSources() {
  const C = 'knowledge_sources';
  await ensureCollection(C, 'Knowledge Sources');
  await attr('string',  C, 'tenantId', { required: true });
  await attr('enum',    C, 'type',     { elements: ['url', 'file', 'manual'], required: true });
  await attr('url',     C, 'url');
  await attr('string',  C, 'fileId');
  await attr('enum',    C, 'status',   { elements: ['processing', 'ready', 'failed'], required: true });
  await attr('integer', C, 'version',  { min: 1, default: 1 });
  await attr('longtext',C, 'metadata');
  // Targets: which channels this source applies to (AI Agent, Copilot, Help Center)
  await attr('longtext',C, 'targets'); // JSON array: ["AI Agent", "Copilot", "Help Center"]
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx', 'key', ['tenantId']);
}

async function setupConversations() {
  const C = 'conversations';
  const STATUS_VALUES = [
    'active',
    'handoff_requested',
    'queued',
    'human_active',
    'resolved',
    'escalated'
  ];
  await ensureCollection(C, 'Conversations');
  await attr('string',   C, 'tenantId',   { required: true });
  await attr('enum',     C, 'channel',    { elements: ['web', 'email', 'whatsapp', 'sms', 'voice', 'instagram', 'facebook_messenger', 'slack'], required: true });
  await attr('enum',     C, 'status',     { elements: STATUS_VALUES, required: true });
  await attr('string',   C, 'userId');
  await attr('longtext', C, 'metadata');
  await attr('datetime', C, 'resolvedAt');
  await attr('datetime', C, 'firstResponseAt');
  await attr('float',    C, 'csatScore',  { min: 1, max: 5 });
  await attr('string',   C, 'assignedTo');

  // Ensure existing deployments with legacy enum (active/resolved/escalated)
  // are upgraded to the full state machine.
  // Note: updateEnumAttribute has SDK compatibility issues; skip if attribute already exists.
  try {
    await db.updateEnumAttribute(DB_ID, C, 'status', STATUS_VALUES, true, '');
  } catch {
    // Attribute already exists with correct or older enum – continue
  }

  await waitForAttributes(C);
  await idx(C, 'tenantId_status_idx',    'key', ['tenantId', 'status']);
  await idx(C, 'tenantId_createdAt_idx', 'key', ['tenantId', '$createdAt']);
}

async function setupMessages() {
  const C = 'messages';
  await ensureCollection(C, 'Messages');
  await attr('string',   C, 'conversationId', { required: true });
  await attr('enum',     C, 'role',           { elements: ['user', 'assistant'], required: true });
  await attr('longtext', C, 'content',        { required: true });
  await attr('float',    C, 'confidence');
  await attr('longtext', C, 'citations');
  await attr('longtext', C, 'metadata');
  await waitForAttributes(C);
  await idx(C, 'conversationId_idx', 'key', ['conversationId']);
}

async function setupPolicies() {
  const C = 'policies';
  await ensureCollection(C, 'Policies');
  await attr('string',  C, 'tenantId', { required: true });
  await attr('string',  C, 'name',     { required: true });
  await attr('enum',    C, 'type',     { elements: ['topic_filter', 'pii_filter', 'tone', 'length'], required: true });
  await attr('enum',    C, 'mode',     { elements: ['pre', 'post'], required: true });
  await attr('longtext',C, 'config');
  await attr('boolean', C, 'enabled',  { default: true });
  await attr('integer', C, 'priority', { min: 0, default: 0 });
  await waitForAttributes(C);
  await idx(C, 'tenantId_enabled_idx', 'key', ['tenantId', 'enabled']);
}

async function setupAuditEvents() {
  const C = 'audit_events';
  await ensureCollection(C, 'Audit Events');
  await attr('string',   C, 'tenantId',  { required: true });
  await attr('string',   C, 'eventType', { required: true });
  await attr('string',   C, 'userId');
  await attr('longtext', C, 'payload');
  await waitForAttributes(C);
  await idx(C, 'tenantId_eventType_createdAt_idx', 'key', ['tenantId', 'eventType', '$createdAt']);
}

async function setupProcedures() {
  const C = 'procedures';
  await ensureCollection(C, 'Procedures');
  await attr('string',  C, 'tenantId',    { required: true });
  await attr('string',  C, 'name',        { required: true });
  await attr('longtext',C, 'description');
  await attr('longtext',C, 'trigger',     { required: true }); // JSON
  await attr('longtext',C, 'steps',       { required: true }); // JSON array
  await attr('boolean', C, 'enabled',     { default: true });
  await attr('integer', C, 'version',     { min: 1, default: 1 });
  await waitForAttributes(C);
  await idx(C, 'tenantId_enabled_idx', 'key', ['tenantId', 'enabled']);
}

async function setupDataConnectors() {
  const C = 'data_connectors';
  await ensureCollection(C, 'Data Connectors');
  await attr('string',  C, 'tenantId', { required: true });
  await attr('string',  C, 'name',     { required: true });
  await attr('enum',    C, 'provider', { elements: ['shopify', 'stripe', 'linear', 'zendesk', 'salesforce', 'intercom', 'custom'], required: true });
  await attr('longtext',C, 'auth');       // JSON (encrypted)
  await attr('longtext',C, 'config');     // JSON
  await attr('longtext',C, 'endpoints');  // JSON array
  await attr('boolean', C, 'enabled',  { default: true });
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx', 'key', ['tenantId']);
}

async function setupTestScenarios() {
  const C = 'test_scenarios';
  await ensureCollection(C, 'Test Scenarios');
  await attr('string',   C, 'tenantId',        { required: true });
  await attr('string',   C, 'name',            { required: true });
  await attr('longtext', C, 'messages',         { required: true }); // JSON array of strings
  await attr('longtext', C, 'expectedOutcome',  { required: true }); // JSON
  await attr('datetime', C, 'lastRun');
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx', 'key', ['tenantId']);
}

async function setupContentSuggestions() {
  const C = 'content_suggestions';
  await ensureCollection(C, 'Content Suggestions');
  await attr('string',   C, 'tenantId',         { required: true });
  await attr('string',   C, 'topic',            { required: true });
  await attr('integer',  C, 'frequency',        { min: 0, default: 1 });
  await attr('longtext', C, 'exampleQueries');   // JSON array
  await attr('longtext', C, 'suggestedContent');
  await attr('enum',     C, 'status',           { elements: ['pending', 'approved', 'dismissed'], required: true });
  await waitForAttributes(C);
  await idx(C, 'tenantId_status_idx', 'key', ['tenantId', 'status']);
}

// ── Vectors ────────────────────────────────────────────────────────────────────
async function setupVectors() {
  const C = 'vectors';
  await ensureCollection(C, 'Vectors');
  await attr('string',   C, 'tenantId',   { required: true, size: 64 });
  await attr('string',   C, 'vectorId',   { required: true, size: 255 });
  await attr('string',   C, 'sourceId',   { required: true, size: 64 });
  await attr('longtext', C, 'text');                   // chunk text (up to 10k chars)
  await attr('longtext', C, 'embedding');               // JSON array of floats (1024-d)
  await attr('longtext', C, 'metadata');                // JSON object
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx',          'key', ['tenantId']);
  await idx(C, 'tenantId_sourceId_idx', 'key', ['tenantId', 'sourceId']);
}

// ── Chatbot (public SWEO website chatbot) ──────────────────────────────────────
async function setupChatbotConversations() {
  const C = 'chatbot_conversations';
  await ensureCollection(C, 'Chatbot Conversations');
  await attr('string',   C, 'sessionId',       { required: true, size: 64 });
  await attr('enum',     C, 'department',       { elements: ['sales', 'support'], required: true });
  await attr('enum',     C, 'status',           { elements: ['active', 'closed'], required: true });
  await attr('string',   C, 'visitorIp');
  await attr('string',   C, 'visitorUserAgent', { size: 512 });
  await attr('longtext', C, 'metadata');
  await waitForAttributes(C);
  await idx(C, 'sessionId_idx', 'unique', ['sessionId']);
  await idx(C, 'department_status_idx', 'key', ['department', 'status']);
  await idx(C, 'createdAt_idx', 'key', ['$createdAt']);
}

async function setupChatbotMessages() {
  const C = 'chatbot_messages';
  await ensureCollection(C, 'Chatbot Messages');
  await attr('string',   C, 'conversationId', { required: true });
  await attr('enum',     C, 'role',           { elements: ['user', 'assistant'], required: true });
  await attr('longtext', C, 'content',        { required: true });
  await waitForAttributes(C);
  await idx(C, 'conversationId_idx', 'key', ['conversationId']);
  await idx(C, 'conversationId_createdAt_idx', 'key', ['conversationId', '$createdAt']);
}

// ── Macros ──────────────────────────────────────────────────────────────────
async function setupMacros() {
  const C = 'macros';
  await ensureCollection(C, 'Macros');
  await attr('string',   C, 'tenantId', { required: true });
  await attr('string',   C, 'name',     { required: true });
  await attr('longtext', C, 'content',  { required: true });
  await attr('integer',  C, 'usageCount', { min: 0, default: 0 });
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx', 'key', ['tenantId']);
}

// ── Tags ────────────────────────────────────────────────────────────────────
async function setupTags() {
  const C = 'tags';
  await ensureCollection(C, 'Tags');
  await attr('string',  C, 'tenantId', { required: true });
  await attr('string',  C, 'name',     { required: true });
  await attr('string',  C, 'color',    { size: 30, required: true });
  await attr('integer', C, 'usageCount', { min: 0, default: 0 });
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx', 'key', ['tenantId']);
}

// ── Webhooks ────────────────────────────────────────────────────────────────
async function setupWebhooks() {
  const C = 'webhooks';
  await ensureCollection(C, 'Webhooks');
  await attr('string',   C, 'tenantId', { required: true });
  await attr('url',      C, 'url',      { required: true });
  await attr('longtext', C, 'events');             // JSON array of event strings
  await attr('enum',     C, 'status',   { elements: ['active', 'inactive', 'failed'], required: true });
  await attr('string',   C, 'lastTriggered');
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx', 'key', ['tenantId']);
}

// ── Automation Rules ────────────────────────────────────────────────────────
async function setupAutomationRules() {
  const C = 'automation_rules';
  await ensureCollection(C, 'Automation Rules');
  await attr('string',  C, 'tenantId', { required: true });
  await attr('string',  C, 'name',     { required: true });
  await attr('string',  C, 'trigger',  { size: 500, required: true });
  await attr('string',  C, 'action',   { size: 500, required: true });
  await attr('boolean', C, 'enabled',  { default: true });
  await waitForAttributes(C);
  await idx(C, 'tenantId_enabled_idx', 'key', ['tenantId', 'enabled']);
}

// ── Team Inboxes ────────────────────────────────────────────────────────────
async function setupTeamInboxes() {
  const C = 'team_inboxes';
  await ensureCollection(C, 'Team Inboxes');
  await attr('string',  C, 'tenantId',    { required: true });
  await attr('string',  C, 'name',        { required: true });
  await attr('integer', C, 'memberCount', { min: 0, default: 0 });
  await attr('boolean', C, 'isDefault',   { default: false });
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx', 'key', ['tenantId']);
}

// ── Guidance Rules ──────────────────────────────────────────────────────────
async function setupGuidanceRules() {
  const C = 'guidance_rules';
  await ensureCollection(C, 'Guidance Rules');
  await attr('string',  C, 'tenantId',    { required: true });
  await attr('enum',    C, 'channel',     { elements: ['chat-email', 'voice'], required: true });
  await attr('enum',    C, 'category',    { elements: ['communication_style', 'context_clarification', 'content_sources', 'spam', 'other'], required: true });
  await attr('string',  C, 'name',        { required: true });
  await attr('longtext',C, 'description');
  await attr('longtext',C, 'ruleContent', { required: true });
  await attr('boolean', C, 'enabled',     { default: true });
  await attr('enum',    C, 'tone',        { elements: ['friendly', 'neutral', 'matter-of-fact', 'professional', 'humorous'] });
  await attr('enum',    C, 'length',      { elements: ['concise', 'standard', 'thorough'] });
  await waitForAttributes(C);
  await idx(C, 'tenantId_channel_idx',  'key', ['tenantId', 'channel']);
  await idx(C, 'tenantId_category_idx', 'key', ['tenantId', 'category']);
}

// ── Contacts ────────────────────────────────────────────────────────────────
async function setupContacts() {
  const C = 'contacts';
  await ensureCollection(C, 'Contacts');
  await attr('string',   C, 'tenantId',    { required: true });
  await attr('string',   C, 'name',        { required: true });
  await attr('string',   C, 'email',       { size: 500 });
  await attr('string',   C, 'phone',       { size: 50 });
  await attr('string',   C, 'company',     { size: 255 });
  await attr('enum',     C, 'type',        { elements: ['user', 'lead'], default: 'user' });
  await attr('enum',     C, 'status',      { elements: ['active', 'inactive', 'archived'], default: 'active' });
  await attr('string',   C, 'avatarColor', { size: 50 });
  await attr('string',   C, 'city',        { size: 255 });
  await attr('string',   C, 'country',     { size: 255 });
  await attr('integer',  C, 'webSessions', { min: 0, default: 0 });
  await attr('datetime', C, 'lastSeenAt');
  await attr('datetime', C, 'firstSeenAt');
  await attr('datetime', C, 'signedUpAt');
  await attr('longtext', C, 'tags');
  await attr('longtext', C, 'notes');
  await attr('longtext', C, 'metadata');
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx',        'key', ['tenantId']);
  await idx(C, 'tenantId_type_idx',   'key', ['tenantId', 'type']);
  await idx(C, 'tenantId_status_idx', 'key', ['tenantId', 'status']);
  await idx(C, 'tenantId_email_idx',  'key', ['tenantId', 'email']);
}

// ── Cases (Case Management) ─────────────────────────────────────────────────
async function setupCases() {
  const C = 'cases';
  await ensureCollection(C, 'Cases');
  await attr('string',   C, 'tenantId',       { required: true });
  await attr('string',   C, 'contactId');
  await attr('string',   C, 'conversationId');
  await attr('enum',     C, 'type',           { elements: ['invoice_dispute', 'complaint', 'return', 'warranty', 'general'], required: true });
  await attr('enum',     C, 'status',         { elements: ['open', 'in_progress', 'awaiting_customer', 'awaiting_internal', 'resolved', 'closed'], required: true });
  await attr('enum',     C, 'priority',       { elements: ['low', 'medium', 'high', 'urgent'], required: true });
  await attr('string',   C, 'subject',        { size: 500, required: true });
  await attr('longtext', C, 'description');
  await attr('string',   C, 'assignedTo');
  await attr('datetime', C, 'dueDate');
  await attr('datetime', C, 'resolvedAt');
  await attr('longtext', C, 'tags');           // JSON array
  await attr('longtext', C, 'metadata');       // JSON
  await waitForAttributes(C);
  await idx(C, 'tenantId_status_idx',     'key', ['tenantId', 'status']);
  await idx(C, 'tenantId_type_idx',       'key', ['tenantId', 'type']);
  await idx(C, 'tenantId_priority_idx',   'key', ['tenantId', 'priority']);
  await idx(C, 'tenantId_assignedTo_idx', 'key', ['tenantId', 'assignedTo']);
  await idx(C, 'tenantId_contactId_idx',  'key', ['tenantId', 'contactId']);
  await idx(C, 'tenantId_createdAt_idx',  'key', ['tenantId', '$createdAt']);
}

async function setupCaseDocuments() {
  const C = 'case_documents';
  await ensureCollection(C, 'Case Documents');
  await attr('string',  C, 'tenantId',     { required: true });
  await attr('string',  C, 'caseId',       { required: true });
  await attr('string',  C, 'fileId',       { required: true });
  await attr('string',  C, 'fileName',     { size: 500, required: true });
  await attr('string',  C, 'fileMimeType', { size: 100 });
  await attr('integer', C, 'fileSize',     { min: 0 });
  await attr('string',  C, 'uploadedBy');
  await waitForAttributes(C);
  await idx(C, 'caseId_idx',    'key', ['caseId']);
  await idx(C, 'tenantId_idx',  'key', ['tenantId']);
}

async function setupCaseNotes() {
  const C = 'case_notes';
  await ensureCollection(C, 'Case Notes');
  await attr('string',   C, 'tenantId',   { required: true });
  await attr('string',   C, 'caseId',     { required: true });
  await attr('string',   C, 'authorId');
  await attr('string',   C, 'authorName', { size: 255 });
  await attr('longtext', C, 'content',    { required: true });
  await waitForAttributes(C);
  await idx(C, 'caseId_idx',   'key', ['caseId']);
  await idx(C, 'tenantId_idx', 'key', ['tenantId']);
}

async function setupCaseTimeline() {
  const C = 'case_timeline';
  await ensureCollection(C, 'Case Timeline');
  await attr('string',   C, 'tenantId',    { required: true });
  await attr('string',   C, 'caseId',      { required: true });
  await attr('enum',     C, 'eventType',   { elements: ['created', 'status_changed', 'priority_changed', 'assigned', 'note_added', 'document_added', 'document_removed', 'comment', 'linked_conversation', 'resolved', 'reopened'], required: true });
  await attr('string',   C, 'actorId');
  await attr('string',   C, 'actorName',   { size: 255 });
  await attr('longtext', C, 'description');
  await attr('longtext', C, 'metadata');    // JSON (e.g. { from: 'open', to: 'in_progress' })
  await waitForAttributes(C);
  await idx(C, 'caseId_createdAt_idx',  'key', ['caseId', '$createdAt']);
  await idx(C, 'tenantId_idx',          'key', ['tenantId']);
}

// ── Helpdesk Integrations ────────────────────────────────────────────────────
async function setupHelpdeskIntegrations() {
  const C = 'helpdesk_integrations';
  await ensureCollection(C, 'Helpdesk Integrations');
  await attr('string',   C, 'tenantId',    { required: true });
  await attr('enum',     C, 'provider',    { elements: ['intercom', 'zendesk', 'salesforce'], required: true });
  await attr('string',   C, 'connectorId', { required: true });
  await attr('enum',     C, 'status',      { elements: ['setup', 'connecting', 'connected', 'syncing', 'active', 'paused', 'error'], required: true });
  await attr('longtext', C, 'config');      // JSON: { syncConversations, syncContacts, syncArticles, autoEscalate, writeBack }
  await attr('longtext', C, 'syncState');   // JSON: { conversations, contacts, articles, errors, lastSyncAt }
  await attr('longtext', C, 'lastError');
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx',          'key', ['tenantId']);
  await idx(C, 'tenantId_provider_idx', 'unique', ['tenantId', 'provider']);
  await idx(C, 'tenantId_status_idx',   'key', ['tenantId', 'status']);
}

async function setupHelpdeskSyncLog() {
  const C = 'helpdesk_sync_log';
  await ensureCollection(C, 'Helpdesk Sync Log');
  await attr('string',   C, 'tenantId',      { required: true });
  await attr('string',   C, 'integrationId', { required: true });
  await attr('enum',     C, 'entity',        { elements: ['conversation', 'contact', 'article'], required: true });
  await attr('string',   C, 'externalId');
  await attr('enum',     C, 'action',        { elements: ['created', 'updated', 'deleted', 'error'], required: true });
  await attr('longtext', C, 'details');       // JSON with error details or sync metadata
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx',          'key', ['tenantId']);
  await idx(C, 'integrationId_idx',     'key', ['integrationId']);
  await idx(C, 'tenantId_createdAt_idx','key', ['tenantId', '$createdAt']);
}

// ── Outbound Messages ────────────────────────────────────────────────────────
async function setupOutboundMessages() {
  const C = 'outbound_messages';
  await ensureCollection(C, 'Outbound Messages');
  await attr('string',   C, 'tenantId',  { required: true });
  await attr('string',   C, 'title',     { required: true });
  await attr('enum',     C, 'channel',   { elements: ['chat', 'email', 'banner', 'post', 'sms', 'whatsapp', 'mobile-push', 'tooltip', 'product-tour', 'checklist', 'survey', 'mobile-carousel', 'workflow', 'news', 'broadcast'], required: true });
  await attr('enum',     C, 'status',    { elements: ['active', 'draft', 'paused', 'archived', 'sending', 'sent', 'failed'], required: true });
  await attr('longtext', C, 'content');    // JSON: { subject?, body, templateId? }
  await attr('longtext', C, 'audience');   // JSON: { type, rules[] }
  await attr('longtext', C, 'schedule');   // JSON: { type: 'immediate'|'scheduled', sendAt? }
  await attr('integer',  C, 'sentCount',  { min: 0, default: 0 });
  await attr('float',    C, 'openRate',   { min: 0, max: 100 });
  await attr('float',    C, 'clickRate',  { min: 0, max: 100 });
  await attr('longtext', C, 'metadata');   // JSON
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx',         'key', ['tenantId']);
  await idx(C, 'tenantId_status_idx',  'key', ['tenantId', 'status']);
  await idx(C, 'tenantId_channel_idx', 'key', ['tenantId', 'channel']);
  await idx(C, 'tenantId_createdAt_idx', 'key', ['tenantId', '$createdAt']);
}

// ── Presence (real-time collaboration) ───────────────────────────────────────

// ── Outbound Deliveries ──────────────────────────────────────────────────────
async function setupOutboundDeliveries() {
  const C = 'outbound_deliveries';
  await ensureCollection(C, 'Outbound Deliveries');
  await attr('string',   C, 'tenantId',    { required: true });
  await attr('string',   C, 'messageId',   { required: true });
  await attr('string',   C, 'contactId',   { required: true });
  await attr('enum',     C, 'channel',     { elements: ['chat', 'email', 'banner', 'post', 'sms', 'whatsapp', 'mobile-push', 'tooltip', 'product-tour', 'checklist', 'survey', 'mobile-carousel', 'workflow', 'news', 'broadcast'], required: true });
  await attr('enum',     C, 'status',      { elements: ['delivered', 'read', 'clicked', 'failed'], required: true });
  await attr('longtext', C, 'content');
  await attr('string',   C, 'deliveredAt');
  await attr('string',   C, 'readAt');
  await attr('string',   C, 'clickedAt');
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx',          'key', ['tenantId']);
  await idx(C, 'messageId_idx',         'key', ['messageId']);
  await idx(C, 'contactId_idx',         'key', ['contactId']);
  await idx(C, 'tenantId_messageId_idx','key', ['tenantId', 'messageId']);
}

// ── Presence (real-time collaboration) ───────────────────────────────────────
async function setupPresence() {
  const C = 'presence';
  await ensureCollection(C, 'Presence');
  await attr('string',  C, 'agentId',        { required: true });
  await attr('string',  C, 'agentName',       { required: true });
  await attr('string',  C, 'conversationId',  { required: true });
  await attr('string',  C, 'tenantId',        { required: true });
  await attr('integer', C, 'lastSeen',        { required: true });
  await attr('boolean', C, 'typing',          { default: false });
  await waitForAttributes(C);
  await idx(C, 'agent_convo_idx',  'key',    ['agentId', 'conversationId']);
  await idx(C, 'convo_tenant_idx', 'key',    ['conversationId', 'tenantId']);
  await idx(C, 'lastSeen_idx',     'key',    ['lastSeen']);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Setting up Appwrite database…\n');
  await ensureDatabase();
  await ensureBucket();

  await setupTenants();
  await setupKnowledgeSources();
  await setupConversations();
  await setupMessages();
  await setupPolicies();
  await setupAuditEvents();
  await setupProcedures();
  await setupDataConnectors();
  await setupTestScenarios();
  await setupContentSuggestions();
  await setupVectors();
  await setupChatbotConversations();
  await setupChatbotMessages();
  await setupMacros();
  await setupTags();
  await setupWebhooks();
  await setupAutomationRules();
  await setupTeamInboxes();
  await setupGuidanceRules();
  await setupContacts();
  await setupCases();
  await setupCaseDocuments();
  await setupCaseNotes();
  await setupCaseTimeline();
  await setupHelpdeskIntegrations();
  await setupHelpdeskSyncLog();
  await setupOutboundMessages();
  await setupOutboundDeliveries();
  await setupPresence();

  console.log('\n✅ All collections, attributes, indexes, and storage bucket created.');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
