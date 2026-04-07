'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BookOpen,
  X,
  Instagram,
  Info,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Reusable Helpers                                                   */
/* ------------------------------------------------------------------ */

function SettingsSection({
  title,
  description,
  children,
  action
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className='py-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <h3 className='text-sm font-semibold'>{title}</h3>
          {description && (
            <div className='text-muted-foreground mt-1 text-xs leading-relaxed'>
              {description}
            </div>
          )}
          {children && <div className='mt-4'>{children}</div>}
        </div>
        {action && <div className='shrink-0 pt-0.5'>{action}</div>}
      </div>
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-1.5'>
      <Label className='text-xs'>{label}</Label>
      <div className='flex items-center gap-2'>
        <Input
          readOnly
          value={value}
          className='text-muted-foreground h-8 text-xs font-mono'
        />
        <Button variant='outline' size='sm' onClick={handleCopy} className='shrink-0'>
          {copied ? (
            <Check className='h-3.5 w-3.5 text-green-500' />
          ) : (
            <Copy className='h-3.5 w-3.5' />
          )}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function InstagramChannelClient() {
  const router = useRouter();
  const { config, loading, saving, save } = useTenantSettings();
  const [showBanner, setShowBanner] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [autoReply, setAutoReply] = useState(true);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!loading && config) {
      const ic = config.instagramConfig;
      setEnabled(ic?.enabled ?? false);
      setAutoReply(ic?.autoReply ?? true);
    }
  }, [loading, config]);

  const handleSave = async () => {
    await save(
      {
        instagramConfig: {
          enabled,
          autoReply
        }
      },
      'Instagram settings saved'
    );
    setDirty(false);
  };

  const markDirty = () => setDirty(true);

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/instagram`
      : '/api/webhooks/instagram';

  return (
    <div className='flex min-h-full flex-1 flex-col overflow-y-auto'>
      {/* Page Header */}
      <div className='flex items-center justify-between border-b px-6 py-3'>
        <div className='flex items-center gap-2.5'>
          <Image src='/icons/channels/instagram.svg' alt='Instagram' width={28} height={28} className='rounded-lg' />
          <h1 className='text-lg font-semibold'>Instagram</h1>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={() => router.push('/docs')}>
            <BookOpen className='mr-1.5 h-3.5 w-3.5' />
            Docs
          </Button>
          <Button size='sm' onClick={handleSave} disabled={saving || !dirty}>
            {saving && <Icons.spinner className='mr-1.5 h-3.5 w-3.5 animate-spin' />}
            Save changes
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='w-full space-y-0 px-6 pb-12'>
        {/* Discovery Banner */}
        {showBanner && (
          <div className='py-6'>
            <div className='bg-muted/50 relative overflow-hidden rounded-2xl border p-8'>
              <button
                onClick={() => setShowBanner(false)}
                className='text-muted-foreground hover:text-foreground absolute right-3 top-3'
              >
                <X className='h-4 w-4' />
              </button>
              <div className='flex items-center gap-8'>
                <div className='flex-1'>
                  <h2 className='mb-2 text-base font-semibold'>
                    Connect Instagram to your Inbox
                  </h2>
                  <p className='text-muted-foreground mb-4 text-sm leading-relaxed'>
                    Handle Instagram DMs in your unified inbox and deploy SWEO AI
                    Agent to automatically answer common questions from followers.
                  </p>
                  <Button variant='outline' size='sm' asChild>
                    <a
                      href='https://developers.facebook.com/apps/'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Meta Developer Portal
                      <ExternalLink className='ml-1.5 h-3.5 w-3.5' />
                    </a>
                  </Button>
                </div>
                <div className='hidden shrink-0 lg:block'>
                  <Image
                    src='/images/connect-instagram-inbox.png'
                    alt='Connect Instagram Messenger to your Inbox'
                    width={320}
                    height={224}
                    className='rounded-xl'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Enable Channel */}
        <SettingsSection
          title='Enable Instagram DM Channel'
          description='When enabled, incoming Instagram DMs will be routed to your inbox.'
          action={
            <Switch
              checked={enabled}
              onCheckedChange={(v) => { setEnabled(v); markDirty(); }}
            />
          }
        />

        <Separator />

        {/* Connection Status */}
        <SettingsSection
          title='Connection Status'
          description='Connect your Instagram Business or Creator account via Meta Developer settings.'
        >
          <div className='flex items-center gap-2'>
            <Badge variant={enabled ? 'default' : 'secondary'}>
              {enabled ? 'Connected' : 'Not Connected'}
            </Badge>
            <Button variant='outline' size='sm' asChild>
              <a
                href='https://developers.facebook.com/apps/'
                target='_blank'
                rel='noopener noreferrer'
              >
                Meta Developer Portal
                <ExternalLink className='ml-1.5 h-3.5 w-3.5' />
              </a>
            </Button>
          </div>
        </SettingsSection>

        <Separator />

        {/* Webhook Configuration */}
        <SettingsSection
          title='Webhook Configuration'
          description='Configure the webhook URL in your Meta App settings. Subscribe to the "messages" field on the "instagram" object.'
        >
          <div className='space-y-4'>
            <CopyField label='Callback URL' value={webhookUrl} />
            <div className='flex items-start gap-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3'>
              <Info className='mt-0.5 h-4 w-4 shrink-0 text-blue-400' />
              <div className='text-xs leading-relaxed'>
                The verify token is set in your environment variables as{' '}
                <code className='font-mono text-xs'>META_VERIFY_TOKEN</code>. Use
                this same value when subscribing to the webhook in the Meta Developer
                Portal.
              </div>
            </div>
          </div>
        </SettingsSection>

        <Separator />

        {/* AI Auto-Reply */}
        <SettingsSection
          title='AI Auto-Reply'
          description='Automatically reply to Instagram DMs using SWEO AI Agent before routing to a human agent.'
          action={
            <Switch
              checked={autoReply}
              onCheckedChange={(v) => { setAutoReply(v); markDirty(); }}
              disabled={!enabled}
            />
          }
        />

        <Separator />

        {/* Requirements */}
        <SettingsSection title='Requirements'>
          <div className='flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3'>
            <Info className='mt-0.5 h-4 w-4 shrink-0 text-amber-400' />
            <div className='text-xs leading-relaxed'>
              <ul className='list-disc space-y-1 pl-4'>
                <li>Instagram Business or Creator account</li>
                <li>Meta Developer App with Instagram Messaging enabled</li>
                <li>
                  Page access token with{' '}
                  <code className='font-mono'>instagram_manage_messages</code>{' '}
                  permission
                </li>
                <li>Webhook subscription for the &quot;messages&quot; field</li>
              </ul>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
