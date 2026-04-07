'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OutboundIcon } from '@/components/icons/sweo-icons';
import OutboundSidebar, { type OutboundView } from './outbound-sidebar';
import OutboundTemplateModal from './outbound-template-modal';
import OutboundAllTemplatesModal from './outbound-all-templates-modal';
import { listOutboundMessages } from '../actions/outbound-crud';
import {
  QUICK_STARTERS,
  CHANNEL_TYPES
} from '../lib/outbound-data';
import type { QuickStarter } from '../lib/outbound-data';
import type { OutboundMessage } from '@/types/appwrite';
import {
  Plus,
  ChevronDown,
  Search,
  MoreHorizontal,
  Clock,
  Play,
  Pause,
  FileText,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  CreditCard,
  Globe,
  Send as SendIcon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/* ── Featured templates (from quick starters) ──────────────────────── */

const FEATURED_TEMPLATES = [
  QUICK_STARTERS.find(t => t.id === 'chat-1'),
  QUICK_STARTERS.find(t => t.id === 'email-2'),
  QUICK_STARTERS.find(t => t.id === 'tour-2')
].filter(Boolean) as QuickStarter[];

/* ── Realistic preview mock for each featured card ─────────────────── */

function ChatPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white">
          Y
        </div>
        <div className="flex-1 rounded-lg rounded-tl-none bg-foreground/10 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-foreground/90">
            Welcome <span className="rounded bg-primary/20 px-1 text-[10px] text-primary">{'{{FirstName}}'}</span> 👋 let me
            know if you have any questions
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-1.5">
        <span className="flex-1 text-[10px] text-muted-foreground">Reply to Chloe...</span>
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <SendIcon className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}

function EmailPreview() {
  return (
    <div className="space-y-2">
      <div className="rounded-t-md border-b border-foreground/10 bg-foreground/5 px-3 py-1.5">
        <p className="text-[10px] text-muted-foreground">
          Subject: <span className="inline-block h-1.5 w-16 rounded-full bg-muted-foreground/30" />
        </p>
      </div>
      <div className="px-2 text-center">
        <p className="text-[11px] leading-relaxed text-foreground/90">
          It&apos;s been a while 👋<br />
          Anything we can help with?
        </p>
        <span className="mt-2 inline-flex h-6 items-center rounded bg-primary px-3 text-[10px] font-medium text-primary-foreground">
          Open app
        </span>
      </div>
    </div>
  );
}

function TourPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
          A
        </div>
        <div className="flex-1">
          <p className="text-[11px] leading-relaxed text-foreground/90">
            Welcome to <span className="rounded bg-primary/20 px-1 text-[10px] text-primary">{'{{AppName}}'}</span> 👋
          </p>
          <p className="text-[10px] text-muted-foreground">
            Find the tools you need here
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-foreground/5 px-3 py-1.5">
        <span className="text-[10px] text-muted-foreground">1 of 4</span>
        <span className="inline-flex h-5 items-center rounded bg-primary px-2.5 text-[9px] font-medium text-primary-foreground">
          Start
        </span>
      </div>
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<string, React.ComponentType> = {
  'chat-1': ChatPreview,
  'email-2': EmailPreview,
  'tour-2': TourPreview
};

/* ── Hero illustration ────────────────────────────────────────────── */

