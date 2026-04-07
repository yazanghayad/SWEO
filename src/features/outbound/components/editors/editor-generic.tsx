'use client';

import type { GenericContent } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

interface EditorGenericProps {
  value: GenericContent;
  onChange: (v: GenericContent) => void;
  channelSlug: string;
}

export default function EditorGeneric({ value, onChange, channelSlug: _channelSlug }: EditorGenericProps) {
  function update(patch: Partial<GenericContent>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="space-y-4">
      {/* Title (optional) */}
      <div>
        <label className={labelClass}>Title (optional)</label>
        <input
          type="text"
          value={value.title ?? ''}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Optional title..."
          className={inputClass}
        />
      </div>

      {/* Body */}
      <div>
        <label className={labelClass}>Body</label>
        <textarea
          rows={5}
          value={value.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder="Write your message..."
          className={`${inputClass} resize-none`}
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
            placeholder="e.g. Learn more"
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
