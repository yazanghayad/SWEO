'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { OutboundIcon } from '@/components/icons/sweo-icons';
import { Send, GitBranch, Settings, ExternalLink } from 'lucide-react';

export type OutboundView = 'messages' | 'series';

interface Props {
  activeView?: OutboundView;
  onViewChange?: (v: OutboundView) => void;
}

export default function OutboundSidebar({ activeView, onViewChange }: Props) {
  const pathname = usePathname();

  const isSlugPage =
    pathname.includes('/outbound/') && pathname !== '/dashboard/outbound';

  const isViewActive = (v: OutboundView) => {
    if (isSlugPage) return false;
    return activeView === v;
  };

  return (
    <aside className="flex h-[calc(100dvh-44px)] w-[230px] shrink-0 flex-col border-r border-border/60 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-3">
        <OutboundIcon className="h-4 w-4 text-primary" />
        <h1 className="text-[13px] font-semibold text-foreground">Outbound</h1>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pb-2">
        <button
          onClick={() => onViewChange?.('messages')}
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
            isViewActive('messages')
              ? 'bg-accent text-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
        >
          <Send className="h-4 w-4 shrink-0" />
          <span>Messages</span>
        </button>

        <button
          onClick={() => onViewChange?.('series')}
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
            isViewActive('series')
              ? 'bg-accent text-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
        >
          <GitBranch className="h-4 w-4 shrink-0" />
          <span>Series</span>
        </button>

        <Link
          href="/dashboard/settings/outbound"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="flex-1">Settings</span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
        </Link>
      </nav>
    </aside>
  );
}
