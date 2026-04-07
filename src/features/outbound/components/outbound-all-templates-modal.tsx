'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { QUICK_STARTERS, CHANNEL_TYPES } from '../lib/outbound-data';
import type { QuickStarter } from '../lib/outbound-data';
import { Globe, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

/* ── Sidebar categories ──────────────────────────────────────── */

interface SidebarCategory {
  id: string;
  label: string;
  group?: string;
}

const SIDEBAR_CATEGORIES: SidebarCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'popular', label: 'Popular' },
  { id: 'proactive-support', label: 'Proactive Support', group: 'USE CASES' },
  { id: 'onboarding', label: 'Onboarding', group: 'USE CASES' },
  { id: 'transactional', label: 'Transactional', group: 'USE CASES' },
  { id: 'engagement', label: 'Engagement', group: 'USE CASES' },
  { id: 'ch-messenger', label: 'Messenger', group: 'CHANNELS' },
  { id: 'ch-website', label: 'Website', group: 'CHANNELS' },
  { id: 'ch-mobile', label: 'Mobile', group: 'CHANNELS' },
  { id: 'type-chat', label: 'Chat', group: 'TYPES' },
  { id: 'type-banner', label: 'Banner', group: 'TYPES' },
  { id: 'type-tooltip', label: 'Tooltip', group: 'TYPES' },
  { id: 'type-post', label: 'Post', group: 'TYPES' },
  { id: 'type-email', label: 'Email', group: 'TYPES' },
  { id: 'type-mobile-push', label: 'Mobile Push', group: 'TYPES' },
  { id: 'type-product-tour', label: 'Product Tour', group: 'TYPES' },
  { id: 'type-checklist', label: 'Checklist', group: 'TYPES' },
  { id: 'type-sms', label: 'SMS', group: 'TYPES' },
  { id: 'type-survey', label: 'Survey', group: 'TYPES' }
];

const POPULAR_IDS = [
  'chat-1', 'email-2', 'tour-2', 'post-1', 'banner-1',
  'survey-1', 'carousel-1', 'push-1', 'sms-1', 'workflow-1'
];

const USE_CASE_MAP: Record<string, string[]> = {
  'proactive-support': ['chat-1', 'chat-2', 'chat-3', 'chat-5', 'carousel-3'],
  'onboarding': ['tour-1', 'tour-2', 'checklist-1', 'checklist-2', 'carousel-1', 'carousel-2'],
  'transactional': ['email-4', 'email-5', 'email-7', 'sms-2', 'sms-3', 'sms-4'],
  'engagement': ['post-1', 'post-2', 'post-3', 'email-1', 'email-2', 'banner-1', 'banner-6', 'push-2', 'push-3']
};

const CHANNEL_MAP: Record<string, string[]> = {
  'ch-messenger': ['chat'],
  'ch-website': ['chat', 'banner', 'post', 'tooltip', 'product-tour', 'checklist', 'survey'],
  'ch-mobile': ['mobile-push', 'mobile-carousel', 'sms']
};

function filterTemplates(categoryId: string): QuickStarter[] {
  if (categoryId === 'all') return QUICK_STARTERS;
  if (categoryId === 'popular') return QUICK_STARTERS.filter(t => POPULAR_IDS.includes(t.id));

  if (USE_CASE_MAP[categoryId]) {
    return QUICK_STARTERS.filter(t => USE_CASE_MAP[categoryId].includes(t.id));
  }

  if (CHANNEL_MAP[categoryId]) {
    return QUICK_STARTERS.filter(t => CHANNEL_MAP[categoryId].includes(t.channel));
  }

  if (categoryId.startsWith('type-')) {
    const channelSlug = categoryId.replace('type-', '');
    return QUICK_STARTERS.filter(t => t.channel === channelSlug);
  }

  return QUICK_STARTERS;
}

/* ── All Templates Modal ─────────────────────────────────────── */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: QuickStarter) => void;
}

