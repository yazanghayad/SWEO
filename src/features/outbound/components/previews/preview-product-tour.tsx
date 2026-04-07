'use client';

import type { ProductTourContent } from '../../lib/channel-content-types';

interface PreviewProductTourProps {
  value: ProductTourContent;
  channelSlug: string;
}

export function PreviewProductTour({ value }: PreviewProductTourProps) {
  const steps = value.steps ?? [];
  const totalSteps = steps.length || 1;
  const firstStep = steps[0];
  const stepTitle = firstStep?.title || 'Step title';
  const stepBody = firstStep?.body || 'Step body description...';

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="mx-auto max-w-xs">
        {/* Tour popover card */}
        <div className="rounded-lg border border-border/50 bg-background shadow-md">
          <div className="px-4 py-3">
            {/* Step counter */}
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Step 1 of {totalSteps}
            </p>

            <h4 className="text-sm font-semibold leading-snug text-foreground">{stepTitle}</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{stepBody}</p>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between border-t border-border/30 px-4 py-2.5">
            <button
              type="button"
              tabIndex={-1}
              className="rounded px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50"
            >
              Back
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white"
            >
              Next
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="mt-3 flex justify-center gap-1.5">
          {steps.map((step, i) => (
            <span
              key={step.id}
              className={`h-1.5 w-1.5 rounded-full ${
                i === 0 ? 'bg-blue-600' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
          {steps.length === 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          )}
        </div>
      </div>
    </div>
  );
}
