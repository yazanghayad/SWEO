'use client';

import type { BannerContent } from '../../lib/channel-content-types';

interface PreviewBannerProps {
  value: BannerContent;
  channelSlug: string;
}

const STYLE_COLORS: Record<BannerContent['style'], { bg: string; border: string; text: string; btn: string }> = {
  info:    { bg: 'bg-blue-50 dark:bg-blue-950/40',   border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-900 dark:text-blue-100', btn: 'bg-blue-600/20 text-blue-700 dark:text-blue-300' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-900 dark:text-amber-100', btn: 'bg-amber-600/20 text-amber-700 dark:text-amber-300' },
  success: { bg: 'bg-green-50 dark:bg-green-950/40', border: 'border-green-200 dark:border-green-800', text: 'text-green-900 dark:text-green-100', btn: 'bg-green-600/20 text-green-700 dark:text-green-300' },
  error:   { bg: 'bg-red-50 dark:bg-red-950/40',     border: 'border-red-200 dark:border-red-800', text: 'text-red-900 dark:text-red-100', btn: 'bg-red-600/20 text-red-700 dark:text-red-300' },
};

export function PreviewBanner({ value }: PreviewBannerProps) {
  const title = value.title || 'Banner title';
  const body = value.body || 'Banner body text...';
  const colors = STYLE_COLORS[value.style] ?? STYLE_COLORS.info;
  const positionLabel = value.position === 'bottom' ? 'Bottom banner' : 'Top banner';

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      {/* Position label */}
      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {positionLabel}
      </div>

      {/* Banner bar */}
      <div className={`flex items-start gap-3 rounded-md border px-4 py-3 ${colors.bg} ${colors.border}`}>
        <div className={`flex-1 space-y-1 ${colors.text}`}>
          <p className="text-sm font-bold leading-tight">{title}</p>
          <p className="text-xs leading-relaxed opacity-90">{body}</p>

          {value.ctaText && (
            <span className={`mt-1.5 inline-block rounded px-2.5 py-1 text-[11px] font-medium ${colors.btn}`}>
              {value.ctaText}
            </span>
          )}
        </div>

        {/* Dismiss X */}
        {value.dismissible && (
          <button
            type="button"
            className={`shrink-0 text-sm leading-none opacity-60 hover:opacity-100 ${colors.text}`}
            tabIndex={-1}
            aria-label="Dismiss"
          >
            &#10005;
          </button>
        )}
      </div>
    </div>
  );
}
