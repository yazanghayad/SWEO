'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import {
  listTeamInboxes,
  createTeamInbox as createInboxAction,
  deleteTeamInbox as deleteInboxAction
} from '@/features/settings/actions/list-data-actions';
import type { TeamInbox } from '@/types/appwrite';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

function SettingsSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='py-5'>
      <div className='mb-4'>
        <p className='mb-1 text-sm font-semibold'>{title}</p>
        {description && (
          <p className='text-muted-foreground text-xs leading-relaxed'>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function TeamInboxesClient() {
  const [inboxes, setInboxes] = useState<TeamInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    listTeamInboxes()
      .then(setInboxes)
      .catch(() => toast.error('Failed to load inboxes'))
      .finally(() => setLoading(false));
  }, []);

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        const inbox = await createInboxAction({ name: newName });
        setInboxes((prev) => [inbox, ...prev]);
        setNewName('');
        setDialogOpen(false);
        toast.success(`Inbox "${inbox.name}" created`);
      } catch {
        toast.error('Failed to create inbox');
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      try {
        await deleteInboxAction(id);
        setInboxes((prev) => prev.filter((i) => i.$id !== id));
        toast.success('Inbox removed');
      } catch {
        toast.error('Failed to remove inbox');
      }
    });
  }

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <div>
          <h1 className='text-lg font-semibold'>Team Inboxes</h1>
          <p className='text-muted-foreground text-xs'>
            {inboxes.length} inbox{inboxes.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size='sm'>Create inbox</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create team inbox</DialogTitle>
              <DialogDescription>
                Team inboxes help route conversations to the right group.
              </DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='Inbox name'
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || isPending}
              >
                {isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          <SettingsSection
            title='Inboxes'
            description='Organize conversations by team or topic. Each inbox can have its own assignment rules.'
          >
            <div className='space-y-2'>
              {inboxes.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center text-sm'>
                  No inboxes configured yet.
                </div>
              ) : (
                inboxes.map((inbox) => (
                  <div
                    key={inbox.$id}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='bg-muted flex h-9 w-9 items-center justify-center rounded-lg'>
                        <svg
                          className='text-muted-foreground h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={2}
                        >
                          <path d='M20 4H4a2 2 0 0 0-2 2v2h20V6a2 2 0 0 0-2-2ZM2 8v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8Z' />
                        </svg>
                      </div>
                      <div>
                        <p className='text-sm font-medium'>{inbox.name}</p>
                        <p className='text-muted-foreground text-xs'>
                          {inbox.memberCount} member
                          {inbox.memberCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {inbox.isDefault && (
                        <Badge
                          variant='outline'
                          className='text-xs text-green-600 dark:text-green-400'
                        >
                          Default
                        </Badge>
                      )}
                      <Button variant='outline' size='sm'>
                        Edit
                      </Button>
                      {!inbox.isDefault && (
                        <Button
                          variant='ghost'
                          size='sm'
                          disabled={isPending}
                          onClick={() => handleRemove(inbox.$id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SettingsSection>

          <Separator />

          <SettingsSection
            title='Routing rules'
            description='Define how incoming conversations are routed to inboxes based on channel, language, or topic.'
          >
            <div className='text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm'>
              No routing rules configured yet.
              <br />
              <Button variant='link' size='sm' className='mt-1'>
                Create a routing rule
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
