'use server';

/**
 * Data connector CRUD server actions.
 *
 * Data connectors integrate with third-party services (Shopify, Stripe, etc.)
 * and are used by procedure steps (api_call, data_lookup) to execute actions
 * on behalf of the tenant.
 */

import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID, Query } from 'node-appwrite';
import type {
  DataConnector,
  DataConnectorProvider,
  ConnectorEndpoint
} from '@/types/appwrite';
import { logAuditEventAsync } from '@/lib/audit/logger';
import {
  encryptCredentials,
  decryptCredentials,
  maskCredentials
} from '@/lib/encryption';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export async function listConnectorsAction(tenantId: string): Promise<{
  success: boolean;
  connectors?: DataConnector[];
  error?: string;
}> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();
    const result = await databases.listDocuments<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      [
        Query.equal('tenantId', tenantId),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    const connectors = result.documents.map((doc) => {
      const parsed = parseConnectorDoc(doc);
      // Mask credentials for listing
      if (parsed.auth?.credentials) {
        parsed.auth = {
          ...parsed.auth,
          credentials: maskCredentials(parsed.auth.credentials)
        };
      }
      return parsed;
    });

    return { success: true, connectors };
  } catch (err) {
    logger.error('listConnectorsAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to list connectors')
    };
  }
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

export async function getConnectorAction(
  connectorId: string,
  tenantId: string
): Promise<{
  success: boolean;
  connector?: DataConnector;
  error?: string;
}> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();
    const doc = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      connectorId
    );

    if (doc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const connector = parseConnectorDoc(doc);
    // Mask credentials — never send decrypted secrets to client
    if (connector.auth?.credentials) {
      connector.auth = {
        ...connector.auth,
        credentials: maskCredentials(connector.auth.credentials)
      };
    }

    return { success: true, connector };
  } catch (err) {
    logger.error('getConnectorAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to get connector')
    };
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateConnectorInput {
  name: string;
  provider: DataConnectorProvider;
  auth: {
    type: 'oauth' | 'api_key' | 'basic';
    credentials: Record<string, string>;
    baseUrl?: string;
  };
  config?: Record<string, unknown>;
  endpoints?: ConnectorEndpoint[];
  enabled?: boolean;
}

export async function createConnectorAction(
  tenantId: string,
  input: CreateConnectorInput
): Promise<{ success: boolean; connectorId?: string; error?: string }> {
  try {
    await (await createSessionClient()).account.get();

    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: 'Name is required' };
    }

    const { databases } = createAdminClient();

    // Encrypt credentials before storing
    const authToStore = { ...input.auth };
    if (authToStore.credentials) {
      authToStore.credentials = encryptCredentials(authToStore.credentials);
    }

    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      ID.unique(),
      {
        tenantId,
        name: input.name.trim(),
        provider: input.provider,
        auth: JSON.stringify(authToStore),
        config: JSON.stringify(input.config ?? {}),
        endpoints: JSON.stringify(input.endpoints ?? []),
        enabled: input.enabled ?? true
      }
    );

    logAuditEventAsync(tenantId, 'connector.called', {
      action: 'created',
      connectorId: doc.$id,
      provider: input.provider,
      name: input.name
    });

    return { success: true, connectorId: doc.$id };
  } catch (err) {
    logger.error('createConnectorAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to create connector')
    };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdateConnectorInput {
  name?: string;
  auth?: {
    type: 'oauth' | 'api_key' | 'basic';
    credentials: Record<string, string>;
    baseUrl?: string;
  };
  config?: Record<string, unknown>;
  endpoints?: ConnectorEndpoint[];
  enabled?: boolean;
}

