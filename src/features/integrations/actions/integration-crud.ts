'use server';

/**
 * Helpdesk integration CRUD server actions.
 *
 * Manages integration configs that link a data_connector (credentials)
 * to a helpdesk provider with sync settings, webhook info, and status.
 */

import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID, Query } from 'node-appwrite';
import type { HelpdeskProvider, HelpdeskIntegration, IntegrationConfig, SyncState } from '@/types/helpdesk';
import { decryptCredentials } from '@/lib/encryption';
import type { HelpdeskCredentials } from '@/lib/integrations/base';
import type { DataConnector } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';
import { safeJsonParse } from '@/lib/safe-json-parse';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntegrationDoc(doc: Record<string, unknown>): HelpdeskIntegration {
  return {
    id: doc.$id as string,
    tenantId: doc.tenantId as string,
    provider: doc.provider as HelpdeskProvider,
    connectorId: doc.connectorId as string,
    status: doc.status as HelpdeskIntegration['status'],
    config: safeJsonParse<IntegrationConfig>(doc.config, {} as IntegrationConfig),
    syncState: safeJsonParse<SyncState>(doc.syncState, {} as SyncState),
    createdAt: doc.$createdAt as string,
    updatedAt: doc.$updatedAt as string
  };
}

// ---------------------------------------------------------------------------
// List integrations
// ---------------------------------------------------------------------------

export async function listIntegrationsAction(tenantId: string): Promise<{
  success: boolean;
  integrations?: HelpdeskIntegration[];
  error?: string;
}> {
  try {
    await (await createSessionClient()).account.get();
    const { databases } = createAdminClient();

    const result = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      [
        Query.equal('tenantId', tenantId),
        Query.orderDesc('$createdAt'),
        Query.limit(10)
      ]
    );

    return {
      success: true,
      integrations: result.documents.map((d) =>
        parseIntegrationDoc(d as unknown as Record<string, unknown>)
      )
    };
  } catch (err) {
    logger.error('listIntegrationsAction error', { err });
    return { success: false, error: safeError(err, 'Failed to list integrations') };
  }
}

// ---------------------------------------------------------------------------
// Get by provider (used by webhook handler — no session required)
// ---------------------------------------------------------------------------

export async function getIntegrationByProvider(
  tenantId: string,
  provider: HelpdeskProvider
): Promise<HelpdeskIntegration | null> {
  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      [
        Query.equal('tenantId', tenantId),
        Query.equal('provider', provider),
        Query.limit(1)
      ]
    );

    if (result.documents.length === 0) return null;
    return parseIntegrationDoc(result.documents[0] as unknown as Record<string, unknown>);
  } catch (err) {
    logger.error('getIntegrationByProvider error', { err });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Create integration
// ---------------------------------------------------------------------------

export interface CreateIntegrationInput {
  provider: HelpdeskProvider;
  connectorId: string;
  config: Partial<IntegrationConfig>;
}

export async function createIntegrationAction(
  tenantId: string,
  input: CreateIntegrationInput
): Promise<{ success: boolean; integrationId?: string; error?: string }> {
  try {
    await (await createSessionClient()).account.get();
    const { databases } = createAdminClient();

    // Check no duplicate
    const existing = await getIntegrationByProvider(tenantId, input.provider);
    if (existing) {
      return { success: false, error: `${input.provider} integration already exists` };
    }

    const defaultConfig: IntegrationConfig = {
      syncConversations: true,
      syncContacts: true,
      syncArticles: true,
      writeBack: true,
      autoEscalate: true,
      providerConfig: {},
      ...input.config
    };

    const defaultSyncState: SyncState = {
      lastSyncAt: null,
      conversationsImported: 0,
      contactsImported: 0,
      articlesImported: 0,
      errors: []
    };

    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      ID.unique(),
      {
        tenantId,
        provider: input.provider,
        connectorId: input.connectorId,
        status: 'setup',
        config: JSON.stringify(defaultConfig),
        syncState: JSON.stringify(defaultSyncState)
      }
    );

    return { success: true, integrationId: doc.$id };
  } catch (err) {
    logger.error('createIntegrationAction error', { err });
    return { success: false, error: safeError(err, 'Failed to create integration') };
  }
}

