'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BookOpen,
  X,
  AlertCircle,
  Mail,
  Info,
  Copy,
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
          className='text-muted-foreground h-8 font-mono text-xs'
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

const MAIL_DOMAIN = process.env.NEXT_PUBLIC_MAILGUN_DOMAIN ?? `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se'}`;

export default function EmailChannelClient() {
  const router = useRouter();
  const { config, tenant, loading, saving, save } = useTenantSettings();
  const [showBanner, setShowBanner] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [forwardingEmail, setForwardingEmail] = useState('');
  const [autoReply, setAutoReply] = useState(true);
  const [replyStyle, setReplyStyle] = useState<'conversational' | 'formal'>('conversational');
  const [escalationEmail, setEscalationEmail] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!loading && config) {
      const ec = config.emailChannelConfig;
      setEnabled(ec?.enabled ?? false);
      setForwardingEmail(ec?.forwardingEmail ?? '');
      setAutoReply(ec?.autoReply ?? true);
      setReplyStyle((ec?.replyStyle as 'conversational' | 'formal') ?? 'conversational');
      setEscalationEmail(ec?.escalationEmail ?? '');
    }
  }, [loading, config]);

  const handleSave = async () => {
    await save(
      {
        emailChannelConfig: {
          enabled,
          forwardingEmail,
          autoReply,
          replyStyle,
          escalationEmail
        }
      },
      'Email settings saved'
    );
    setDirty(false);
  };

  const markDirty = () => setDirty(true);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/email`
      : '/api/webhooks/email';

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex min-h-full flex-1 flex-col overflow-y-auto'>
      {/* Page Header */}
      <div className='flex items-center justify-between border-b px-6 py-3'>
        <div className='flex items-center gap-2.5'>
          <Image src='/icons/channels/email.png' alt='Email' width={28} height={28} className='rounded-lg' />
          <h1 className='text-lg font-semibold'>Email</h1>
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
                    Deploy SWEO over email for instant, accurate answers
                  </h2>
                  <p className='text-muted-foreground mb-4 text-sm leading-relaxed'>
                    SWEO AI Agent interprets inbound emails, gives answers using your
                    support content, and escalates complex issues when needed.
                  </p>
                  <Button variant='outline' size='sm' onClick={() => router.push('/dashboard/knowledge')}>
                    <BookOpen className='mr-1.5 h-3.5 w-3.5' />
                    Add knowledge sources first
                  </Button>
                </div>
                <div className='hidden shrink-0 lg:block'>
                  <Image
                    src='/images/deploy-sweo-email.png'
                    alt='Deploy SWEO over email'
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

        {/* Enable Email Channel */}
        <SettingsSection
          title='Enable Email Channel'
          description='When enabled, incoming emails forwarded to your webhook will be answered by SWEO AI Agent.'
          action={
            <Switch
              checked={enabled}
              onCheckedChange={(v) => { setEnabled(v); markDirty(); }}
            />
          }
        />

        <Separator />

        {/* Inbound Email Address */}
        {tenant?.subdomain && (
          <>
            <SettingsSection
              title='Your Inbound Email Address'
              description='Customers can email this address to reach your AI agent. Share it on your website, in signatures, or set it as your support email.'
            >
              <div className='space-y-3'>
                <CopyField
                  label='Customer Support Email'
                  value={`${tenant.subdomain}@${MAIL_DOMAIN}`}
                />
                <div className='flex items-start gap-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3'>
                  <Info className='mt-0.5 h-4 w-4 shrink-0 text-blue-400' />
                  <p className='text-xs leading-relaxed'>
                    Emails sent to <strong>{tenant.subdomain}@{MAIL_DOMAIN}</strong> are
                    automatically routed to your SWEO AI Agent. No forwarding setup required.
                  </p>
                </div>
              </div>
            </SettingsSection>

            <Separator />
          </>
        )}

        {/* Forwarding Email (alternative) */}
        <SettingsSection
          title='Custom Forwarding (Optional)'
          description='Alternatively, forward emails from your own inbox (e.g. support@yourcompany.com) to SWEO.'
        >
          <div className='space-y-3'>
            <Input
              placeholder='support@yourcompany.com'
              value={forwardingEmail}
              onChange={(e) => { setForwardingEmail(e.target.value); markDirty(); }}
            />
            <div className='flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-amber-400' />
              <p className='text-xs leading-relaxed'>
                Configure automatic forwarding from your email provider to the
                webhook URL below, so SWEO can receive and reply to emails.
              </p>
            </div>
          </div>
        </SettingsSection>

        <Separator />

        {/* Webhook URL */}
        <SettingsSection
          title='Webhook Configuration'
          description='Forward inbound emails to this URL. Supports standard email-to-webhook services like Mailgun, SendGrid, or Postmark.'
        >
          <CopyField label='Email Webhook URL' value={webhookUrl} />
        </SettingsSection>

        <Separator />

        {/* AI Auto-Reply */}
        <SettingsSection
          title='AI Auto-Reply'
          description='Let SWEO AI Agent automatically reply to incoming emails using your knowledge base.'
          action={
            <Switch
              checked={autoReply}
              onCheckedChange={(v) => { setAutoReply(v); markDirty(); }}
              disabled={!enabled}
            />
          }
        />

        <Separator />

        {/* Reply Style */}
        <SettingsSection
          title='Reply Style'
          description='Choose how SWEO formats email responses.'
        >
          <Select
            value={replyStyle}
            onValueChange={(v) => { setReplyStyle(v as 'conversational' | 'formal'); markDirty(); }}
            disabled={!enabled}
          >
            <SelectTrigger className='w-60'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='conversational'>Conversational (friendly)</SelectItem>
              <SelectItem value='formal'>Formal (professional)</SelectItem>
            </SelectContent>
          </Select>
        </SettingsSection>

        <Separator />

        {/* Escalation */}
        <SettingsSection
          title='Escalation Email'
          description="When SWEO can't resolve a conversation, it will forward the email to this address for human follow-up."
        >
          <Input
            placeholder='team@yourcompany.com'
            value={escalationEmail}
            onChange={(e) => { setEscalationEmail(e.target.value); markDirty(); }}
            disabled={!enabled}
          />
        </SettingsSection>

        <Separator />

        {/* Status */}
        <SettingsSection title='Channel Status'>
          <div className='flex items-center gap-2'>
            <Badge variant={enabled ? 'default' : 'secondary'}>
              {enabled ? 'Live' : 'Not live'}
            </Badge>
            {enabled && (
              <span className='text-muted-foreground text-xs'>SWEO is replying to emails</span>
            )}
          </div>
        </SettingsSection>

        <Separator />

        {/* AI Disclosure */}
        <div className='flex items-center justify-center gap-1.5 py-6'>
          <Info className='text-muted-foreground h-3.5 w-3.5' />
          <p className='text-muted-foreground text-xs'>
            You may need to let people know they&apos;re interacting with an AI Agent.{' '}
            <button className='text-primary hover:underline' onClick={() => router.push('/docs')}>
              Learn more
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
