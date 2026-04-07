'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
        <h3 className='text-sm font-semibold'>{title}</h3>
        {description && (
          <p className='text-muted-foreground mt-0.5 text-xs'>{description}</p>
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
  onCheckedChange
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className='flex items-center justify-between py-1'>
      <div>
        <p className='text-sm'>{label}</p>
        {description && (
          <p className='text-muted-foreground text-xs'>{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function SmsChannelClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [enabled, setEnabled] = useState(false);
  const [twilioPhone, setTwilioPhone] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [senderName, setSenderName] = useState('');
  const [autoReply, setAutoReply] = useState(true);
  const [autoReplyMessage, setAutoReplyMessage] = useState('');
  const [optOut, setOptOut] = useState(true);
  const [optOutMessage, setOptOutMessage] = useState('');

  useEffect(() => {
    if (!loading && config) {
      setEnabled(config.smsConfig?.enabled ?? false);
      setTwilioPhone(config.smsConfig?.twilioPhone ?? '');
      setTwilioSid(config.smsConfig?.twilioSid ?? '');
      setTwilioAuthToken(config.smsConfig?.twilioAuthToken ?? '');
      setSenderName(config.smsConfig?.senderName ?? '');
      setAutoReply(config.smsConfig?.autoReplyEnabled ?? true);
      setAutoReplyMessage(config.smsConfig?.autoReplyMessage ?? '');
      setOptOutMessage(config.smsConfig?.optOutMessage ?? '');
    }
  }, [loading, config]);

  const handleSave = () => {
    save(
      {
        smsConfig: {
          enabled,
          twilioPhone,
          twilioSid,
          twilioAuthToken,
          senderName,
          autoReplyEnabled: autoReply,
          autoReplyMessage,
          optOutMessage
        }
      },
      'SMS settings saved'
    );
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
      {/* Header bar */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2.5'>
            <Image src='/icons/channels/sms.png' alt='SMS' width={28} height={28} className='rounded-lg' />
            <h1 className='text-lg font-semibold'>SMS</h1>
          </div>
          <Badge variant={enabled ? 'default' : 'secondary'}>
            {enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <Button onClick={handleSave} size='sm' disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='w-full space-y-0'>
          <SettingsSection title='Channel status'>
            <ToggleRow
              label='Enable SMS'
              description='Allow customers to reach support via text messages (Twilio)'
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </SettingsSection>

          <Separator />

          <SettingsSection
            title='SMS configuration'
            description='Connect your Twilio account for SMS messaging.'
          >
            <div className='space-y-4'>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Twilio Phone Number
                </Label>
                <Input
                  value={twilioPhone}
                  onChange={(e) => setTwilioPhone(e.target.value)}
                  placeholder='+1 (555) 000-0000'
                  className='max-w-sm'
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Twilio Account SID
                </Label>
                <Input
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  placeholder='AC...'
                  type='password'
                  className='max-w-sm'
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Twilio Auth Token
                </Label>
                <Input
                  value={twilioAuthToken}
                  onChange={(e) => setTwilioAuthToken(e.target.value)}
                  placeholder='••••••••'
                  type='password'
                  className='max-w-sm'
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Sender Name (Alphanumeric ID)
                </Label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder='SWEO'
                  maxLength={11}
                  className='max-w-xs'
                />
                <p className='text-muted-foreground mt-1 text-xs'>
                  Max 11 characters. Used as sender name where supported.
                </p>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          <SettingsSection title='Auto-reply'>
            <div className='space-y-4'>
              <ToggleRow
                label='AI auto-reply'
                description='Let SWEO AI respond to incoming SMS automatically'
                checked={autoReply}
                onCheckedChange={setAutoReply}
              />
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Welcome message
                </Label>
                <Input
                  value={autoReplyMessage}
                  onChange={(e) => setAutoReplyMessage(e.target.value)}
                  placeholder="Hi! You've reached SWEO support. How can we help?"
                  className='max-w-lg'
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Away message
                </Label>
                <Input
                  placeholder="We're currently offline. We'll get back to you shortly."
                  className='max-w-lg'
                />
              </div>
            </div>
          </SettingsSection>

          <Separator />

          <SettingsSection title='Compliance'>
            <div className='space-y-4'>
              <ToggleRow
                label='Opt-out handling'
                description='Automatically handle STOP/UNSUBSCRIBE keywords'
                checked={optOut}
                onCheckedChange={setOptOut}
              />
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Opt-out confirmation
                </Label>
                <Input
                  value={optOutMessage}
                  onChange={(e) => setOptOutMessage(e.target.value)}
                  placeholder='You have been unsubscribed. Reply START to re-subscribe.'
                  className='max-w-lg'
                />
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