// ---------------------------------------------------------------------------
// Update integration
// ---------------------------------------------------------------------------

export async function updateIntegrationAction(
  integrationId: string,
  tenantId: string,
  updates: {
    status?: HelpdeskIntegration['status'];
    config?: Partial<IntegrationConfig>;
    syncState?: Partial<SyncState>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await (await createSessionClient()).account.get();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      integrationId
    );

    if ((existing as unknown as Record<string, unknown>).tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const patch: Record<string, unknown> = {};
    if (updates.status) patch.status = updates.status;
    if (updates.config) {
      const current = safeJsonParse(existing.config);
      patch.config = JSON.stringify({ ...current, ...updates.config });
    }
    if (updates.syncState) {
      const current = safeJsonParse(existing.syncState);
      patch.syncState = JSON.stringify({ ...current, ...updates.syncState });
    }

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      integrationId,
      patch
    );

    return { success: true };
  } catch (err) {
    logger.error('updateIntegrationAction error', { err });
    return { success: false, error: safeError(err, 'Failed to update integration') };
  }
}

// ---------------------------------------------------------------------------
// Delete integration
// ---------------------------------------------------------------------------

export async function deleteIntegrationAction(
  integrationId: string,
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await (await createSessionClient()).account.get();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      integrationId
    );

    if ((existing as unknown as Record<string, unknown>).tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      integrationId
    );

    return { success: true };
  } catch (err) {
    logger.error('deleteIntegrationAction error', { err });
    return { success: false, error: safeError(err, 'Failed to delete integration') };
  }
}

// ---------------------------------------------------------------------------
// Test connection
// ---------------------------------------------------------------------------

export async function testIntegrationAction(
  integrationId: string,
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();
    const doc = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      integrationId
    );

    const data = doc as unknown as Record<string, unknown>;
    if (data.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const credentials = await loadConnectorCredentials(data.connectorId as string);
    if (!credentials) {
      return { success: false, error: 'Connector not found or credentials missing' };
    }

    const { createHelpdeskIntegration } = await import('@/lib/integrations');
    const client = createHelpdeskIntegration(
      data.provider as HelpdeskProvider,
      credentials
    );

    const connected = await client.testConnection();
    if (connected) {
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.HELPDESK_INTEGRATIONS,
        integrationId,
        { status: 'connected' }
      );
    }

    return { success: connected, error: connected ? undefined : 'Connection test failed' };
  } catch (err) {
    logger.error('testIntegrationAction error', { err });
    return { success: false, error: safeError(err, 'Connection test failed') };
  }
}

// ---------------------------------------------------------------------------
// Load connector credentials (shared with webhook handler)
// ---------------------------------------------------------------------------

export async function loadConnectorCredentials(
  connectorId: string
): Promise<HelpdeskCredentials | null> {
  try {
    const { databases } = createAdminClient();
    const doc = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      connectorId
    );

    const auth = safeJsonParse(doc.auth);
    let credentials: Record<string, string> = (auth?.credentials ?? {}) as Record<string, string>;

    if (credentials && Object.keys(credentials).length > 0) {
      try {
        credentials = decryptCredentials(credentials);
      } catch {
        // Legacy unencrypted
      }
    }

    return {
      apiKey: credentials.apiKey,
      accessToken: credentials.accessToken,
      email: credentials.email,
      subdomain: credentials.subdomain ?? (auth?.baseUrl ? extractSubdomain(String(auth.baseUrl)) : undefined),
      instanceUrl: credentials.instanceUrl ?? auth?.baseUrl
    };
  } catch (err) {
    logger.error('loadConnectorCredentials error', { err });
    return null;
  }
}

function extractSubdomain(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length > 2) return parts[0];
    return undefined;
  } catch {
    return undefined;
  }
}