function HeroIllustration() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gradient-to-br from-amber-800/70 via-orange-900/50 to-stone-800/60">
      {/* Browser-like card (top-left) */}
      <div className="absolute left-3 top-3 w-[55%] rounded-md border border-white/10 bg-white/8 p-2 backdrop-blur-sm">
        <div className="mb-1.5 flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
        </div>
        <div className="mb-1 h-2 w-full rounded-sm bg-primary/20" />
        <div className="space-y-1">
          <div className="h-1 w-3/4 rounded-full bg-white/12" />
          <div className="h-1 w-1/2 rounded-full bg-white/8" />
          <div className="flex gap-1 pt-1">
            <div className="h-4 w-10 rounded-sm bg-white/10" />
            <div className="h-4 w-10 rounded-sm bg-white/10" />
          </div>
        </div>
      </div>

      {/* Dashboard card (right) with warm branding */}
      <div className="absolute right-3 top-6 w-[42%] rounded-md border border-white/10 bg-white/8 p-2 backdrop-blur-sm">
        <div className="mb-1 text-[6px] font-medium text-white/40">PaySphere</div>
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-primary/25" />
          <div className="h-1 w-2/3 rounded-full bg-white/10" />
        </div>
        <div className="mt-1.5 flex gap-1">
          <div className="h-6 w-6 rounded-sm bg-primary/20" />
          <div className="h-6 w-6 rounded-sm bg-amber-500/15" />
          <div className="h-6 w-6 rounded-sm bg-white/8" />
        </div>
      </div>

      {/* Chat widget card (bottom-right) */}
      <div className="absolute bottom-5 right-4 w-[40%] rounded-md border border-white/10 bg-white/8 p-2 backdrop-blur-sm">
        <div className="mb-1 text-[6px] font-medium text-white/40">Hello, Hailey</div>
        <div className="flex items-start gap-1.5">
          <div className="h-4 w-4 shrink-0 rounded-full bg-primary/40" />
          <div className="space-y-0.5">
            <div className="h-1 w-16 rounded-full bg-white/12" />
            <div className="h-1 w-12 rounded-full bg-white/8" />
          </div>
        </div>
      </div>

      {/* Play button */}
      <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/40">
        <Play className="ml-0.5 h-6 w-6 text-white/90" />
      </div>
    </div>
  );
}

/* ── Overview page ───────────────────────────────────────────────── */

