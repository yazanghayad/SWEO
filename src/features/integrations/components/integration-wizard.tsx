'use client';

import Link from 'next/link';

/**
 * Helpdesk integration setup wizard.
 *
 * A step-by-step flow to connect an existing helpdesk (Intercom, Zendesk,
 * Salesforce), test the connection, configure sync, and run the initial import.
 *
 * Matches the landing page promise: "No migration required — go live in under an hour."
 */

import { useState, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Plug,
  Settings,
  Download,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTenant } from '@/hooks/use-tenant';
import { toast } from 'sonner';
import { ProviderIcon } from '@/features/connectors/components/provider-icons';
import type { HelpdeskProvider } from '@/types/helpdesk';
import {
  HELPDESK_PROVIDERS,
  HELPDESK_PROVIDER_INFO
} from '@/lib/integrations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WizardState {
  provider: HelpdeskProvider | null;
  connectorId: string | null;
  credentials: Record<string, string>;
  connectionTested: boolean;
  config: {
    syncConversations: boolean;
    syncContacts: boolean;
    syncArticles: boolean;
    writeBack: boolean;
    autoEscalate: boolean;
  };
  syncRunning: boolean;
  syncComplete: boolean;
  syncResult: {
    conversations: number;
    contacts: number;
    articles: number;
    errors: number;
  } | null;
}

const STEPS = [
  { id: 'provider', label: 'Choose Provider', icon: Plug },
  { id: 'connect', label: 'Connect', icon: Settings },
  { id: 'configure', label: 'Configure', icon: Settings },
  { id: 'import', label: 'Import Data', icon: Download },
  { id: 'done', label: 'Done', icon: CheckCircle2 }
] as const;

const CREDENTIAL_FIELDS: Record<
  HelpdeskProvider,
  Array<{ key: string; label: string; placeholder: string; type?: string }>
