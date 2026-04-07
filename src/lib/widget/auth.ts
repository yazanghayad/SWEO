/**
 * Shared authentication helper for public widget API routes.
 *
 * Extracts and validates the tenant API key from the Authorization header,
 * including grace-period support for rotated keys. Reused by all
 * /api/chat/* endpoints to avoid duplicating auth logic.
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Tenant } from '@/types/appwrite';
import { Query } from 'node-appwrite';
import { findTenantByPreviousApiKey } from './previous-key-lookup';

export type AuthResult =
  | { ok: true; tenant: Tenant; apiKey: string }
  | { ok: false; error: string; status: number };

/**
 * Authenticate a request using the Bearer API key.
 * Returns the resolved Tenant or an error response.
 */
export async function authenticateWidgetRequest(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      error: 'Missing or invalid Authorization header',
      status: 401
    };
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey) {
    return { ok: false, error: 'API key is required', status: 401 };
  }

  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('apiKey', apiKey), Query.limit(1)]
    );

    if (result.documents.length > 0) {
      return { ok: true, tenant: result.documents[0], apiKey };
    }

    // Grace-period check for rotated keys using indexed field
    const match = await findTenantByPreviousApiKey(apiKey);

    if (!match) {
      return { ok: false, error: 'Invalid API key', status: 401 };
    }

    return { ok: true, tenant: match, apiKey };
  } catch {
    return { ok: false, error: 'Authentication failed', status: 500 };
  }
}
