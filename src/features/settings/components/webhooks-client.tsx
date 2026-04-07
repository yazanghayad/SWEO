'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import {
  listWebhooks,
  createWebhook as createWebhookAction,
  deleteWebhook as deleteWebhookAction
} from '@/features/settings/actions/list-data-actions';
import type { Webhook } from '@/types/appwrite';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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

const EVENTS = [
  'conversation.created',
  'conversation.resolved',
  'conversation.assigned',
  'message.created',
  'contact.created',
  'contact.updated'
];

export default function WebhooksClient() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvent, setNewEvent] = useState('conversation.created');

  useEffect(() => {
    listWebhooks()
      .then((docs) => {
        // events is stored as JSON string in Appwrite, parse it
        setWebhooks(
          docs.map((d) => ({
            ...d,
            events:
              typeof d.events === 'string'
                ? JSON.parse(d.events as unknown as string)
                : d.events
          }))
        );
      })
      .catch(() => toast.error('Failed to load webhooks'))
      .finally(() => setLoading(false));
  }, []);

  function handleCreate() {
    if (!newUrl.trim()) return;
    startTransition(async () => {
      try {
        const wh = await createWebhookAction({
          url: newUrl,
          events: [newEvent]
        });
        // Parse events from the returned doc
        const parsed = {
          ...wh,
          events:
            typeof wh.events === 'string'
              ? JSON.parse(wh.events as unknown as string)
              : wh.events
        };
        setWebhooks((prev) => [parsed, ...prev]);
        setNewUrl('');
        setDialogOpen(false);
        toast.success('Webhook created');
      } catch {
        toast.error('Failed to create webhook');
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      try {
        await deleteWebhookAction(id);
        setWebhooks((prev) => prev.filter((w) => w.$id !== id));
        toast.success('Webhook removed');
      } catch {
        toast.error('Failed to remove webhook');
      }
    });
  }

  const statusColors: Record<string, string> = {
    active: 'text-green-600 dark:text-green-400',
    inactive: 'text-gray-600 dark:text-gray-400',
    failed: 'text-red-600 dark:text-red-400'
  };

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
        <h1 className='text-lg font-semibold'>Webhooks</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size='sm'>Create webhook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create webhook</DialogTitle>
              <DialogDescription>
                Configure an endpoint to receive real-time event notifications.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div>
                <Label className='text-xs'>Endpoint URL</Label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder='https://...'
                  className='mt-1'
                />
              </div>
              <div>
                <Label className='text-xs'>Event</Label>
                <Select value={newEvent} onValueChange={setNewEvent}>
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENTS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={!newUrl.trim() || isPending}
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
            title='Webhook endpoints'
            description='Receive HTTP POST notifications when events occur in your workspace.'
          >
            <div className='space-y-2'>
              {webhooks.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center text-sm'>
                  No webhooks configured.
                </div>
              ) : (
                webhooks.map((wh) => (
                  <div key={wh.$id} className='rounded-lg border p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-mono text-sm'>{wh.url}</p>
                        <div className='mt-2 flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className={statusColors[wh.status]}
                          >
                            {wh.status}
                          </Badge>
                          {(Array.isArray(wh.events) ? wh.events : []).map(
                            (e: string) => (
                              <Badge
                                key={e}
                                variant='secondary'
                                className='text-xs'
                              >
                                {e}
                              </Badge>
                            )
                          )}
                        </div>
                        {wh.lastTriggered && (
                          <p className='text-muted-foreground mt-1 text-xs'>
                            Last triggered: {wh.lastTriggered}
                          </p>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm'>
                          Test
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          disabled={isPending}
                          onClick={() => handleRemove(wh.$id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
