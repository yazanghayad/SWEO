'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query, ID } from 'node-appwrite';
import type {
  Macro,
  Tag,
  Webhook,
  AutomationRule,
  TeamInbox
} from '@/types/appwrite';

// ---------------------------------------------------------------------------
// Helper: get current tenant ID from session
// ---------------------------------------------------------------------------

async function getTenantId(): Promise<string> {
  const { account } = await createSessionClient();
  const user = await account.get();
  const { databases } = createAdminClient();

  const result = await databases.listDocuments(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('userId', user.$id), Query.limit(1)]
  );

  if (result.documents.length === 0) {
    throw new Error('No tenant found');
  }
  return result.documents[0].$id;
}

// ---------------------------------------------------------------------------
// Generic CRUD helpers (scoped to current tenant)
// ---------------------------------------------------------------------------

async function listForTenant<T>(collectionId: string): Promise<T[]> {
  const tenantId = await getTenantId();
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(
    APPWRITE_DATABASE,
    collectionId,
    [Query.equal('tenantId', tenantId), Query.limit(100), Query.orderDesc('$createdAt')]
  );
  return result.documents.map(
    (d) => JSON.parse(JSON.stringify(d)) as T
  );
}

async function createForTenant<T>(
  collectionId: string,
  data: Record<string, unknown>
): Promise<T> {
  const tenantId = await getTenantId();
  const { databases } = createAdminClient();
  const doc = await databases.createDocument(
    APPWRITE_DATABASE,
    collectionId,
    ID.unique(),
    { tenantId, ...data }
  );
  return JSON.parse(JSON.stringify(doc)) as T;
}

async function updateForTenant<T>(
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>
): Promise<T> {
  // Verify session and derive tenant to prevent cross-tenant mutations
  const tenantId = await getTenantId();
  const { databases } = createAdminClient();

  // Verify the document belongs to the caller's tenant before updating
  const existing = await databases.getDocument(
    APPWRITE_DATABASE,
    collectionId,
    documentId
  );
  if ((existing as Record<string, unknown>).tenantId !== tenantId) {
    throw new Error('Forbidden: document does not belong to this tenant');
  }

  const doc = await databases.updateDocument(
    APPWRITE_DATABASE,
    collectionId,
    documentId,
    data
  );
  return JSON.parse(JSON.stringify(doc)) as T;
}

async function deleteForTenant(
  collectionId: string,
  documentId: string
): Promise<void> {
  // Verify session and derive tenant to prevent cross-tenant mutations
  const tenantId = await getTenantId();
  const { databases } = createAdminClient();

  // Verify the document belongs to the caller's tenant before deleting
  const existing = await databases.getDocument(
    APPWRITE_DATABASE,
    collectionId,
    documentId
  );
  if ((existing as Record<string, unknown>).tenantId !== tenantId) {
    throw new Error('Forbidden: document does not belong to this tenant');
  }

  await databases.deleteDocument(APPWRITE_DATABASE, collectionId, documentId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MACROS
// ═══════════════════════════════════════════════════════════════════════════════

export async function listMacros(): Promise<Macro[]> {
  return listForTenant<Macro>(COLLECTION.MACROS);
}

export async function createMacro(data: {
  name: string;
  content: string;
}): Promise<Macro> {
  return createForTenant<Macro>(COLLECTION.MACROS, {
    name: data.name,
    content: data.content,
    usageCount: 0
  });
}

export async function updateMacro(
  id: string,
  data: { name?: string; content?: string }
): Promise<Macro> {
  return updateForTenant<Macro>(COLLECTION.MACROS, id, data);
}

export async function deleteMacro(id: string): Promise<void> {
  return deleteForTenant(COLLECTION.MACROS, id);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAGS
// ═══════════════════════════════════════════════════════════════════════════════

export async function listTags(): Promise<Tag[]> {
  return listForTenant<Tag>(COLLECTION.TAGS);
}

export async function createTag(data: {
  name: string;
  color: string;
}): Promise<Tag> {
  return createForTenant<Tag>(COLLECTION.TAGS, {
    name: data.name,
    color: data.color,
    usageCount: 0
  });
}

export async function updateTag(
  id: string,
  data: { name?: string; color?: string }
): Promise<Tag> {
  return updateForTenant<Tag>(COLLECTION.TAGS, id, data);
}

export async function deleteTag(id: string): Promise<void> {
  return deleteForTenant(COLLECTION.TAGS, id);
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export async function listWebhooks(): Promise<Webhook[]> {
  return listForTenant<Webhook>(COLLECTION.WEBHOOKS);
}

export async function createWebhook(data: {
  url: string;
  events: string[];
}): Promise<Webhook> {
  return createForTenant<Webhook>(COLLECTION.WEBHOOKS, {
    url: data.url,
    events: JSON.stringify(data.events),
    status: 'active',
    lastTriggered: null
  });
}

export async function updateWebhook(
  id: string,
  data: { url?: string; events?: string[]; status?: string }
): Promise<Webhook> {
  const update: Record<string, unknown> = {};
  if (data.url !== undefined) update.url = data.url;
  if (data.events !== undefined) update.events = JSON.stringify(data.events);
  if (data.status !== undefined) update.status = data.status;
  return updateForTenant<Webhook>(COLLECTION.WEBHOOKS, id, update);
}

export async function deleteWebhook(id: string): Promise<void> {
  return deleteForTenant(COLLECTION.WEBHOOKS, id);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOMATION RULES
// ═══════════════════════════════════════════════════════════════════════════════

export async function listAutomationRules(): Promise<AutomationRule[]> {
  return listForTenant<AutomationRule>(COLLECTION.AUTOMATION_RULES);
}

export async function createAutomationRule(data: {
  name: string;
  trigger: string;
  action: string;
  enabled?: boolean;
}): Promise<AutomationRule> {
  return createForTenant<AutomationRule>(COLLECTION.AUTOMATION_RULES, {
    name: data.name,
    trigger: data.trigger,
    action: data.action,
    enabled: data.enabled ?? true
  });
}

export async function updateAutomationRule(
  id: string,
  data: { name?: string; trigger?: string; action?: string; enabled?: boolean }
): Promise<AutomationRule> {
  return updateForTenant<AutomationRule>(COLLECTION.AUTOMATION_RULES, id, data);
}

export async function deleteAutomationRule(id: string): Promise<void> {
  return deleteForTenant(COLLECTION.AUTOMATION_RULES, id);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM INBOXES
// ═══════════════════════════════════════════════════════════════════════════════

export async function listTeamInboxes(): Promise<TeamInbox[]> {
  return listForTenant<TeamInbox>(COLLECTION.TEAM_INBOXES);
}

export async function createTeamInbox(data: {
  name: string;
  isDefault?: boolean;
}): Promise<TeamInbox> {
  return createForTenant<TeamInbox>(COLLECTION.TEAM_INBOXES, {
    name: data.name,
    memberCount: 0,
    isDefault: data.isDefault ?? false
  });
}

export async function updateTeamInbox(
  id: string,
  data: { name?: string; memberCount?: number; isDefault?: boolean }
): Promise<TeamInbox> {
  return updateForTenant<TeamInbox>(COLLECTION.TEAM_INBOXES, id, data);
}

export async function deleteTeamInbox(id: string): Promise<void> {
  return deleteForTenant(COLLECTION.TEAM_INBOXES, id);
}
