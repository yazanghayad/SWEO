'use client';

import { cn } from '@/lib/utils';
import {
  SweoIcon,
  InboxIcon,
  SweoLogoIcon,
  ArticleIcon,
  ColumnChartIcon,
  OutboundIcon,
  MultiplePeopleIcon,
  CasesIcon,
  ConnectorsIcon,
  MultiplatformIcon,
  SearchIcon,
  SettingsIcon
} from '@/components/icons/sweo-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface RailItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  matchPrefix: string;
}

const topItems: RailItem[] = [
  {
    icon: InboxIcon,
    label: 'Inbox',
    href: '/dashboard/inbox',
    matchPrefix: '/dashboard/inbox'
  },
  {
    icon: SweoLogoIcon,
    label: 'SWEO AI Agent',
    href: '/dashboard/overview',
    matchPrefix: '/dashboard/overview'
  },
  {
    icon: ArticleIcon,
    label: 'Knowledge',
    href: '/dashboard/knowledge',
    matchPrefix: '/dashboard/knowledge'
  },
  {
    icon: ColumnChartIcon,
    label: 'Reports',
    href: '/dashboard/reports',
    matchPrefix: '/dashboard/reports'
  },
  {
    icon: OutboundIcon,
    label: 'Outbound',
    href: '/dashboard/outbound',
    matchPrefix: '/dashboard/outbound'
  },
  {
    icon: MultiplePeopleIcon,
    label: 'Contacts',
    href: '/dashboard/contacts',
    matchPrefix: '/dashboard/contacts'
  },
  {
    icon: CasesIcon,
    label: 'Cases',
    href: '/dashboard/cases',
    matchPrefix: '/dashboard/cases'
  },
  {
    icon: ConnectorsIcon,
    label: 'Connectors',
    href: '/dashboard/connectors',
    matchPrefix: '/dashboard/connectors'
  },
  {
    icon: MultiplatformIcon,
    label: 'Integrations',
    href: '/dashboard/integrations',
    matchPrefix: '/dashboard/integrations'
  }
];

const bottomItems: RailItem[] = [
  {
    icon: SettingsIcon,
    label: 'Settings',
    href: '/dashboard/settings',
    matchPrefix: '/dashboard/settings'
  }
];

function RailButton({ item, isActive }: { item: RailItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            'relative flex size-9 items-center justify-center rounded-md transition-all duration-200',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )}
        >
          {isActive && (
            <span className='absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary' />
          )}
          <Icon className='size-[18px]' />
        </Link>
      </TooltipTrigger>
      <TooltipContent side='right' sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function IconRail() {
  const pathname = usePathname();

  const isActive = (item: RailItem) => pathname.startsWith(item.matchPrefix);

  return (
    <TooltipProvider delayDuration={0}>
      <aside className='bg-sidebar border-sidebar-border flex h-screen w-[56px] flex-col items-center border-r py-3 transition-colors'>
        {/* Logo */}
        <Link
          href='/dashboard/overview'
          className='mb-2 flex size-9 shrink-0 items-center justify-center'
        >
          <SweoIcon className='size-6 text-foreground' />
        </Link>

        {/* Separator */}
        <div className='bg-sidebar-border mb-1.5 h-px w-8' />

        {/* Top section — main nav */}
        <nav className='flex flex-1 flex-col items-center gap-1'>
          {topItems.map((item) => (
            <RailButton key={item.href} item={item} isActive={isActive(item)} />
          ))}
        </nav>

        {/* Bottom section — search, settings, profile */}
        <nav className='flex flex-col items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className='text-muted-foreground hover:bg-accent/60 hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors'
                onClick={() => {
                  document.dispatchEvent(
                    new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                      bubbles: true
                    })
                  );
                }}
              >
                <SearchIcon className='size-5' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right' sideOffset={8}>
              Search (⌘K)
            </TooltipContent>
          </Tooltip>

          {bottomItems.map((item) => (
            <RailButton key={item.href} item={item} isActive={isActive(item)} />
          ))}

          <div className='mt-3 border-t border-sidebar-border pt-3'>
            <Avatar className='size-8'>
              <AvatarFallback className='bg-accent text-muted-foreground text-[11px] font-medium'>
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
