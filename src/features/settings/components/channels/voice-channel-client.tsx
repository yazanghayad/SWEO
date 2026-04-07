'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Mic,
  Volume2,
  Settings,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Voice Channel Settings (saves to backend)                          */
/* ------------------------------------------------------------------ */

export default function VoiceChannelClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [enabled, setEnabled] = useState(false);
  const [voiceModel, setVoiceModel] = useState('nova');
  const [language, setLanguage] = useState('en-US');
  const [greeting, setGreeting] = useState(
    "Hello! I'm SWEO, your AI assistant. How can I help you today?"
  );
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!loading && config) {
      const vc = config.voiceConfig;
      setEnabled(vc?.enabled ?? false);
      setVoiceModel(vc?.voiceModel ?? 'nova');
      setLanguage(vc?.language ?? 'en-US');
      setGreeting(vc?.greeting ?? "Hello! I'm SWEO, your AI assistant. How can I help you today?");
    }
  }, [loading, config]);

  const handleSave = async () => {
    await save(
      {
        voiceConfig: {
          enabled,
          voiceModel,
          language,
          greeting
        }
      },
      'Voice settings saved'
    );
    setDirty(false);
  };

  const markDirty = () => setDirty(true);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/voice`
      : '/api/webhooks/voice';

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('Webhook URL copied');
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2.5'>
            <Image src='/icons/channels/phone.png' alt='Voice' width={28} height={28} className='rounded-lg' />
            <h1 className='text-lg font-semibold'>Voice (AI)</h1>
          </div>
          <Badge variant='secondary'>Phase 3</Badge>
        </div>
        <div className='flex items-center gap-2'>
          <Label htmlFor='voice-toggle' className='text-sm'>
            Enabled
          </Label>
          <Switch
            id='voice-toggle'
            checked={enabled}
            onCheckedChange={(v) => { setEnabled(v); markDirty(); }}
          />
          <Button size='sm' onClick={handleSave} disabled={saving || !dirty} className='ml-2'>
            {saving && <Icons.spinner className='mr-1.5 h-3.5 w-3.5 animate-spin' />}
            Save changes
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto px-6 py-5'>
        <div className='w-full space-y-6'>
          {/* Overview Card */}
          <div className='overflow-hidden rounded-2xl border bg-violet-500/5'>
            <div className='flex items-center gap-8 p-8'>
              <div className='flex-1'>
                <div className='mb-4 flex items-center gap-2'>
                  <span className='h-2 w-2 rounded-full bg-violet-500' />
                  <span className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>
                    AI Voice Channel
                  </span>
                </div>
                <h2 className='mb-3 text-2xl font-semibold leading-tight'>
                  Let SWEO handle phone calls with AI
                </h2>
                <p className='text-muted-foreground mb-2 text-sm leading-relaxed'>
                  SWEO Voice uses Twilio for telephony, OpenAI Whisper for
                  speech-to-text, and OpenAI TTS for text-to-speech. Callers
                  speak naturally and get AI-powered answers in real-time.
                </p>
              </div>
              <div className='hidden shrink-0 lg:block'>
                <div className='flex h-40 w-56 items-center justify-center rounded-xl bg-violet-500/10'>
                  <Mic className='h-20 w-20 text-violet-500' />
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Settings className='h-4 w-4' />
                Twilio Configuration
              </CardTitle>
              <CardDescription>
                Set up your Twilio phone number to forward calls to SWEO.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>Voice Webhook URL</Label>
                <div className='flex gap-2'>
                  <Input value={webhookUrl} readOnly className='font-mono text-xs' />
                  <Button variant='outline' size='icon' onClick={copyWebhookUrl}>
                    {copied ? (
                      <Check className='h-4 w-4 text-green-500' />
                    ) : (
                      <Copy className='h-4 w-4' />
                    )}
                  </Button>
                </div>
                <p className='text-muted-foreground text-xs'>
                  Paste this URL in your Twilio phone number&apos;s &quot;A Call
                  Comes In&quot; webhook field.
                </p>
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label>Setup Steps</Label>
                <ol className='text-muted-foreground list-decimal space-y-2 pl-5 text-sm'>
                  <li>
                    Go to your{' '}
                    <a
                      href='https://console.twilio.com/us1/develop/phone-numbers/manage/incoming'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary inline-flex items-center gap-1 hover:underline'
                    >
                      Twilio Console
                      <ExternalLink className='h-3 w-3' />
                    </a>
                  </li>
                  <li>Select your phone number</li>
                  <li>Under &quot;Voice Configuration&quot;, set the webhook URL above</li>
                  <li>Set HTTP method to POST</li>
                  <li>Save changes</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Volume2 className='h-4 w-4' />
                Voice Settings
              </CardTitle>
              <CardDescription>Customize how SWEO sounds on the phone.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>TTS Voice</Label>
                  <Select value={voiceModel} onValueChange={(v) => { setVoiceModel(v); markDirty(); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='nova'>Nova (warm, female)</SelectItem>
                      <SelectItem value='alloy'>Alloy (neutral)</SelectItem>
                      <SelectItem value='echo'>Echo (male)</SelectItem>
                      <SelectItem value='fable'>Fable (British)</SelectItem>
                      <SelectItem value='onyx'>Onyx (deep male)</SelectItem>
                      <SelectItem value='shimmer'>Shimmer (expressive female)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Language</Label>
                  <Select value={language} onValueChange={(v) => { setLanguage(v); markDirty(); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='en-US'>English (US)</SelectItem>
                      <SelectItem value='en-GB'>English (UK)</SelectItem>
                      <SelectItem value='sv-SE'>Swedish</SelectItem>
                      <SelectItem value='de-DE'>German</SelectItem>
                      <SelectItem value='fr-FR'>French</SelectItem>
                      <SelectItem value='es-ES'>Spanish</SelectItem>
                      <SelectItem value='pt-BR'>Portuguese (BR)</SelectItem>
                      <SelectItem value='ja-JP'>Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Greeting Message</Label>
                <Input
                  value={greeting}
                  onChange={(e) => { setGreeting(e.target.value); markDirty(); }}
                  placeholder='Hello! How can I help you today?'
                />
                <p className='text-muted-foreground text-xs'>
                  This is the first thing callers hear when they connect.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Required Environment Variables</CardTitle>
              <CardDescription>Make sure these are set in your deployment.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='bg-muted space-y-2 rounded-lg p-4 font-mono text-xs'>
                <p>TWILIO_ACCOUNT_SID=AC...</p>
                <p>TWILIO_AUTH_TOKEN=...</p>
                <p>TWILIO_PHONE_NUMBER=+1...</p>
                <p>OPENAI_API_KEY=sk-...</p>
                <p className='text-muted-foreground'># Optional: number to transfer escalated calls to</p>
                <p>TWILIO_TRANSFER_NUMBER=+1...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
