'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  AlertTriangle,
  AlertCircle,
  CircleCheck,
  Loader2,
  Trash,
  Send,
  FileIcon,
  Upload,
  Pencil,
  Check,
  X,
  Calendar,
  GitGraph,
  MessageSquare,
  Paperclip,
  Link,
  User,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import type {
  Case,
  CaseType,
  CaseStatus,
  CasePriority,
  CaseNote,
  CaseTimelineEvent,
  CaseDocument
} from '@/types/appwrite';
import {
  getCase,
  updateCase,
  deleteCase,
  addCaseNote,
  listCaseNotes,
  listCaseTimeline,
  listCaseDocuments,
  deleteCaseDocument
} from '@/features/cases/actions/case-crud';

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; color: string; bg: string }
> = {
  open: {
    label: 'Open',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  awaiting_customer: {
    label: 'Awaiting Customer',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  },
  awaiting_internal: {
    label: 'Awaiting Internal',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Timeline Event Icons ─────────────────────────────────────────────────────

function getTimelineIcon(eventType: string) {
  switch (eventType) {
    case 'created':
      return <AlertCircle className='h-3.5 w-3.5 text-blue-500' />;
    case 'status_changed':
      return <ArrowRight className='h-3.5 w-3.5 text-yellow-500' />;
    case 'priority_changed':
      return <ArrowUp className='h-3.5 w-3.5 text-orange-500' />;
    case 'assigned':
      return <User className='h-3.5 w-3.5 text-purple-500' />;
    case 'note_added':
      return <MessageSquare className='h-3.5 w-3.5 text-sky-500' />;
    case 'document_added':
      return <Paperclip className='h-3.5 w-3.5 text-green-500' />;
    case 'document_removed':
      return <Trash className='h-3.5 w-3.5 text-red-500' />;
    case 'linked_conversation':
      return <Link className='h-3.5 w-3.5 text-indigo-500' />;
    case 'resolved':
      return <CircleCheck className='h-3.5 w-3.5 text-green-500' />;
    case 'reopened':
      return <AlertCircle className='h-3.5 w-3.5 text-orange-500' />;
    default:
      return <GitGraph className='h-3.5 w-3.5 text-muted-foreground' />;
  }
}

// ── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({ caseId }: { caseId: string }) {
  const [events, setEvents] = useState<CaseTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCaseTimeline(caseId).then((res) => {
      if (res.success) setEvents(res.data ?? []);
      setLoading(false);
    });
  }, [caseId]);

  if (loading)
    return (
      <div className='flex justify-center py-10'>
        <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    );

  if (events.length === 0)
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        No timeline events yet.
      </p>
    );

  return (
    <div className='relative ml-4 border-l pl-6 space-y-6 py-2'>
      {events.map((ev) => (
        <div key={ev.$id} className='relative'>
          {/* Dot on the line */}
          <div className='absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-background'>
            {getTimelineIcon(ev.eventType)}
          </div>

          <div>
            <p className='text-sm'>{ev.description}</p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {ev.actorName} &middot; {formatDateTime(ev.$createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Notes Tab ────────────────────────────────────────────────────────────────

function NotesTab({
  caseId,
  onNoteAdded
}: {
  caseId: string;
  onNoteAdded: () => void;
}) {
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [sending, setSending] = useState(false);

  const loadNotes = useCallback(() => {
    setLoading(true);
    listCaseNotes(caseId).then((res) => {
      if (res.success) setNotes(res.data ?? []);
      setLoading(false);
    });
  }, [caseId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSending(true);
    const res = await addCaseNote(caseId, newNote.trim());
    setSending(false);
    if (res.success) {
      setNewNote('');
      loadNotes();
      onNoteAdded();
      toast.success('Note added');
    } else {
      toast.error(res.error ?? 'Failed to add note');
    }
  };

  return (
    <div className='flex h-full flex-col'>
      {/* Note list */}
      <div className='flex-1 space-y-4 py-2'>
        {loading ? (
          <div className='flex justify-center py-10'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : notes.length === 0 ? (
          <p className='py-10 text-center text-sm text-muted-foreground'>
            No internal notes yet.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.$id}
              className='rounded-lg border bg-muted/30 p-3'
            >
              <p className='text-sm whitespace-pre-wrap'>{note.content}</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                {note.authorName} &middot; {formatDateTime(note.$createdAt)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add note input */}
      <div className='border-t pt-3'>
        <div className='flex gap-2'>
          <Textarea
            placeholder='Write an internal note...'
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={2}
            className='flex-1 resize-none'
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddNote();
              }
            }}
          />
          <Button
            size='icon'
            className='shrink-0 self-end'
            disabled={sending || !newNote.trim()}
            onClick={handleAddNote}
          >
            {sending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </div>
        <p className='mt-1 text-xs text-muted-foreground'>
          Press Ctrl+Enter to send
        </p>
      </div>
    </div>
  );
}

// ── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({
  caseId,
  onDocumentChanged
}: {
  caseId: string;
  onDocumentChanged: () => void;
}) {
  const [docs, setDocs] = useState<CaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDocs = useCallback(() => {
    setLoading(true);
    listCaseDocuments(caseId).then((res) => {
      if (res.success) setDocs(res.data ?? []);
      setLoading(false);
    });
  }, [caseId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to Appwrite Storage via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);

      const res = await fetch('/api/cases/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Document uploaded');
        loadDocs();
        onDocumentChanged();
      } else {
        toast.error(data.error ?? 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string) => {
    const res = await deleteCaseDocument(docId);
    if (res.success) {
      toast.success('Document deleted');
      loadDocs();
      onDocumentChanged();
    } else {
      toast.error(res.error ?? 'Failed to delete');
    }
  };

  return (
    <div className='space-y-4 py-2'>
      {/* Upload button */}
      <div>
        <input
          ref={fileRef}
          type='file'
          className='hidden'
          onChange={handleUpload}
          accept='.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv,.xlsx'
        />
        <Button
          variant='outline'
          size='sm'
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Upload className='mr-2 h-4 w-4' />
          )}
          Upload Document
        </Button>
      </div>

      {/* Document list */}
      {loading ? (
        <div className='flex justify-center py-10'>
          <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      ) : docs.length === 0 ? (
        <p className='py-10 text-center text-sm text-muted-foreground'>
          No documents attached.
        </p>
      ) : (
        <div className='space-y-2'>
          {docs.map((doc) => (
            <div
              key={doc.$id}
              className='flex items-center gap-3 rounded-lg border px-3 py-2'
            >
              <FileIcon className='h-5 w-5 shrink-0 text-muted-foreground' />
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{doc.fileName}</p>
                <p className='text-xs text-muted-foreground'>
                  {formatFileSize(doc.fileSize)} &middot;{' '}
                  {formatDate(doc.$createdAt)}
                </p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 shrink-0 text-destructive hover:text-destructive'
                onClick={() => handleDelete(doc.$id)}
              >
                <Trash className='h-3.5 w-3.5' />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function CaseDetailClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Editable fields
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const loadCase = useCallback(async () => {
    const res = await getCase(caseId);
    if (res.success && res.data) {
      setCaseData(res.data);
    } else {
      toast.error('Case not found');
      router.push('/dashboard/cases');
    }
    setLoading(false);
  }, [caseId, router]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  // Populate edit fields when entering edit mode
  const startEditing = () => {
    if (!caseData) return;
    setEditSubject(caseData.subject);
    setEditDescription(caseData.description ?? '');
    setEditAssignedTo(caseData.assignedTo ?? '');
    setEditDueDate(caseData.dueDate ? caseData.dueDate.substring(0, 10) : '');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const saveEdits = async () => {
    if (!caseData) return;
    setSaving(true);
    const res = await updateCase(caseData.$id, {
      subject: editSubject.trim() || undefined,
      description: editDescription.trim(),
      assignedTo: editAssignedTo.trim() || undefined,
      dueDate: editDueDate || undefined
    });
    setSaving(false);
    if (res.success) {
      toast.success('Case updated');
      setEditing(false);
      loadCase();
    } else {
      toast.error(res.error ?? 'Failed to update');
    }
  };

  const handleStatusChange = async (status: CaseStatus) => {
    if (!caseData) return;
    const res = await updateCase(caseData.$id, { status });
    if (res.success) {
      toast.success(`Status changed to ${STATUS_CONFIG[status].label}`);
      loadCase();
    } else {
      toast.error(res.error ?? 'Failed to update status');
    }
  };

  const handlePriorityChange = async (priority: CasePriority) => {
    if (!caseData) return;
    const res = await updateCase(caseData.$id, { priority });
    if (res.success) {
      toast.success(`Priority changed to ${PRIORITY_CONFIG[priority].label}`);
      loadCase();
    } else {
      toast.error(res.error ?? 'Failed to update priority');
    }
  };

  const handleTypeChange = async (type: CaseType) => {
    if (!caseData) return;
    const res = await updateCase(caseData.$id, { type });
    if (res.success) {
      toast.success(`Type changed to ${TYPE_LABELS[type]}`);
      loadCase();
    } else {
      toast.error(res.error ?? 'Failed to update type');
    }
  };

  const handleDelete = async () => {
    if (!caseData) return;
    const res = await deleteCase(caseData.$id);
    if (res.success) {
      toast.success('Case deleted');
      router.push('/dashboard/cases');
    } else {
      toast.error(res.error ?? 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!caseData) return null;

  const statusCfg = STATUS_CONFIG[caseData.status];
  const priorityCfg = PRIORITY_CONFIG[caseData.priority];
  const PriorityIcon = priorityCfg.icon;

  return (
    <div className='flex h-full flex-col'>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div className='flex items-center gap-3 border-b px-6 py-3'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={() => router.push('/dashboard/cases')}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <span className='text-sm text-muted-foreground'>Cases</span>
        <ChevronRight className='h-3.5 w-3.5 text-muted-foreground' />
        <span className='truncate text-sm font-medium'>
          {caseData.subject}
        </span>

        <div className='ml-auto flex items-center gap-2'>
          {editing ? (
            <>
              <Button
                variant='ghost'
                size='sm'
                onClick={cancelEditing}
              >
                <X className='mr-1 h-3.5 w-3.5' />
                Cancel
              </Button>
              <Button size='sm' onClick={saveEdits} disabled={saving}>
                {saving ? (
                  <Loader2 className='mr-1 h-3.5 w-3.5 animate-spin' />
                ) : (
                  <Check className='mr-1 h-3.5 w-3.5' />
                )}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' size='sm' onClick={startEditing}>
                <Pencil className='mr-1 h-3.5 w-3.5' />
                Edit
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='text-destructive hover:text-destructive'
                onClick={() => setDeleteOpen(true)}
              >
                <Trash className='mr-1 h-3.5 w-3.5' />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left: Main content */}
        <div className='flex-1 overflow-y-auto'>
          <div className='p-6'>
            {/* Subject + Description */}
            <div className='space-y-4'>
              {editing ? (
                <>
                  <div className='space-y-2'>
                    <Label>Subject</Label>
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Description</Label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Assigned To</Label>
                      <Input
                        value={editAssignedTo}
                        onChange={(e) => setEditAssignedTo(e.target.value)}
                        placeholder='Name or email'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Due Date</Label>
                      <Input
                        type='date'
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h1 className='text-xl font-semibold'>
                    {caseData.subject}
                  </h1>
                  {caseData.description && (
                    <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                      {caseData.description}
                    </p>
                  )}
                </>
              )}
            </div>

            <Separator className='my-6' />

            {/* Tabs: Timeline / Notes / Documents */}
            <Tabs defaultValue='timeline'>
              <TabsList>
                <TabsTrigger value='timeline'>
                  <GitGraph className='mr-1.5 h-3.5 w-3.5' />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value='notes'>
                  <MessageSquare className='mr-1.5 h-3.5 w-3.5' />
                  Notes
                </TabsTrigger>
                <TabsTrigger value='documents'>
                  <Paperclip className='mr-1.5 h-3.5 w-3.5' />
                  Documents
                </TabsTrigger>
              </TabsList>

              <div className='mt-4'>
                <TabsContent value='timeline'>
                  <TimelineTab caseId={caseId} />
                </TabsContent>

                <TabsContent value='notes'>
                  <NotesTab caseId={caseId} onNoteAdded={loadCase} />
                </TabsContent>

                <TabsContent value='documents'>
                  <DocumentsTab
                    caseId={caseId}
                    onDocumentChanged={loadCase}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Right: Sidebar with metadata */}
        <div className='w-[280px] shrink-0 border-l bg-muted/20 overflow-y-auto'>
          <div className='space-y-5 p-5'>
            {/* Status */}
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                Status
              </Label>
              <Select
                value={caseData.status}
                onValueChange={(v) => handleStatusChange(v as CaseStatus)}
              >
                <SelectTrigger className='h-8'>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='secondary'
                      className={cn('text-[10px] px-1.5 py-0', statusCfg.bg)}
                    >
                      {statusCfg.label}
                    </Badge>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                Priority
              </Label>
              <Select
                value={caseData.priority}
                onValueChange={(v) =>
                  handlePriorityChange(v as CasePriority)
                }
              >
                <SelectTrigger className='h-8'>
                  <div className='flex items-center gap-2'>
                    <PriorityIcon
                      className={cn('h-3.5 w-3.5', priorityCfg.color)}
                    />
                    <span className={priorityCfg.color}>
                      {priorityCfg.label}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <div className='flex items-center gap-2'>
                        <cfg.icon className={cn('h-3.5 w-3.5', cfg.color)} />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                Type
              </Label>
              <Select
                value={caseData.type}
                onValueChange={(v) => handleTypeChange(v as CaseType)}
              >
                <SelectTrigger className='h-8'>
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

            <Separator />

            {/* Assigned To */}
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                Assigned To
              </Label>
              <p className='text-sm'>
                {caseData.assignedTo || (
                  <span className='text-muted-foreground'>Unassigned</span>
                )}
              </p>
            </div>

            {/* Contact */}
            {caseData.contactId && (
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                  Linked Contact
                </Label>
                <Button
                  variant='link'
                  size='sm'
                  className='h-auto p-0 text-sm'
                  onClick={() =>
                    router.push(`/dashboard/contacts?id=${caseData.contactId}`)
                  }
                >
                  View Contact →
                </Button>
              </div>
            )}

            {/* Conversation */}
            {caseData.conversationId && (
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                  Linked Conversation
                </Label>
                <Button
                  variant='link'
                  size='sm'
                  className='h-auto p-0 text-sm'
                  onClick={() =>
                    router.push(
                      `/dashboard/inbox?conv=${caseData.conversationId}`
                    )
                  }
                >
                  View Conversation →
                </Button>
              </div>
            )}

            <Separator />

            {/* Dates */}
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                Created
              </Label>
              <p className='text-sm'>
                {formatDateTime(caseData.$createdAt)}
              </p>
            </div>

            {caseData.dueDate && (
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                  Due Date
                </Label>
                <div className='flex items-center gap-1.5 text-sm'>
                  <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
                  {formatDate(caseData.dueDate)}
                </div>
              </div>
            )}

            {caseData.resolvedAt && (
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                  Resolved
                </Label>
                <p className='text-sm'>
                  {formatDateTime(caseData.resolvedAt)}
                </p>
              </div>
            )}

            {/* Tags */}
            {caseData.tags && caseData.tags !== '[]' && (
              <>
                <Separator />
                <div className='space-y-1.5'>
                  <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                    Tags
                  </Label>
                  <div className='flex flex-wrap gap-1'>
                    {(() => {
                      try {
                        const tags = JSON.parse(caseData.tags) as string[];
                        return tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant='secondary'
                            className='text-xs'
                          >
                            {tag}
                          </Badge>
                        ));
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation ──────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Delete Case</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-muted-foreground'>
            This will permanently delete this case and all associated notes,
            documents, and timeline events. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
