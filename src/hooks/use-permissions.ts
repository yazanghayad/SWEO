'use client';

/**
 * usePermissions – Client-side hook that resolves the current user's
 * team role(s) and exposes a `can(permission)` helper for UI gating.
 *
 * Usage:
 *   const { can, role, loading } = usePermissions();
 *   if (can('knowledge.delete')) { ... }
 */

import { useEffect, useState } from 'react';
import { getCurrentUserRoleAction } from '@/features/auth/actions/rbac';
import {
  hasPermission,
  getHighestRole,
  type Permission
} from '@/lib/rbac/permissions';
import type { TeamRole } from '@/lib/appwrite/teams';

interface PermissionsState {
  /** All roles the current user has in the active tenant's team. */
  roles: TeamRole[];
  /** The highest role (owner > admin > agent > viewer). */
  role: TeamRole;
  /** Whether the role data is still loading. */
  loading: boolean;
  /** Check if the user has a specific permission. */
  can: (permission: Permission) => boolean;
  /** Check if the user has ANY of the given permissions. */
  canAny: (...permissions: Permission[]) => boolean;
  /** Whether the user is at least the given role level. */
  isAtLeast: (minRole: TeamRole) => boolean;
}

const ROLE_LEVELS: Record<TeamRole, number> = {
  viewer: 0,
  agent: 1,
  admin: 2,
  owner: 3
};

export function usePermissions(): PermissionsState {
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCurrentUserRoleAction().then((result) => {
      if (cancelled) return;
      if (result.roles) {
        setRoles(result.roles);
      } else {
        // Fallback: if we can't resolve roles, treat as owner
        // (tenant owner without a team yet)
        setRoles(['owner']);
      }
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setRoles(['owner']);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const role = getHighestRole(roles);

  return {
    roles,
    role,
    loading,
    can: (permission: Permission) => hasPermission(roles, permission),
    canAny: (...permissions: Permission[]) =>
      permissions.some((p) => hasPermission(roles, p)),
    isAtLeast: (minRole: TeamRole) =>
      ROLE_LEVELS[role] >= ROLE_LEVELS[minRole]
  };
}
