'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CHANNEL_TYPES, QUICK_STARTERS } from '../lib/outbound-data';
import type { TemplateRule } from '../lib/outbound-data';
import { createOutboundMessage, sendOutboundMessage, updateOutboundMessage } from '../actions/outbound-crud';
import type { OutboundChannel } from '@/types/appwrite';
import {
  getChannelGroup,
  getDefaultContent,
  type ChannelContent
} from '../lib/channel-content-types';
import { getEditorComponent } from './editors';
import { getPreviewComponent } from './previews';
import AudienceRuleBuilder from './audience-rule-builder';
import {
  ArrowLeft,
  Save,
  Send,
  Users,
  Calendar,
  Type,
  Eye,
  Loader2,
  Clock,
  Rocket
} from 'lucide-react';
import Link from 'next/link';

export default function OutboundComposer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Resolve template if coming from "Use template"
  const templateId = searchParams.get('template');
  const template = templateId
    ? QUICK_STARTERS.find((t) => t.id === templateId)
    : null;

  // Resolve channel: from template, explicit param, or default
  const channelSlug = template?.channel ?? searchParams.get('channel') ?? 'chat';
  const ch = CHANNEL_TYPES.find((c) => c.slug === channelSlug) ?? CHANNEL_TYPES[0];
  const ChannelIcon = ch.icon;

  // Channel group determines which editor/preview to render
  const channelGroup = getChannelGroup(ch.slug);

  // State
  const [title, setTitle] = useState(template?.title ?? '');
  const [content, setContent] = useState<ChannelContent>(() => {
    if (template?.defaultContent) {
      const defaults = getDefaultContent(channelGroup);
      return { ...defaults, ...template.defaultContent } as ChannelContent;
    }
    return getDefaultContent(channelGroup);
  });
  const [audienceRules, setAudienceRules] = useState<TemplateRule[]>(
    template?.rules ?? []
  );
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Dynamic editor/preview components
  const EditorComponent = useMemo(() => getEditorComponent(channelGroup), [channelGroup]);
  const PreviewComponent = useMemo(() => getPreviewComponent(channelGroup), [channelGroup]);

  async function handleSave(status: 'draft' | 'active') {
    if (!title.trim()) return;
    setSaving(true);

    const schedulePayload: { type: 'immediate' | 'scheduled'; sendAt?: string } = {
      type: scheduleType,
    };
    if (scheduleType === 'scheduled' && scheduleDate) {
      schedulePayload.sendAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }

    const result = await createOutboundMessage({
      title: title.trim(),
      channel: ch.slug as OutboundChannel,
      status,
      content: content as unknown as Record<string, unknown>,
      audience: {
        type: audienceRules.length === 0 ? 'all' : 'rules',
        rules: audienceRules
      },
      schedule: schedulePayload
    });
    setSaving(false);
    if (result.success) {
      router.push('/dashboard/outbound');
    }
  }

  async function handleSend() {
    if (!title.trim()) return;
    setSending(true);

    const schedulePayload: { type: 'immediate' | 'scheduled'; sendAt?: string } = {
      type: scheduleType,
    };
    if (scheduleType === 'scheduled' && scheduleDate) {
      schedulePayload.sendAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }

    // 1. Create the message first
    const createResult = await createOutboundMessage({
      title: title.trim(),
      channel: ch.slug as OutboundChannel,
      status: 'active',
      content: content as unknown as Record<string, unknown>,
      audience: {
        type: audienceRules.length === 0 ? 'all' : 'rules',
        rules: audienceRules
      },
      schedule: schedulePayload
    });

    if (!createResult.success || !createResult.data) {
      setSending(false);
      return;
    }

    // 2. Then send/schedule it
    const sendResult = await sendOutboundMessage(createResult.data.$id);
    setSending(false);

    if (sendResult.success) {
      router.push('/dashboard/outbound');
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-3">
        <Link
          href="/dashboard/outbound"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded"
            style={{ backgroundColor: `${ch.color}15` }}
          >
            <ChannelIcon className="h-3.5 w-3.5" style={{ color: ch.color }} />
          </div>
          <span className="text-[13px] font-semibold text-foreground">
            New {ch.label} message
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            disabled={saving || sending || !title.trim()}
            onClick={() => handleSave('draft')}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-background px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save as draft
          </button>
          <button
            disabled={saving || sending || !title.trim()}
            onClick={handleSend}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : scheduleType === 'scheduled' ? (
              <Clock className="h-3.5 w-3.5" />
            ) : (
              <Rocket className="h-3.5 w-3.5" />
            )}
            {scheduleType === 'scheduled' ? 'Schedule' : 'Send now'}
          </button>
        </div>
      </div>

      {/* Editor + Preview side by side */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[960px] px-6 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,360px]">
            {/* Left: Editor */}
            <div className="space-y-6">
              {/* Message name */}
              <div>
                <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                  Message name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Welcome new users"
                  className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Audience */}
              <div className="rounded-md border border-border/60 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-[13px] font-medium text-foreground">
                    Audience
                  </h3>
                </div>
                <p className="mb-3 text-[12px] text-muted-foreground">
                  Choose who will receive this message
                </p>
                <AudienceRuleBuilder
                  rules={audienceRules}
                  onChange={setAudienceRules}
                />
              </div>

              {/* Content — dynamic per channel */}
              <div className="rounded-md border border-border/60 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-[13px] font-medium text-foreground">
                    Content
                  </h3>
                  <span
                    className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: `${ch.color}15`, color: ch.color }}
                  >
                    <ChannelIcon className="h-3 w-3" />
                    {ch.label}
                  </span>
                </div>
                <EditorComponent
                  value={content}
                  onChange={setContent}
                  channelSlug={ch.slug}
                />
              </div>

              {/* Schedule */}
              <div className="rounded-md border border-border/60 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-[13px] font-medium text-foreground">
                    Schedule
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setScheduleType('immediate')}
                    className={`flex-1 rounded-md border px-4 py-3 text-left transition-colors ${
                      scheduleType === 'immediate'
                        ? 'border-primary bg-primary/5'
                        : 'border-border/60 bg-background hover:border-border hover:bg-accent/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4" />
                      <p className="text-[12px] font-medium text-foreground">
                        Send immediately
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Message will be sent as soon as you click Send
                    </p>
                  </button>
                  <button
                    onClick={() => setScheduleType('scheduled')}
                    className={`flex-1 rounded-md border px-4 py-3 text-left transition-colors ${
                      scheduleType === 'scheduled'
                        ? 'border-primary bg-primary/5'
                        : 'border-border/60 bg-background hover:border-border hover:bg-accent/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <p className="text-[12px] font-medium text-foreground">
                        Schedule for later
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Pick a date and time to send
                    </p>
                  </button>
                </div>

                {scheduleType === 'scheduled' && (
                  <div className="mt-4 flex gap-3">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                    <div className="w-32">
                      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Time
                      </label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live preview */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-md border border-border/60 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-[13px] font-medium text-foreground">
                    Preview
                  </h3>
                </div>
                <PreviewComponent
                  value={content}
                  channelSlug={ch.slug}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
