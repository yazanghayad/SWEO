'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Hash,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  ArrowUpRight,
  AtSign,
  Edit3,
  Layers,
  Search,
  ShieldAlert,
  Star,
  Ticket,
  Users
} from 'lucide-react';
import type { InboxView, InboxCounts } from './inbox-page-client';
import { useTenant } from '@/hooks/use-tenant';
import type { HelpdeskProvider } from '@/types/helpdesk';

interface SidebarItem {
  id: InboxView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainItemsDef: SidebarItem[] = [
  { id: 'your-inbox', label: 'Your inbox', icon: Inbox },
  { id: 'mentions', label: 'Mentions', icon: AtSign },
  { id: 'created-by-you', label: 'Created by you', icon: Edit3 },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'all', label: 'All', icon: Layers },
  { id: 'unassigned', label: 'Unassigned', icon: Users },
  { id: 'spam', label: 'Spam', icon: ShieldAlert }
];

const finItems: SidebarItem[] = [
  { id: 'sweo-all', label: 'All conversations', icon: Bot },
  { id: 'sweo-resolved', label: 'Resolved', icon: CheckCircle2 },
  { id: 'sweo-escalated', label: 'Escalated & Handoff', icon: ArrowUpRight },
  { id: 'sweo-pending', label: 'Pending', icon: Clock }
];

interface ChannelViewItem {
  id: InboxView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  channels: string[]; // Appwrite channel values that map to this view
}

const channelViewItems: ChannelViewItem[] = [
  {
    id: 'channel-web',
    label: 'Messenger',
    icon: MessageSquare,
    channels: ['web']
  },
  { id: 'channel-email', label: 'Email', icon: Mail, channels: ['email'] },
  {
    id: 'channel-whatsapp',
    label: 'WhatsApp & Social',
    icon: Hash,
    channels: ['whatsapp']
  },
  {
    id: 'channel-sms',
    label: 'Phone & SMS',
    icon: Phone,
    channels: ['sms', 'voice']
  },
  {
    id: 'channel-voice' as InboxView,
    label: 'Tickets',
    icon: Ticket,
    channels: []
  }
];

// -- Helpdesk integration sub-views per provider ---
interface IntegrationFolder {
  provider: HelpdeskProvider;
  label: string;
  items: SidebarItem[];
}

const INTEGRATION_FOLDERS: IntegrationFolder[] = [
  {
    provider: 'zendesk',
    label: 'Zendesk',
    items: [
      { id: 'zendesk-all', label: 'All tickets', icon: Layers },
      { id: 'zendesk-active', label: 'Open', icon: Inbox },
      { id: 'zendesk-resolved', label: 'Resolved', icon: CheckCircle2 }
    ]
  },
  {
    provider: 'intercom',
    label: 'Intercom',
    items: [
      { id: 'intercom-all', label: 'All conversations', icon: Layers },
      { id: 'intercom-active', label: 'Open', icon: Inbox },
      { id: 'intercom-resolved', label: 'Resolved', icon: CheckCircle2 }
    ]
  },
  {
    provider: 'salesforce',
    label: 'Salesforce',
    items: [
      { id: 'salesforce-all', label: 'All cases', icon: Layers },
      { id: 'salesforce-active', label: 'Open', icon: Inbox },
      { id: 'salesforce-resolved', label: 'Resolved', icon: CheckCircle2 }
    ]
  }
];

function getMainCount(id: InboxView, counts: InboxCounts): number | undefined {
  switch (id) {
    case 'your-inbox':
    case 'all':
      return counts.total;
    case 'unassigned':
      return undefined; // We don't track this separately yet
    default:
      return undefined;
  }
}

function getChannelCount(
  channels: string[],
  byChannel: Record<string, number>
): number {
  return channels.reduce((sum, ch) => sum + (byChannel[ch] ?? 0), 0);
}

interface InboxSidebarProps {
  currentView: InboxView;
  counts?: InboxCounts;
  onViewChange: (view: InboxView) => void;
}

