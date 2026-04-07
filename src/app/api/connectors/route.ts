/**
 * Connectors API routes.
 *
 * GET  /api/connectors?tenantId=xxx            — List connectors
 * POST /api/connectors  { tenantId, ... }      — Create connector
 *
 * Requires session-based authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID, Query } from 'node-appwrite';
import type { DataConnector, Tenant } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';
import {
  encryptCredentials,
  maskCredentials
} from '@/lib/encryption';
import { logAuditEventAsync } from '@/lib/audit/logger';
import { checkPermission } from '@/lib/rbac/actions';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function verifyTenantAccess(
  accountId: string,
  tenantId: string
): Promise<boolean> {
  const { databases } = createAdminClient();
  const tenants = await databases.listDocuments<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('userId', accountId), Query.limit(1)]
  );
  return tenants.documents.some((t) => t.$id === tenantId);
}

function parseConnectorDoc(doc: DataConnector): DataConnector {
  const plain = JSON.parse(JSON.stringify(doc));
  return {
    ...plain,
    auth:
      typeof plain.auth === 'string' ? JSON.parse(plain.auth) : plain.auth,
    config:
      typeof plain.config === 'string'
        ? JSON.parse(plain.config)
        : (plain.config ?? {}),
    endpoints:
      typeof plain.endpoints === 'string'
        ? JSON.parse(plain.endpoints)
        : (plain.endpoints ?? [])
  };
}

// ---------------------------------------------------------------------------
// GET — List connectors
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  let account;
  try {
    const { account: sessionAccount } = await createSessionClient();
    account = await sessionAccount.get();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = req.nextUrl.searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json(
      { error: 'tenantId is required' },
      { status: 400 }
    );
  }

  if (!(await verifyTenantAccess(account.$id, tenantId))) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // RBAC: connectors.view required
  const perm = await checkPermission(tenantId, 'connectors.view');
  if (!perm.allowed) {
    return NextResponse.json({ error: perm.error ?? 'Forbidden' }, { status: 403 });
  }

  try {
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
      if (parsed.auth?.credentials) {
        parsed.auth = {
          ...parsed.auth,
          credentials: maskCredentials(parsed.auth.credentials)
        };
      }
      return parsed;
    });

    return NextResponse.json({ connectors });
  } catch (err) {
    logger.error('GET /api/connectors error', { err });
    return NextResponse.json(
      { error: safeError(err, 'Failed to list connectors') },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST — Create connector
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let account;
  try {
    const { account: sessionAccount } = await createSessionClient();
    account = await sessionAccount.get();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const tenantId = body.tenantId as string;
  const name = body.name as string;
  const provider = body.provider as string;
  const auth = body.auth as Record<string, unknown> | undefined;
  const config = body.config as Record<string, unknown> | undefined;
  const endpoints = body.endpoints as unknown[] | undefined;

  if (!tenantId || !name?.trim() || !provider) {
    return NextResponse.json(
      { error: 'tenantId, name, and provider are required' },
      { status: 400 }
    );
  }

  if (!(await verifyTenantAccess(account.$id, tenantId))) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // RBAC: connectors.manage required to create
  const permCreate = await checkPermission(tenantId, 'connectors.manage');
  if (!permCreate.allowed) {
    return NextResponse.json({ error: permCreate.error ?? 'Forbidden' }, { status: 403 });
  }

  try {
    const { databases } = createAdminClient();

    const authToStore = auth ? { ...auth } : { type: 'api_key', credentials: {} };
    if (
      authToStore.credentials &&
      typeof authToStore.credentials === 'object'
    ) {
      authToStore.credentials = encryptCredentials(
        authToStore.credentials as Record<string, string>
      );
    }

    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      ID.unique(),
      {
        tenantId,
        name: name.trim(),
        provider,
        auth: JSON.stringify(authToStore),
        config: JSON.stringify(config ?? {}),
        endpoints: JSON.stringify(endpoints ?? []),
        enabled: true
      }
    );

    logAuditEventAsync(tenantId, 'connector.called', {
      action: 'created',
      connectorId: doc.$id,
      provider,
      name
    });

    return NextResponse.json({ connectorId: doc.$id }, { status: 201 });
  } catch (err) {
    logger.error('POST /api/connectors error', { err });
    return NextResponse.json(
      { error: safeError(err, 'Failed to create connector') },
      { status: 500 }
    );
  }
}
