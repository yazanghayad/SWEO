'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Users,
  Search,
  ChevronDown,
  Plus,
  Building,
  MessageSquare,
  X,
  Calendar,
  Globe,
  List,
  Columns3,
  Info,
  ExternalLink,
  FileText,
  Tag,
  Send,
  User,
  Monitor,
  Trash,
  Loader2,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Contact } from '@/types/appwrite';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface SegmentInfo {
  label: string;
  key: string;
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */

function ContactsChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn(
        'ml-auto h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200',
        expanded && 'rotate-90'
      )}
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='currentColor'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z'
      />
    </svg>
  );
}

export function ContactsSidebar({
  activeSegment,
  onSegmentChange,
  collapsed,
  segments,
  onSearch
}: {
  activeSegment: string;
  onSegmentChange: (s: string) => void;
  collapsed: boolean;
  segments: SegmentInfo[];
  onSearch: () => void;
}) {
  const [peopleExpanded, setPeopleExpanded] = useState(true);
  const [companiesExpanded, setCompaniesExpanded] = useState(false);
  const router = useRouter();

  if (collapsed) return null;

  return (
    <aside className='flex h-[calc(100dvh-44px)] w-[230px] shrink-0 flex-col border-r border-border/60 bg-background'>
      {/* Header */}
      <div className='flex items-center gap-2 px-3 pt-4 pb-3'>
        <Users className='h-4 w-4 text-primary' />
        <h1 className='text-[13px] font-semibold text-foreground'>Contacts</h1>
        <button
          onClick={onSearch}
          className='ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground'
        >
          <Search className='h-3.5 w-3.5' />
        </button>
      </div>

      {/* Nav */}
      <nav className='flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2'>
        {/* People section */}
        <div>
          <button
            onClick={() => setPeopleExpanded(!peopleExpanded)}
            className='group mb-1 flex w-full items-center gap-2 border-b border-border/50 px-2.5 pt-3 pb-2'
          >
            <span className='inline-block size-1.5 rounded-[1px] bg-primary' />
            <span className='font-mono text-[11px] font-normal uppercase leading-[1.273] tracking-[1.5px] text-primary'>
              People
            </span>
            <ContactsChevronIcon expanded={peopleExpanded} />
          </button>
          {peopleExpanded && (
            <div className='mb-1 ml-6 flex flex-col gap-px border-l border-border/40 pl-2.5'>
              {segments.map((seg) => {
                const isActive = activeSegment === seg.key;
                return (
                  <button
                    key={seg.key}
                    onClick={() => onSegmentChange(seg.key)}
                    className={cn(
                      'flex items-center justify-between rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                      isActive
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    <span>{seg.label}</span>
                    <span
                      className={cn(
                        'text-[11px] tabular-nums',
                        seg.count === 0
                          ? 'text-muted-foreground/40'
                          : 'text-muted-foreground'
                      )}
                    >
                      {seg.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Companies section */}
        <div>
          <button
            onClick={() => setCompaniesExpanded(!companiesExpanded)}
            className='group mb-1 flex w-full items-center gap-2 border-b border-border/50 px-2.5 pt-3 pb-2'
          >
            <span className='inline-block size-1.5 rounded-[1px] bg-primary' />
            <span className='font-mono text-[11px] font-normal uppercase leading-[1.273] tracking-[1.5px] text-primary'>
              Companies
            </span>
            <ContactsChevronIcon expanded={companiesExpanded} />
          </button>
          {companiesExpanded && (
            <div className='mb-1 ml-6 flex flex-col gap-px border-l border-border/40 pl-2.5'>
              <p className='text-muted-foreground px-2.5 py-1.5 text-xs'>
                No companies yet
              </p>
            </div>
          )}
        </div>

        {/* Conversations link */}
        <button
          onClick={() => router.push('/dashboard/inbox')}
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
            'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
        >
          <MessageSquare className='h-4 w-4 shrink-0' />
          <span>Conversations</span>
        </button>
      </nav>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Banner                                                         */
/* ------------------------------------------------------------------ */

export function HeroBanner({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter();
  return (
    <div className='bg-card relative mx-6 mt-4 rounded-lg border p-6'>
      <Button
        variant='ghost'
        size='icon'
        className='absolute top-3 right-3 h-7 w-7'
        onClick={onDismiss}
      >
        <X className='h-4 w-4' />
      </Button>

      <div className='flex items-start gap-6'>
        <div className='flex-1 space-y-4'>
          <h1 className='text-xl font-semibold'>
            Import your contacts for a personalized experience
          </h1>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            View user and company profiles, or segment your contacts by the
            actions they take. Integrate with more data sources in our App Store.
            When you&apos;re ready, start targeting your customers more
            effectively with outbound messages, SWEO AI Agent and Workflows.
          </p>
          <div className='flex flex-wrap gap-2'>
            <ActionLink label='Get started with contacts' onClick={() => router.push('/dashboard/content')} />
            <ActionLink label='Tracking and grouping your customers' onClick={() => router.push('/dashboard/contacts')} />
            <ActionLink label='Using apps and integrations' onClick={() => router.push('/dashboard/settings')} />
            <ActionLink label='Visit our App Store' isExternal onClick={() => router.push('/dashboard/settings')} />
          </div>
        </div>

        <div className='hidden shrink-0 lg:block'>
          <div className='bg-muted flex h-[200px] w-[180px] items-center justify-center rounded-lg'>
            <div className='space-y-3 text-center'>
              <Users className='text-muted-foreground/50 mx-auto h-12 w-12' />
              <div className='space-y-1.5'>
                <div className='bg-muted-foreground/20 mx-auto h-2 w-20 rounded' />
                <div className='bg-muted-foreground/20 mx-auto h-2 w-16 rounded' />
                <div className='bg-muted-foreground/20 mx-auto h-2 w-24 rounded' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionLink({
  label,
  isExternal,
  onClick
}: {
  label: string;
  isExternal?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button variant='outline' size='sm' className='gap-1.5 text-[13px]' onClick={onClick}>
      {isExternal ? (
        <ExternalLink className='h-3.5 w-3.5' />
      ) : (
        <FileText className='h-3.5 w-3.5' />
      )}
      <span>{label}</span>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Info Banner                                                         */
/* ------------------------------------------------------------------ */

export function InfoBanner() {
  return (
    <div className='bg-card mx-6 mt-3 flex items-start gap-2.5 rounded-md border px-4 py-3'>
      <Info className='text-primary mt-0.5 h-4 w-4 shrink-0' />
      <p className='text-muted-foreground text-[13px] leading-relaxed'>
        Enforce identity verification to protect customer conversations and
        prevent impersonation.{' '}
        <button className='text-primary hover:underline' onClick={() => window.location.href = '/dashboard/settings/security'}>
          Set up identity verification.
        </button>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Bar                                                          */
/* ------------------------------------------------------------------ */

export function FilterBar({
  search,
  onSearchChange
}: {
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className='mx-6 mt-4 space-y-2'>
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' className='gap-1.5 text-[13px]'>
          <Users className='text-muted-foreground h-3.5 w-3.5' />
          <span>Users</span>
        </Button>

        <Separator orientation='vertical' className='h-6' />

        <Button variant='outline' size='sm' className='gap-1 text-[13px]'>
          <Calendar className='text-muted-foreground h-3.5 w-3.5' />
          <span>Last seen</span>
          <span className='text-muted-foreground'>less than 30 days ago</span>
        </Button>

        <Button
          variant={showSearch ? 'default' : 'outline'}
          size='icon'
          className='h-8 w-8'
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className='h-3 w-3' />
        </Button>

        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8 border-dashed'
          onClick={() => toast.info('Advanced filters coming soon')}
        >
          <Plus className='h-3 w-3' />
        </Button>
      </div>

      {showSearch && (
        <div className='flex items-center gap-2'>
          <Search className='text-muted-foreground h-3.5 w-3.5' />
          <Input
            type='text'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className='h-8 w-64 text-sm'
            placeholder='Search contacts by name...'
            aria-label='Search contacts'
            autoFocus
          />
          {search && (
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              onClick={() => onSearchChange('')}
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>
      )}

      <button
        className='text-primary hover:text-primary/80 flex items-center gap-1 text-[13px]'
        onClick={() => toast.info('Advanced filters coming soon')}
      >
        <Plus className='h-3 w-3' />
        <span>Add filter</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toolbar                                                             */
/* ------------------------------------------------------------------ */

export function Toolbar({
  userCount,
  selectedIds,
  onNewMessage,
  onAddTag,
  onBulkDelete,
  loading
}: {
  userCount: number;
  selectedIds: string[];
  onNewMessage: () => void;
  onAddTag: () => void;
  onBulkDelete: () => void;
  loading: boolean;
}) {
  const [viewMode, setViewMode] = useState<'list' | 'globe'>('list');
  const hasSelection = selectedIds.length > 0;

  return (
    <div className='mx-6 mt-4 flex items-center gap-2'>
      <h2 className='text-sm font-semibold'>
        {loading ? (
          <Loader2 className='text-muted-foreground inline h-3.5 w-3.5 animate-spin' />
        ) : (
          <>
            {userCount} contact{userCount !== 1 ? 's' : ''}
            {hasSelection && (
              <span className='text-primary ml-2'>
                ({selectedIds.length} selected)
              </span>
            )}
          </>
        )}
      </h2>

      <Button
        variant='outline'
        size='sm'
        className='ml-2 gap-1.5 text-[13px]'
        onClick={onNewMessage}
      >
        <Send className='h-3.5 w-3.5' />
        New message
      </Button>
      <Button
        variant='outline'
        size='sm'
        className='gap-1.5 text-[13px]'
        disabled={!hasSelection}
        onClick={onAddTag}
      >
        <Tag className='h-3.5 w-3.5' />
        Add tag
      </Button>

      {/* More menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='gap-1.5 text-[13px]'>
            More
            <ChevronDown className='h-3 w-3' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem
            onClick={onBulkDelete}
            disabled={!hasSelection}
            className='text-destructive focus:text-destructive'
          >
            <Trash className='mr-2 h-3.5 w-3.5' />
            Delete selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className='flex-1' />

      <Button variant='outline' size='sm' className='gap-1'>
        <Columns3 className='h-3.5 w-3.5' />
        <ChevronDown className='h-3 w-3' />
      </Button>

      <div className='flex overflow-hidden rounded-md border'>
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            'px-2 py-1 transition-colors',
            viewMode === 'list'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <List className='h-3.5 w-3.5' />
        </button>
        <button
          onClick={() => setViewMode('globe')}
          className={cn(
            'px-2 py-1 transition-colors',
            viewMode === 'globe'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Globe className='h-3.5 w-3.5' />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Users Table                                                         */
/* ------------------------------------------------------------------ */

export function UsersTable({
  users,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onRowClick,
  activeRowId,
  loading
}: {
  users: Contact[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onRowClick: (id: string) => void;
  activeRowId: string | null;
  loading: boolean;
}) {
  const allSelected = users.length > 0 && selectedIds.length === users.length;

  if (loading) {
    return (
      <div className='mx-6 mt-6 flex items-center justify-center py-20'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
          <p className='text-muted-foreground text-sm'>Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className='mx-6 mt-6 flex items-center justify-center py-20'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <Users className='text-muted-foreground/40 h-12 w-12' />
          <p className='text-muted-foreground text-sm font-medium'>
            No contacts yet
          </p>
          <p className='text-muted-foreground text-[13px]'>
            Create your first contact using the button above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-6 mt-3 overflow-x-auto rounded-md border'>
      <table className='w-full text-[13px]'>
        <thead>
          <tr className='bg-muted/50 border-b'>
            <th className='w-10 px-3 py-2'>
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
              />
            </th>
            <th className='text-muted-foreground px-3 py-2 text-left font-medium'>
              <div className='flex items-center gap-1.5'>
                <Users className='h-3.5 w-3.5' />
                <span>Name</span>
              </div>
            </th>
            <th className='text-muted-foreground w-10 px-2 py-2 text-left font-medium' />
            <th className='text-muted-foreground px-3 py-2 text-left font-medium'>
              <div className='flex items-center gap-1.5'>
                <Mail className='h-3.5 w-3.5' />
                <span>Email</span>
              </div>
            </th>
            <th className='text-muted-foreground px-3 py-2 text-left font-medium'>
              <div className='flex items-center gap-1.5'>
                <Calendar className='h-3.5 w-3.5' />
                <span>Last seen</span>
              </div>
            </th>
            <th className='text-muted-foreground px-3 py-2 text-left font-medium'>
              <div className='flex items-center gap-1.5'>
                <User className='h-3.5 w-3.5' />
                <span>Type</span>
              </div>
            </th>
            <th className='text-muted-foreground px-3 py-2 text-left font-medium'>
              <div className='flex items-center gap-1.5'>
                <Calendar className='h-3.5 w-3.5' />
                <span>First seen</span>
              </div>
            </th>
            <th className='text-muted-foreground px-3 py-2 text-left font-medium'>
              <div className='flex items-center gap-1.5'>
                <Monitor className='h-3.5 w-3.5' />
                <span>Web sessions</span>
              </div>
            </th>
            <th className='text-muted-foreground px-3 py-2 text-left font-medium'>
              <div className='flex items-center gap-1.5'>
                <Building className='h-3.5 w-3.5' />
                <span>City</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelected = selectedIds.includes(user.$id);
            const isActive = activeRowId === user.$id;
            return (
              <tr
                key={user.$id}
                onClick={() => onRowClick(user.$id)}
                className={cn(
                  'cursor-pointer border-b transition-colors last:border-b-0',
                  isActive
                    ? 'bg-accent'
                    : isSelected
                      ? 'bg-accent/50'
                      : 'hover:bg-muted/50'
                )}
              >
                <td className='px-3 py-2.5'>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(user.$id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className='px-3 py-2.5'>
                  <div className='flex items-center gap-2.5'>
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                        user.avatarColor || 'bg-blue-500'
                      )}
                    >
                      {getInitial(user.name)}
                    </div>
                    <div className='min-w-0'>
                      <span className='font-medium hover:underline'>
                        {user.name}
                      </span>
                      {user.company && (
                        <>
                          <span className='text-muted-foreground ml-1.5'>
                            at
                          </span>
                          <span className='text-muted-foreground ml-1.5 hover:underline'>
                            <Building className='mr-0.5 inline h-3 w-3' />
                            {user.company}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className='px-2 py-2.5'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(user.$id);
                    }}
                  >
                    <MessageSquare className='h-3.5 w-3.5' />
                  </Button>
                </td>
                <td className='text-muted-foreground px-3 py-2.5'>
                  {user.email || '—'}
                </td>
                <td className='text-muted-foreground px-3 py-2.5'>
                  {timeAgo(user.lastSeenAt)}
                </td>
                <td className='px-3 py-2.5'>
                  <Badge
                    variant={user.type === 'lead' ? 'outline' : 'secondary'}
                    className='text-[11px]'
                  >
                    {user.type === 'lead' ? 'Lead' : 'User'}
                  </Badge>
                </td>
                <td className='text-muted-foreground px-3 py-2.5'>
                  {timeAgo(user.firstSeenAt)}
                </td>
                <td className='text-muted-foreground px-3 py-2.5'>
                  {user.webSessions ?? 0}
                </td>
                <td className='text-muted-foreground px-3 py-2.5'>
                  {user.city || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
