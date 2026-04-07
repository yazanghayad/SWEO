'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ProductTourContent, ProductTourStep } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

const positions: ProductTourStep['position'][] = ['top', 'bottom', 'left', 'right'];

interface EditorProductTourProps {
  value: ProductTourContent;
  onChange: (v: ProductTourContent) => void;
  channelSlug: string;
}

export default function EditorProductTour({ value, onChange, channelSlug: _channelSlug }: EditorProductTourProps) {
  const steps = value.steps ?? [];

  function updateField<K extends keyof ProductTourContent>(key: K, val: ProductTourContent[K]) {
    onChange({ ...value, [key]: val });
  }

  function updateStep(index: number, patch: Partial<ProductTourStep>) {
    const updated = steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    updateField('steps', updated);
  }

  function removeStep(index: number) {
    updateField('steps', steps.filter((_, i) => i !== index));
  }

  function addStep() {
    const newStep: ProductTourStep = {
      id: crypto.randomUUID(),
      selector: '',
      title: '',
      body: '',
      position: 'bottom',
    };
    updateField('steps', [...steps, newStep]);
  }

  return (
    <div className="space-y-4">
      {/* Tour title */}
      <div>
        <label className={labelClass}>Tour Title</label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g. Getting started tour"
          className={inputClass}
        />
      </div>

      {/* Steps */}
      <div>
        <label className={labelClass}>Steps</label>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-md border border-border/60 p-3"
            >
              {/* Step header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-foreground">
                  Step {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* CSS Selector */}
                <div>
                  <label className={labelClass}>CSS Selector</label>
                  <input
                    type="text"
                    value={step.selector}
                    onChange={(e) => updateStep(index, { selector: e.target.value })}
                    placeholder="#my-element or .my-class"
                    className={`${inputClass} font-mono`}
                  />
                </div>

                {/* Step title */}
                <div>
                  <label className={labelClass}>Step Title</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(index, { title: e.target.value })}
                    placeholder="Step title"
                    className={inputClass}
                  />
                </div>

                {/* Step body */}
                <div>
                  <label className={labelClass}>Step Body</label>
                  <textarea
                    rows={2}
                    value={step.body}
                    onChange={(e) => updateStep(index, { body: e.target.value })}
                    placeholder="Describe this step..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Position */}
                <div>
                  <label className={labelClass}>Position</label>
                  <div className="flex gap-1.5">
                    {positions.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => updateStep(index, { position: pos })}
                        className={`rounded-md border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                          step.position === pos
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add step */}
      <button
        type="button"
        onClick={addStep}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border/60 px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add step
      </button>
    </div>
  );
}
