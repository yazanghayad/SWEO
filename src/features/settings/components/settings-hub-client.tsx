'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LongTextIcon,
  PersonIcon,
  ClockFilledIcon,
  BrandsIcon,
  ShieldCheckIcon,
  LanguageIcon,
  CashIcon,
  MessengerIcon,
  EmailIcon,
  PhoneIcon,
  WhatsAppIcon,
  SmsIcon,
  InstagramIcon,
  SlackIcon,
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
  TagIcon
} from '@/components/icons/sweo-icons';

interface SettingsCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SettingsSection {
  title: string;
  cards: SettingsCard[];
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Workspace',
    cards: [
      {
        title: 'General',
        description: 'Workspace name, timezone, and default language',
        href: '/dashboard/settings/general',
        icon: LongTextIcon
      },
      {
        title: 'Teammates',
        description: 'Manage team members, roles, and permissions',
        href: '/dashboard/settings/team',
        icon: PersonIcon
      },
      {
        title: 'Office hours',
        description: 'Set up your office hours and availability',
        href: '/dashboard/settings/office-hours',
        icon: ClockFilledIcon
      },
      {
        title: 'Brands',
        description: 'Manage brand identity and messaging tone',
        href: '/dashboard/settings/customization',
        icon: BrandsIcon
      },
      {
        title: 'Security',
        description:
          'Authentication methods, IP allowlists, and session settings',
        href: '/dashboard/settings/security',
        icon: ShieldCheckIcon
      },
      {
        title: 'Multilingual',
        description: 'Configure supported languages and translations',
        href: '/dashboard/settings/languages',
        icon: LanguageIcon
      }
    ]
  },
  {
    title: 'Subscription',
    cards: [
      {
        title: 'Billing',
        description: 'Manage your plan, invoices, and payment methods',
        href: '/dashboard/settings/billing',
        icon: CashIcon
      }
    ]
  },
  {
    title: 'Channels',
    cards: [
      {
        title: 'Messenger',
        description: 'Configure the web chat messenger widget',
        href: '/dashboard/settings/channels/messenger',
        icon: MessengerIcon
      },
      {
        title: 'Email',
        description: 'Set up email addresses and forwarding rules',
        href: '/dashboard/settings/channels/email',
        icon: EmailIcon
      },
      {
        title: 'Phone',
        description: 'Configure voice and phone call settings',
        href: '/dashboard/settings/channels/phone',
        icon: PhoneIcon
      },
      {
        title: 'WhatsApp',
        description: 'Connect and manage WhatsApp Business',
        href: '/dashboard/settings/channels/whatsapp',
        icon: WhatsAppIcon
      },
      {
        title: 'SMS',
        description: 'Set up SMS messaging and phone numbers',
        href: '/dashboard/settings/channels/sms',
        icon: SmsIcon
      },
      {
        title: 'Instagram',
        description: 'Connect Instagram DMs to your inbox',
        href: '/dashboard/settings/channels/instagram',
        icon: InstagramIcon
      },
      {
        title: 'Slack',
        description: 'Connect Slack community channels',
        href: '/dashboard/settings/channels/slack',
        icon: SlackIcon
      }
    ]
  },
  {
    title: 'Inbox',
    cards: [
      {
        title: 'Team Inboxes',
        description: 'Create and manage team-based inbox routing',
        href: '/dashboard/settings/inboxes',
        icon: InboxIcon
      },
      {
        title: 'Assignments',
        description: 'Configure auto-assignment and round-robin rules',
        href: '/dashboard/settings/assignments',
        icon: PersonIcon
      },
      {
        title: 'Macros',
        description: 'Create saved reply templates and macros',
        href: '/dashboard/settings/macros',
        icon: SparklesIcon
      },
      {
        title: 'Tags',
        description: 'Manage conversation tags and labels',
        href: '/dashboard/settings/tags',
        icon: TagIcon
      }
    ]
  },
  {
    title: 'AI & Automation',
    cards: [
      {
        title: 'AI Agent',
        description: 'Configure AI agent behavior, personality, and training',
        href: '/dashboard/settings/ai-agent',
        icon: AiIcon
      },
      {
        title: 'Inbox AI',
        description: 'Enable AI compose, summarize, and autofill features',
        href: '/dashboard/settings/inbox-ai',
        icon: SparklesIcon
      },
      {
        title: 'Automation',
        description: 'Build workflow automations and routing rules',
        href: '/dashboard/settings/automation',
        icon: WorkflowsIcon
      }
    ]
  },
  {
    title: 'Integrations',
    cards: [
      {
        title: 'Data Connectors',
        description: 'Connect to Shopify, Stripe, Salesforce, and more',
        href: '/dashboard/connectors',
        icon: DatabaseIcon
      },
      {
        title: 'Webhooks',
        description: 'Configure webhook endpoints for real-time events',
        href: '/dashboard/settings/webhooks',
        icon: WebhookIcon
      },
      {
        title: 'API & Tokens',
        description: 'Manage API keys and access tokens',
        href: '/dashboard/settings/api-tokens',
        icon: KeyIcon
      }
    ]
  },
  {
    title: 'Personal',
    cards: [
      {
        title: 'Your Details',
        description: 'Manage your personal profile and preferences',
        href: '/dashboard/settings/profile',
        icon: SettingsIcon
      },
      {
        title: 'Notifications',
        description: 'Configure notification channels and preferences',
        href: '/dashboard/settings/notifications',
        icon: BellIcon
      },
      {
        title: 'Account Security',
        description: 'Manage your password and two-factor authentication',
        href: '/dashboard/settings/account-security',
        icon: LockedIcon
      }
    ]
  }
];

export default function SettingsHubClient() {
  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <h1 className='text-lg font-semibold'>Settings</h1>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='space-y-8'>
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h3 className='text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase'>
                {section.title}
              </h3>
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {section.cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.title}
                      href={card.href}
                      className={cn(
                        'group flex items-start gap-3 rounded-lg border p-4 transition-all',
                        'hover:border-primary/30 bg-background hover:shadow-sm'
                      )}
                    >
                      <div className='bg-muted group-hover:bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors'>
                        <Icon className='text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium'>{card.title}</p>
                        <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed'>
                          {card.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
