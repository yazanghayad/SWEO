'use client';

import type { TooltipContent } from '../../lib/channel-content-types';

interface PreviewTooltipProps {
  value: TooltipContent;
  channelSlug: string;
}

export function PreviewTooltip({ value }: PreviewTooltipProps) {
  const title = value.title || 'Tooltip title';
  const body = value.body || 'Tooltip body text...';

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="flex flex-col items-center gap-3">
        {/* Beacon dot */}
        <div className="relative">
          <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-blue-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-600" />
        </div>

        {/* Tooltip popover card */}
        <div className="w-full max-w-xs">
          {/* Arrow */}
          <div className="mx-auto h-0 w-0 border-x-[6px] border-b-[6px] border-x-transparent border-b-border/50" />

          <div className="rounded-lg border border-border/50 bg-background px-4 py-3 shadow-md">
            <h4 className="text-sm font-semibold leading-snug text-foreground">{title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>

            {value.ctaText && (
              <span className="mt-2 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white">
                {value.ctaText}
              </span>
            )}
          </div>
        </div>

        {/* CSS selector label */}
        {value.cssSelector && (
          <p className="text-[10px] font-mono text-muted-foreground/60">
            Target: <span className="text-muted-foreground">{value.cssSelector}</span>
          </p>
        )}
      </div>
    </div>
  );
}
