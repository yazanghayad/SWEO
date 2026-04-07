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

export default function WhatsAppChannelClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [enabled, setEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    if (!loading && config) {
      setEnabled(config.whatsappConfig?.enabled ?? false);
      setAccountSid(config.whatsappConfig?.twilioSid ?? '');
      setAuthToken(config.whatsappConfig?.twilioAuthToken ?? '');
      setPhoneNumber(config.whatsappConfig?.twilioPhone ?? '');
    }
  }, [loading, config]);

  const handleSave = () => {
    save(
      {
        whatsappConfig: {
          enabled,
          twilioSid: accountSid,
          twilioAuthToken: authToken,
          twilioPhone: phoneNumber
        }
      },
      'WhatsApp settings saved'
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
            <Image src='/icons/channels/whatsapp.png' alt='WhatsApp' width={28} height={28} className='rounded-lg' />
            <h1 className='text-lg font-semibold'>WhatsApp</h1>
          </div>
          <Badge variant={enabled ? 'default' : 'secondary'}>
            {enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <Button
          onClick={handleSave}
          size='sm'
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='w-full space-y-0'>
          <SettingsSection title='Channel status'>
            <ToggleRow
              label='Enable WhatsApp'
              description='Receive and respond to WhatsApp messages via Twilio'
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </SettingsSection>

          <Separator />

          <SettingsSection
            title='Twilio configuration'
            description='Connect your Twilio account for WhatsApp Business.'
          >
            <div className='space-y-4'>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Account SID
                </Label>
                <Input
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                  placeholder='AC...'
                  type='password'
                  className='max-w-sm'
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Auth Token
                </Label>
                <Input
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder='Enter auth token'
                  type='password'
                  className='max-w-sm'
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  WhatsApp Phone Number
                </Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder='+1234567890'
                  className='max-w-sm'
                />
              </div>
            </div>
          </SettingsSection>

          <Separator />

          <SettingsSection
            title='Webhook URL'
            description='Configure this URL in your Twilio console.'
          >
            <div className='bg-muted rounded-lg p-4'>
              <code className='text-primary text-sm'>
                {typeof window !== 'undefined'
                  ? window.location.origin
                  : 'https://your-app.com'}
                /api/webhooks/whatsapp
              </code>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
