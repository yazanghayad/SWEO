'use client';

import type { TextMessageContent } from '../../lib/channel-content-types';

interface PreviewTextProps {
  value: TextMessageContent;
  channelSlug: string;
}

export function PreviewText({ value, channelSlug }: PreviewTextProps) {
  const body = value.body || 'Your message here...';
  const initial = channelSlug.charAt(0).toUpperCase() || 'B';

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      {/* Phone / chat-style container */}
      <div className="mx-auto max-w-xs space-y-3">
        {/* Status bar hint */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
          <span>9:41</span>
          <span className="capitalize">{channelSlug}</span>
        </div>

        {/* Chat bubble row */}
        <div className="flex items-end gap-2">
          {/* Bot avatar */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {initial}
          </div>

          {/* Bubble */}
          <div className="rounded-2xl rounded-bl-md bg-background px-3.5 py-2.5 text-sm leading-relaxed shadow-sm border border-border/40">
            {body}
          </div>
        </div>

        {/* CTA button */}
        {value.ctaText && (
          <div className="pl-9">
            <span className="inline-block rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
              {value.ctaText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
