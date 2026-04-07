'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Link, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadFileAction } from '@/features/knowledge/actions/upload-file';
import { ingestUrlAction } from '@/features/knowledge/actions/ingest-url';
import { createManualSourceAction } from '@/features/knowledge/actions/manual-source';

/* ------------------------------------------------------------------ */
/*  Add Article Dialog                                                 */
/* ------------------------------------------------------------------ */

export function AddArticleDialog({
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
      const result = await createManualSourceAction(tenantId, title.trim(), content.trim());
      if (result.success) {
        toast.success(`"${title}" created and processing started`);
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
      <DialogContent className='sm:max-w-[600px] border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Add article</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Add a knowledge article. The content will be chunked and embedded for AI retrieval.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='article-title' className='text-foreground'>Title</Label>
            <Input
              id='article-title'
              placeholder='e.g. How to reset your password'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              className='border-border bg-accent text-foreground'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='article-content' className='text-foreground'>Content</Label>
            <Textarea
              id='article-content'
              placeholder='Write or paste your article content here...'
              className='min-h-[200px] border-border bg-accent text-foreground'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={saving} className='border-border text-foreground'>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !content.trim()}>
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

/* ------------------------------------------------------------------ */
/*  Add URL Dialog                                                     */
/* ------------------------------------------------------------------ */

export function AddUrlDialog({
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
        toast.success('URL ingestion started');
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
      <DialogContent className='sm:max-w-[500px] border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Add website URL</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Enter a public URL to crawl and index for AI knowledge retrieval.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='source-url' className='text-foreground'>URL</Label>
            <Input
              id='source-url'
              type='url'
              placeholder='https://example.com/docs/getting-started'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={ingesting}
              className='border-border bg-accent text-foreground'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={ingesting} className='border-border text-foreground'>
            Cancel
          </Button>
          <Button onClick={handleIngest} disabled={ingesting || !url.trim()}>
            {ingesting ? (
              <>
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                Ingesting...
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

/* ------------------------------------------------------------------ */
/*  Upload Document Dialog                                             */
/* ------------------------------------------------------------------ */

export function UploadDocumentDialog({
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
        toast.success(`"${file.name}" uploaded and processing started`);
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
      <DialogContent className='sm:max-w-[500px] border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Upload document</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Upload a file to build your AI knowledge base. Supports PDF, DOCX, TXT, MD, CSV (max 20 MB).
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
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-border',
              dragActive && 'border-blue-500 bg-blue-500/10',
              uploading && 'pointer-events-none opacity-60'
            )}
          >
            {uploading ? (
              <Loader2 className='mb-2 h-10 w-10 animate-spin text-muted-foreground' />
            ) : (
              <Upload className='mb-2 h-10 w-10 text-muted-foreground' />
            )}
            <p className='text-sm text-muted-foreground'>
              {uploading ? 'Uploading...' : 'Drag & drop a file here, or click to browse'}
            </p>
            <p className='mt-1 text-xs text-muted-foreground/60'>
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
