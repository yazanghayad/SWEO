'use client';

import type { EmailContent } from '../../lib/channel-content-types';

interface PreviewEmailProps {
  value: EmailContent;
  channelSlug: string;
}

export function PreviewEmail({ value }: PreviewEmailProps) {
  const subject = value.subject || 'Subject line';
  const body = value.body || 'Email body content goes here...';

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      {/* Email card */}
      <div className="mx-auto max-w-sm overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
        {/* Header */}
        <div className="space-y-1 border-b border-border/40 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">From:</span>
            <span>Team</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Subject:</span>
            <span className="truncate">{subject}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {body}
          </p>
        </div>

        {/* CTA */}
        {value.ctaText && (
          <div className="border-t border-border/30 px-4 py-3">
            <span className="inline-block rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white">
              {value.ctaText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
