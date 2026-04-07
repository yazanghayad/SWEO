'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  BookOpen,
  Lock,
  StickyNote,
  Globe,
  Ellipsis,
  Plus,
  Search,
  ChevronDown,
  User,
  Loader2,
  Upload,
  Link,
  FileText,
  FileIcon,
  Trash,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PreviewChatPanel } from '@/components/preview-chat-panel';
import { useTenant } from '@/hooks/use-tenant';
import {
  listSourcesAction,
  deleteSourceAction
} from '@/features/knowledge/actions/list-sources';
import { uploadFileAction } from '@/features/knowledge/actions/upload-file';
import { ingestUrlAction } from '@/features/knowledge/actions/ingest-url';
import { createManualSourceAction } from '@/features/knowledge/actions/manual-source';
import type { KnowledgeSource } from '@/types/appwrite';

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

function parseMeta(source: KnowledgeSource): Record<string, unknown> {
  if (typeof source.metadata === 'string') {
    try {
      return JSON.parse(source.metadata);
    } catch {
      return {};
    }
  }
  return (source.metadata as Record<string, unknown>) ?? {};
}

function sourceLabel(source: KnowledgeSource): string {
  const meta = parseMeta(source);
  if (source.type === 'file')
    return (meta.fileName as string) ?? 'Uploaded file';
  if (source.type === 'url')
    return source.url ?? (meta.originalUrl as string) ?? 'URL source';
  return (meta.title as string) ?? 'Manual entry';
}

function sourceTypeLabel(source: KnowledgeSource): string {
  if (source.type === 'file') return 'Document';
  if (source.type === 'url') return 'Website';
  return 'Article';
}

/* ------------------------------------------------------------------ */
/*  Add content card                                                   */
/* ------------------------------------------------------------------ */

