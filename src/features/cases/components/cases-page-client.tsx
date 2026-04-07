'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  ChevronDown,
  Loader2,
  AlertCircle,
  Clock,
  CircleCheck,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  AlertTriangle,
  FileText,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
  Case,
  CaseType,
  CaseStatus,
  CasePriority
} from '@/types/appwrite';
import {
  listCases,
  createCase,
  deleteCase,
  getCaseCounts
} from '@/features/cases/actions/case-crud';

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
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

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; color: string; icon: typeof AlertCircle }
> = {
  open: {
    label: 'Open',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: AlertCircle
  },
  in_progress: {
    label: 'In Progress',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock
  },
  awaiting_customer: {
    label: 'Awaiting Customer',
    color:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    icon: Clock
  },
  awaiting_internal: {
    label: 'Awaiting Internal',
    color:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: Clock
  },
  resolved: {
    label: 'Resolved',
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CircleCheck
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    icon: CircleCheck
  }
};

const PRIORITY_CONFIG: Record<
  CasePriority,
  { label: string; color: string; icon: typeof ArrowUp }
> = {
  urgent: {
    label: 'Urgent',
    color: 'text-red-600 dark:text-red-400',
    icon: AlertTriangle
  },
  high: {
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    icon: ArrowUp
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-600 dark:text-yellow-400',
    icon: ArrowRight
  },
  low: {
    label: 'Low',
    color: 'text-muted-foreground',
    icon: ArrowDown
  }
};

const TYPE_LABELS: Record<CaseType, string> = {
  invoice_dispute: 'Invoice Dispute',
  complaint: 'Complaint',
  return: 'Return',
  warranty: 'Warranty',
  general: 'General'
};

// ── Create Case Modal ────────────────────────────────────────────────────────

function CreateCaseModal({
  open,
  onClose,
  onCreated,
  defaultConversationId
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultConversationId?: string | null;
}) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CaseType>('general');
  const [priority, setPriority] = useState<CasePriority>('medium');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setSaving(true);

    const result = await createCase({
      subject: subject.trim(),
      description: description.trim(),
      type,
      priority,
      conversationId: defaultConversationId ?? undefined
    });

    setSaving(false);
    if (result.success) {
      toast.success('Case created');
      setSubject('');
      setDescription('');
      setType('general');
      setPriority('medium');
      onClose();
      onCreated();
    } else {
      toast.error(result.error ?? 'Failed to create case');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create Case</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label>
              Subject <span className='text-destructive'>*</span>
            </Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='Brief description of the issue'
              required
              autoFocus
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as CaseType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as CasePriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className={cfg.color}>{cfg.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Detailed description of the case...'
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={saving || !subject.trim()}>
              {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Create Case
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function CasesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<
    CasePriority | 'all'
  >('all');

  // Auto-open create modal from inbox link (?create=true&conversationId=...)
  const shouldCreate = searchParams.get('create') === 'true';
  const conversationIdParam = searchParams.get('conversationId');
  const [createOpen, setCreateOpen] = useState(shouldCreate);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [casesResult, countsResult] = await Promise.all([
      listCases({
        status:
          statusFilter !== 'all' ? (statusFilter as CaseStatus) : undefined,
        type: typeFilter !== 'all' ? (typeFilter as CaseType) : undefined,
        priority:
          priorityFilter !== 'all'
            ? (priorityFilter as CasePriority)
            : undefined,
        search: search.trim() || undefined
      }),
      getCaseCounts()
    ]);

    if (casesResult.success) setCases(casesResult.data ?? []);
    if (countsResult.success) setCounts(countsResult.data ?? {});
    setLoading(false);
  }, [statusFilter, typeFilter, priorityFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (caseId: string) => {
    const result = await deleteCase(caseId);
    if (result.success) {
      toast.success('Case deleted');
      loadData();
    } else {
      toast.error(result.error ?? 'Failed to delete');
    }
  };

  // Active cases = not resolved/closed
  const activeCount =
    (counts.open ?? 0) +
    (counts.in_progress ?? 0) +
    (counts.awaiting_customer ?? 0) +
    (counts.awaiting_internal ?? 0);

  return (
    <div className='flex h-full flex-col'>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className='border-b px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='font-serif text-xl font-light tracking-tight'>Cases</h1>
            <p className='text-muted-foreground text-sm'>
              {activeCount} active &middot; {counts.resolved ?? 0} resolved
              &middot; {counts.all ?? 0} total
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Create Case
          </Button>
        </div>

        {/* ── Filters ────────────────────────────────────────── */}
        <div className='mt-4 flex items-center gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search cases...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9'
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as CaseStatus | 'all')
            }
          >
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as CaseType | 'all')}
          >
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(v) =>
              setPriorityFilter(v as CasePriority | 'all')
            }
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Priority' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Priorities</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Case List ──────────────────────────────────────── */}
      <ScrollArea className='flex-1'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
          </div>
        ) : cases.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <FileText className='text-muted-foreground mb-3 h-10 w-10' />
            <p className='text-muted-foreground text-sm'>No cases found</p>
            <Button
              variant='outline'
              size='sm'
              className='mt-3'
              onClick={() => setCreateOpen(true)}
            >
              <Plus className='mr-2 h-3.5 w-3.5' />
              Create your first case
            </Button>
          </div>
        ) : (
          <div className='divide-y'>
            {cases.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status];
              const priorityCfg = PRIORITY_CONFIG[c.priority];
              const PriorityIcon = priorityCfg.icon;

              return (
                <div
                  key={c.$id}
                  className='hover:bg-muted/50 flex cursor-pointer items-center gap-4 px-6 py-3 transition-colors'
                  onClick={() => router.push(`/dashboard/cases/${c.$id}`)}
                >
                  {/* Priority indicator */}
                  <div className={cn('shrink-0', priorityCfg.color)}>
                    <PriorityIcon className='h-4 w-4' />
                  </div>

                  {/* Main content */}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='truncate font-medium text-sm'>
                        {c.subject}
                      </span>
                      <Badge
                        variant='secondary'
                        className={cn(
                          'shrink-0 text-[10px] px-1.5 py-0',
                          statusCfg.color
                        )}
                      >
                        {statusCfg.label}
                      </Badge>
                    </div>
                    <div className='text-muted-foreground mt-0.5 flex items-center gap-2 text-xs'>
                      <span>{TYPE_LABELS[c.type]}</span>
                      <span>&middot;</span>
                      <span>{timeAgo(c.$createdAt)}</span>
                      {c.assignedTo && (
                        <>
                          <span>&middot;</span>
                          <span>Assigned: {c.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 shrink-0'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronDown className='h-3.5 w-3.5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/cases/${c.$id}`);
                        }}
                      >
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className='text-destructive'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c.$id);
                        }}
                      >
                        <Trash className='mr-2 h-3.5 w-3.5' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* ── Create Modal ──────────────────────────────────── */}
      <CreateCaseModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          // Clean up query params if opened from inbox
          if (shouldCreate) {
            router.replace('/dashboard/cases');
          }
        }}
        onCreated={loadData}
        defaultConversationId={conversationIdParam}
      />
    </div>
  );
}
