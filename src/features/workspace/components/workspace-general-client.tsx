'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Globe, Clock, Languages, Building2, Key } from 'lucide-react';
import { updateWorkspaceAction } from '@/features/workspace/actions/workspace-actions';
import {
  TIMEZONE_OPTIONS,
  LANGUAGE_OPTIONS
} from '@/data/locale-options';

export default function WorkspaceGeneralClient() {
  const { tenant, loading } = useTenant();
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  // Parse tenant config and populate fields from real data
  useEffect(() => {
    if (tenant) {
      setName(tenant.name ?? '');
      try {
        const config =
          typeof tenant.config === 'string'
            ? JSON.parse(tenant.config)
            : (tenant.config ?? {});
        setTimezone(config.timezone ?? 'UTC');
        setLanguage(config.language ?? 'en');
      } catch {
        // Keep defaults
      }
    }
  }, [tenant]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  const config = (() => {
    try {
      return typeof tenant?.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant?.config ?? {});
    } catch {
      return {};
    }
  })();

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateWorkspaceAction({ name, timezone, language });
      if (result.success) {
        toast.success('Workspace settings saved');
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>General</h2>
        <p className='text-muted-foreground'>
          Workspace name, timezone, and default language
        </p>
      </div>

      {/* Plan & Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Building2 className='h-4 w-4' />
            Workspace Status
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>Plan</span>
            <Badge
              variant={tenant?.plan === 'trial' ? 'secondary' : 'default'}
            >
              {tenant?.plan ?? 'trial'}
            </Badge>
          </div>
          {config.companyName && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>Company</span>
              <span className='text-sm font-medium'>{config.companyName}</span>
            </div>
          )}
          {config.industry && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>Industry</span>
              <span className='text-sm font-medium'>{config.industry}</span>
            </div>
          )}
          {config.companySize && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>Size</span>
              <span className='text-sm font-medium'>{config.companySize}</span>
            </div>
          )}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>Subdomain</span>
            <span className='text-sm font-medium'>
              {config.subdomain ?? tenant?.subdomain ?? '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Globe className='h-4 w-4' />
            Workspace Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>Workspace Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='My Workspace'
            />
          </div>
          <div className='space-y-2'>
            <Label>Workspace ID</Label>
            <Input value={tenant?.$id ?? ''} disabled />
            <p className='text-muted-foreground text-xs'>
              Used in API calls and widget configuration
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Key className='h-4 w-4' />
            API Key
          </CardTitle>
          <CardDescription>
            Your API key for widget and API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={tenant?.apiKey ?? ''}
            disabled
            className='font-mono text-xs'
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Clock className='h-4 w-4' />
            Timezone
          </CardTitle>
          <CardDescription>
            Affects scheduled messages, reports, and SLA calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className='w-64'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Languages className='h-4 w-4' />
            Default Language
          </CardTitle>
          <CardDescription>
            The primary language used for AI responses and UI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className='w-64'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button onClick={handleSave} disabled={saving}>
          {saving && (
            <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
