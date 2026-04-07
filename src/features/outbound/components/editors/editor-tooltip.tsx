'use client';

import type { TooltipContent } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

interface EditorTooltipProps {
  value: TooltipContent;
  onChange: (v: TooltipContent) => void;
  channelSlug: string;
}

export default function EditorTooltip({ value, onChange, channelSlug: _channelSlug }: EditorTooltipProps) {
  function update(patch: Partial<TooltipContent>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Tooltip headline..."
          className={inputClass}
        />
      </div>

      {/* Body */}
      <div>
        <label className={labelClass}>Body</label>
        <textarea
          rows={3}
          value={value.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder="Tooltip content..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* CSS Selector */}
      <div>
        <label className={labelClass}>CSS Selector</label>
        <input
          type="text"
          value={value.cssSelector}
          onChange={(e) => update({ cssSelector: e.target.value })}
          placeholder='e.g. [data-tooltip="feature"]'
          className={`${inputClass} font-mono`}
        />
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>CTA Text</label>
          <input
            type="text"
            value={value.ctaText ?? ''}
            onChange={(e) => update({ ctaText: e.target.value })}
            placeholder="e.g. Got it"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>CTA URL</label>
          <input
            type="text"
            value={value.ctaUrl ?? ''}
            onChange={(e) => update({ ctaUrl: e.target.value })}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
