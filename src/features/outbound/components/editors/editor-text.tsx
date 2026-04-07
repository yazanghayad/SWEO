'use client';

import type { TextMessageContent } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

interface EditorTextProps {
  value: TextMessageContent;
  onChange: (v: TextMessageContent) => void;
  channelSlug: string;
}

export default function EditorText({ value, onChange, channelSlug }: EditorTextProps) {
  const isSms = channelSlug === 'sms';

  function update(patch: Partial<TextMessageContent>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="space-y-4">
      {/* Body */}
      <div>
        <label className={labelClass}>Body</label>
        <textarea
          rows={isSms ? 3 : 5}
          value={value.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder="Write your message..."
          className={`${inputClass} resize-none`}
        />
        {isSms && (
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {value.body.length}/160
          </p>
        )}
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
