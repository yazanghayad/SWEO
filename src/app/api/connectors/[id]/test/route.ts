/**
 * Test connector connection.
 *
 * POST /api/connectors/[id]/test  { tenantId }
 *
 * Performs a simple GET request to the connector's base URL to verify
 * credentials and accessibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { DataConnector, Tenant } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';
import { decryptCredentials } from '@/lib/encryption';
import { validateExternalUrl } from '@/lib/security/url-validator';

export async function POST(
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

  // Verify tenant access
  const { databases } = createAdminClient();
  const tenants = await databases.listDocuments<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('userId', account.$id), Query.limit(1)]
  );
  if (!tenants.documents.some((t) => t.$id === tenantId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const doc = await databases.getDocument<DataConnector>(
      APPWRITE_DATABASE,
      COLLECTION.DATA_CONNECTORS,
      id
    );

    if (doc.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse auth
    const authConfig =
      typeof doc.auth === 'string' ? JSON.parse(doc.auth) : doc.auth;

    // Decrypt credentials
    let creds = authConfig.credentials ?? {};
    if (creds && Object.keys(creds).length > 0) {
      try {
        creds = decryptCredentials(creds);
      } catch {
        // Legacy unencrypted
      }
    }

    const baseUrl = authConfig.baseUrl as string | undefined;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Connector has no baseUrl configured' },
        { status: 400 }
      );
    }

    // SSRF validation
    await validateExternalUrl(baseUrl);

    // Build auth headers
    const headers: Record<string, string> = {};
    if (authConfig.type === 'api_key' && creds.apiKey) {
      headers['Authorization'] = `Bearer ${creds.apiKey}`;
    } else if (authConfig.type === 'basic' && creds.username) {
      const basic = Buffer.from(
        `${creds.username}:${creds.password ?? ''}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    } else if (authConfig.type === 'oauth' && creds.accessToken) {
      headers['Authorization'] = `Bearer ${creds.accessToken}`;
    }

    const response = await fetch(baseUrl, {
      headers,
      method: 'GET',
      signal: AbortSignal.timeout(15_000)
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status
    });
  } catch (err) {
    logger.error('POST /api/connectors/[id]/test error', { err });
    return NextResponse.json(
      {
        success: false,
        error: safeError(err, 'Connection test failed')
      },
      { status: 500 }
    );
  }
}
