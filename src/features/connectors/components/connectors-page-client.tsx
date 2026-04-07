'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import {
  listConnectorsAction,
  createConnectorAction,
  deleteConnectorAction,
  updateConnectorAction,
  testConnectorAction
} from '@/features/connectors/actions/connector-crud';
import type {
  DataConnector,
  DataConnectorProvider,
  ConnectorEndpoint
} from '@/types/appwrite';
import {
  CONNECTOR_TEMPLATES,
  getConnectorTemplate
} from '@/features/connectors/connector-templates';
import { Icons } from '@/components/icons';
import { PageLoader, ContentLoader } from '@/components/loaders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { ProviderIcon } from './provider-icons';

// ---------------------------------------------------------------------------
// Provider metadata
// ---------------------------------------------------------------------------

const providerLabels: Record<DataConnectorProvider, string> = {
  shopify: 'Shopify',
  stripe: 'Stripe',
  linear: 'Linear',
  zendesk: 'Zendesk',
  salesforce: 'Salesforce',
  custom: 'Custom',
  intercom: ''
};

const providerColors: Record<DataConnectorProvider, string> = {
  shopify: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  stripe: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  linear: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  zendesk: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  salesforce: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  custom: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  intercom: ''
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ConnectorsPageClient() {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [connectors, setConnectors] = useState<DataConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingConnector, setEditingConnector] =
    useState<DataConnector | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState('');
  const [newProvider, setNewProvider] =
    useState<DataConnectorProvider>('custom');
  const [newAuthType, setNewAuthType] = useState<'api_key' | 'oauth' | 'basic'>(
    'api_key'
  );
  const [newApiKey, setNewApiKey] = useState('');
  const [newBaseUrl, setNewBaseUrl] = useState('');
  const [newEndpoints, setNewEndpoints] = useState<ConnectorEndpoint[]>([]);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    const res = await listConnectorsAction(tenant.$id);
    if (res.success) setConnectors(res.connectors ?? []);
    setLoading(false);
  }, [tenant]);

  useEffect(() => {
    if (tenant) load();
  }, [tenant, load]);

  // When provider changes, auto-fill from template
  function handleProviderChange(provider: DataConnectorProvider) {
    setNewProvider(provider);
    const template = getConnectorTemplate(provider);
    if (template) {
      setNewBaseUrl(template.defaultBaseUrl);
      setNewAuthType(template.defaultAuthType);
      setNewEndpoints(template.endpoints);
      setNewApiKey('');
    } else {
      setNewBaseUrl('');
      setNewAuthType('api_key');
      setNewEndpoints([]);
    }
  }

  function resetCreateForm() {
    setNewName('');
    setNewProvider('custom');
    setNewAuthType('api_key');
    setNewApiKey('');
    setNewBaseUrl('');
    setNewEndpoints([]);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);

    const template = getConnectorTemplate(newProvider);
    const credentialKey = template?.credentialKey ?? 'apiKey';

    const res = await createConnectorAction(tenant!.$id, {
      name: newName.trim(),
      provider: newProvider,
      auth: {
        type: newAuthType,
        credentials:
          newAuthType === 'api_key' || newAuthType === 'oauth'
            ? { [credentialKey]: newApiKey }
            : {},
        baseUrl: newBaseUrl || undefined
      },
      endpoints: newEndpoints
    });
    setCreating(false);
    if (res.success) {
      toast.success('Connector created');
      setShowCreate(false);
      resetCreateForm();
      load();
    } else {
      toast.error(res.error ?? 'Failed to create');
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteConnectorAction(id, tenant!.$id);
    if (res.success) {
      setConnectors((prev) => prev.filter((c) => c.$id !== id));
      toast.success('Connector deleted');
    } else {
      toast.error(res.error ?? 'Failed to delete');
    }
  }

  async function handleTest(id: string) {
    setTestingId(id);
    const res = await testConnectorAction(id, tenant!.$id);
    setTestingId(null);
    if (res.success) {
      toast.success(`Connection OK (status ${res.status})`);
    } else {
      toast.error(res.error ?? 'Connection test failed');
    }
  }

  async function handleToggleEnabled(connector: DataConnector) {
    const res = await updateConnectorAction(connector.$id, tenant!.$id, {
      enabled: !connector.enabled
    });
    if (res.success) {
      setConnectors((prev) =>
        prev.map((c) =>
          c.$id === connector.$id ? { ...c, enabled: !c.enabled } : c
        )
      );
      toast.success(
        connector.enabled ? 'Connector disabled' : 'Connector enabled'
      );
    } else {
      toast.error(res.error ?? 'Failed to update');
    }
  }

  if (tenantLoading) {
    return <PageLoader />;
  }

  if (tenantError || !tenant) {
    return (
      <div className='text-destructive py-20 text-center'>
        {tenantError ?? 'Could not load tenant'}
      </div>
    );
  }

  return (
    <div className='bg-card flex min-h-full flex-1 flex-col items-center overflow-y-auto rounded-xl px-6 py-6 md:px-20 md:pt-6 md:pb-12'>
      <div className='flex w-full max-w-[900px] flex-col gap-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h1 className='font-serif text-lg font-light tracking-tight'>Data Connectors</h1>
            <Badge variant='secondary'>{connectors.length}</Badge>
          </div>
          <Button onClick={() => setShowCreate(true)} size='sm'>
            <Icons.add className='mr-2 h-4 w-4' />
            Add Connector
          </Button>
        </div>

        <p className='text-muted-foreground text-sm'>
          Connect third-party services so your AI agent can look up data and
          take actions in real time. Use pre-built templates for popular tools or
          create a custom connector.
        </p>

        <div className='dashed-line' />

        <div className='space-y-4'>
          {loading ? (
            <ContentLoader />
          ) : connectors.length === 0 ? (
            <EmptyState onAdd={() => setShowCreate(true)} />
          ) : (
            <div className='space-y-3'>
              {connectors.map((conn) => (
                <Card key={conn.$id}>
                  <CardContent className='flex items-center justify-between p-4'>
                    <div className='flex items-center gap-4'>
                      <button
                        onClick={() => handleToggleEnabled(conn)}
                        className={`h-3 w-3 rounded-full transition-colors ${conn.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        title={
                          conn.enabled
                            ? 'Click to disable'
                            : 'Click to enable'
                        }
                      />
                      <ProviderIcon
                        provider={conn.provider}
                        className='text-muted-foreground h-6 w-6 shrink-0'
                      />
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>{conn.name}</span>
                          <Badge
                            className={providerColors[conn.provider] ?? ''}
                            variant='secondary'
                          >
                            {providerLabels[conn.provider]}
                          </Badge>
                          <Badge variant='outline'>{conn.auth?.type}</Badge>
                        </div>
                        <p className='text-muted-foreground mt-0.5 text-xs'>
                          {conn.endpoints?.length ?? 0} endpoint
                          {(conn.endpoints?.length ?? 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setEditingConnector(conn)}
                      >
                        Endpoints
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleTest(conn.$id)}
                        disabled={testingId === conn.$id}
                      >
                        {testingId === conn.$id ? 'Testing…' : 'Test'}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(conn.$id)}
                      >
                        <Icons.trash className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Add Connector</DialogTitle>
            <DialogDescription>
              Choose a provider to auto-configure endpoints, or use Custom for
              any REST API.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='e.g. Production Shopify Store'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Provider</Label>
                <Select
                  value={newProvider}
                  onValueChange={(v) =>
                    handleProviderChange(v as DataConnectorProvider)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='shopify'>
                      <span className='flex items-center gap-2'>
                        <ProviderIcon provider='shopify' className='h-4 w-4' />
                        Shopify
                      </span>
                    </SelectItem>
                    <SelectItem value='stripe'>
                      <span className='flex items-center gap-2'>
                        <ProviderIcon provider='stripe' className='h-4 w-4' />
                        Stripe
                      </span>
                    </SelectItem>
                    <SelectItem value='linear'>
                      <span className='flex items-center gap-2'>
                        <ProviderIcon provider='linear' className='h-4 w-4' />
                        Linear
                      </span>
                    </SelectItem>
                    <SelectItem value='zendesk'>
                      <span className='flex items-center gap-2'>
                        <ProviderIcon provider='zendesk' className='h-4 w-4' />
                        Zendesk
                      </span>
                    </SelectItem>
                    <SelectItem value='salesforce'>
                      <span className='flex items-center gap-2'>
                        <ProviderIcon provider='salesforce' className='h-4 w-4' />
                        Salesforce
                      </span>
                    </SelectItem>
                    <SelectItem value='custom'>
                      <span className='flex items-center gap-2'>
                        <ProviderIcon provider='custom' className='h-4 w-4' />
                        Custom
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Auth Type</Label>
                <Select
                  value={newAuthType}
                  onValueChange={(v) =>
                    setNewAuthType(v as 'api_key' | 'oauth' | 'basic')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='api_key'>API Key</SelectItem>
                    <SelectItem value='oauth'>OAuth</SelectItem>
                    <SelectItem value='basic'>Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Template description */}
            {newProvider !== 'custom' && (
              <div className='rounded-md border bg-muted/30 p-3'>
                <p className='text-muted-foreground text-xs'>
                  {getConnectorTemplate(newProvider)?.description}
                </p>
              </div>
            )}

            <div className='space-y-2'>
              <Label>Base URL</Label>
              <Input
                value={newBaseUrl}
                onChange={(e) => setNewBaseUrl(e.target.value)}
                placeholder='https://api.example.com'
              />
            </div>
            {(newAuthType === 'api_key' || newAuthType === 'oauth') && (
              <div className='space-y-2'>
                <Label>
                  {newAuthType === 'api_key' ? 'API Key' : 'Access Token'}
                </Label>
                <Input
                  type='password'
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder={
                    getConnectorTemplate(newProvider)?.credentialPlaceholder ??
                    'sk-...'
                  }
                />
              </div>
            )}

            {/* Endpoints preview */}
            {newEndpoints.length > 0 && (
              <div className='space-y-2'>
                <Label>
                  Pre-configured Endpoints ({newEndpoints.length})
                </Label>
                <div className='space-y-1'>
                  {newEndpoints.map((ep) => (
                    <div
                      key={ep.id}
                      className='flex items-center gap-2 rounded border px-3 py-1.5 text-xs'
                    >
                      <Badge
                        variant='outline'
                        className='font-mono text-[10px]'
                      >
                        {ep.method}
                      </Badge>
                      <span className='text-muted-foreground font-mono'>
                        {ep.path}
                      </span>
                      <span className='text-muted-foreground ml-auto'>
                        {ep.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowCreate(false);
                resetCreateForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
            >
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Endpoints Dialog ────────────────────────────────── */}
      {editingConnector && (
        <EndpointEditorDialog
          connector={editingConnector}
          tenantId={tenant.$id}
          onClose={() => setEditingConnector(null)}
          onSaved={() => {
            setEditingConnector(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const templates = Object.values(CONNECTOR_TEMPLATES);

  return (
    <Card className='relative overflow-hidden'>
      <div className='pointer-events-none absolute inset-0 dot-pattern text-foreground opacity-20' />
      <CardContent className='relative py-10 text-center'>
        <p className='text-muted-foreground mb-6'>
          No connectors yet. Connect your tools so the AI agent can take
          actions.
        </p>
        <div className='mx-auto mb-6 flex max-w-md flex-wrap justify-center gap-2'>
          {templates.map((t) => (
            <Badge key={t.provider} variant='secondary' className='gap-1.5 py-1'>
              <ProviderIcon provider={t.provider} className='h-3.5 w-3.5' />
              {t.label}
            </Badge>
          ))}
          <Badge variant='outline'>Custom REST API</Badge>
        </div>
        <Button onClick={onAdd} size='sm'>
          <Icons.add className='mr-2 h-4 w-4' />
          Add your first connector
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Endpoint editor dialog
// ---------------------------------------------------------------------------

function EndpointEditorDialog({
  connector,
  tenantId,
  onClose,
  onSaved
}: {
  connector: DataConnector;
  tenantId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [endpoints, setEndpoints] = useState<ConnectorEndpoint[]>(
    connector.endpoints ?? []
  );
  const [saving, setSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [epId, setEpId] = useState('');
  const [epMethod, setEpMethod] = useState<ConnectorEndpoint['method']>('GET');
  const [epPath, setEpPath] = useState('');

  function handleAddEndpoint() {
    if (!epId.trim() || !epPath.trim()) return;
    setEndpoints((prev) => [
      ...prev,
      {
        id: epId.trim(),
        method: epMethod,
        path: epPath.trim(),
        params: {},
        responseMapping: {}
      }
    ]);
    setEpId('');
    setEpPath('');
    setEpMethod('GET');
    setShowAdd(false);
  }

  function handleRemoveEndpoint(id: string) {
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    const res = await updateConnectorAction(connector.$id, tenantId, {
      endpoints
    });
    setSaving(false);
    if (res.success) {
      toast.success('Endpoints saved');
      onSaved();
    } else {
      toast.error(res.error ?? 'Failed to save');
    }
  }

  const template = getConnectorTemplate(connector.provider);
  const missingFromTemplate = template
    ? template.endpoints.filter(
        (te) => !endpoints.some((e) => e.id === te.id)
      )
    : [];

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Endpoints — {connector.name}</DialogTitle>
          <DialogDescription>
            Configure which API endpoints the AI agent can call via this
            connector.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {endpoints.length === 0 ? (
            <p className='text-muted-foreground text-center text-sm'>
              No endpoints configured.
            </p>
          ) : (
            <Accordion type='multiple' className='w-full'>
              {endpoints.map((ep) => (
                <AccordionItem key={ep.id} value={ep.id}>
                  <AccordionTrigger className='hover:no-underline'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Badge
                        variant='outline'
                        className='font-mono text-[10px]'
                      >
                        {ep.method}
                      </Badge>
                      <span className='font-mono'>{ep.path}</span>
                      <span className='text-muted-foreground ml-2'>
                        ({ep.id})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-3 pt-2'>
                      <div>
                        <Label className='text-xs'>Parameters</Label>
                        {Object.keys(ep.params).length === 0 ? (
                          <p className='text-muted-foreground text-xs'>
                            No parameters
                          </p>
                        ) : (
                          <div className='mt-1 space-y-0.5'>
                            {Object.entries(ep.params).map(([k, v]) => (
                              <div key={k} className='font-mono text-xs'>
                                <span className='text-foreground'>{k}</span>
                                <span className='text-muted-foreground'>
                                  : {v}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className='text-xs'>Response Mapping</Label>
                        {Object.keys(ep.responseMapping).length === 0 ? (
                          <p className='text-muted-foreground text-xs'>
                            No response mapping
                          </p>
                        ) : (
                          <div className='mt-1 space-y-0.5'>
                            {Object.entries(ep.responseMapping).map(
                              ([jsonPath, varName]) => (
                                <div
                                  key={jsonPath}
                                  className='font-mono text-xs'
                                >
                                  <span className='text-muted-foreground'>
                                    {jsonPath}
                                  </span>
                                  <span className='text-foreground'>
                                    {' → '}
                                    {varName}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <div className='flex justify-end'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveEndpoint(ep.id)}
                          className='text-destructive text-xs'
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <div className='dashed-line' />

          {/* Template suggestions */}
          {missingFromTemplate.length > 0 && (
            <div className='space-y-2'>
              <Label className='text-xs'>
                Available from {template!.label} template
              </Label>
              <div className='flex flex-wrap gap-1'>
                {missingFromTemplate.map((te) => (
                  <Button
                    key={te.id}
                    variant='outline'
                    size='sm'
                    className='text-xs'
                    onClick={() =>
                      setEndpoints((prev) => [...prev, te])
                    }
                  >
                    <Icons.add className='mr-1 h-3 w-3' />
                    {te.id}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Add custom endpoint */}
          {showAdd ? (
            <div className='space-y-3 rounded-md border p-3'>
              <Label className='text-xs font-medium'>New Endpoint</Label>
              <div className='grid grid-cols-[100px_1fr] gap-2'>
                <Select
                  value={epMethod}
                  onValueChange={(v) =>
                    setEpMethod(v as ConnectorEndpoint['method'])
                  }
                >
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='GET'>GET</SelectItem>
                    <SelectItem value='POST'>POST</SelectItem>
                    <SelectItem value='PUT'>PUT</SelectItem>
                    <SelectItem value='DELETE'>DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <div className='flex-1'>
                  <Label className='sr-only'>Endpoint Path</Label>
                  <Input
                    className='h-8 text-xs'
                    value={epPath}
                    onChange={(e) => setEpPath(e.target.value)}
                    placeholder='/api/resource'
                    aria-label='Endpoint Path'
                  />
                </div>
              </div>
              <div>
                <Label className='sr-only'>Endpoint ID</Label>
                <Input
                  className='h-8 text-xs'
                  value={epId}
                  onChange={(e) => setEpId(e.target.value)}
                  placeholder='Endpoint ID (e.g. orders.list)'
                  aria-label='Endpoint ID'
                />
              </div>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  className='text-xs'
                  onClick={handleAddEndpoint}
                >
                  Add
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='text-xs'
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant='outline'
              size='sm'
              className='text-xs'
              onClick={() => setShowAdd(true)}
            >
              <Icons.add className='mr-1 h-3 w-3' />
              Add Custom Endpoint
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Endpoints'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
