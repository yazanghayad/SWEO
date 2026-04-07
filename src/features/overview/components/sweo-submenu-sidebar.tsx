'use client';

import { cn } from '@/lib/utils';
import {
  ColumnChartIcon,
  SettingsIcon,
  TestBeakerIcon,
  RocketShipIcon,
  ChangelogIcon,
  WorkflowsIcon,
  LightningBoltIcon,
  SweoLogoIcon,
  ExternalLinkIcon,
  RightArrowIcon
} from '@/components/icons/sweo-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SubMenuItem {
  label: string;
  href: string;
  external?: boolean;
}

interface SubMenuSection {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  items?: SubMenuItem[];
  defaultExpanded?: boolean;
}

const sections: SubMenuSection[] = [
  {
    label: 'Analyze',
    icon: ColumnChartIcon,
    defaultExpanded: true,
    items: [
      { label: 'Get started', href: '/dashboard/overview' },
      { label: 'Performance', href: '/dashboard/reports/sweo-performance' },
      { label: 'AI Insights', href: '/dashboard/ai-insights' },
      {
        label: 'Conversations',
        href: '/dashboard/conversations',
        external: true
      },
      {
        label: 'Unresolved questions',
        href: '/dashboard/reports/sweo-deflection'
      }
    ]
  },
  {
    label: 'Train',
    icon: ArticleIconLocal,
    items: [
      { label: 'Guidance', href: '/dashboard/guidance' },
      { label: 'Content', href: '/dashboard/content' },
      { label: 'Sources', href: '/dashboard/knowledge' },
      { label: 'Policies', href: '/dashboard/policies' },
      { label: 'Procedures', href: '/dashboard/procedures' },
      { label: 'Connectors', href: '/dashboard/connectors' }
    ]
  },
  {
    label: 'Test',
    icon: TestBeakerIcon,
    href: '/dashboard/testing'
  },
  {
    label: 'Deploy',
    icon: RocketShipIcon,
    items: [
      { label: 'Email', href: '/dashboard/settings/channels/email' },
      { label: 'Phone', href: '/dashboard/settings/channels/phone' },
      { label: 'Voice (AI)', href: '/dashboard/settings/channels/voice' },
      { label: 'WhatsApp', href: '/dashboard/settings/channels/whatsapp' },
      { label: 'SMS', href: '/dashboard/settings/channels/sms' },
      { label: 'Messenger', href: '/dashboard/settings/channels/messenger' },
      { label: 'Instagram', href: '/dashboard/settings/channels/instagram' },
      { label: 'Slack', href: '/dashboard/settings/channels/slack' }
    ]
  },
  {
    label: 'SWEO settings',
    icon: SettingsIcon,
    items: [
      { label: 'General', href: '/dashboard/settings/general' },
      { label: 'AI Agent', href: '/dashboard/ai' }
    ]
  },
  {
    label: 'Changelog',
    icon: ChangelogIcon,
    href: '/docs'
  }
];

const bottomLinks: SubMenuSection[] = [
  {
    label: 'Workflows',
    icon: WorkflowsIcon,
    href: '/dashboard/procedures'
  },
  {
    label: 'Simple automations',
    icon: LightningBoltIcon,
    href: '/dashboard/ai'
  }
];

/** Local article icon to avoid circular dep issues */
function ArticleIconLocal({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.5 2C14.5 2 14.48 2 14.47 2C12.1 2.12 9.9 2.85 8 4.01C6.1 2.85 3.89 2.13 1.53 2.01C1.53 2.01 1.51 2.01 1.5 2.01C1.23 2.01 1 2.24 1 2.52V13.25C1 13.52 1.21 13.73 1.48 13.74C3.86 13.86 6.08 14.58 8 15.75C9.92 14.58 12.14 13.85 14.52 13.74C14.79 13.73 15 13.52 15 13.25V2.51C15 2.23 14.77 2 14.5 2ZM13.3 12.14C11.45 12.37 9.65 12.93 8 13.8V6.02L8.89 5.48C10.24 4.65 11.75 4.1 13.3 3.85V12.15V12.14Z" />
    </svg>
  );
}

function CollapsibleSection({
  section,
  pathname
}: {
  section: SubMenuSection;
  pathname: string;
}) {
  const hasItems = section.items && section.items.length > 0;
  const isChildActive = hasItems
    ? section.items!.some((item) => pathname === item.href)
    : false;
  const [expanded, setExpanded] = useState(
    section.defaultExpanded || isChildActive
  );
  const Icon = section.icon;

  if (!hasItems && section.href) {
    const isActive = pathname === section.href;
    return (
      <Link
        href={section.href}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
          isActive
            ? 'bg-accent text-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{section.label}</span>
      </Link>
    );
  }

  return (
    <div>
      {/* Section label — SWEO mono uppercase pattern */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="group mb-1 flex w-full items-center gap-2 border-b border-border/50 px-2.5 pt-3 pb-2"
      >
        <span className="inline-block size-1.5 rounded-[1px] bg-primary" />
        <span className="font-mono text-[11px] font-normal uppercase leading-[1.273] tracking-[1.5px] text-primary">
          {section.label}
        </span>
        <svg
          className={cn(
            'ml-auto h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200',
            expanded && 'rotate-90'
          )}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z"
          />
        </svg>
      </button>

      {expanded && section.items && (
        <div className="mb-1 ml-6 flex flex-col gap-px border-l border-border/40 pl-2.5">
          {section.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                  isActive
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <span className="flex-1">{item.label}</span>
                {item.external && (
                  <ExternalLinkIcon className="h-3 w-3 shrink-0 opacity-50" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SweoSubmenuSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-[calc(100dvh-44px)] w-[230px] shrink-0 flex-col border-r border-border/60 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-3">
        <SweoLogoIcon className="h-4 w-4 text-primary" />
        <h1 className="text-[13px] font-semibold text-foreground">
          SWEO AI Agent
        </h1>
      </div>

      {/* Sections */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {sections.map((section) => (
          <CollapsibleSection
            key={section.label}
            section={section}
            pathname={pathname}
          />
        ))}

        {/* Dashed separator — SWEO pattern */}
        <div
          className="my-3 h-px w-full"
          style={{
            background: 'linear-gradient(to right, var(--border) 5px, transparent 5px)',
            backgroundSize: '10px 1px',
            backgroundRepeat: 'repeat-x'
          }}
        />

        {/* Bottom links */}
        {bottomLinks.map((section) => (
          <CollapsibleSection
            key={section.label}
            section={section}
            pathname={pathname}
          />
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* SWEO Studio card */}
        <Link
          href="/dashboard/ai"
          className="mt-4 flex items-center gap-2 rounded-md border border-border/50 bg-accent/60 p-2.5 transition-colors hover:bg-accent"
        >
          <SweoLogoIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-[13px] font-medium text-foreground">
            SWEO Studio
          </span>
          <RightArrowIcon className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Link>
      </nav>
    </aside>
  );
}
