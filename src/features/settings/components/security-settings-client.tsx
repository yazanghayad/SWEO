'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

/* ── Reusable sub-components (SWEO pattern) ── */

function SettingsSection({
  title,
  description,
  helpLink,
  helpText,
  children
}: {
  title: string;
  description?: string;
  helpLink?: string;
  helpText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='py-5'>
      <div className='mb-4'>
        <p className='mb-1 text-sm font-semibold'>{title}</p>
        {description && (
          <p className='text-muted-foreground text-xs leading-relaxed'>{description}</p>
        )}
        {helpLink && helpText && (
          <a
            href={helpLink}
            className='text-primary mt-2 inline-flex items-center gap-1 text-xs hover:underline'
            target='_blank'
            rel='noopener noreferrer'
          >
            <span>{helpText}</span>
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  badge
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  badge?: string;
}) {
  return (
    <div className='flex items-center justify-between py-1'>
      <div className='flex items-center gap-2'>
        <div>
          <p className='text-sm'>{label}</p>
          {description && (
            <p className='text-muted-foreground text-xs'>{description}</p>
          )}
        </div>
        {badge && (
          <Badge variant='secondary' className='text-[10px]'>
            {badge}
          </Badge>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/* ── Main component ── */

export default function SecuritySettingsClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [emailAuth, setEmailAuth] = useState(true);
  const [googleSSO, setGoogleSSO] = useState(false);
  const [samlSSO, setSamlSSO] = useState(false);
  const [ipAllowlist, setIpAllowlist] = useState(false);
  const [ipAddresses, setIpAddresses] = useState('');
  const [sessionLength, setSessionLength] = useState('24');
  const [securityEmail, setSecurityEmail] = useState('');
  const [aiTraining, setAiTraining] = useState(true);
  const [enforceSSO, setEnforceSSO] = useState(false);

  // Messenger tab
  const [identityVerification, setIdentityVerification] = useState(false);
  const [requireEmail, setRequireEmail] = useState(true);
  const [allowAttachments, setAllowAttachments] = useState(true);

  useEffect(() => {
    if (!loading && config) {
      setEmailAuth(config.security?.emailAuth ?? true);
      setGoogleSSO(config.security?.googleSSO ?? false);
      setSamlSSO(config.security?.samlSSO ?? false);
      setIpAllowlist(config.security?.ipAllowlist ?? false);
      setIpAddresses(config.security?.ipAddresses ?? '');
      setSessionLength(config.security?.sessionLength ?? '24');
      setSecurityEmail(config.security?.securityEmail ?? '');
      setAiTraining(config.security?.aiTraining ?? true);
      setEnforceSSO(config.security?.enforceSSO ?? false);
      setIdentityVerification(config.security?.identityVerification ?? false);
      setRequireEmail(config.security?.requireEmail ?? true);
      setAllowAttachments(config.security?.allowAttachments ?? true);
    }
  }, [loading, config]);

  async function handleSave() {
    await save(
      {
        security: {
          emailAuth,
          googleSSO,
          samlSSO,
          enforceSSO,
          ipAllowlist,
          ipAddresses,
          sessionLength,
          securityEmail,
          aiTraining,
          identityVerification,
          requireEmail,
          allowAttachments
        }
      },
      'Security settings saved'
    );
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
      {/* Header bar */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <h1 className='text-lg font-semibold'>Security</h1>
        <Button onClick={handleSave} size='sm' disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl'>
          <Tabs defaultValue='workspace'>
            <TabsList className='mb-2'>
              <TabsTrigger value='workspace'>Workspace</TabsTrigger>
              <TabsTrigger value='data'>Data</TabsTrigger>
              <TabsTrigger value='messenger'>Messenger</TabsTrigger>
              <TabsTrigger value='attachments'>Attachments</TabsTrigger>
            </TabsList>

            {/* ── Workspace tab ── */}
            <TabsContent value='workspace' className='space-y-0'>
              <SettingsSection
                title='Authentication methods'
                description='Choose how teammates sign in to this workspace.'
              >
                <div className='space-y-3'>
                  <div className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='flex items-center gap-3'>
                      <svg
                        className='text-muted-foreground h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path d='M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' />
                        <path d='M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41' />
                      </svg>
                      <div>
                        <p className='text-sm font-medium'>Email & Password</p>
                        <p className='text-muted-foreground text-xs'>
                          Standard email and password authentication
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='text-green-600 dark:text-green-400'
                      >
                        Active
                      </Badge>
                      <Switch
                        checked={emailAuth}
                        onCheckedChange={setEmailAuth}
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='flex items-center gap-3'>
                      <svg
                        className='h-5 w-5'
                        viewBox='0 0 24 24'
                        fill='currentColor'
                      >
                        <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z' />
                        <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                        <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                        <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                      </svg>
                      <div>
                        <p className='text-sm font-medium'>Google SSO</p>
                        <p className='text-muted-foreground text-xs'>
                          Allow teammates to sign in with Google accounts
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={googleSSO}
                      onCheckedChange={setGoogleSSO}
                    />
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='flex items-center gap-3'>
                      <svg
                        className='text-muted-foreground h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                      </svg>
                      <div>
                        <p className='text-sm font-medium'>SAML SSO</p>
                        <p className='text-muted-foreground text-xs'>
                          Enterprise single sign-on with your identity provider
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary'>Enterprise</Badge>
                      <Switch
                        checked={samlSSO}
                        onCheckedChange={setSamlSSO}
                      />
                    </div>
                  </div>

                  {(googleSSO || samlSSO) && (
                    <div className='flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950'>
                      <div>
                        <p className='text-sm font-medium'>Enforce SSO</p>
                        <p className='text-muted-foreground text-xs'>
                          Require all teammates to use SSO (disables
                          email/password)
                        </p>
                      </div>
                      <Switch
                        checked={enforceSSO}
                        onCheckedChange={setEnforceSSO}
                      />
                    </div>
                  )}
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection
                title='Security contact'
                description='Email address for security alerts and notifications.'
              >
                <Input
                  type='email'
                  value={securityEmail}
                  onChange={(e) => setSecurityEmail(e.target.value)}
                  placeholder='security@company.com'
                  className='max-w-sm'
                />
              </SettingsSection>

              <Separator />

              <SettingsSection
                title='IP allowlist'
                description='Restrict dashboard access to specific IP addresses.'
              >
                <div className='space-y-3'>
                  <ToggleRow
                    label='Enable IP allowlist'
                    checked={ipAllowlist}
                    onCheckedChange={setIpAllowlist}
                  />
                  {ipAllowlist && (
                    <div className='grid gap-2'>
                      <Label className='text-muted-foreground text-xs'>
                        Allowed IP addresses (one per line)
                      </Label>
                      <Textarea
                        className='max-w-sm'
                        rows={3}
                        value={ipAddresses}
                        onChange={(e) => setIpAddresses(e.target.value)}
                        placeholder={'192.168.1.0/24\n10.0.0.1'}
                      />
                    </div>
                  )}
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection
                title='Session length'
                description='How long teammates stay signed in before re-authentication.'
              >
                <div className='flex items-center gap-3'>
                  <Input
                    type='number'
                    min={1}
                    max={720}
                    value={sessionLength}
                    onChange={(e) => setSessionLength(e.target.value)}
                    className='w-24'
                  />
                  <span className='text-muted-foreground text-sm'>hours</span>
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection
                title='AI model training preferences'
                description='Control whether your data is used to improve AI models.'
              >
                <ToggleRow
                  label='Allow data for model improvement'
                  description='Your conversations may be used to improve AI quality'
                  checked={aiTraining}
                  onCheckedChange={setAiTraining}
                />
              </SettingsSection>
            </TabsContent>

            {/* ── Data tab ── */}
            <TabsContent value='data' className='space-y-0'>
              <SettingsSection
                title='Data retention'
                description='Configure how long conversation data is stored.'
              >
                <div className='space-y-4'>
                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Conversation retention period
                    </Label>
                    <Select defaultValue='90'>
                      <SelectTrigger className='max-w-sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='30'>30 days</SelectItem>
                        <SelectItem value='90'>90 days</SelectItem>
                        <SelectItem value='180'>180 days</SelectItem>
                        <SelectItem value='365'>1 year</SelectItem>
                        <SelectItem value='0'>Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Deleted data grace period
                    </Label>
                    <Select defaultValue='30'>
                      <SelectTrigger className='max-w-sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='7'>7 days</SelectItem>
                        <SelectItem value='30'>30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection
                title='Data export'
                description='Export all workspace data.'
              >
                <Button variant='outline' size='sm'>
                  Request Data Export
                </Button>
              </SettingsSection>

              <Separator />

              <SettingsSection
                title='Danger zone'
                description='This action is irreversible. All data will be permanently deleted.'
              >
                <Button variant='destructive' size='sm'>
                  Delete Workspace
                </Button>
              </SettingsSection>
            </TabsContent>

            {/* ── Messenger tab ── */}
            <TabsContent value='messenger' className='space-y-0'>
              <SettingsSection
                title='Messenger security'
                description='Control security settings for the chat widget.'
              >
                <div className='space-y-4'>
                  <ToggleRow
                    label='Identity verification'
                    description='Require HMAC identity verification for logged-in users'
                    checked={identityVerification}
                    onCheckedChange={setIdentityVerification}
                  />
                  <ToggleRow
                    label='Require email for conversations'
                    description='Users must provide email before starting a chat'
                    checked={requireEmail}
                    onCheckedChange={setRequireEmail}
                  />
                  <ToggleRow
                    label='Allow file attachments'
                    description='Users can upload files in conversations'
                    checked={allowAttachments}
                    onCheckedChange={setAllowAttachments}
                  />
                </div>
              </SettingsSection>
            </TabsContent>

            {/* ── Attachments tab ── */}
            <TabsContent value='attachments' className='space-y-0'>
              <SettingsSection
                title='Attachment settings'
                description='Configure allowed file types and size limits.'
              >
                <div className='space-y-4'>
                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Maximum file size (MB)
                    </Label>
                    <Input
                      type='number'
                      defaultValue={25}
                      min={1}
                      max={100}
                      className='w-32'
                    />
                  </div>
                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Blocked file types
                    </Label>
                    <Input
                      placeholder='.exe, .bat, .cmd'
                      defaultValue='.exe, .bat, .cmd, .msi'
                      className='max-w-sm'
                    />
                    <p className='text-muted-foreground mt-1 text-xs'>
                      Comma-separated list of blocked extensions
                    </p>
                  </div>
                </div>
              </SettingsSection>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
