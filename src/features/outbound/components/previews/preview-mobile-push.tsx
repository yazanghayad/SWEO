'use client';

import type { MobilePushContent } from '../../lib/channel-content-types';

interface PreviewMobilePushProps {
  value: MobilePushContent;
  channelSlug: string;
}

export function PreviewMobilePush({ value }: PreviewMobilePushProps) {
  const title = value.title || 'Notification title';
  const body = value.body || 'Notification body...';

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="mx-auto max-w-xs">
        {/* Mobile notification card */}
        <div className="rounded-xl border border-border/50 bg-background px-3.5 py-3 shadow-md">
          <div className="flex items-start gap-2.5">
            {/* App icon placeholder */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
              <div className="h-5 w-5 rounded bg-blue-600/60" />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="truncate text-xs font-bold text-foreground">{title}</h4>
                <span className="shrink-0 text-[10px] text-muted-foreground/60">now</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                {body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