export function InboxSidebar({
  currentView,
  counts,
  onViewChange
}: InboxSidebarProps) {
  const [sweoOpen, setSweoOpen] = useState(true);
  const [viewsOpen, setViewsOpen] = useState(true);
  const [integrationsOpen, setIntegrationsOpen] = useState(true);
  const { tenant } = useTenant();
  const [connectedProviders, setConnectedProviders] = useState<HelpdeskProvider[]>([]);

  useEffect(() => {
    if (!tenant) return;
    import('@/features/integrations/actions/integration-crud').then(
      ({ listIntegrationsAction }) =>
        listIntegrationsAction(tenant.$id).then((res) => {
          if (res.success && res.integrations) {
            setConnectedProviders(
              res.integrations
                .filter((i) => i.status === 'active' || i.status === 'connected' || i.status === 'syncing')
                .map((i) => i.provider)
            );
          }
        })
    );
  }, [tenant]);

  const safeCounts: InboxCounts = counts ?? {
    total: 0,
    active: 0,
    resolved: 0,
    escalated: 0,
    byChannel: {}
  };

  return (
    <div className='flex h-full w-56 shrink-0 flex-col overflow-hidden border-r border-border/40 bg-sidebar'>
      {/* Header */}
      <div className='flex h-12 items-center justify-between px-4'>
        <h2 className='font-serif text-sm font-light tracking-tight'>Inbox</h2>
        <Button variant='ghost' size='icon' className='h-6 w-6'>
          <Plus className='h-3.5 w-3.5' />
        </Button>
      </div>

      {/* Search */}
      <div className='px-3 pb-2'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2' />
          <Input placeholder='Search' className='h-8 pl-8 text-xs' aria-label='Search conversations' />
        </div>
      </div>

      <ScrollArea className='flex-1'>
        <div className='space-y-1 px-2 py-1'>
          {/* Main navigation items */}
          <div className='space-y-0.5'>
            {mainItemsDef.map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              const count = getMainCount(item.id, safeCounts);
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-200',
                    active
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <Icon className='h-4 w-4 shrink-0' />
                  <span className='truncate'>{item.label}</span>
                  {count != null && count > 0 && (
                    <span className='ml-auto font-mono text-[10px] tabular-nums text-muted-foreground'>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
            {/* Dashboard */}
            <button className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground'>
              <LayoutDashboard className='h-4 w-4 shrink-0' />
              <span className='truncate'>Dashboard</span>
            </button>
          </div>

          {/* SWEO AI Agent */}
          <Collapsible open={sweoOpen} onOpenChange={setSweoOpen}>
            <div className='mt-4 flex items-center justify-between px-2'>
              <CollapsibleTrigger asChild>
                <button className='section-label flex items-center gap-1 text-muted-foreground'>
                  SWEO AI Agent
                  {sweoOpen ? (
                    <ChevronDown className='h-3 w-3' />
                  ) : (
                    <ChevronRight className='h-3 w-3' />
                  )}
                </button>
              </CollapsibleTrigger>
              <div className='flex items-center gap-0.5'>
                <Button variant='ghost' size='icon' className='h-5 w-5'>
                  <Plus className='h-3 w-3' />
                </Button>
              </div>
            </div>
            <CollapsibleContent>
              <div className='mt-1 space-y-0.5'>
                {finItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-200',
                        active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      <Icon className='h-4 w-4 shrink-0' />
                      <span className='truncate'>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Team Inboxes */}
          <div className='mt-4 flex items-center justify-between px-2'>
            <span className='section-label text-muted-foreground'>
              Team Inboxes
            </span>
            <div className='flex items-center gap-0.5'>
              <Button variant='ghost' size='icon' className='h-5 w-5'>
                <Plus className='h-3 w-3' />
              </Button>
              <ChevronRight className='text-muted-foreground h-3 w-3' />
            </div>
          </div>

          {/* Teammates */}
          <div className='mt-4 flex items-center justify-between px-2'>
            <span className='section-label text-muted-foreground'>
              Teammates
            </span>
            <div className='flex items-center gap-0.5'>
              <Button variant='ghost' size='icon' className='h-5 w-5'>
                <Plus className='h-3 w-3' />
              </Button>
              <ChevronRight className='text-muted-foreground h-3 w-3' />
            </div>
          </div>

          {/* Helpdesk Integrations */}
          {connectedProviders.length > 0 && (
            <Collapsible
              open={integrationsOpen}
              onOpenChange={setIntegrationsOpen}
              className='mt-4'
            >
              <div className='flex items-center justify-between px-2'>
                <CollapsibleTrigger asChild>
                  <button className='section-label flex items-center gap-1 text-muted-foreground'>
                    Integrations
                    {integrationsOpen ? (
                      <ChevronDown className='h-3 w-3' />
                    ) : (
                      <ChevronRight className='h-3 w-3' />
                    )}
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className='mt-1 space-y-0.5'>
                  {INTEGRATION_FOLDERS.filter((f) =>
                    connectedProviders.includes(f.provider)
                  ).map((folder) => (
                    <div key={folder.provider}>
                      <span className='section-label mt-1 block px-2 text-muted-foreground'>
                        {folder.label}
                      </span>
                      {folder.items.map((item) => {
                        const Icon = item.icon;
                        const active = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-200',
                              active
                                ? 'bg-primary/10 font-medium text-primary'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                            )}
                          >
                            <Icon className='h-4 w-4 shrink-0' />
                            <span className='truncate'>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Views — channel-based filtering */}
          <Collapsible
            open={viewsOpen}
            onOpenChange={setViewsOpen}
            className='mt-4'
          >
            <div className='flex items-center justify-between px-2'>
              <CollapsibleTrigger asChild>
                <button className='section-label flex items-center gap-1 text-muted-foreground'>
                  Views
                  {viewsOpen ? (
                    <ChevronDown className='h-3 w-3' />
                  ) : (
                    <ChevronRight className='h-3 w-3' />
                  )}
                </button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className='mt-1 space-y-0.5'>
                {channelViewItems.map((v) => {
                  const Icon = v.icon;
                  const active = currentView === v.id;
                  const count = getChannelCount(
                    v.channels,
                    safeCounts.byChannel
                  );
                  return (
                    <button
                      key={v.id}
                      onClick={() => onViewChange(v.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-200',
                        active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      <Icon className='h-4 w-4 shrink-0' />
                      <span className='truncate'>{v.label}</span>
                      {count > 0 && (
                        <span className='ml-auto font-mono text-[10px] tabular-nums text-muted-foreground'>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Get set up card */}
      <div className='border-t border-border/40 p-3'>
        <div className='rounded-lg border border-border/40 p-3'>
          <p className='font-serif text-xs font-light'>Get set up</p>
          <p className='mt-0.5 text-[10px] text-muted-foreground'>
            Set up channels to connect with your customers
          </p>
        </div>
      </div>
    </div>
  );
}
