'use server';

/**
 * RBAC server actions.
 *
 * Resolves the logged-in user's role(s) in the current tenant's team.
 * Used by usePermissions hook (client) and requirePermission (server).
 */

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query, Teams } from 'node-appwrite';
import type { TeamRole } from '@/lib/appwrite/teams';
import type { Tenant } from '@/types/appwrite';
import { hasPermission, type Permission } from './permissions';
import { safeError } from '@/lib/safe-error';

// ---------------------------------------------------------------------------
// Resolve current user's role(s) — used by usePermissions hook
// ---------------------------------------------------------------------------

export async function getCurrentUserRoleAction(): Promise<{
  roles: TeamRole[] | null;
  error: string | null;
}> {
  try {
    const { account, client } = await createSessionClient();
    const user = await account.get();
    const { databases } = createAdminClient();

    // Find user's tenant
    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    // If the user IS the tenant owner, they're the owner
    if (result.documents.length > 0) {
      return { roles: ['owner'] as TeamRole[], error: null };
    }

    // Otherwise check team memberships across all tenants
    // (the user might be invited to somebody else's tenant)
    const allTenants = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.limit(100)]
    );

    for (const tenant of allTenants.documents) {
      const config = parseTenantConfig(tenant.config);
      const teamId = config?.teamId as string | undefined;
      if (!teamId) continue;

      try {
        const teams = new Teams(client);
        const memberships = await teams.listMemberships({
          teamId,
          queries: [
            Query.equal('userId', user.$id),
            Query.limit(1)
          ]
        });

        if (memberships.memberships.length > 0) {
          const roles = memberships.memberships[0].roles as TeamRole[];
          return { roles, error: null };
        }
      } catch {
        // User not in this team, continue
      }
    }

    // Fallback: no team membership found
    return { roles: null, error: 'No team membership found' };
  } catch (err) {
    return { roles: null, error: safeError(err, 'Failed to resolve role') };
  }
}

// ---------------------------------------------------------------------------
// Server-side permission check — use in server actions & API routes
// ---------------------------------------------------------------------------

export interface PermissionContext {
  tenantId: string;
  userId: string;
  roles: TeamRole[];
}

/**
 * Verify the current user has a specific permission for a tenant.
 * Throws if unauthorized.
 */
export async function requirePermission(
  tenantId: string,
  permission: Permission
): Promise<PermissionContext> {
  const { account, client } = await createSessionClient();
  const user = await account.get();
  const { databases } = createAdminClient();

  const tenant = await databases.getDocument<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    tenantId
  );

  // Owner has all permissions
  if (tenant.userId === user.$id) {
    return { tenantId, userId: user.$id, roles: ['owner'] };
  }

  // Check team membership for role
  const config = parseTenantConfig(tenant.config);
  const teamId = config?.teamId as string | undefined;

  if (!teamId) {
    throw new Error('Forbidden: no team configured');
  }

  const teams = new Teams(client);
  const memberships = await teams.listMemberships({
    teamId,
    queries: [
      Query.equal('userId', user.$id),
      Query.limit(1)
    ]
  });

  if (memberships.memberships.length === 0) {
    throw new Error('Forbidden: not a team member');
  }

  const roles = memberships.memberships[0].roles as TeamRole[];

  if (!hasPermission(roles, permission)) {
    throw new Error(
      `Forbidden: role '${roles.join(',')}' lacks permission '${permission}'`
    );
  }

  return { tenantId, userId: user.$id, roles };
}

/**
 * Same as requirePermission but returns a result instead of throwing.
 */
export async function checkPermission(
  tenantId: string,
  permission: Permission
): Promise<{ allowed: boolean; context?: PermissionContext; error?: string }> {
  try {
    const ctx = await requirePermission(tenantId, permission);
    return { allowed: true, context: ctx };
  } catch (err) {
    return {
      allowed: false,
      error: err instanceof Error ? err.message : 'Permission denied'
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTenantConfig(
  raw: unknown
): Record<string, unknown> | null {
  try {
    if (typeof raw === 'string') return JSON.parse(raw);
    return (raw as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}
