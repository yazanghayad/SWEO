/**
 * RBAC Permission System
 *
 * Defines a granular permission matrix for the 4 team roles:
 *   owner > admin > agent > viewer
 *
 * Each permission is a dot-separated string (resource.action).
 * Roles inherit all permissions from lower roles in the hierarchy.
 */

import type { TeamRole } from '@/lib/appwrite/teams';

// ---------------------------------------------------------------------------
// Permission definitions
// ---------------------------------------------------------------------------

export const PERMISSIONS = {
  // Inbox / Conversations
  'inbox.view': 'View inbox and conversations',
  'inbox.reply': 'Reply to conversations',
  'inbox.assign': 'Assign conversations to agents',
  'inbox.escalate': 'Escalate conversations',
  'inbox.resolve': 'Resolve/close conversations',

  // Knowledge base
  'knowledge.view': 'View knowledge sources',
  'knowledge.create': 'Create/upload knowledge sources',
  'knowledge.edit': 'Edit existing knowledge sources',
  'knowledge.delete': 'Delete knowledge sources',

  // Procedures
  'procedures.view': 'View procedures',
  'procedures.create': 'Create procedures',
  'procedures.edit': 'Edit procedures',
  'procedures.delete': 'Delete procedures',

  // Contacts
  'contacts.view': 'View contacts',
  'contacts.create': 'Create contacts',
  'contacts.edit': 'Edit contacts',
  'contacts.delete': 'Delete contacts',

  // Cases
  'cases.view': 'View cases',
  'cases.create': 'Create cases',
  'cases.edit': 'Edit cases',
  'cases.delete': 'Delete cases',

  // Reports / Analytics
  'reports.view': 'View reports and analytics',
  'reports.export': 'Export reports',

  // Outbound
  'outbound.view': 'View outbound campaigns',
  'outbound.create': 'Create outbound campaigns',
  'outbound.send': 'Send/launch campaigns',
  'outbound.delete': 'Delete campaigns',

  // Connectors / Integrations
  'connectors.view': 'View connectors',
  'connectors.manage': 'Create, edit and delete connectors',
  'integrations.view': 'View integrations',
  'integrations.manage': 'Manage integrations',

  // Settings
  'settings.view': 'View settings',
  'settings.general': 'Edit general settings',
  'settings.channels': 'Manage channels',
  'settings.ai': 'Configure AI agent',
  'settings.automation': 'Manage automation rules',
  'settings.webhooks': 'Manage webhooks',
  'settings.billing': 'Manage billing and subscription',

  // Team management
  'team.view': 'View team members',
  'team.invite': 'Invite new members',
  'team.remove': 'Remove team members',
  'team.roles': 'Change member roles',

  // Workspace / Tenant
  'workspace.delete': 'Delete workspace'
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ---------------------------------------------------------------------------
// Role → Permission mapping
// ---------------------------------------------------------------------------

const VIEWER_PERMISSIONS: Permission[] = [
  'inbox.view',
  'knowledge.view',
  'procedures.view',
  'contacts.view',
  'cases.view',
  'reports.view',
  'outbound.view',
  'connectors.view',
  'integrations.view',
  'settings.view',
  'team.view'
];

const AGENT_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  'inbox.reply',
  'inbox.assign',
  'inbox.escalate',
  'inbox.resolve',
  'knowledge.create',
  'knowledge.edit',
  'contacts.create',
  'contacts.edit',
  'cases.create',
  'cases.edit',
  'reports.export',
  'outbound.create'
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...AGENT_PERMISSIONS,
  'knowledge.delete',
  'procedures.create',
  'procedures.edit',
  'procedures.delete',
  'contacts.delete',
  'cases.delete',
  'outbound.send',
  'outbound.delete',
  'connectors.manage',
  'integrations.manage',
  'settings.general',
  'settings.channels',
  'settings.ai',
  'settings.automation',
  'settings.webhooks',
  'settings.billing',
  'team.invite',
  'team.remove',
  'team.roles'
];

const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  'workspace.delete'
];

const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  viewer: VIEWER_PERMISSIONS,
  agent: AGENT_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  owner: OWNER_PERMISSIONS
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a role has a specific permission.
 */
export function roleHasPermission(
  role: TeamRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if any of the user's roles grant the given permission.
 */
export function hasPermission(
  roles: TeamRole[],
  permission: Permission
): boolean {
  return roles.some((role) => roleHasPermission(role, permission));
}

/**
 * Get all permissions for a given set of roles (union).
 */
export function getPermissions(roles: TeamRole[]): Permission[] {
  const perms = new Set<Permission>();
  for (const role of roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) {
      perms.add(p);
    }
  }
  return Array.from(perms);
}

/**
 * Get the highest role from a set of roles.
 */
export function getHighestRole(roles: TeamRole[]): TeamRole {
  const hierarchy: TeamRole[] = ['owner', 'admin', 'agent', 'viewer'];
  for (const level of hierarchy) {
    if (roles.includes(level)) return level;
  }
  return 'viewer';
}

/**
 * Role hierarchy level (higher = more privilege).
 */
export function roleLevel(role: TeamRole): number {
  const levels: Record<TeamRole, number> = {
    viewer: 0,
    agent: 1,
    admin: 2,
    owner: 3
  };
  return levels[role] ?? 0;
}

/**
 * Human-readable role labels.
 */
export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  agent: 'Agent',
  viewer: 'Viewer'
};

/**
 * Roles available for assignment (owner can't be assigned through UI).
 */
export const ASSIGNABLE_ROLES: TeamRole[] = ['admin', 'agent', 'viewer'];