export default function OutboundAllTemplatesModal({ open, onOpenChange, onSelectTemplate }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTemplates = useMemo(
    () => filterTemplates(activeCategory),
    [activeCategory]
  );

  // Group by channel for display
  const grouped = useMemo(() => {
    return filteredTemplates.reduce<Record<string, QuickStarter[]>>((acc, s) => {
      if (!acc[s.channel]) acc[s.channel] = [];
      acc[s.channel].push(s);
      return acc;
    }, {});
  }, [filteredTemplates]);

  // Render sidebar groups
  const groups = useMemo(() => {
    const result: { group: string | null; items: SidebarCategory[] }[] = [];
    let currentGroup: string | null = null;
    let currentItems: SidebarCategory[] = [];

    for (const cat of SIDEBAR_CATEGORIES) {
      const g = cat.group ?? null;
      if (g !== currentGroup) {
        if (currentItems.length > 0) {
          result.push({ group: currentGroup, items: currentItems });
        }
        currentGroup = g;
        currentItems = [cat];
      } else {
        currentItems.push(cat);
      }
    }
    if (currentItems.length > 0) {
      result.push({ group: currentGroup, items: currentItems });
    }
    return result;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-[1200px] sm:max-w-[1200px] flex-col gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Choose a template</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-[18px] font-semibold text-foreground">
            Choose a template
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href="#"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <Globe className="h-3.5 w-3.5" />
              Try a demo
            </Link>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <ScrollArea className="w-[200px] shrink-0 border-r border-border/60">
            <nav className="space-y-1 px-3 py-3">
              {groups.map((g, gi) => (
                <div key={gi}>
                  {g.group && (
                    <p className="mb-1 mt-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {g.group}
                    </p>
                  )}
                  {g.items.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        'flex w-full items-center rounded-md px-2 py-1.5 text-[13px] transition-colors',
                        activeCategory === cat.id
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Main content */}
          <ScrollArea className="flex-1">
            <div className="px-5 py-4">
              {/* Start from scratch */}
              <div className="mb-6">
                <h3 className="mb-3 text-[15px] font-semibold text-foreground">
                  Start from scratch
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {CHANNEL_TYPES.map((ch) => {
                    const Icon = ch.icon;
                    return (
                      <Link
                        key={ch.slug}
                        href={`/dashboard/outbound/compose?channel=${ch.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="flex items-center gap-2.5 rounded-md border border-border/60 bg-background px-3 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-border hover:bg-accent/20"
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: ch.color }} />
                        {ch.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Or choose a quick starter */}
              <div>
                <h3 className="mb-3 text-[15px] font-semibold text-foreground">
                  Or choose a quick starter
                </h3>

                {Object.entries(grouped).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-[13px] text-muted-foreground">
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(grouped).map(([channelSlug, templates]) => {
                    const ch = CHANNEL_TYPES.find((c) => c.slug === channelSlug);
                    if (!ch) return null;
                    const ChannelIcon = ch.icon;

                    return templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onSelectTemplate(t)}
                        className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card text-left transition-all hover:border-border hover:shadow-sm"
                      >
                        {/* Preview area */}
                        <div className="relative bg-muted/70 p-3">
                          <p className="text-[12px] leading-relaxed text-foreground/80">
                            {t.description}
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex h-5 items-center rounded bg-primary px-2 text-[10px] font-medium text-primary-foreground">
                              Learn more
                            </span>
                          </div>
                          <span
                            className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </div>

                        {/* Channel + title */}
                        <div className="px-3 py-2.5">
                          <div className="mb-1 flex items-center gap-1.5">
                            <ChannelIcon
                              className="h-3.5 w-3.5"
                              style={{ color: ch.color }}
                            />
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {ch.label}
                            </span>
                          </div>
                          <h4 className="text-[13px] font-semibold leading-snug text-foreground">
                            {t.title}
                          </h4>
                        </div>
                      </button>
                    ));
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
