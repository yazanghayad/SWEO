'use client';

import type { NavItem } from '@/types';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import type { Permission } from '@/lib/rbac/permissions';

/**
 * Filter navigation items based on the current route context and
 * the user's RBAC permissions. Items whose `access.permission` the
 * user lacks are excluded from the returned list.
 */
export function useFilteredNavItems(items: NavItem[]): NavItem[] {
  const pathname = usePathname();
  const { can, loading } = usePermissions();

  // While loading, show all items to avoid layout shift
  return items
    .filter((item) => {
      if (loading) return true;
      if (!item.access?.permission) return true;
      return can(item.access.permission as Permission);
    })
    .map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(`${item.url}/`),
      items: item.items
        ?.filter((sub) => {
          if (loading) return true;
          if (!sub.access?.permission) return true;
          return can(sub.access.permission as Permission);
        })
        .map((sub) => ({
          ...sub,
          isActive: pathname === sub.url || pathname.startsWith(`${sub.url}/`)
        }))
    }));
}
