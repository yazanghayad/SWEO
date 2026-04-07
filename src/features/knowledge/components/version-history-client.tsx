'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/use-tenant';
import {
  listVersionsAction,
  rollbackVersionAction,
  getVersionContent,
  type VersionInfo
} from '@/features/knowledge/actions/version-management';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  Undo2,
  Loader2,
  Eye,
  Check,
  Clock,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Version History Page Client Component                              */
/* ------------------------------------------------------------------ */

export function VersionHistoryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tenant } = useTenant();

  const sourceId = searchParams.get('sourceId') ?? '';
  const sourceName = searchParams.get('name') ?? 'Knowledge Source';

  const [versions, setVersions] = React.useState<VersionInfo[]>([]);
  const [currentVersion, setCurrentVersion] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(true);
  const [rollingBack, setRollingBack] = React.useState(false);

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewContent, setPreviewContent] = React.useState<string | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewVersion, setPreviewVersion] = React.useState<number>(0);

  // Rollback confirmation dialog state
  const [rollbackTarget, setRollbackTarget] = React.useState<number | null>(
    null
  );

  // ── Load versions ───────────────────────────────────────────────────
  React.useEffect(() => {
    if (!sourceId || !tenant?.$id) return;

    async function load() {
      setLoading(true);
      const result = await listVersionsAction(sourceId, tenant!.$id);
      if (result.success && result.data) {
        setVersions(result.data.versions);
        setCurrentVersion(result.data.currentVersion);
      } else {
        toast.error(result.error ?? 'Failed to load versions');
      }
      setLoading(false);
    }

    load();
  }, [sourceId, tenant]);

  // ── Preview version content ─────────────────────────────────────────
  const handlePreview = async (version: VersionInfo) => {
    if (!version.storageFileId) {
      toast.error('No stored content available for this version');
      return;
    }

    setPreviewLoading(true);
    setPreviewVersion(version.version);
    setPreviewOpen(true);

    const content = await getVersionContent(version.storageFileId);
    setPreviewContent(content);
    setPreviewLoading(false);
  };

  // ── Rollback to version ─────────────────────────────────────────────
  const handleRollback = async () => {
    if (rollbackTarget === null || !sourceId || !tenant?.$id) return;

    setRollingBack(true);
    const result = await rollbackVersionAction(
      sourceId,
      tenant.$id,
      rollbackTarget
    );

    if (result.success) {
      toast.success(
        `Successfully rolled back to version ${rollbackTarget}`
      );
      // Reload versions
      const updated = await listVersionsAction(sourceId, tenant.$id);
      if (updated.success && updated.data) {
        setVersions(updated.data.versions);
        setCurrentVersion(updated.data.currentVersion);
      }
    } else {
      toast.error(result.error ?? 'Rollback failed');
    }

    setRollingBack(false);
    setRollbackTarget(null);
  };

  // ── Format date ─────────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────

  if (!sourceId) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-4 p-8'>
        <AlertTriangle className='h-12 w-12 text-muted-foreground' />
        <p className='text-muted-foreground'>
          No source selected. Go back to sources and select a knowledge source.
        </p>
        <Button
          variant='outline'
          onClick={() => router.push('/dashboard/knowledge')}
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Back to Sources
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => router.push('/dashboard/knowledge')}
        >
          <ChevronLeft className='h-5 w-5' />
        </Button>
        <div className='flex-1'>
          <h1 className='text-xl font-semibold'>Version History</h1>
          <p className='text-sm text-muted-foreground'>
            {sourceName} — Current version: v{currentVersion}
          </p>
        </div>
        <Badge variant='outline' className='gap-1'>
          <History className='h-3.5 w-3.5' />
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <Separator />

      {/* Loading state */}
      {loading && (
        <div className='flex items-center justify-center py-16'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading versions…
          </span>
        </div>
      )}

      {/* Empty state */}
      {!loading && versions.length === 0 && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <History className='h-12 w-12 text-muted-foreground' />
            <p className='mt-4 text-muted-foreground'>
              No version history available yet.
            </p>
            <p className='text-sm text-muted-foreground'>
              Versions are saved automatically when knowledge sources are
              updated.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Version timeline */}
      {!loading && versions.length > 0 && (
        <div className='space-y-3'>
          {[...versions].reverse().map((version, idx) => {
            const isCurrent = version.version === currentVersion;
            const _isLatest = idx === 0;
            const rollbackInfo =
              (version as VersionInfo & { rollbackFrom?: number; rollbackTo?: number })
                .rollbackFrom !== undefined
                ? `Rolled back from v${(version as VersionInfo & { rollbackFrom?: number }).rollbackFrom} to v${(version as VersionInfo & { rollbackTo?: number }).rollbackTo}`
                : null;

            return (
              <Card
                key={version.version}
                className={cn(
                  'transition-colors',
                  isCurrent && 'border-primary/50 bg-primary/5'
                )}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                          isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        v{version.version}
                      </div>
                      <div>
                        <CardTitle className='text-sm'>
                          Version {version.version}
                          {isCurrent && (
                            <Badge className='ml-2' variant='default'>
                              <Check className='mr-1 h-3 w-3' />
                              Current
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className='flex items-center gap-1 text-xs'>
                          <Clock className='h-3 w-3' />
                          {formatDate(version.createdAt)}
                        </CardDescription>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {version.storageFileId && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handlePreview(version)}
                        >
                          <Eye className='mr-1.5 h-3.5 w-3.5' />
                          Preview
                        </Button>
                      )}
                      {!isCurrent && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            setRollbackTarget(version.version)
                          }
                          disabled={rollingBack}
                        >
                          <Undo2 className='mr-1.5 h-3.5 w-3.5' />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='pb-3 pt-0'>
                  <div className='flex gap-4 text-xs text-muted-foreground'>
                    <span>
                      {version.chunkCount} chunk
                      {version.chunkCount !== 1 ? 's' : ''}
                    </span>
                    <span>
                      {version.vectorCount} vector
                      {version.vectorCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {rollbackInfo && (
                    <p className='mt-1.5 text-xs text-amber-600'>
                      <Undo2 className='mr-1 inline h-3 w-3' />
                      {rollbackInfo}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Preview Dialog ──────────────────────────────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              Version {previewVersion} Content Preview
            </DialogTitle>
            <DialogDescription>
              Full content snapshot from this version
            </DialogDescription>
          </DialogHeader>

          {previewLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
              <span className='ml-2 text-muted-foreground'>
                Loading content…
              </span>
            </div>
          ) : (
            <ScrollArea className='max-h-[60vh]'>
              <pre className='whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm'>
                {previewContent ?? 'No content available'}
              </pre>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rollback Confirmation Dialog ────────────────────────────── */}
      <AlertDialog
        open={rollbackTarget !== null}
        onOpenChange={(open) => !open && setRollbackTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
            <AlertDialogDescription>
              This will rollback <strong>{sourceName}</strong> from
              version&nbsp;
              <strong>v{currentVersion}</strong> to version&nbsp;
              <strong>v{rollbackTarget}</strong>.
              <br />
              <br />
              This will:
              <ul className='mt-2 list-disc space-y-1 pl-5'>
                <li>Delete current vector embeddings</li>
                <li>Re-chunk and re-embed the old content</li>
                <li>Update the knowledge source document</li>
                <li>Invalidate the semantic cache</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rollingBack}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRollback}
              disabled={rollingBack}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {rollingBack ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Rolling back…
                </>
              ) : (
                <>
                  <Undo2 className='mr-2 h-4 w-4' />
                  Rollback to v{rollbackTarget}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
