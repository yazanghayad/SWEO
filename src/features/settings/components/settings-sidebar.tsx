'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LongTextIcon,
  PersonIcon,
  ClockFilledIcon,
  BrandsIcon,
  ShieldCheckIcon,
  LanguageIcon,
  ChevronRightIcon,
  CashIcon,
  MessengerIcon,
  EmailIcon,
  PhoneIcon,
  WhatsAppIcon,
  SmsIcon,
  InstagramIcon,
  SlackIcon,
  GlobeIcon,
  MultiplatformIcon,
  InboxIcon,
  SparklesIcon,
  WorkflowsIcon,
  AiIcon,
  DatabaseIcon,
  WebhookIcon,
  KeyIcon,
  SettingsIcon,
  BellIcon,
  LockedIcon,
  ArticleIcon,
  OutboundIcon,
  TagIcon
} from '@/components/icons/sweo-icons';

interface SidebarItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarSection {
  title: string;
  href?: string;
  items?: SidebarItem[];
  defaultExpanded?: boolean;
}

const settingsSections: SidebarSection[] = [
  {
    title: 'Home',
    href: '/dashboard/settings'
  },
  {
    title: 'Workspace',
    defaultExpanded: true,
    items: [
      {
        title: 'General',
        href: '/dashboard/settings/general',
        icon: LongTextIcon
      },
      {
        title: 'Teammates',
        href: '/dashboard/settings/team',
        icon: PersonIcon
      },
      {
        title: 'Office hours',
        href: '/dashboard/settings/office-hours',
        icon: ClockFilledIcon
      },
      {
        title: 'Brands',
        href: '/dashboard/settings/customization',
        icon: BrandsIcon
      },
      {
        title: 'Security',
        href: '/dashboard/settings/security',
        icon: ShieldCheckIcon
      },
      {
        title: 'Multilingual',
        href: '/dashboard/settings/languages',
        icon: LanguageIcon
      }
    ]
  },
  {
    title: 'Subscription',
    items: [
      {
        title: 'Billing',
        href: '/dashboard/settings/billing',
        icon: CashIcon
      }
    ]
  },
  {
    title: 'Channels',
    items: [
      {
        title: 'Messenger',
        href: '/dashboard/settings/channels/messenger',
        icon: MessengerIcon
      },
      {
        title: 'Email',
        href: '/dashboard/settings/channels/email',
        icon: EmailIcon
      },
      {
        title: 'Phone',
        href: '/dashboard/settings/channels/phone',
        icon: PhoneIcon
      },
      {
        title: 'WhatsApp',
        href: '/dashboard/settings/channels/whatsapp',
        icon: WhatsAppIcon
      },
      {
        title: 'SMS',
        href: '/dashboard/settings/channels/sms',
        icon: SmsIcon
      },
      {
        title: 'Instagram',
        href: '/dashboard/settings/channels/instagram',
        icon: InstagramIcon
      },
      {
        title: 'Slack',
        href: '/dashboard/settings/channels/slack',
        icon: SlackIcon
      },
      {
        title: 'Outbound',
        href: '/dashboard/settings/channels/outbound',
        icon: GlobeIcon
      },
      {
        title: 'All channels',
        href: '/dashboard/settings/channels',
        icon: MultiplatformIcon
      }
    ]
  },
  {
    title: 'Inbox',
    items: [
      {
        title: 'Team Inboxes',
        href: '/dashboard/settings/inboxes',
        icon: InboxIcon
      },
      {
        title: 'Assignments',
        href: '/dashboard/settings/assignments',
        icon: PersonIcon
      },
      {
        title: 'Macros',
        href: '/dashboard/settings/macros',
        icon: SparklesIcon
      },
      {
        title: 'Tags',
        href: '/dashboard/settings/tags',
        icon: TagIcon
      }
    ]
  },
  {
    title: 'AI & Automation',
    items: [
      {
        title: 'AI Agent',
        href: '/dashboard/settings/ai-agent',
        icon: AiIcon
      },
      {
        title: 'Inbox AI',
        href: '/dashboard/settings/inbox-ai',
        icon: SparklesIcon
      },
      {
        title: 'Automation',
        href: '/dashboard/settings/automation',
        icon: WorkflowsIcon
      }
    ]
  },
  {
    title: 'Integrations',
    items: [
      {
        title: 'Data Connectors',
        href: '/dashboard/connectors',
        icon: DatabaseIcon
      },
      {
        title: 'Webhooks',
        href: '/dashboard/settings/webhooks',
        icon: WebhookIcon
      },
      {
        title: 'API & Tokens',
        href: '/dashboard/settings/api-tokens',
        icon: KeyIcon
      }
    ]
  },
  {
    title: 'Data',
    items: [
      {
        title: 'People',
        href: '/dashboard/contacts',
        icon: PersonIcon
      }
    ]
  },
  {
    title: 'Help Center',
    items: [
      {
        title: 'Articles',
        href: '/dashboard/knowledge',
        icon: ArticleIcon
      }
    ]
  },
  {
    title: 'Outbound',
    items: [
      {
        title: 'Messages',
        href: '/dashboard/settings/outbound',
        icon: OutboundIcon
      }
    ]
  },
  {
    title: 'Personal',
    items: [
      {
        title: 'Your Details',
        href: '/dashboard/settings/profile',
        icon: SettingsIcon
      },
      {
        title: 'Notifications',
        href: '/dashboard/settings/notifications',
        icon: BellIcon
      },
      {
        title: 'Account Security',
        href: '/dashboard/settings/account-security',
        icon: LockedIcon
      }
    ]
  }
];

function SectionGroup({ section }: { section: SidebarSection }) {
  const pathname = usePathname();

  const hasActiveChild = section.items?.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  ) ?? false;

  const [expanded, setExpanded] = useState(
    section.defaultExpanded ?? hasActiveChild
  );

  // Auto-expand when navigating into this section
  useEffect(() => {
    if (hasActiveChild && !expanded) {
      setExpanded(true);
    }
  }, [hasActiveChild]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simple link (like Home)
  if (!section.items) {
    return (
      <div className='flex-none'>
        <Link
          href={section.href ?? '/dashboard/settings'}
          className={cn(
            'text-foreground/80 hover:bg-accent/50 block rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
            pathname === section.href && 'bg-accent text-foreground font-semibold'
          )}
        >
          {section.title}
        </Link>
      </div>
    );
  }

  // Collapsible section
  return (
    <div className='flex-none'>
      <button
        onClick={() => setExpanded(!expanded)}
        className='text-foreground/60 hover:text-foreground flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors'
      >
        <span>{section.title}</span>
        <ChevronRightIcon
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            expanded && 'rotate-90'
          )}
        />
      </button>

      {expanded && section.items && (
        <div className='mt-0.5 space-y-0.5'>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  'text-foreground/70 hover:bg-accent/50 flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors',
                  isActive &&
                    'bg-accent text-foreground font-medium'
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive
                        ? 'text-foreground'
                        : 'text-foreground/50'
                    )}
                  />
                )}
                <span className='truncate'>{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SettingsSidebar() {
  return (
    <div className='bg-background flex h-full w-[230px] shrink-0 flex-col border-r'>
      {/* Header */}
      <div className='flex-none px-4 pt-5 pb-3'>
        <h1 className='text-lg font-semibold'>Settings</h1>
      </div>

      {/* Scrollable sections */}
      <div className='flex-1 space-y-1 overflow-y-auto px-2 pb-4'>
        {settingsSections.map((section) => (
          <SectionGroup key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