function OverviewPage({ onTemplateSelect, onSeeAll }: { onTemplateSelect: (templateId: string) => void; onSeeAll: () => void }) {
  return (
    <ScrollArea className="flex-1">
      <div className="min-h-screen bg-background">

        {/* Hero section */}
        <div className="bg-gradient-to-b from-amber-950/40 via-amber-950/20 to-background px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-[1fr_380px] gap-10">
              {/* Left column */}
              <div className="flex flex-col justify-center">
                <h1 className="mb-3 text-2xl font-semibold leading-tight text-foreground">
                  Send Outbound messages to keep customers in the loop
                </h1>
                <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                  Proactively support customers wherever they are with targeted and
                  personalized outbound messages. Send them in your product or across email, SMS, WhatsApp,
                  and more.
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Learn about Outbound
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    View pricing
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Try a demo
                  </Link>
                </div>
              </div>

              {/* Right column - illustration */}
              <div className="flex items-center justify-center">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </div>

        {/* Start with a popular template */}
        <div className="px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
              Start with a popular template
            </h2>

            {/* Three featured template cards */}
            <div className="mb-4 grid grid-cols-3 gap-5">
              {FEATURED_TEMPLATES.map((template) => {
                const ch = CHANNEL_TYPES.find(c => c.slug === template.channel);
                const ChannelIcon = ch?.icon ?? MessageSquare;
                const Preview = PREVIEW_COMPONENTS[template.id];

                return (
                  <button
                    key={template.id}
                    onClick={() => onTemplateSelect(template.id)}
                    className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card text-left transition-all hover:border-border hover:shadow-md"
                  >
                    {/* Preview area (dark) */}
                    <div className="bg-muted/70 p-4">
                      {Preview ? <Preview /> : (
                        <div className="flex h-20 items-center justify-center">
                          <p className="text-[11px] text-muted-foreground/60">[{ch?.label} preview]</p>
                        </div>
                      )}
                    </div>

                    {/* Channel badge + title */}
                    <div className="flex flex-1 flex-col px-4 py-3">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <ChannelIcon
                          className="h-3 w-3"
                          style={{ color: ch?.color ?? '#888' }}
                        />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {ch?.label ?? template.channel}
                        </span>
                      </div>
                      <h3 className="text-[13px] font-semibold leading-snug text-foreground">
                        {template.title}
                      </h3>

                      {/* Hover reveal */}
                      <span className="mt-2 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Use template →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* See all link */}
            <div className="text-center">
              <button
                onClick={() => onSeeAll()}
                className="text-[13px] font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary"
              >
                See all
              </button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

/* ── Messages list view (real Appwrite data) ─────────────────────── */

function MessagesPage() {
  const [messages, setMessages] = useState<OutboundMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const result = await listOutboundMessages({
        search: searchTerm || undefined
      });
      if (cancelled) return;
      if (result.success) {
        setMessages(result.data ?? []);
      } else {
        setError(result.error ?? 'Failed to load messages');
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [searchTerm]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full rounded-md border border-border/60 bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <Link
          href="/dashboard/outbound/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          New message
        </Link>
      </div>

      {/* Messages list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground/40" />
            <p className="text-[13px] text-muted-foreground">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-destructive/40" />
            <p className="text-[13px] text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-[13px] text-muted-foreground">
                  No messages yet
                </p>
                <Link
                  href="/dashboard/outbound/new"
                  className="mt-3 text-[12px] font-medium text-primary hover:underline"
                >
                  Create your first message
                </Link>
              </div>
            ) : (
              messages.map((msg) => {
                const ch = CHANNEL_TYPES.find((c) => c.slug === msg.channel);
                const ChannelIcon = ch?.icon ?? MessageSquare;
                return (
                  <div
                    key={msg.$id}
                    className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-accent/30"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${ch?.color ?? '#888'}15` }}
                    >
                      <ChannelIcon
                        className="h-4 w-4"
                        style={{ color: ch?.color ?? '#888' }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {msg.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {ch?.label ?? msg.channel} &middot; Created{' '}
                        {new Date(msg.$createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {msg.status === 'active' && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                          <Play className="h-3 w-3" />
                          Active
                        </div>
                      )}
                      {msg.status === 'draft' && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Draft
                        </div>
                      )}
                      {msg.status === 'paused' && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600">
                          <Pause className="h-3 w-3" />
                          Paused
                        </div>
                      )}
                      {msg.status === 'sending' && (
                        <div className="flex items-center gap-1 text-[11px] text-blue-600">
                          <Clock className="h-3 w-3 animate-spin" />
                          Sending…
                        </div>
                      )}
                      {msg.status === 'sent' && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                          <Play className="h-3 w-3" />
                          Sent
                        </div>
                      )}
                      {msg.status === 'failed' && (
                        <div className="flex items-center gap-1 text-[11px] text-red-600">
                          <Clock className="h-3 w-3" />
                          Failed
                        </div>
                      )}
                      {msg.sentCount > 0 && (
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {msg.sentCount.toLocaleString()} sent
                        </span>
                      )}
                      {msg.openRate > 0 && (
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {msg.openRate}% open
                        </span>
                      )}
                      <button className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */

export default function OutboundPageClient() {
  const [currentView, setCurrentView] = useState<OutboundView>('messages');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [allTemplatesOpen, setAllTemplatesOpen] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId || undefined);
    setTemplateModalOpen(true);
  };

  const handleSeeAll = () => {
    setAllTemplatesOpen(true);
  };

  const handleAllTemplatesSelect = (template: QuickStarter) => {
    setAllTemplatesOpen(false);
    setSelectedTemplateId(template.id);
    setTemplateModalOpen(true);
  };

  return (
    <div className="relative flex h-[calc(100vh-44px)]">
      <OutboundSidebar activeView={currentView} onViewChange={setCurrentView} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 border-b border-border/60 bg-background px-6 py-3">
          <OutboundIcon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[15px] font-semibold text-foreground">Messages</h2>

          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-accent/50 hover:text-foreground">
              <HelpCircle className="h-3.5 w-3.5" />
              Learn
              <ChevronDown className="h-3 w-3" />
            </button>

            <Link
              href="/dashboard/outbound/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              New message
            </Link>
          </div>
        </div>

        {/* Content */}
        {currentView === 'messages' && (
          <OverviewPage
            onTemplateSelect={handleTemplateSelect}
            onSeeAll={handleSeeAll}
          />
        )}
        {currentView === 'series' && <MessagesPage />}
      </div>

      {/* Template preview modal */}
      <OutboundTemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        templateId={selectedTemplateId}
      />

      {/* All templates modal */}
      <OutboundAllTemplatesModal
        open={allTemplatesOpen}
        onOpenChange={setAllTemplatesOpen}
        onSelectTemplate={handleAllTemplatesSelect}
      />
    </div>
  );
}
