'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  FileText,
  Star,
  MessageSquare,
  Download,
  CalendarClock,
  Lightbulb,
  Plus
} from 'lucide-react';

export type ReportsView =
  | 'overview'
  | 'all-reports'
  | 'your-reports'
  | 'favorites'
  | 'topics'
  | 'suggestions'
  | 'dataset-export'
  | 'manage-schedules';

interface Props {
  activeView?: ReportsView;
  onViewChange?: (v: ReportsView) => void;
}

/* ── Chevron icon (matches SweoSubmenuSidebar) ──────────────── */

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
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
  );
}

/* ── Main component ─────────────────────────────────────────── */

export default function ReportsSidebar({ activeView, onViewChange }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [aiOpen, setAiOpen] = useState(true);
  const [humanOpen, setHumanOpen] = useState(true);
  const [topicsOpen, setTopicsOpen] = useState(false);

  const isSlugPage = pathname.includes('/reports/') && pathname !== '/dashboard/reports';
  const currentSlug = isSlugPage ? pathname.split('/reports/')[1] : '';

  const click = (v: ReportsView) => {
    if (onViewChange) {
      onViewChange(v);
    } else {
      router.push('/dashboard/reports');
    }
  };

  const isViewActive = (v: ReportsView) => activeView === v && !isSlugPage;
  const isSubActive = (slug: string) => currentSlug === slug;

  return (
    <aside className="flex h-[calc(100dvh-44px)] w-[230px] shrink-0 flex-col border-r border-border/60 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-3">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h1 className="text-[13px] font-semibold text-foreground">Reports</h1>
        <button className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {/* Top-level views */}
        <div className="flex flex-col gap-px">
          <button
            onClick={() => click('overview')}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
              isViewActive('overview')
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => click('all-reports')}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
              isViewActive('all-reports')
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">All reports</span>
            <span className="text-[11px] tabular-nums text-muted-foreground">21</span>
          </button>

          <button
            onClick={() => click('your-reports')}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
              isViewActive('your-reports')
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Your reports</span>
            <span className="text-[11px] tabular-nums text-muted-foreground">0</span>
          </button>

          <button
            onClick={() => click('favorites')}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
              isViewActive('favorites')
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <Star className="h-4 w-4 shrink-0" />
            <span>Favorites</span>
          </button>
        </div>

        {/* ── Conversation topics ────────────────────────────────── */}
        <div>
          <button
            onClick={() => setTopicsOpen(!topicsOpen)}
            className="group mb-1 flex w-full items-center gap-2 border-b border-border/50 px-2.5 pt-3 pb-2"
          >
            <span className="inline-block size-1.5 rounded-[1px] bg-primary" />
            <span className="font-mono text-[11px] font-normal uppercase leading-[1.273] tracking-[1.5px] text-primary">
              Conversation topics
            </span>
            <ChevronIcon expanded={topicsOpen} />
          </button>
          {topicsOpen && (
            <div className="mb-1 ml-6 flex flex-col gap-px border-l border-border/40 pl-2.5">
              <button
                onClick={() => click('topics')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                  isViewActive('topics')
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span>Topics</span>
              </button>
              <button
                onClick={() => click('suggestions')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                  isViewActive('suggestions')
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                <span>Suggestions</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Tools ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-px">
          <button
            onClick={() => click('dataset-export')}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
              isViewActive('dataset-export')
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Dataset export</span>
          </button>
          <button
            onClick={() => click('manage-schedules')}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
              isViewActive('manage-schedules')
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <CalendarClock className="h-4 w-4 shrink-0" />
            <span>Manage schedules</span>
          </button>
        </div>

        {/* ── AI & Automation ───────────────────────────────────── */}
        <div>
          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="group mb-1 flex w-full items-center gap-2 border-b border-border/50 px-2.5 pt-3 pb-2"
          >
            <span className="inline-block size-1.5 rounded-[1px] bg-primary" />
            <span className="font-mono text-[11px] font-normal uppercase leading-[1.273] tracking-[1.5px] text-primary">
              AI &amp; Automation
            </span>
            <ChevronIcon expanded={aiOpen} />
          </button>
          {aiOpen && (
            <div className="mb-1 ml-6 flex flex-col gap-px border-l border-border/40 pl-2.5">
              <Link
                href="/dashboard/reports/fin-ai-agent"
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                  isSubActive('fin-ai-agent')
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                Fin AI Agent
              </Link>
              <Link
                href="/dashboard/reports/copilot"
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                  isSubActive('copilot')
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                Copilot
              </Link>
            </div>
          )}
        </div>

        {/* ── Human support ─────────────────────────────────────── */}
        <div>
          <button
            onClick={() => setHumanOpen(!humanOpen)}
            className="group mb-1 flex w-full items-center gap-2 border-b border-border/50 px-2.5 pt-3 pb-2"
          >
            <span className="inline-block size-1.5 rounded-[1px] bg-primary" />
            <span className="font-mono text-[11px] font-normal uppercase leading-[1.273] tracking-[1.5px] text-primary">
              Human support
            </span>
            <ChevronIcon expanded={humanOpen} />
          </button>
          {humanOpen && (
            <div className="mb-1 ml-6 flex flex-col gap-px border-l border-border/40 pl-2.5">
              {[
                { slug: 'calls', label: 'Calls' },
                { slug: 'conversations', label: 'Conversations' },
                { slug: 'surveyed-csat', label: 'Surveyed CSAT' },
                { slug: 'effectiveness', label: 'Effectiveness' },
                { slug: 'responsiveness', label: 'Responsiveness' },
                { slug: 'slas', label: 'SLAs' },
                { slug: 'team-inbox-performance', label: 'Team inbox performance' },
                { slug: 'team-performance', label: 'Teammate performance' },
                { slug: 'tickets', label: 'Tickets' }
              ].map((item) => (
                <Link
                  key={item.slug}
                  href={`/dashboard/reports/${item.slug}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                    isSubActive(item.slug)
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
