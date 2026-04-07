'use client';

import Link from 'next/link';

/**
 * Helpdesk integrations dashboard.
 *
 * Shows existing helpdesk integrations with their sync status,
 * and provides access to the setup wizard for new integrations.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pause,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useTenant } from '@/hooks/use-tenant';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProviderIcon } from '@/features/connectors/components/provider-icons';
import { IntegrationWizard } from './integration-wizard';
import type { HelpdeskIntegration } from '@/types/helpdesk';
import { HELPDESK_PROVIDER_INFO } from '@/lib/integrations';
import { Icons } from '@/components/icons';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }
> = {
  setup: { label: 'Setup', variant: 'outline', icon: Loader2 },
  connecting: { label: 'Connecting', variant: 'outline', icon: Loader2 },
  connected: { label: 'Connected', variant: 'secondary', icon: CheckCircle2 },
  syncing: { label: 'Syncing', variant: 'secondary', icon: RefreshCw },
  active: { label: 'Active', variant: 'default', icon: CheckCircle2 },
  paused: { label: 'Paused', variant: 'outline', icon: Pause },
  error: { label: 'Error', variant: 'destructive', icon: AlertCircle }
};

export default function IntegrationsPageClient() {
  const { tenant } = useTenant();
  const [integrations, setIntegrations] = useState<HelpdeskIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  const load = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const { listIntegrationsAction } = await import(
        '@/features/integrations/actions/integration-crud'
      );
      const result = await listIntegrationsAction(tenant.$id);
      if (result.success && result.integrations) {
        setIntegrations(result.integrations);
      }
    } catch {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = useCallback(
    async (integrationId: string) => {
      if (!tenant) return;
      try {
        const { deleteIntegrationAction } = await import(
          '@/features/integrations/actions/integration-crud'
        );
        const result = await deleteIntegrationAction(
          integrationId,
          tenant.$id
        );
        if (result.success) {
          toast.success('Integration removed');
          setIntegrations((prev) =>
            prev.filter((i) => i.id !== integrationId)
          );
        } else {
          toast.error(result.error ?? 'Failed to remove');
        }
      } catch {
        toast.error('Failed to remove integration');
      }
    },
    [tenant]
  );

  const handleResync = useCallback(
    async (integrationId: string) => {
      if (!tenant) return;
      toast.info('Re-sync started...');
      try {
        const { runFullSync } = await import(
          '@/features/integrations/actions/sync-handler'
        );
        const result = await runFullSync(tenant.$id, integrationId);
        if (result.success) {
          toast.success('Re-sync complete');
          load();
        } else {
          toast.error(result.error ?? 'Re-sync failed');
        }
      } catch {
        toast.error('Re-sync failed');
      }
    },
    [tenant, load]
  );

  if (!tenant) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-6 w-6 animate-spin' />
      </div>
    );
  }

  return (
    <div className='bg-card flex min-h-full flex-1 flex-col items-center overflow-y-auto rounded-xl px-6 py-6 md:px-20 md:pt-6 md:pb-12'>
      <div className='flex w-full max-w-[900px] flex-col gap-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <p className='section-label mb-2'>INTEGRATIONS</p>
            <h1 className='font-serif text-2xl font-light tracking-tight'>
              Helpdesk Integrations
            </h1>
            <p className='text-muted-foreground text-sm'>
              Connect your existing helpdesk to import data and enable
              bi-directional sync.
            </p>
          </div>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> Add Integration
          </Button>
        </div>

        <div className='dashed-line' />

        {/* Loading */}
        {loading && (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
          </div>
        )}

        {/* Empty state */}
        {!loading && integrations.length === 0 && (
          <Card className='relative overflow-hidden border-dashed'>
            <div className='pointer-events-none absolute inset-0 dot-pattern text-foreground opacity-20' />
            <CardContent className='relative flex flex-col items-center gap-4 py-12'>
              <div className='flex gap-2'>
                <ProviderIcon provider='intercom' className='h-8 w-8' />
                <ProviderIcon provider='zendesk' className='h-8 w-8' />
                <ProviderIcon provider='salesforce' className='h-8 w-8' />
              </div>
              <div className='text-center'>
                <p className='font-medium'>No integrations yet</p>
                <p className='text-muted-foreground text-sm'>
                  Connect Intercom, Zendesk, or Salesforce to import your
                  existing data. No migration required.
                </p>
              </div>
              <Button onClick={() => setWizardOpen(true)}>
                <Plus className='mr-2 h-4 w-4' /> Connect Helpdesk
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Integration cards */}
        {integrations.map((integration) => {
          const info = HELPDESK_PROVIDER_INFO[integration.provider];
          const status = STATUS_CONFIG[integration.status] ?? STATUS_CONFIG.setup;
          const StatusIcon = status.icon;
          const sync = integration.syncState;

          return (
            <Card key={integration.id}>
              <CardHeader className='flex flex-row items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <ProviderIcon
                    provider={integration.provider}
                    className='h-10 w-10'
                  />
                  <div>
                    <CardTitle className='text-base'>
                      {info?.label ?? integration.provider}
                    </CardTitle>
                    <CardDescription>
                      {info?.description ?? 'Helpdesk integration'}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={status.variant} className='gap-1'>
                  <StatusIcon
                    className={cn(
                      'h-3 w-3',
                      integration.status === 'syncing' && 'animate-spin'
                    )}
                  />
                  {status.label}
                </Badge>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Sync stats */}
                <div className='grid grid-cols-4 gap-4'>
                  <MiniStat
                    label='Conversations'
                    value={sync.conversationsImported}
                  />
                  <MiniStat
                    label='Contacts'
                    value={sync.contactsImported}
                  />
                  <MiniStat
                    label='Articles'
                    value={sync.articlesImported}
                  />
                  <MiniStat
                    label='Errors'
                    value={sync.errors.length}
                    alert={sync.errors.length > 0}
                  />
                </div>

                {/* Error details */}
                {sync.errors.length > 0 && (
                  <div className='rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30'>
                    <p className='mb-2 text-xs font-medium text-red-800 dark:text-red-300'>
                      Sync errors:
                    </p>
                    <ul className='space-y-1'>
                      {sync.errors.map(
                        (
                          err: {
                            entity: string;
                            externalId: string;
                            message: string;
                            timestamp: string;
                          },
                          i: number
                        ) => (
                          <li
                            key={i}
                            className='text-[11px] text-red-700 dark:text-red-400'
                          >
                            <span className='font-medium'>
                              {err.entity} ({err.externalId})
                            </span>
                            : {err.message}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {sync.lastSyncAt && (
                  <p className='text-muted-foreground text-xs'>
                    Last synced:{' '}
                    {new Date(sync.lastSyncAt).toLocaleString()}
                  </p>
                )}

                <div className='dashed-line' />

                {/* Actions */}
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleResync(integration.id)}
                    disabled={integration.status === 'syncing'}
                  >
                    <RefreshCw
                      className={cn(
                        'mr-1.5 h-3.5 w-3.5',
                        integration.status === 'syncing' && 'animate-spin'
                      )}
                    />
                    Re-sync
                  </Button>

                  <Button variant='outline' size='sm' asChild>
                    <Link href='/dashboard/connectors'>
                      <ExternalLink className='mr-1.5 h-3.5 w-3.5' />
                      Connector Settings
                    </Link>
                  </Button>

                  <div className='ml-auto'>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <Trash2 className='h-3.5 w-3.5 text-destructive' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove integration?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disconnect{' '}
                            {info?.label ?? integration.provider} and stop
                            syncing. Imported data will be kept.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDelete(integration.id)
                            }
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Wizard dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className='w-[95vw] max-w-[900px] sm:max-w-[900px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Connect Helpdesk</DialogTitle>
            <DialogDescription>
              Import your existing data and enable bi-directional sync.
            </DialogDescription>
          </DialogHeader>
          <IntegrationWizard />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({
  label,
  value,
  alert
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className='text-center'>
      <p
        className={cn(
          'font-mono text-lg font-light tabular-nums',
          alert && 'text-destructive'
        )}
      >
        {value.toLocaleString()}
      </p>
      <p className='text-muted-foreground text-xs'>{label}</p>
    </div>
  );
}