function AddContentCard({
  icon,
  title,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className='border-border hover:shadow-sm flex flex-1 cursor-pointer flex-col rounded-lg border p-4 transition-shadow'
    >
      <div className='bg-muted border-border flex h-8 w-8 items-center justify-center rounded-lg border'>
        {icon}
      </div>
      <h4 className='mt-3 text-sm font-semibold'>{title}</h4>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Status dot                                                         */
/* ------------------------------------------------------------------ */

function StatusDot({ status }: { status: KnowledgeSource['status'] }) {
  if (status === 'ready') {
    return (
      <div className='flex items-center gap-2'>
        <div className='h-4 w-4 shrink-0 rounded-full border-4 border-green-200 bg-green-500 dark:border-green-900' />
        <span className='text-sm leading-5'>Live</span>
      </div>
    );
  }
  if (status === 'processing') {
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='h-4 w-4 animate-spin text-yellow-500' />
        <span className='text-muted-foreground text-sm leading-5'>
          Processing
        </span>
      </div>
    );
  }
  return (
    <div className='flex items-center gap-2'>
      <div className='bg-destructive h-4 w-4 shrink-0 rounded-full border-4 border-red-200 dark:border-red-900' />
      <span className='text-muted-foreground text-sm leading-5'>Failed</span>
    </div>
  );
}

function AiAgentDot({ status }: { status: KnowledgeSource['status'] }) {
  if (status === 'ready') {
    return (
      <div className='flex items-center gap-2'>
        <div className='h-4 w-4 shrink-0 rounded-full border-4 border-green-200 bg-green-500 dark:border-green-900' />
        <span className='text-sm leading-5'>Used by AI</span>
      </div>
    );
  }
  return (
    <div className='flex items-center gap-2'>
      <svg
        className='text-muted-foreground/50 h-4 w-4'
        viewBox='0 0 16 16'
        xmlns='http://www.w3.org/2000/svg'
        fill='currentColor'
      >
        <rect x='1' y='1' width='14' height='14' rx='7' />
      </svg>
      <span className='text-muted-foreground text-sm leading-5'>—</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialogs                                                            */
/* ------------------------------------------------------------------ */

function AddArticleDialog({
  open,
  onOpenChange,
  tenantId,
  onSuccess,
  variant = 'public'
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantId: string;
  onSuccess: () => void;
  variant?: 'public' | 'internal';
}) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const result = await createManualSourceAction(
        tenantId,
        title.trim(),
        content.trim()
      );
      if (result.success) {
        toast.success(`"${title}" created`);
        setTitle('');
        setContent('');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error ?? 'Failed to create article');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {variant === 'public' ? 'Public article' : 'Internal article'}
          </DialogTitle>
          <DialogDescription>
            {variant === 'public'
              ? 'Add a public article that customers and AI can access.'
              : 'Add an internal article only visible to your team.'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='article-title'>Title</Label>
            <Input
              id='article-title'
              placeholder='e.g. How to reset your password'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='article-content'>Content</Label>
            <Textarea
              id='article-content'
              placeholder='Write or paste your article content here...'
              className='min-h-[200px]'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
          >
            {saving ? (
              <>
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                Saving...
              </>
            ) : (
              'Add article'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSnippetDialog({
  open,
  onOpenChange,
  tenantId,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantId: string;
  onSuccess: () => void;
}) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const result = await createManualSourceAction(
        tenantId,
        title.trim(),
        content.trim()
      );
      if (result.success) {
        toast.success(`Snippet "${title}" created`);
        setTitle('');
        setContent('');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error ?? 'Failed to create snippet');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Add snippet</DialogTitle>
          <DialogDescription>
            Snippets are short pieces of content the AI agent can use to answer
            questions.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='snippet-title'>Title</Label>
            <Input
              id='snippet-title'
              placeholder='e.g. Return policy'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='snippet-content'>Content</Label>
            <Textarea
              id='snippet-content'
              placeholder='Write or paste your snippet here...'
              className='min-h-[160px]'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
          >
            {saving ? (
              <>
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                Saving...
              </>
            ) : (
              'Add snippet'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddUrlDialog({
  open,
  onOpenChange,
  tenantId,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantId: string;
  onSuccess: () => void;
}) {
  const [url, setUrl] = React.useState('');
  const [ingesting, setIngesting] = React.useState(false);

  async function handleIngest() {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    setIngesting(true);
    try {
      const result = await ingestUrlAction(tenantId, url.trim());
      if (result.success) {
        toast.success('Website sync started');
        setUrl('');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error ?? 'URL ingestion failed');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIngesting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Sync website</DialogTitle>
          <DialogDescription>
            Enter a public URL to crawl and index for AI knowledge retrieval.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='website-url'>URL</Label>
            <Input
              id='website-url'
              type='url'
              placeholder='https://example.com/docs'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={ingesting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={ingesting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleIngest}
            disabled={ingesting || !url.trim()}
          >
            {ingesting ? (
              <>
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                Syncing...
              </>
            ) : (
              <>
                <Link className='mr-1.5 h-3.5 w-3.5' />
                Sync
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadFileDialog({
  open,
  onOpenChange,
  tenantId,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantId: string;
  onSuccess: () => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadFileAction(tenantId, formData);
      if (result.success) {
        toast.success(`"${file.name}" uploaded`);
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error ?? 'Upload failed');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            Upload a file (PDF, DOCX, TXT, MD, CSV) to add to your knowledge
            base.
          </DialogDescription>
        </DialogHeader>
        <div className='py-2'>
          <div
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-muted-foreground/25 hover:border-muted-foreground/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
              dragActive && 'border-primary bg-primary/5',
              uploading && 'pointer-events-none opacity-60'
            )}
          >
            {uploading ? (
              <Loader2 className='text-muted-foreground mb-2 h-10 w-10 animate-spin' />
            ) : (
              <Upload className='text-muted-foreground mb-2 h-10 w-10' />
            )}
            <p className='text-muted-foreground text-sm'>
              {uploading
                ? 'Uploading...'
                : 'Drag & drop a file here, or click to browse'}
            </p>
            <p className='text-muted-foreground/70 mt-1 text-xs'>
              PDF, DOCX, TXT, MD, CSV (max 20 MB)
            </p>
            <input
              ref={fileInputRef}
              type='file'
              className='hidden'
              accept='.pdf,.docx,.txt,.md,.csv'
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={uploading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Content sources summary row helpers                                */
/* ------------------------------------------------------------------ */

interface ContentGroup {
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  sources: KnowledgeSource[];
  liveCount: number;
}

function groupSources(sources: KnowledgeSource[]): ContentGroup[] {
  const manual = sources.filter((s) => s.type === 'manual');
  const url = sources.filter((s) => s.type === 'url');
  const file = sources.filter((s) => s.type === 'file');

  const groups: ContentGroup[] = [];

  if (manual.length > 0 || url.length === 0) {
    groups.push({
      icon: (
        <svg
          className='text-muted-foreground h-4 w-4'
          viewBox='0 0 16 16'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M3.01006 12.5L1.57006 15H14.4301L12.9901 12.5H3.01006ZM3.01006 8.5L1.57006 11H14.4301L12.9901 8.5H3.01006ZM11.5401 2H4.45006L1.56006 7H14.4201L11.5301 2H11.5401Z' />
        </svg>
      ),
      label: 'Articles',
      subLabel: 'Snippets, public, internal, docs',
      sources: manual,
      liveCount: manual.filter((s) => s.status === 'ready').length
    });
  }

  if (url.length > 0) {
    groups.push({
      icon: <Globe className='text-muted-foreground h-4 w-4' />,
      label: 'Websites',
      subLabel: 'Synced URLs',
      sources: url,
      liveCount: url.filter((s) => s.status === 'ready').length
    });
  }

  if (file.length > 0) {
    groups.push({
      icon: <FileIcon className='text-muted-foreground h-4 w-4' />,
      label: 'Documents',
      subLabel: 'Uploaded files',
      sources: file,
      liveCount: file.filter((s) => s.status === 'ready').length
    });
  }

  return groups;
}

/* ------------------------------------------------------------------ */
/*  Main Content Page Component                                        */
/* ------------------------------------------------------------------ */

export default function ContentPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const tenantId = tenant?.$id ?? '';

  const [sources, setSources] = React.useState<KnowledgeSource[]>([]);
  const [loadingSources, setLoadingSources] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [showPublicArticle, setShowPublicArticle] = React.useState(false);
  const [showInternalArticle, setShowInternalArticle] = React.useState(false);
  const [showSnippet, setShowSnippet] = React.useState(false);
  const [showWebsiteSync, setShowWebsiteSync] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);

  // Expanded group
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);

  // Load sources
  const loadSources = React.useCallback(async () => {
    if (!tenantId) return;
    setLoadingSources(true);
    try {
      const result = await listSourcesAction(tenantId);
      if (result.success && result.data) {
        setSources(result.data);
      }
    } catch {
      toast.error('Failed to load content');
    } finally {
      setLoadingSources(false);
    }
  }, [tenantId]);

  React.useEffect(() => {
    loadSources();
  }, [loadSources]);

  // Auto-refresh while processing
  React.useEffect(() => {
    const hasProcessing = sources.some((s) => s.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(loadSources, 5000);
    return () => clearInterval(interval);
  }, [sources, loadSources]);

  // Delete handler
  async function handleDelete(sourceId: string) {
    try {
      const result = await deleteSourceAction(sourceId, tenantId);
      if (result.success) {
        setSources((prev) => prev.filter((s) => s.$id !== sourceId));
        toast.success('Content deleted');
      } else {
        toast.error(result.error ?? 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  }

  // Filter by search
  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return sources;
    const q = searchQuery.toLowerCase();
    return sources.filter((s) => {
      const label = sourceLabel(s).toLowerCase();
      return label.includes(q);
    });
  }, [sources, searchQuery]);

  // Sort
  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const labelA = sourceLabel(a).toLowerCase();
      const labelB = sourceLabel(b).toLowerCase();
      return sortDir === 'asc'
        ? labelA.localeCompare(labelB)
        : labelB.localeCompare(labelA);
    });
  }, [filtered, sortDir]);

  const groups = groupSources(sorted);

  if (tenantLoading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex h-full flex-1 overflow-hidden'>
      {/* Main content area */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <div className='border-b'>
          <div className='flex items-center justify-between px-6 py-4'>
            <h1 className='font-serif text-xl font-light tracking-tight'>Content</h1>
            <div className='flex items-center gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <BookOpen className='mr-1.5 h-3.5 w-3.5' />
                    Learn
                    <ChevronDown className='ml-1 h-3 w-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => window.location.href = '/docs'}>
                    Getting started with content
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard/guidance'}>
                    Best practices for AI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/docs'}>
                    Content guidelines
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filters row */}
          <div className='flex items-center justify-between px-6 pb-4'>
            <div className='flex items-center gap-2'>
              {/* Search */}
              <div className='relative'>
                <Search className='text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2' />
                <Input
                  placeholder='Search...'
                  className='h-8 w-64 pl-8 text-sm'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Audience */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <User className='mr-1.5 h-3.5 w-3.5' />
                    Audience
                    <ChevronDown className='ml-1 h-3 w-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  <DropdownMenuItem>All users</DropdownMenuItem>
                  <DropdownMenuItem>Customers</DropdownMenuItem>
                  <DropdownMenuItem>Internal</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filters */}
              <Button variant='ghost' size='sm'>
                <Plus className='mr-1 h-3.5 w-3.5' />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto px-6 pt-6 pb-4'>
          {/* Add content section */}
          <div className='mb-12'>
            <h3 className='mb-3 text-base font-semibold'>Add content</h3>
            <div className='flex gap-4'>
              <AddContentCard
                icon={
                  <BookOpen className='h-4 w-4' />
                }
                title='Public article'
                onClick={() => setShowPublicArticle(true)}
              />
              <AddContentCard
                icon={
                  <Lock className='h-4 w-4' />
                }
                title='Internal article'
                onClick={() => setShowInternalArticle(true)}
              />
              <AddContentCard
                icon={
                  <StickyNote className='h-4 w-4' />
                }
                title='Snippet'
                onClick={() => setShowSnippet(true)}
              />
              <AddContentCard
                icon={
                  <Globe className='h-4 w-4' />
                }
                title='Website sync'
                onClick={() => setShowWebsiteSync(true)}
              />
              <AddContentCard
                icon={
                  <div className='flex items-center gap-1'>
                    <Upload className='h-3.5 w-3.5' />
                    <Ellipsis className='h-3.5 w-3.5' />
                  </div>
                }
                title='See all'
                onClick={() => setShowUpload(true)}
              />
            </div>
          </div>

          {/* Content sources table */}
          <div>
            <h3 className='mb-3 text-base font-semibold'>Content sources</h3>

            {loadingSources && sources.length === 0 ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
              </div>
            ) : sources.length === 0 ? (
              <div className='text-muted-foreground flex flex-col items-center justify-center py-12 text-center'>
                <FileText className='mb-3 h-10 w-10 opacity-40' />
                <p className='text-sm font-medium'>No content yet</p>
                <p className='mt-1 text-xs'>
                  Add content above to get started with your AI agent.
                </p>
              </div>
            ) : (
              <div className='overflow-hidden rounded-lg border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-6' />
                      <TableHead
                        className='cursor-pointer select-none'
                        onClick={() =>
                          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                        }
                      >
                        <span className='flex items-center gap-1'>
                          Title
                          {sortDir === 'asc' ? (
                            <ArrowUp className='h-3 w-3' />
                          ) : (
                            <ArrowDown className='h-3 w-3' />
                          )}
                        </span>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI Agent</TableHead>
                      <TableHead className='w-10' />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <React.Fragment key={group.label}>
                        {/* Group header row */}
                        <TableRow
                          className='hover:bg-muted/50 cursor-pointer'
                          onClick={() =>
                            setExpandedGroup((prev) =>
                              prev === group.label ? null : group.label
                            )
                          }
                        >
                          <TableCell className='w-6 pr-0'>
                            <ChevronDown
                              className={cn(
                                'text-muted-foreground h-3.5 w-3.5 transition-transform',
                                expandedGroup === group.label && 'rotate-180'
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              {group.icon}
                              <span className='font-medium'>{group.label}</span>
                              <span className='text-muted-foreground'>
                                · {group.subLabel}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <div className='h-4 w-4 shrink-0 rounded-full border-4 border-green-200 bg-green-500 dark:border-green-900' />
                              <span className='text-sm'>
                                {group.liveCount} Live
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {group.liveCount > 0 ? (
                              <div className='flex items-center gap-2'>
                                <div className='h-4 w-4 shrink-0 rounded-full border-4 border-green-200 bg-green-500 dark:border-green-900' />
                                <span className='text-sm'>Active</span>
                              </div>
                            ) : (
                              <div className='flex items-center gap-2'>
                                <svg
                                  className='text-muted-foreground/50 h-4 w-4'
                                  viewBox='0 0 16 16'
                                  xmlns='http://www.w3.org/2000/svg'
                                  fill='currentColor'
                                >
                                  <rect
                                    x='1'
                                    y='1'
                                    width='14'
                                    height='14'
                                    rx='7'
                                  />
                                </svg>
                                <span className='text-muted-foreground text-sm'>
                                  —
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell />
                        </TableRow>

                        {/* Expanded individual sources */}
                        {expandedGroup === group.label &&
                          group.sources.map((source) => (
                            <TableRow
                              key={source.$id}
                              className='bg-muted/30'
                            >
                              <TableCell />
                              <TableCell>
                                <div className='flex items-center gap-2 pl-4'>
                                  <FileText className='text-muted-foreground h-4 w-4' />
                                  <span className='text-sm'>
                                    {sourceLabel(source)}
                                  </span>
                                  <Badge
                                    variant='outline'
                                    className='text-[10px]'
                                  >
                                    {sourceTypeLabel(source)}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusDot status={source.status} />
                              </TableCell>
                              <TableCell>
                                <AiAgentDot status={source.status} />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(source.$id);
                                  }}
                                >
                                  <Trash className='h-3.5 w-3.5' />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right preview panel – interactive chat */}
      <PreviewChatPanel
        tenantId={tenantId}
        description='Ask a question to preview how SWEO responds with your current knowledge base.'
      />

      {/* Dialogs */}
      <AddArticleDialog
        open={showPublicArticle}
        onOpenChange={setShowPublicArticle}
        tenantId={tenantId}
        onSuccess={loadSources}
        variant='public'
      />
      <AddArticleDialog
        open={showInternalArticle}
        onOpenChange={setShowInternalArticle}
        tenantId={tenantId}
        onSuccess={loadSources}
        variant='internal'
      />
      <AddSnippetDialog
        open={showSnippet}
        onOpenChange={setShowSnippet}
        tenantId={tenantId}
        onSuccess={loadSources}
      />
      <AddUrlDialog
        open={showWebsiteSync}
        onOpenChange={setShowWebsiteSync}
        tenantId={tenantId}
        onSuccess={loadSources}
      />
      <UploadFileDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        tenantId={tenantId}
        onSuccess={loadSources}
      />
    </div>
  );
}
