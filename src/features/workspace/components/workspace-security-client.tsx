'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Key, Globe, Clock } from 'lucide-react';
import { updateSecuritySettingsAction } from '@/features/workspace/actions/workspace-actions';

export default function WorkspaceSecurityClient() {
  const { tenant, loading } = useTenant();
  const [twoFactor, setTwoFactor] = useState(false);
  const [sso, setSso] = useState(false);
  const [ssoProviderUrl, setSsoProviderUrl] = useState('');
  const [ssoEntityId, setSsoEntityId] = useState('');
  const [ssoCertificate, setSsoCertificate] = useState('');
  const [passwordPolicy, setPasswordPolicy] = useState('strong');
  const [ipAllowlist, setIpAllowlist] = useState(false);
  const [allowedIps, setAllowedIps] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState('24h');
  const [maxSessions, setMaxSessions] = useState('5');
  const [saving, setSaving] = useState(false);

  // Load persisted security settings from tenant config
  useEffect(() => {
    if (tenant) {
      try {
        const config =
          typeof tenant.config === 'string'
            ? JSON.parse(tenant.config)
            : (tenant.config ?? {});
        const sec = config.security ?? {};
        setTwoFactor(sec.twoFactor ?? false);
        setSso(sec.sso ?? false);
        setSsoProviderUrl(sec.ssoProviderUrl ?? '');
        setSsoEntityId(sec.ssoEntityId ?? '');
        setSsoCertificate(sec.ssoCertificate ?? '');
        setPasswordPolicy(sec.passwordPolicy ?? 'strong');
        setIpAllowlist(sec.ipAllowlist ?? false);
        setAllowedIps(sec.allowedIps ?? '');
        setSessionTimeout(sec.sessionTimeout ?? '24h');
        setMaxSessions(sec.maxSessions ?? '5');
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

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateSecuritySettingsAction({
        twoFactor,
        sso,
        ssoProviderUrl,
        ssoEntityId,
        ssoCertificate,
        passwordPolicy,
        ipAllowlist,
        allowedIps,
        sessionTimeout,
        maxSessions
      });
      if (result.success) {
        toast.success('Security settings saved');
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
        <h2 className='text-2xl font-bold tracking-tight'>Security</h2>
        <p className='text-muted-foreground'>
          Authentication methods, IP allowlists, and session settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Key className='h-4 w-4' />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>
                Two-factor authentication (2FA)
              </p>
              <p className='text-muted-foreground text-xs'>
                Require 2FA for all workspace members
              </p>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
          <Separator />
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>Single Sign-On (SSO)</p>
              <p className='text-muted-foreground text-xs'>
                Enable SAML 2.0 SSO for enterprise authentication
              </p>
            </div>
            <Switch checked={sso} onCheckedChange={setSso} />
          </div>
          {sso && (
            <div className='space-y-3 rounded-md border p-4'>
              <div className='space-y-2'>
                <Label>SSO Provider URL</Label>
                <Input
                  placeholder='https://idp.example.com/saml2'
                  value={ssoProviderUrl}
                  onChange={(e) => setSsoProviderUrl(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label>Entity ID</Label>
                <Input
                  placeholder='urn:example:idp'
                  value={ssoEntityId}
                  onChange={(e) => setSsoEntityId(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label>Certificate (X.509)</Label>
                <Input
                  placeholder='Paste certificate...'
                  value={ssoCertificate}
                  onChange={(e) => setSsoCertificate(e.target.value)}
                />
              </div>
            </div>
          )}
          <Separator />
          <div className='space-y-2'>
            <Label>Password Policy</Label>
            <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
              <SelectTrigger className='w-64'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='basic'>Basic (min 8 characters)</SelectItem>
                <SelectItem value='strong'>
                  Strong (min 12, mixed case, numbers)
                </SelectItem>
                <SelectItem value='enterprise'>
                  Enterprise (min 16, special characters)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Globe className='h-4 w-4' />
            IP Allowlist
          </CardTitle>
          <CardDescription>
            Restrict workspace access to specific IP addresses
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>Enable IP allowlist</p>
              <p className='text-muted-foreground text-xs'>
                Only allow access from listed IP addresses
              </p>
            </div>
            <Switch checked={ipAllowlist} onCheckedChange={setIpAllowlist} />
          </div>
          {ipAllowlist && (
            <div className='space-y-2'>
              <Label>Allowed IPs (one per line)</Label>
              <textarea
                className='border-input bg-background min-h-[80px] w-full rounded-md border px-3 py-2 text-sm'
                placeholder={'192.168.1.0/24\n10.0.0.1'}
                value={allowedIps}
                onChange={(e) => setAllowedIps(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Clock className='h-4 w-4' />
            Session Settings
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>Session timeout</Label>
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger className='w-64'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1h'>1 hour</SelectItem>
                <SelectItem value='8h'>8 hours</SelectItem>
                <SelectItem value='24h'>24 hours</SelectItem>
                <SelectItem value='7d'>7 days</SelectItem>
                <SelectItem value='30d'>30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className='space-y-2'>
            <Label>Max concurrent sessions</Label>
            <Select value={maxSessions} onValueChange={setMaxSessions}>
              <SelectTrigger className='w-64'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1'>1 session</SelectItem>
                <SelectItem value='3'>3 sessions</SelectItem>
                <SelectItem value='5'>5 sessions</SelectItem>
                <SelectItem value='unlimited'>Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
