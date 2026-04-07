import { NavItem } from '@/types';

/**
 * Navigation configuration
 * Used by sidebar and Cmd+K bar (kbar).
 *
 * Primary navigation is the IconRail (src/components/layout/icon-rail.tsx).
 * This sidebar config provides secondary/sub-navigation within each section
 * **and** powers the Cmd+K global search.
 */
export const navItems: NavItem[] = [
  {
    title: 'Inbox',
    url: '/dashboard/inbox',
    icon: 'inbox',
    shortcut: ['i', 'i'],
    isActive: false,
    items: [],
    access: { permission: 'inbox.view' }
  },
  {
    title: 'SWEO AI Agent',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [],
    access: { permission: 'inbox.view' }
  },
  {
    title: 'Knowledge',
    url: '/dashboard/knowledge',
    icon: 'knowledge',
    shortcut: ['k', 's'],
    isActive: false,
    items: [],
    access: { permission: 'knowledge.view' }
  },
  {
    title: 'Reports',
    url: '/dashboard/reports',
    icon: 'analytics',
    shortcut: ['r', 'r'],
    isActive: false,
    items: [],
    access: { permission: 'reports.view' }
  },
  {
    title: 'Outbound',
    url: '/dashboard/outbound',
    icon: 'outbound',
    shortcut: ['o', 'o'],
    isActive: false,
    items: [],
    access: { permission: 'outbound.view' }
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: 'settings',
    shortcut: ['s', 's'],
    isActive: false,
    items: [],
    access: { permission: 'settings.view' }
  },
  {
    title: 'Contacts',
    url: '/dashboard/contacts',
    icon: 'users',
    shortcut: ['c', 'c'],
    isActive: false,
    items: [],
    access: { permission: 'contacts.view' }
  },
  {
    title: 'Cases',
    url: '/dashboard/cases',
    icon: 'briefcase',
    shortcut: ['c', 'a'],
    isActive: false,
    items: [],
    access: { permission: 'cases.view' }
  },
  {
    title: 'Connectors',
    url: '/dashboard/connectors',
    icon: 'connectors',
    shortcut: ['c', 'o'],
    isActive: false,
    items: [],
    access: { permission: 'connectors.view' }
  },
  {
    title: 'Integrations',
    url: '/dashboard/integrations',
    icon: 'plug',
    shortcut: ['i', 'n'],
    isActive: false,
    items: [],
    access: { permission: 'integrations.view' }
  }
];
