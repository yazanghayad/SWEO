'use client';

import { Plus, X } from 'lucide-react';
import type { ChecklistContent, ChecklistItem } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

interface EditorChecklistProps {
  value: ChecklistContent;
  onChange: (v: ChecklistContent) => void;
  channelSlug: string;
}

export default function EditorChecklist({ value, onChange, channelSlug: _channelSlug }: EditorChecklistProps) {
  const items = value.items ?? [];

  function updateField<K extends keyof ChecklistContent>(key: K, val: ChecklistContent[K]) {
    onChange({ ...value, [key]: val });
  }

  function updateItem(index: number, patch: Partial<ChecklistItem>) {
    const updated = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateField('items', updated);
  }

  function removeItem(index: number) {
    updateField('items', items.filter((_, i) => i !== index));
  }

  function addItem() {
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      label: '',
    };
    updateField('items', [...items, newItem]);
  }

  return (
    <div className="space-y-4">
      {/* Checklist title */}
      <div>
        <label className={labelClass}>Checklist Title</label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g. Onboarding checklist"
          className={inputClass}
        />
      </div>

      {/* Items */}
      <div>
        <label className={labelClass}>Items</label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                placeholder="Item label"
                className={`${inputClass} flex-1`}
              />
              <input
                type="text"
                value={item.url ?? ''}
                onChange={(e) => updateItem(index, { url: e.target.value || undefined })}
                placeholder="Link URL (optional)"
                className={`${inputClass} w-[200px]`}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add item */}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border/60 px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add item
      </button>
    </div>
  );
}
