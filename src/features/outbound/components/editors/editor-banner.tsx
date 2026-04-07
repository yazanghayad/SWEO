'use client';

import type { BannerContent } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

interface EditorBannerProps {
  value: BannerContent;
  onChange: (v: BannerContent) => void;
  channelSlug: string;
}

const STYLE_OPTIONS: { value: BannerContent['style']; label: string; dotColor: string }[] = [
  { value: 'info', label: 'Info', dotColor: 'bg-blue-500' },
  { value: 'warning', label: 'Warning', dotColor: 'bg-amber-500' },
  { value: 'success', label: 'Success', dotColor: 'bg-emerald-500' },
  { value: 'error', label: 'Error', dotColor: 'bg-red-500' },
];

export default function EditorBanner({ value, onChange, channelSlug: _channelSlug }: EditorBannerProps) {
  function update(patch: Partial<BannerContent>) {
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
          placeholder="Banner headline..."
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
          placeholder="Banner message..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Position */}
      <div>
        <label className={labelClass}>Position</label>
        <div className="flex gap-2">
          {(['top', 'bottom'] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => update({ position: pos })}
              className={`flex-1 rounded-md border px-3 py-2 text-[13px] font-medium capitalize transition-colors ${
                value.position === pos
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/60 bg-background text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <label className={labelClass}>Style</label>
        <div className="flex gap-2">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ style: opt.value })}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium transition-colors ${
                value.style === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/60 bg-background text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <span className={`inline-block h-2 w-2 rounded-full ${opt.dotColor}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dismissible */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.dismissible}
            onChange={(e) => update({ dismissible: e.target.checked })}
            className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary/30"
          />
          <span className="text-[13px] text-foreground">Dismissible</span>
        </label>
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>CTA Text</label>
          <input
            type="text"
            value={value.ctaText ?? ''}
            onChange={(e) => update({ ctaText: e.target.value })}
            placeholder="e.g. View details"
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