> = {
  intercom: [
    {
      key: 'apiKey',
      label: 'Access Token',
      placeholder: 'your-intercom-access-token',
      type: 'password'
    }
  ],
  zendesk: [
    {
      key: 'subdomain',
      label: 'Subdomain',
      placeholder: 'your-company (from your-company.zendesk.com)'
    },
    {
      key: 'email',
      label: 'Admin Email',
      placeholder: 'admin@your-company.com'
    },
    {
      key: 'apiKey',
      label: 'API Token',
      placeholder: 'your-zendesk-api-token',
      type: 'password'
    }
  ],
  salesforce: [
    {
      key: 'instanceUrl',
      label: 'Instance URL',
      placeholder: 'https://your-org.my.salesforce.com'
    },
    {
      key: 'accessToken',
      label: 'Access Token',
      placeholder: 'your-salesforce-access-token',
      type: 'password'
    }
  ]
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IntegrationWizard() {
  const { tenant } = useTenant();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<WizardState>({
    provider: null,
    connectorId: null,
    credentials: {},
    connectionTested: false,
    config: {
      syncConversations: true,
      syncContacts: true,
      syncArticles: true,
      writeBack: true,
      autoEscalate: true
    },
    syncRunning: false,
    syncComplete: false,
    syncResult: null
  });

  // -- Provider selection step ------------------------------------------------

  const selectProvider = useCallback((provider: HelpdeskProvider) => {
    setState((prev) => ({
      ...prev,
      provider,
      credentials: {},
      connectionTested: false
    }));
    setStep(1);
  }, []);

  // -- Connect step -----------------------------------------------------------

  const testConnection = useCallback(async () => {
    if (!tenant || !state.provider) return;
    setLoading(true);

    try {
      const { createConnectorAction } = await import(
        '@/features/connectors/actions/connector-crud'
      );

      // Build auth payload for the connector
      const authPayload = {
        type: state.provider === 'salesforce' ? 'oauth' as const : 'api_key' as const,
        credentials: state.credentials,
        baseUrl: getBaseUrl(state.provider, state.credentials)
      };

      // Create a connector first (or find existing)
      const createResult = await createConnectorAction(tenant.$id, {
        name: `${HELPDESK_PROVIDER_INFO[state.provider].label} Integration`,
        provider: state.provider,
        auth: authPayload,
        enabled: true
      });

      if (!createResult.success || !createResult.connectorId) {
        toast.error(createResult.error ?? 'Failed to save credentials');
        setLoading(false);
        return;
      }

      const connectorId = createResult.connectorId;

      // Test connection
      const { testConnectorAction } = await import(
        '@/features/connectors/actions/connector-crud'
      );
      const testResult = await testConnectorAction(connectorId, tenant.$id);

      if (testResult.success) {
        setState((prev) => ({
          ...prev,
          connectorId,
          connectionTested: true
        }));
        toast.success('Connection successful!');
      } else {
        toast.error(testResult.error ?? 'Connection test failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to test connection: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [tenant, state.provider, state.credentials]);

  // -- Import step ------------------------------------------------------------

  const runImport = useCallback(async () => {
    if (!tenant || !state.provider || !state.connectorId) return;
    setState((prev) => ({ ...prev, syncRunning: true }));

    try {
      // Create integration config
      const { createIntegrationAction } = await import(
        '@/features/integrations/actions/integration-crud'
      );

      const createResult = await createIntegrationAction(tenant.$id, {
        provider: state.provider,
        connectorId: state.connectorId,
        config: state.config
      });

      if (!createResult.success || !createResult.integrationId) {
        toast.error(createResult.error ?? 'Failed to create integration');
        setState((prev) => ({ ...prev, syncRunning: false }));
        return;
      }

      // Run full sync
      const { runFullSync } = await import(
        '@/features/integrations/actions/sync-handler'
      );
      const syncResult = await runFullSync(
        tenant.$id,
        createResult.integrationId
      );

      setState((prev) => ({
        ...prev,
        syncRunning: false,
        syncComplete: true,
        syncResult: {
          conversations: syncResult.syncState.conversationsImported,
          contacts: syncResult.syncState.contactsImported,
          articles: syncResult.syncState.articlesImported,
          errors: syncResult.syncState.errors.length
        }
      }));

      if (syncResult.success) {
        toast.success('Import complete!');
        setStep(4);
      } else {
        toast.error(syncResult.error ?? 'Import had errors');
      }
    } catch {
      toast.error('Import failed');
      setState((prev) => ({ ...prev, syncRunning: false }));
    }
  }, [tenant, state.provider, state.connectorId, state.config]);

  // -- Render helpers ---------------------------------------------------------

  if (!tenant) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-6'>
      {/* Step indicator */}
      <div className='flex items-center gap-2'>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={s.id} className='flex items-center gap-2'>
              {i > 0 && (
                <div
                  className={cn(
                    'h-px w-8',
                    isDone ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
                  isActive && 'bg-primary text-primary-foreground',
                  isDone && 'bg-primary/10 text-primary',
                  !isActive && !isDone && 'text-muted-foreground'
                )}
              >
                {isDone ? (
                  <Check className='h-4 w-4' />
                ) : (
                  <Icon className='h-4 w-4' />
                )}
                <span>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Step content */}
      {step === 0 && (
        <StepProvider onSelect={selectProvider} />
      )}

      {step === 1 && state.provider && (
        <StepConnect
          provider={state.provider}
          credentials={state.credentials}
          onCredentialsChange={(creds) =>
            setState((prev) => ({ ...prev, credentials: creds }))
          }
          onTest={testConnection}
          tested={state.connectionTested}
          loading={loading}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && state.provider && (
        <StepConfigure
          provider={state.provider}
          config={state.config}
          onConfigChange={(config) =>
            setState((prev) => ({ ...prev, config }))
          }
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && state.provider && (
        <StepImport
          provider={state.provider}
          config={state.config}
          syncRunning={state.syncRunning}
          syncResult={state.syncResult}
          onRun={runImport}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && state.provider && (
        <StepDone
          provider={state.provider}
          syncResult={state.syncResult}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components for each step
// ---------------------------------------------------------------------------

function StepProvider({
  onSelect
}: {
  onSelect: (p: HelpdeskProvider) => void;
}) {
  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-xl font-semibold'>Connect your helpdesk</h2>
        <p className='text-muted-foreground text-sm'>
          Import your existing conversations, contacts, and knowledge base. No
          migration required — your helpdesk keeps working as usual.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        {HELPDESK_PROVIDERS.map((provider) => {
          const info = HELPDESK_PROVIDER_INFO[provider];
          return (
            <Card
              key={provider}
              className='cursor-pointer transition-shadow hover:shadow-md'
              onClick={() => onSelect(provider)}
            >
              <CardHeader className='flex flex-row items-center gap-3 pb-2'>
                <ProviderIcon provider={provider} className='h-8 w-8' />
                <CardTitle className='text-base'>{info.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm'>
                  {info.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StepConnect({
  provider,
  credentials,
  onCredentialsChange,
  onTest,
  tested,
  loading,
  onNext,
  onBack
}: {
  provider: HelpdeskProvider;
  credentials: Record<string, string>;
  onCredentialsChange: (creds: Record<string, string>) => void;
  onTest: () => void;
  tested: boolean;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const fields = CREDENTIAL_FIELDS[provider];

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <ProviderIcon provider={provider} className='h-8 w-8' />
        <div>
          <h2 className='text-xl font-semibold'>
            Connect {HELPDESK_PROVIDER_INFO[provider].label}
          </h2>
          <p className='text-muted-foreground text-sm'>
            Enter your API credentials to connect.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className='space-y-4 pt-6'>
          {fields.map((field) => (
            <div key={field.key} className='space-y-2'>
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type ?? 'text'}
                placeholder={field.placeholder}
                value={credentials[field.key] ?? ''}
                onChange={(e) =>
                  onCredentialsChange({
                    ...credentials,
                    [field.key]: e.target.value
                  })
                }
              />
            </div>
          ))}

          <Separator />

          <div className='flex items-center gap-3'>
            <Button
              onClick={onTest}
              disabled={
                loading || fields.some((f) => !credentials[f.key])
              }
            >
              {loading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : tested ? (
                <CheckCircle2 className='mr-2 h-4 w-4 text-green-500' />
              ) : (
                <Plug className='mr-2 h-4 w-4' />
              )}
              {tested ? 'Connected' : 'Test Connection'}
            </Button>
            {tested && (
              <Badge variant='outline' className='text-green-600'>
                Connection verified
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-between'>
        <Button variant='outline' onClick={onBack}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back
        </Button>
        <Button onClick={onNext} disabled={!tested}>
          Next <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

function StepConfigure({
  provider,
  config,
  onConfigChange,
  onNext,
  onBack
}: {
  provider: HelpdeskProvider;
  config: WizardState['config'];
  onConfigChange: (config: WizardState['config']) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggleKey = (key: keyof typeof config) => {
    onConfigChange({ ...config, [key]: !config[key] });
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold'>Configure sync</h2>
        <p className='text-muted-foreground text-sm'>
          Choose what to import from{' '}
          {HELPDESK_PROVIDER_INFO[provider].label}.
        </p>
      </div>

      <Card>
        <CardContent className='space-y-4 pt-6'>
          <SyncToggle
            label='Conversations'
            description={`Import ${provider === 'salesforce' ? 'cases' : provider === 'zendesk' ? 'tickets' : 'conversations'} so agents have full context`}
            checked={config.syncConversations}
            onChange={() => toggleKey('syncConversations')}
          />
          <Separator />
          <SyncToggle
            label='Contacts'
            description='Import customer profiles and contact details'
            checked={config.syncContacts}
            onChange={() => toggleKey('syncContacts')}
          />
          <Separator />
          <SyncToggle
            label='Knowledge Base Articles'
            description='Import help center articles into the AI knowledge base'
            checked={config.syncArticles}
            onChange={() => toggleKey('syncArticles')}
          />
          <Separator />
          <SyncToggle
            label='Auto-Escalate'
            description={`Automatically create ${provider === 'salesforce' ? 'cases' : 'tickets'} when the AI can't resolve a query`}
            checked={config.autoEscalate}
            onChange={() => toggleKey('autoEscalate')}
          />
          <Separator />
          <SyncToggle
            label='Write Back'
            description={`Sync resolved conversations back to ${HELPDESK_PROVIDER_INFO[provider].label}`}
            checked={config.writeBack}
            onChange={() => toggleKey('writeBack')}
          />
        </CardContent>
      </Card>

      <div className='flex justify-between'>
        <Button variant='outline' onClick={onBack}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back
        </Button>
        <Button onClick={onNext}>
          Next <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

function StepImport({
  provider,
  config,
  syncRunning,
  syncResult,
  onRun,
  onBack
}: {
  provider: HelpdeskProvider;
  config: WizardState['config'];
  syncRunning: boolean;
  syncResult: WizardState['syncResult'];
  onRun: () => void;
  onBack: () => void;
}) {
  const items = [
    config.syncConversations && 'conversations',
    config.syncContacts && 'contacts',
    config.syncArticles && 'articles'
  ].filter(Boolean);

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold'>Import your data</h2>
        <p className='text-muted-foreground text-sm'>
          We&apos;ll import {items.join(', ')} from{' '}
          {HELPDESK_PROVIDER_INFO[provider].label}. This can be done
          without affecting your existing setup.
        </p>
      </div>

      <Card>
        <CardContent className='space-y-4 pt-6'>
          {syncRunning && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-sm font-medium'>
                  Importing data...
                </span>
              </div>
              <Progress value={undefined} className='h-2' />
              <p className='text-muted-foreground text-xs'>
                This may take a few minutes depending on your data volume.
              </p>
            </div>
          )}

          {syncResult && (
            <div className='space-y-3'>
              <div className='grid grid-cols-3 gap-4'>
                <StatCard
                  label='Conversations'
                  value={syncResult.conversations}
                />
                <StatCard label='Contacts' value={syncResult.contacts} />
                <StatCard label='Articles' value={syncResult.articles} />
              </div>
              {syncResult.errors > 0 && (
                <div className='flex items-center gap-2 text-sm text-amber-600'>
                  <AlertCircle className='h-4 w-4' />
                  {syncResult.errors} items had errors (will be retried
                  automatically)
                </div>
              )}
            </div>
          )}

          {!syncRunning && !syncResult && (
            <div className='text-center py-4'>
              <Download className='text-muted-foreground mx-auto mb-3 h-10 w-10' />
              <p className='text-sm font-medium'>Ready to import</p>
              <p className='text-muted-foreground text-xs'>
                Click below to start the import. Your{' '}
                {HELPDESK_PROVIDER_INFO[provider].label} account
                won&apos;t be affected.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='flex justify-between'>
        <Button
          variant='outline'
          onClick={onBack}
          disabled={syncRunning}
        >
          <ArrowLeft className='mr-2 h-4 w-4' /> Back
        </Button>
        <Button onClick={onRun} disabled={syncRunning || !!syncResult}>
          {syncRunning ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Download className='mr-2 h-4 w-4' />
          )}
          {syncRunning ? 'Importing...' : 'Start Import'}
        </Button>
      </div>
    </div>
  );
}

function StepDone({
  provider,
  syncResult
}: {
  provider: HelpdeskProvider;
  syncResult: WizardState['syncResult'];
}) {
  return (
    <div className='space-y-6 text-center py-8'>
      <div className='flex justify-center'>
        <div className='bg-primary/10 rounded-full p-4'>
          <CheckCircle2 className='text-primary h-12 w-12' />
        </div>
      </div>

      <div>
        <h2 className='text-xl font-semibold'>
          {HELPDESK_PROVIDER_INFO[provider].label} connected!
        </h2>
        <p className='text-muted-foreground mx-auto mt-2 max-w-md text-sm'>
          Your data has been imported and the AI agent is ready. Incoming
          webhooks will keep everything in sync automatically.
        </p>
      </div>

      {syncResult && (
        <div className='mx-auto grid max-w-sm grid-cols-3 gap-4'>
          <StatCard
            label='Conversations'
            value={syncResult.conversations}
          />
          <StatCard label='Contacts' value={syncResult.contacts} />
          <StatCard label='Articles' value={syncResult.articles} />
        </div>
      )}

      <div className='flex justify-center gap-3'>
        <Button variant='outline' asChild>
          <Link href='/dashboard/connectors'>View Connectors</Link>
        </Button>
        <Button asChild>
          <Link href='/dashboard/inbox'>Go to Inbox</Link>
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------

function SyncToggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm font-medium'>{label}</p>
        <p className='text-muted-foreground text-xs'>{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-lg border p-3 text-center'>
      <p className='text-2xl font-bold'>{value.toLocaleString()}</p>
      <p className='text-muted-foreground text-xs'>{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function getBaseUrl(
  provider: HelpdeskProvider,
  creds: Record<string, string>
): string {
  switch (provider) {
    case 'intercom':
      return 'https://api.intercom.io';
    case 'zendesk': {
      // Sanitize: strip protocol, .zendesk.com suffix, trailing slashes
      let sub = (creds.subdomain ?? 'example').trim();
      sub = sub.replace(/^https?:\/\//, '');
      sub = sub.replace(/\.zendesk\.com.*$/i, '');
      sub = sub.replace(/\/+$/, '');
      return `https://${sub}.zendesk.com/api/v2`;
    }
    case 'salesforce':
      return creds.instanceUrl ?? 'https://login.salesforce.com/services/data/v59.0';
  }
}
