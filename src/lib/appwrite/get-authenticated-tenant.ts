import { Query, Teams, type Client } from 'node-appwrite';
import { createSessionClient, createAdminClient } from './server';
import { APPWRITE_DATABASE } from './constants';
import { COLLECTION } from './collections';
import type { Tenant } from '@/types/appwrite';

export interface AuthenticatedTenantContext {
  tenantId: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
}

function parseTeamId(rawConfig: unknown): string | null {
  try {
    const config =
      typeof rawConfig === 'string'
        ? (JSON.parse(rawConfig) as Record<string, unknown>)
        : (rawConfig as Record<string, unknown> | null);
    const teamId = config?.teamId;
    return typeof teamId === 'string' && teamId.trim().length > 0
      ? teamId
      : null;
  } catch {
    return null;
  }
}

async function userHasTeamAccess(
  client: Client,
  teamId: string,
  userId: string
): Promise<boolean> {
  try {
    const teams = new Teams(client);
    const memberships = await teams.listMemberships(teamId, [
      Query.equal('userId', userId),
      Query.limit(1)
    ]);
    return memberships.memberships.length > 0;
  } catch {
    return false;
  }
}

/**
 * Derive the authenticated tenant ID from the current user's session.
 *
 * 1. Parses the session cookie via `createSessionClient()`
 * 2. Calls `account.get()` to verify the session is still valid
 * 3. Queries the `tenants` collection by `userId` to resolve the tenant
 *
 * If any step fails the function throws – callers should treat the absence
 * of a valid tenant as an authorisation failure.
 *
 * Use this in every server-action / API-route instead of accepting a
 * client-supplied `tenantId` parameter.
 */
export async function getAuthenticatedTenantContext(
  expectedTenantId?: string
): Promise<AuthenticatedTenantContext> {
  const { account, client } = await createSessionClient();
  const user = await account.get();
  const { databases } = createAdminClient();

  if (expectedTenantId) {
    const tenant = await databases.getDocument<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      expectedTenantId
    );

    if (tenant.userId === user.$id) {
      return {
        tenantId: tenant.$id,
        userId: user.$id,
        userName: user.name ?? null,
        userEmail: user.email ?? null
      };
    }

    const teamId = parseTeamId(tenant.config);
    if (teamId && (await userHasTeamAccess(client, teamId, user.$id))) {
      return {
        tenantId: tenant.$id,
        userId: user.$id,
        userName: user.name ?? null,
        userEmail: user.email ?? null
      };
    }

    throw new Error('Forbidden: no access to this tenant');
  }

  const result = await databases.listDocuments<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('userId', user.$id), Query.limit(1)]
  );

  if (result.documents.length === 0) {
    throw new Error('Forbidden: no tenant found for the current user');
  }

  return {
    tenantId: result.documents[0].$id,
    userId: user.$id,
    userName: user.name ?? null,
    userEmail: user.email ?? null
  };
}

export async function getAuthenticatedTenantId(
  expectedTenantId?: string
): Promise<string> {
  const ctx = await getAuthenticatedTenantContext(expectedTenantId);
  return ctx.tenantId;
}
