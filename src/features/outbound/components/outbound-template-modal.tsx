'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { QUICK_STARTERS, CHANNEL_TYPES } from '../lib/outbound-data';
import type { TemplateRule } from '../lib/outbound-data';
import {
  ArrowLeft,
  X,
  Clock,
  Users,
  Calendar,
  Globe,
  Tag,
  Mail,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

/* ── Rule icon mapping ────────────────────────────────────────── */

function getRuleIcon(field: string) {
  const lower = field.toLowerCase();
  if (lower.includes('time')) return Clock;
  if (lower.includes('visitor') || lower.includes('user')) return Users;
  if (lower.includes('contacted') || lower.includes('heard') || lower.includes('last')) return Calendar;
  if (lower.includes('page') || lower.includes('url')) return Globe;
  if (lower.includes('plan') || lower.includes('subscription') || lower.includes('trial')) return Tag;
  if (lower.includes('email')) return Mail;
  if (lower.includes('phone') || lower.includes('sms') || lower.includes('push') || lower.includes('mobile') || lower.includes('platform')) return Smartphone;
  return Users;
}

/* ── Rule badge component ─────────────────────────────────────── */

function RuleBadge({ rule }: { rule: TemplateRule }) {
  const Icon = getRuleIcon(rule.field);
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
      <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="text-[11px] text-foreground">
        {rule.field} {rule.operator} {rule.value}
      </span>
    </div>
  );
}

/* ── Types ────────────────────────────────────────────────────── */

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
}

/* ── Template modal ───────────────────────────────────────────── */

export default function OutboundTemplateModal({
  open,
  onOpenChange,
  templateId
}: TemplateModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templateId ?? null);

  useEffect(() => {
    setSelectedTemplateId(templateId ?? null);
  }, [templateId]);

  const template = selectedTemplateId
    ? QUICK_STARTERS.find(t => t.id === selectedTemplateId)
    : null;

  const channel = template
    ? CHANNEL_TYPES.find(c => c.slug === template.channel)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[1100px] sm:max-w-[1100px] overflow-hidden p-0">
        <DialogTitle className="sr-only">
          {template?.title ?? 'Template preview'}
        </DialogTitle>

        {template ? (
          <div className="flex h-full gap-0">
            {/* Left panel (60%) */}
            <div className="flex w-3/5 flex-col border-r border-border/60">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-[14px] font-semibold text-foreground">
                    {template.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/outbound/compose?template=${template.id}&channel=${template.channel}`}
                    className="inline-flex h-8 items-center rounded-md border border-border/60 bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-accent/50"
                  >
                    Use this template
                  </Link>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1">
                <div className="space-y-5 px-5 py-5">
                  {/* About section */}
                  <div>
                    <h3 className="mb-1.5 text-[13px] font-semibold text-foreground">
                      About
                    </h3>
                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      {template.aboutText || template.description}
                    </p>
                  </div>

                  {/* Rules section */}
                  {template.rules && template.rules.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-[13px] font-semibold text-foreground">
                          Rules
                        </h3>
                        <span className="text-[11px] text-muted-foreground">ⓘ</span>
                      </div>

                      <div className="space-y-2">
                        {/* Dynamic audience badge */}
                        <Badge
                          variant="secondary"
                          className="rounded-full bg-muted text-[10px] font-medium text-foreground"
                        >
                          Dynamic audience
                        </Badge>

                        {/* Rule badges with "and" connectors */}
                        {template.rules.map((rule, idx) => (
                          <div key={idx}>
                            <RuleBadge rule={rule} />
                            {idx < template.rules.length - 1 && (
                              <span className="ml-3 text-[11px] font-medium text-muted-foreground">
                                and
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right panel (40%) — preview */}
            <div className="flex w-2/5 flex-col bg-muted/40">
              <ScrollArea className="flex-1">
                <div className="flex min-h-full items-center justify-center p-6">
                  <div className="w-full">
                    {/* Chat preview */}
                    {channel?.slug === 'chat' && (
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <div className="mb-3 flex items-start gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                            Y
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <p className="text-[12px] text-foreground">
                              Hey <span className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-primary">↔ First name</span> 👋
                            </p>
                            <p className="text-[12px] text-foreground">
                              Welcome to <span className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-primary">↔ App name</span> 👀
                            </p>
                            <p className="text-[12px] leading-relaxed text-foreground">
                              Take a look around! If you have any questions, just reply to this message.
                            </p>
                            <p className="mt-3 text-[12px] text-foreground">
                              <span className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-primary">↔ Author name</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Yazan • Just now
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email preview */}
                    {channel?.slug === 'email' && (
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <div className="mb-3 border-b border-border/60 pb-2">
                          <p className="text-[11px] text-muted-foreground">From: support@company.com</p>
                          <p className="text-[11px] font-medium text-foreground">Subject: {template.title}</p>
                        </div>
                        <div className="space-y-2 text-center">
                          <p className="text-[12px] leading-relaxed text-foreground">
                            It&apos;s been a while 👋
                          </p>
                          <p className="text-[12px] text-foreground">
                            Anything we can help with?
                          </p>
                          <button className="mt-2 inline-flex h-7 items-center rounded bg-primary px-3 text-[10px] font-medium text-primary-foreground">
                            Open app
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Product tour preview */}
                    {channel?.slug === 'product-tour' && (
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <div className="mb-3 flex items-start gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                            A
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-[12px] text-foreground">
                              Welcome to <span className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-primary">↔ AppName</span> 👋
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Find the tools you need here
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded bg-muted/50 px-3 py-2">
                          <span className="text-[10px] text-muted-foreground">1 of 4</span>
                          <button className="inline-flex h-6 items-center rounded bg-primary px-2.5 text-[10px] font-medium text-primary-foreground">
                            Start
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Default preview */}
                    {!['chat', 'email', 'product-tour'].includes(channel?.slug ?? '') && (
                      <div className="rounded-lg border border-border/60 bg-background p-4">
                        <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                          {channel?.label} Message
                        </p>
                        <div className="rounded-md bg-muted/50 p-5 text-center">
                          <p className="text-[12px] leading-relaxed text-foreground">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center">
            <p className="text-[13px] text-muted-foreground">
              Select a template to preview
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
