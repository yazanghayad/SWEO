'use client';

import type { MobilePushContent } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

interface EditorMobilePushProps {
  value: MobilePushContent;
  onChange: (v: MobilePushContent) => void;
  channelSlug: string;
}

export default function EditorMobilePush({ value, onChange, channelSlug: _channelSlug }: EditorMobilePushProps) {
  function updateField<K extends keyof MobilePushContent>(key: K, val: MobilePushContent[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Title</label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {value.title.length}/50
          </span>
        </div>
        <input
          type="text"
          value={value.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Push notification title"
          className={inputClass}
        />
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Body</label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {value.body.length}/140
          </span>
        </div>
        <textarea
          rows={3}
          value={value.body}
          onChange={(e) => updateField('body', e.target.value)}
          placeholder="Push notification body text..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Deep link URL */}
      <div>
        <label className={labelClass}>Deep Link URL</label>
        <input
          type="text"
          value={value.deepLinkUrl ?? ''}
          onChange={(e) => updateField('deepLinkUrl', e.target.value || undefined)}
          placeholder="e.g. myapp://screen/settings"
          className={inputClass}
        />
      </div>
    </div>
  );
}
