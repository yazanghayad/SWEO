'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';

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

function ToggleRow({
  checked,
  onCheckedChange,
  label,
  description
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  description?: string;
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

export default function OutboundClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [emailOutbound, setEmailOutbound] = useState(true);
  const [messengerOutbound, setMessengerOutbound] = useState(true);
  const [smsOutbound, setSmsOutbound] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [tracking, setTracking] = useState(true);

  useEffect(() => {
    if (!config) return;
    setEmailOutbound(config.outbound?.email ?? true);
    setMessengerOutbound(config.outbound?.messenger ?? true);
    setSmsOutbound(config.outbound?.sms ?? false);
    setPushNotifications(config.outbound?.push ?? false);
    setTracking(config.outbound?.tracking ?? true);
  }, [config]);

  function handleSave() {
    save(
      {
        outbound: {
          email: emailOutbound,
          messenger: messengerOutbound,
          sms: smsOutbound,
          push: pushNotifications,
          tracking
        }
      },
      'Outbound settings saved'
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
      {/* Header */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <h1 className='text-lg font-semibold'>Outbound</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          size='sm'
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          {/* Outbound channels */}
          <SettingsSection
            title='Outbound channels'
            description='Control which channels can be used for proactive outbound messaging.'
          >
            <div className='space-y-4'>
              <ToggleRow
                checked={emailOutbound}
                onCheckedChange={setEmailOutbound}
                label='Email'
                description='Send proactive emails to customers and leads.'
              />
              <ToggleRow
                checked={messengerOutbound}
                onCheckedChange={setMessengerOutbound}
                label='Messenger'
                description='Send in-app messages via the chat widget.'
              />
              <ToggleRow
                checked={smsOutbound}
                onCheckedChange={setSmsOutbound}
                label='SMS'
                description='Send outbound SMS messages.'
              />
              <ToggleRow
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
                label='Push notifications'
                description='Send push notifications to mobile app users.'
              />
            </div>
          </SettingsSection>

          <Separator />

          {/* Tracking */}
          <SettingsSection
            title='Tracking & analytics'
            description='Track engagement with outbound messages.'
          >
            <ToggleRow
              checked={tracking}
              onCheckedChange={setTracking}
              label='Enable tracking'
              description='Track open rates, click rates, and reply rates for outbound messages.'
            />
          </SettingsSection>

          <Separator />

          {/* Rate limits */}
          <SettingsSection
            title='Rate limits'
            description='Protect your customers from receiving too many messages.'
          >
            <div className='space-y-2'>
              <div className='rounded-lg border p-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm'>Maximum messages per customer per day</p>
                  <span className='text-sm font-medium'>3</span>
                </div>
              </div>
              <div className='rounded-lg border p-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm'>
                    Minimum interval between messages
                  </p>
                  <span className='text-sm font-medium'>4 hours</span>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
