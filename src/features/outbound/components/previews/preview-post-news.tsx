'use client';

import type { PostNewsContent } from '../../lib/channel-content-types';

interface PreviewPostNewsProps {
  value: PostNewsContent;
  channelSlug: string;
}

export function PreviewPostNews({ value }: PreviewPostNewsProps) {
  const title = value.title || 'Post title';
  const body = value.body || 'Post body content goes here...';

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="mx-auto max-w-sm overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
        {/* Content */}
        <div className="space-y-2 px-4 py-4">
          <h3 className="text-sm font-bold leading-snug text-foreground">{title}</h3>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
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
