'use client';

import type { ChecklistContent } from '../../lib/channel-content-types';

interface PreviewChecklistProps {
  value: ChecklistContent;
  channelSlug: string;
}

export function PreviewChecklist({ value }: PreviewChecklistProps) {
  const title = value.title || 'Checklist';
  const items = value.items ?? [];
  const total = items.length || 1;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="mx-auto max-w-xs overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <h4 className="text-sm font-bold leading-snug text-foreground">{title}</h4>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-0 rounded-full bg-blue-600 transition-all" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              0 / {total}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-border/30">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 border-b border-border/20 px-4 py-2.5 last:border-b-0"
              >
                {/* Empty checkbox */}
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border/60 bg-background" />
                <span className="text-xs text-foreground">{item.label || 'Untitled item'}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border/60 bg-background" />
              <span className="text-xs text-muted-foreground">No items yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
