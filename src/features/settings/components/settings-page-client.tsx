'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import type { TenantConfig, ConversationChannel } from '@/types/appwrite';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { WidgetInstall } from './widget-install';

const ALL_CHANNELS: ConversationChannel[] = [
  'web',
  'email',
  'whatsapp',
  'sms',
  'voice'
];

/* ── Reusable sub-components ── */

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
    <div className='py-6'>
      <div className='mb-4'>
        <p className='flex items-center gap-1.5 font-serif text-sm font-light tracking-tight'>
          <span className='inline-block size-1.5 rounded-[1px] bg-primary' />
          {title}
        </p>
        {description && (
          <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Main component ── */

export default function SettingsPageClient() {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [config, setConfig] = useState<TenantConfig>({});
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [rotatingKey, setRotatingKey] = useState(false);

  useEffect(() => {
    if (tenant) {
      const cfg = (tenant.config ?? {}) as TenantConfig;
      setConfig({
        channels: cfg.channels ?? ['web'],
        model: cfg.model ?? 'gpt-4o',
        confidenceThreshold: cfg.confidenceThreshold ?? 0.7,
        maxHistoryMessages: cfg.maxHistoryMessages ?? 10,
        customSystemPrompt: cfg.customSystemPrompt ?? '',
        webhookUrl: cfg.webhookUrl ?? '',
        cacheTtlSeconds: cfg.cacheTtlSeconds ?? 3600
      });
      setApiKey(tenant.apiKey ?? '');
    }
  }, [tenant]);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to save');
      }
      toast.success('Settings saved');
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save settings'
      );
    } finally {
      setSaving(false);
    }
  }, [config]);

  const rotateApiKey = useCallback(async () => {
    if (
      !confirm(
        'Rotate API key? The current key will remain valid for 24 hours.'
      )
    )
      return;
    setRotatingKey(true);
    try {
      const res = await fetch('/api/tenant/api-key', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to rotate key');
      const data = await res.json();
      setApiKey(data.apiKey);
      toast.success('API key rotated. Old key valid for 24h.');
    } catch {
      toast.error('Failed to rotate API key');
    } finally {
      setRotatingKey(false);
    }
  }, []);

  function toggleChannel(ch: ConversationChannel) {
    setConfig((prev) => {
      const current = prev.channels ?? [];
      const next = current.includes(ch)
        ? current.filter((c) => c !== ch)
        : [...current, ch];
      return { ...prev, channels: next };
    });
  }

  if (tenantLoading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <div className='text-destructive py-20 text-center'>
        {tenantError ?? 'Could not load tenant'}
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* Header bar */}
      <div className='flex items-center justify-between border-b border-border/40 px-6 py-4'>
        <h1 className='font-serif text-base font-light tracking-tight'>API & Tokens</h1>
        <Button disabled={saving} onClick={saveSettings} size='sm'>
          {saving && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
          Save
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto px-6 py-4'>
        <div className='max-w-3xl space-y-0 divide-y divide-border/40'>
          {/* Tenant Info */}
          <SettingsSection title='Tenant'>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Name</span>
                <span className='font-medium'>{tenant.name}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Plan</span>
                <Badge variant='outline'>
                  {tenant.plan?.charAt(0).toUpperCase() +
                    tenant.plan?.slice(1)}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Tenant ID</span>
                <code className='text-muted-foreground text-xs'>
                  {tenant.$id}
                </code>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* API Key */}
          <SettingsSection
            title='API Key'
            description='Use this key to authenticate widget and webhook requests.'
          >
            <div className='space-y-3'>
              <div className='flex max-w-lg items-center gap-2'>
                <Input
                  readOnly
                  value={apiKey}
                  className='font-mono text-xs'
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    toast.success('Copied');
                  }}
                >
                  Copy
                </Button>
              </div>
              <Button
                variant='destructive'
                size='sm'
                disabled={rotatingKey}
                onClick={rotateApiKey}
              >
                {rotatingKey && (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                )}
                Rotate Key
              </Button>
            </div>
          </SettingsSection>

          <Separator />

          {/* AI Configuration */}
          <SettingsSection title='AI Configuration'>
            <div className='space-y-5'>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Model
                </Label>
                <Select
                  value={config.model ?? 'gpt-4o'}
                  onValueChange={(v) =>
                    setConfig((p) => ({ ...p, model: v }))
                  }
                >
                  <SelectTrigger className='max-w-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='gpt-4o'>GPT-4o</SelectItem>
                    <SelectItem value='gpt-4o-mini'>GPT-4o Mini</SelectItem>
                    <SelectItem value='gpt-4.1'>GPT-4.1</SelectItem>
                    <SelectItem value='gpt-4.1-mini'>GPT-4.1 Mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Confidence Threshold (
                  {((config.confidenceThreshold ?? 0.7) * 100).toFixed(0)}%)
                </Label>
                <Input
                  type='range'
                  min={0}
                  max={1}
                  step={0.05}
                  value={config.confidenceThreshold ?? 0.7}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      confidenceThreshold: parseFloat(e.target.value)
                    }))
                  }
                  className='max-w-sm'
                />
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Max History Messages
                </Label>
                <Input
                  type='number'
                  min={1}
                  max={50}
                  value={config.maxHistoryMessages ?? 10}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      maxHistoryMessages: parseInt(e.target.value) || 10
                    }))
                  }
                  className='w-32'
                />
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Custom System Prompt
                </Label>
                <Textarea
                  rows={4}
                  placeholder='Optional: customize how the AI responds...'
                  value={config.customSystemPrompt ?? ''}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      customSystemPrompt: e.target.value
                    }))
                  }
                  className='max-w-lg'
                />
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Enabled Channels */}
          <SettingsSection
            title='Enabled channels'
            description='Toggle which channels the AI agent responds on.'
          >
            <div className='space-y-3'>
              {ALL_CHANNELS.map((ch) => (
                <div
                  key={ch}
                  className='flex items-center justify-between py-1'
                >
                  <Label className='capitalize'>{ch}</Label>
                  <Switch
                    checked={config.channels?.includes(ch) ?? false}
                    onCheckedChange={() => toggleChannel(ch)}
                  />
                </div>
              ))}
            </div>
          </SettingsSection>

          <Separator />

          {/* Advanced */}
          <SettingsSection title='Advanced'>
            <div className='space-y-5'>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Webhook URL
                </Label>
                <Input
                  type='url'
                  placeholder='https://...'
                  value={config.webhookUrl ?? ''}
                  onChange={(e) =>
                    setConfig((p) => ({ ...p, webhookUrl: e.target.value }))
                  }
                  className='max-w-lg'
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Cache TTL (seconds)
                </Label>
                <Input
                  type='number'
                  min={0}
                  value={config.cacheTtlSeconds ?? 3600}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      cacheTtlSeconds: parseInt(e.target.value) || 3600
                    }))
                  }
                  className='w-32'
                />
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Widget Embed */}
          <div className='py-6'>
            <WidgetInstall
              apiKey={apiKey}
              apiUrl={
                typeof window !== 'undefined' ? window.location.origin : ''
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
