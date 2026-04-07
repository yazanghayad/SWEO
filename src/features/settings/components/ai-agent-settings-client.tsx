'use client';

import { useEffect, useState } from 'react';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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

export default function AiAgentSettingsClient() {
  const { config, loading, saving, save } = useTenantSettings();

  const [enabled, setEnabled] = useState(true);
  const [model, setModel] = useState('gpt-4o');
  const [personality, setPersonality] = useState('professional');
  const [autoResolve, setAutoResolve] = useState(true);
  const [humanHandoff, setHumanHandoff] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [customInstructions, setCustomInstructions] = useState('');
  const [collectFeedback, setCollectFeedback] = useState(true);
  const [showSources, setShowSources] = useState(true);

  // Hydrate from config
  useEffect(() => {
    if (!loading && config) {
      setEnabled(config.aiEnabled ?? true);
      setModel(config.model ?? 'gpt-4o');
      setPersonality(config.aiPersonality ?? 'professional');
      setAutoResolve(config.aiAutoResolve ?? true);
      setHumanHandoff(config.aiHumanHandoff ?? true);
      setConfidenceThreshold(
        config.confidenceThreshold != null
          ? Math.round(config.confidenceThreshold * 100)
          : 70
      );
      setCustomInstructions(config.customSystemPrompt ?? '');
      setCollectFeedback(config.aiCollectFeedback ?? true);
      setShowSources(config.aiShowSources ?? true);
    }
  }, [loading, config]);

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  function handleSave() {
    save({
      aiEnabled: enabled,
      model,
      aiPersonality: personality,
      aiAutoResolve: autoResolve,
      aiHumanHandoff: humanHandoff,
      confidenceThreshold: confidenceThreshold / 100,
      customSystemPrompt: customInstructions,
      aiCollectFeedback: collectFeedback,
      aiShowSources: showSources
    }, 'AI Agent settings saved');
  }

  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <h1 className='text-lg font-semibold'>AI Agent</h1>
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
          {/* Enable AI */}
          <SettingsSection
            title='AI Agent'
            description='Enable or disable the AI Agent for automatic customer responses.'
          >
            <ToggleRow
              checked={enabled}
              onCheckedChange={setEnabled}
              label='Enable AI Agent'
              description='The AI Agent will automatically respond to customer queries using your knowledge base.'
            />
          </SettingsSection>

          <Separator />

          {/* Model */}
          <SettingsSection
            title='AI Model'
            description='Select the AI model powering your agent.'
          >
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className='max-w-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='gpt-4o'>GPT-4o</SelectItem>
                <SelectItem value='gpt-4o-mini'>GPT-4o Mini</SelectItem>
                <SelectItem value='gpt-4.1'>GPT-4.1</SelectItem>
                <SelectItem value='gpt-4.1-mini'>GPT-4.1 Mini</SelectItem>
              </SelectContent>
            </Select>
          </SettingsSection>

          <Separator />

          {/* Personality */}
          <SettingsSection
            title='Agent personality'
            description='Define the tone and style of AI responses.'
          >
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger className='max-w-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='professional'>Professional</SelectItem>
                <SelectItem value='friendly'>Friendly</SelectItem>
                <SelectItem value='casual'>Casual</SelectItem>
                <SelectItem value='formal'>Formal</SelectItem>
              </SelectContent>
            </Select>
          </SettingsSection>

          <Separator />

          {/* Custom Instructions */}
          <SettingsSection
            title='Custom instructions'
            description='Provide specific instructions for how the AI should behave and respond.'
          >
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder='E.g., Always greet in Swedish, never discuss competitors...'
              rows={4}
              className='max-w-lg'
            />
          </SettingsSection>

          <Separator />

          {/* Confidence */}
          <SettingsSection
            title='Confidence threshold'
            description='Minimum confidence level required before the AI responds. Lower values mean more responses, higher values mean more accurate responses.'
          >
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <Input
                  type='range'
                  min={0}
                  max={100}
                  step={5}
                  value={confidenceThreshold}
                  onChange={(e) =>
                    setConfidenceThreshold(parseInt(e.target.value))
                  }
                  className='max-w-sm'
                />
                <span className='text-sm font-medium'>
                  {confidenceThreshold}%
                </span>
              </div>
              <p className='text-muted-foreground text-xs'>
                Queries below this threshold will be escalated to a human agent.
              </p>
            </div>
          </SettingsSection>

          <Separator />

          {/* Behavior */}
          <SettingsSection
            title='Behavior'
            description='Configure how the AI agent handles conversations.'
          >
            <div className='space-y-4'>
              <ToggleRow
                checked={autoResolve}
                onCheckedChange={setAutoResolve}
                label='Auto-resolve conversations'
                description='Automatically close conversations when the AI has fully answered the query.'
              />
              <ToggleRow
                checked={humanHandoff}
                onCheckedChange={setHumanHandoff}
                label='Human handoff'
                description='Allow the AI to escalate to a human agent when it cannot resolve the issue.'
              />
              <ToggleRow
                checked={collectFeedback}
                onCheckedChange={setCollectFeedback}
                label='Collect feedback'
                description='Ask customers to rate AI responses after resolution.'
              />
              <ToggleRow
                checked={showSources}
                onCheckedChange={setShowSources}
                label='Show sources'
                description='Display knowledge base article sources in AI responses.'
              />
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
