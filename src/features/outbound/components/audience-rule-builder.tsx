'use client';

import type { TemplateRule } from '../lib/outbound-data';
import { Plus, X, Users } from 'lucide-react';

interface AudienceRuleBuilderProps {
  rules: TemplateRule[];
  onChange: (rules: TemplateRule[]) => void;
}

/* ── Quick presets ────────────────────────────────────────────── */

const PRESETS: { label: string; rules: TemplateRule[] }[] = [
  { label: 'All users', rules: [] },
  { label: 'New users', rules: [{ field: 'Signed up', operator: 'within', value: '7 days' }] },
  { label: 'Active users', rules: [{ field: 'Last seen', operator: 'within', value: '7 days' }] },
  {
    label: 'Inactive users',
    rules: [{ field: 'Last seen', operator: 'more than', value: '30 days ago' }]
  },
  { label: 'Trial users', rules: [{ field: 'Plan', operator: 'is', value: 'Trial' }] },
  { label: 'Visitors', rules: [{ field: 'User type', operator: 'is', value: 'Visitors' }] }
];

/* ── Field & operator options ────────────────────────────────── */

const FIELDS = [
  'User role',
  'User type',
  'Last seen',
  'Signed up',
  'Plan',
  'Session count',
  'Visit count',
  'Current page URL',
  'Time on current page',
  'Browser language',
  'Feature used',
  'Event',
  'Email subscription',
  'Push enabled',
  'Platform'
];

const OPERATORS = [
  'is',
  'is not',
  'contains',
  'greater than',
  'less than',
  'within',
  'more than'
];

/* ── Helpers ─────────────────────────────────────────────────── */

function rulesMatch(a: TemplateRule[], b: TemplateRule[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (r, i) =>
      r.field === b[i].field &&
      r.operator === b[i].operator &&
      r.value === b[i].value
  );
}

/* ── Component ───────────────────────────────────────────────── */

export default function AudienceRuleBuilder({ rules, onChange }: AudienceRuleBuilderProps) {
  function updateRule(index: number, patch: Partial<TemplateRule>) {
    const next = rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(next);
  }

  function removeRule(index: number) {
    onChange(rules.filter((_, i) => i !== index));
  }

  function addRule() {
    onChange([...rules, { field: FIELDS[0], operator: OPERATORS[0], value: '' }]);
  }

  return (
    <div className="space-y-4">
      {/* ── Quick preset chips ─────────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-[12px] font-medium text-muted-foreground">Quick presets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const active = rulesMatch(rules, preset.rules);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.rules)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Rules list ─────────────────────────────────────────── */}
      {rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={index}>
              {index > 0 && (
                <p className="mb-2 text-center text-[11px] font-medium text-muted-foreground">
                  and
                </p>
              )}
              <div className="flex items-center gap-2">
                {/* Field */}
                <select
                  value={rule.field}
                  onChange={(e) => updateRule(index, { field: e.target.value })}
                  className="h-9 flex-1 rounded-md border border-border/60 bg-background px-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  {FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                {/* Operator */}
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(index, { operator: e.target.value })}
                  className="h-9 flex-1 rounded-md border border-border/60 bg-background px-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  {OPERATORS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>

                {/* Value */}
                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => updateRule(index, { value: e.target.value })}
                  placeholder="Value"
                  className="h-9 flex-1 rounded-md border border-border/60 bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add rule button ────────────────────────────────────── */}
      <button
        type="button"
        onClick={addRule}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-background px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add rule
      </button>
    </div>
  );
}
