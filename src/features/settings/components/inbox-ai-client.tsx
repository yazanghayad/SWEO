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

export default function InboxAiClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [aiCompose, setAiCompose] = useState(true);
  const [aiSummarize, setAiSummarize] = useState(true);
  const [aiAutofill, setAiAutofill] = useState(true);
  const [aiTone, setAiTone] = useState(false);
  const [aiTranslate, setAiTranslate] = useState(true);
  const [aiSuggestMacro, setAiSuggestMacro] = useState(true);

  useEffect(() => {
    if (!config) return;
    setAiCompose(config.inboxAi?.compose ?? true);
    setAiSummarize(config.inboxAi?.summarize ?? true);
    setAiAutofill(config.inboxAi?.autofill ?? true);
    setAiTone(config.inboxAi?.tone ?? false);
    setAiTranslate(config.inboxAi?.translate ?? true);
    setAiSuggestMacro(config.inboxAi?.suggestMacro ?? true);
  }, [config]);

  function handleSave() {
    save(
      {
        inboxAi: {
          compose: aiCompose,
          summarize: aiSummarize,
          autofill: aiAutofill,
          tone: aiTone,
          translate: aiTranslate,
          suggestMacro: aiSuggestMacro
        }
      },
      'Inbox AI settings saved'
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
        <h1 className='text-lg font-semibold'>Inbox AI</h1>
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
          {/* AI Compose */}
          <SettingsSection
            title='AI Compose'
            description='Help teammates write better replies with AI-powered suggestions.'
          >
            <ToggleRow
              checked={aiCompose}
              onCheckedChange={setAiCompose}
              label='Enable AI Compose'
              description='Teammates can use AI to draft, expand, and improve their replies.'
            />
          </SettingsSection>

          <Separator />

          {/* AI Summarize */}
          <SettingsSection
            title='AI Summarize'
            description='Automatically generate conversation summaries for quick context.'
          >
            <ToggleRow
              checked={aiSummarize}
              onCheckedChange={setAiSummarize}
              label='Enable AI Summarize'
              description='Show AI-generated summaries at the top of long conversations.'
            />
          </SettingsSection>

          <Separator />

          {/* AI Autofill */}
          <SettingsSection
            title='AI Autofill'
            description='Automatically extract and fill customer details from conversations.'
          >
            <ToggleRow
              checked={aiAutofill}
              onCheckedChange={setAiAutofill}
              label='Enable AI Autofill'
              description='Automatically populate customer attributes like name, email, and topic.'
            />
          </SettingsSection>

          <Separator />

          {/* AI Tone adjustment */}
          <SettingsSection
            title='AI Tone adjustment'
            description='Let teammates adjust the tone of their replies using AI.'
          >
            <ToggleRow
              checked={aiTone}
              onCheckedChange={setAiTone}
              label='Enable tone adjustment'
              description='Teammates can make their replies more friendly, formal, or concise.'
            />
          </SettingsSection>

          <Separator />

          {/* AI Translate */}
          <SettingsSection
            title='AI Translation'
            description='Translate messages in real-time within the inbox.'
          >
            <ToggleRow
              checked={aiTranslate}
              onCheckedChange={setAiTranslate}
              label='Enable AI Translation'
              description='Teammates can translate incoming and outgoing messages.'
            />
          </SettingsSection>

          <Separator />

          {/* AI Macro suggestions */}
          <SettingsSection
            title='AI Macro suggestions'
            description='Suggest relevant saved replies based on conversation context.'
          >
            <ToggleRow
              checked={aiSuggestMacro}
              onCheckedChange={setAiSuggestMacro}
              label='Enable macro suggestions'
              description='AI will suggest relevant macros as the teammate types.'
            />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
