'use client';

import { Plus, X } from 'lucide-react';
import type { SurveyContent } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

const questionTypes: { value: SurveyContent['questionType']; label: string }[] = [
  { value: 'rating', label: 'Rating' },
  { value: 'text', label: 'Free text' },
  { value: 'multiple-choice', label: 'Multiple choice' },
];

interface EditorSurveyProps {
  value: SurveyContent;
  onChange: (v: SurveyContent) => void;
  channelSlug: string;
}

export default function EditorSurvey({ value, onChange, channelSlug: _channelSlug }: EditorSurveyProps) {
  const choices = value.choices ?? [];

  function updateField<K extends keyof SurveyContent>(key: K, val: SurveyContent[K]) {
    onChange({ ...value, [key]: val });
  }

  function updateChoice(index: number, text: string) {
    const updated = choices.map((c, i) => (i === index ? text : c));
    onChange({ ...value, choices: updated });
  }

  function removeChoice(index: number) {
    onChange({ ...value, choices: choices.filter((_, i) => i !== index) });
  }

  function addChoice() {
    onChange({ ...value, choices: [...choices, ''] });
  }

  return (
    <div className="space-y-4">
      {/* Survey title */}
      <div>
        <label className={labelClass}>Survey Title</label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g. Customer satisfaction survey"
          className={inputClass}
        />
      </div>

      {/* Question text */}
      <div>
        <label className={labelClass}>Question Text</label>
        <textarea
          rows={3}
          value={value.question}
          onChange={(e) => updateField('question', e.target.value)}
          placeholder="Enter your survey question..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Question type */}
      <div>
        <label className={labelClass}>Question Type</label>
        <div className="flex gap-1.5">
          {questionTypes.map((qt) => (
            <button
              key={qt.value}
              type="button"
              onClick={() => updateField('questionType', qt.value)}
              className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                value.questionType === qt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              {qt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Multiple choice options */}
      {value.questionType === 'multiple-choice' && (
        <div>
          <label className={labelClass}>Choices</label>
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeChoice(index)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addChoice}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-border/60 px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add choice
          </button>
        </div>
      )}
    </div>
  );
}
