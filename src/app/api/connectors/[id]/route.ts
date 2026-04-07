/**
 * Single connector API routes.
 *
 * GET    /api/connectors/[id]?tenantId=xxx  — Get single connector
 * PATCH  /api/connectors/[id]               — Update connector
 * DELETE /api/connectors/[id]?tenantId=xxx  — Delete connector
 *
 * Requires session-based authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { DataConnector, Tenant } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';
import {
  encryptCredentials,
  maskCredentials,
  decryptCredentials
} from '@/lib/encryption';

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
  const parsed = {
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

  if (parsed.auth?.credentials) {
    try {
      parsed.auth = {
        ...parsed.auth,
        credentials: decryptCredentials(parsed.auth.credentials)
      };
    } catch {
      // Legacy unencrypted credentials
    }
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// GET — Get single connector
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let account;
  try {
    const { account: sessionAccount } = await createSessionClient();
    account = await sessionAccount.get();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
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

  try {
    const { databases } = createAdminClient();
    const doc = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      id
    );

    if (doc.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const connector = parseConnectorDoc(doc);
    // Mask credentials for client
    if (connector.auth?.credentials) {
      connector.auth = {
        ...connector.auth,
        credentials: maskCredentials(connector.auth.credentials)
      };
    }

    return NextResponse.json({ connector });
  } catch (err) {
    logger.error('GET /api/connectors/[id] error', { err });
    return NextResponse.json(
      { error: safeError(err, 'Failed to get connector') },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH — Update connector
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let account;
  try {
    const { account: sessionAccount } = await createSessionClient();
    account = await sessionAccount.get();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const tenantId = body.tenantId as string;
  if (!tenantId) {
    return NextResponse.json(
      { error: 'tenantId is required' },
      { status: 400 }
    );
  }

  if (!(await verifyTenantAccess(account.$id, tenantId))) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const { databases } = createAdminClient();

    const existing = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      id
    );
    if (existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = (body.name as string).trim();
    if (body.enabled !== undefined) updates.enabled = body.enabled;
    if (body.endpoints !== undefined)
      updates.endpoints = JSON.stringify(body.endpoints);
    if (body.config !== undefined)
      updates.config = JSON.stringify(body.config);

    if (body.auth !== undefined) {
      const authToStore = { ...(body.auth as Record<string, unknown>) };
      if (
        authToStore.credentials &&
        typeof authToStore.credentials === 'object'
      ) {
        authToStore.credentials = encryptCredentials(
          authToStore.credentials as Record<string, string>
        );
      }
      updates.auth = JSON.stringify(authToStore);
    }

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      id,
      updates
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('PATCH /api/connectors/[id] error', { err });
    return NextResponse.json(
      { error: safeError(err, 'Failed to update connector') },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE — Delete connector
// ---------------------------------------------------------------------------

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let account;
  try {
    const { account: sessionAccount } = await createSessionClient();
    account = await sessionAccount.get();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
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

  try {
    const { databases } = createAdminClient();

    const existing = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      id
    );
    if (existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      id
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('DELETE /api/connectors/[id] error', { err });
    return NextResponse.json(
      { error: safeError(err, 'Failed to delete connector') },
      { status: 500 }
    );
  }
}
