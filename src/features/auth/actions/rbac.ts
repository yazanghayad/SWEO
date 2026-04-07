'use server';

import { getCurrentUserRoleAction as _getCurrentUserRoleAction } from '@/lib/rbac/actions';
import type { TeamRole } from '@/lib/appwrite/teams';

export async function getCurrentUserRoleAction(): Promise<{
  roles: TeamRole[] | null;
  error: string | null;
}> {
  return _getCurrentUserRoleAction();
}