export async function updateConnectorAction(
  connectorId: string,
  tenantId: string,
  input: UpdateConnectorInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();

    const existing = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      connectorId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.auth !== undefined) {
      // Encrypt credentials before storing
      const authToStore = { ...input.auth };
      if (authToStore.credentials) {
        authToStore.credentials = encryptCredentials(authToStore.credentials);
      }
      updates.auth = JSON.stringify(authToStore);
    }
    if (input.config !== undefined)
      updates.config = JSON.stringify(input.config);
    if (input.endpoints !== undefined)
      updates.endpoints = JSON.stringify(input.endpoints);
    if (input.enabled !== undefined) updates.enabled = input.enabled;

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      connectorId,
      updates
    );

    return { success: true };
  } catch (err) {
    logger.error('updateConnectorAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to update connector')
    };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteConnectorAction(
  connectorId: string,
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();

    const existing = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      connectorId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      connectorId
    );

    return { success: true };
  } catch (err) {
    logger.error('deleteConnectorAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to delete connector')
    };
  }
}

// ---------------------------------------------------------------------------
// Test connection
// ---------------------------------------------------------------------------

/**
 * Test a connector by making a simple request to its first endpoint.
 */
export async function testConnectorAction(
  connectorId: string,
  tenantId: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();
    const doc = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      connectorId
    );

    if (doc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const connector = parseConnectorDoc(doc);
    const authConfig = connector.auth;
    const baseUrl = (authConfig as Record<string, unknown>).baseUrl as
      | string
      | undefined;

    if (!baseUrl) {
      return { success: false, error: 'Connector has no baseUrl configured' };
    }

    // SSRF protection
    const { validateExternalUrl } = await import('@/lib/security/url-validator');
    await validateExternalUrl(baseUrl);

    // Simple health check: GET to baseUrl
    const headers: Record<string, string> = {};
    const creds = authConfig.credentials ?? {};

    if (authConfig.type === 'api_key' && creds.apiKey && creds.email) {
      // Zendesk-style: API token with email/token:{apiToken} in Basic auth
      const basic = Buffer.from(`${creds.email}/token:${creds.apiKey}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    } else if (authConfig.type === 'api_key' && creds.apiKey) {
      headers['Authorization'] = `Bearer ${creds.apiKey}`;
    } else if (authConfig.type === 'basic' && creds.username) {
      const basic = Buffer.from(
        `${creds.username}:${creds.password ?? ''}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    } else if (authConfig.type === 'oauth' && creds.accessToken) {
      headers['Authorization'] = `Bearer ${creds.accessToken}`;
    }

    // Provider-specific test endpoints
    let testUrl = baseUrl;
    if (connector.provider === 'zendesk') {
      testUrl = `${baseUrl}/users/me.json`;
    } else if (connector.provider === 'intercom') {
      testUrl = `${baseUrl}/me`;
    }

    logger.info('testConnectorAction: fetching', {
      testUrl,
      provider: connector.provider,
      authType: authConfig.type,
      hasEmail: !!creds.email,
      hasApiKey: !!creds.apiKey
    });

    const response = await fetch(testUrl, { headers, method: 'GET' });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      logger.warn('testConnectorAction: non-ok response', {
        status: response.status,
        body: body.slice(0, 500)
      });
    }

    return { success: response.ok, status: response.status };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('testConnectorAction error', { err: msg });
    return {
      success: false,
      error: msg.includes('blocked') || msg.includes('DNS') || msg.includes('Invalid URL')
        ? msg
        : safeError(err, 'Connection test failed')
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseConnectorDoc(doc: DataConnector): DataConnector {
  const plain = JSON.parse(JSON.stringify(doc));
  const parsed = {
    ...plain,
    auth: typeof plain.auth === 'string' ? JSON.parse(plain.auth) : plain.auth,
    config:
      typeof plain.config === 'string'
        ? JSON.parse(plain.config)
        : (plain.config ?? {}),
    endpoints:
      typeof plain.endpoints === 'string'
        ? JSON.parse(plain.endpoints)
        : (plain.endpoints ?? [])
  };

  // Decrypt credentials (encrypt/decrypt handle dev passthrough internally)
  if (parsed.auth?.credentials) {
    try {
      parsed.auth = {
        ...parsed.auth,
        credentials: decryptCredentials(parsed.auth.credentials)
      };
    } catch {
      // If decryption fails, credentials may be stored unencrypted (legacy/dev)
    }
  }

  return parsed;
}
