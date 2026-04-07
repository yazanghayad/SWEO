'use client';

import type { SurveyContent } from '../../lib/channel-content-types';

interface PreviewSurveyProps {
  value: SurveyContent;
  channelSlug: string;
}

export function PreviewSurvey({ value }: PreviewSurveyProps) {
  const title = value.title || 'Survey';
  const question = value.question || 'Your question here...';
  const questionType = value.questionType ?? 'rating';
  const choices = value.choices ?? [];

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="mx-auto max-w-xs overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
        <div className="space-y-3 px-4 py-4">
          {/* Title */}
          <h4 className="text-sm font-bold leading-snug text-foreground">{title}</h4>

          {/* Question */}
          <p className="text-xs leading-relaxed text-muted-foreground">{question}</p>

          {/* Rating stars */}
          {questionType === 'rating' && (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className="h-5 w-5 text-muted-foreground/30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              ))}
            </div>
          )}

          {/* Text input placeholder */}
          {questionType === 'text' && (
            <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
              <span className="text-xs text-muted-foreground/50">Type your answer...</span>
            </div>
          )}

          {/* Multiple-choice options */}
          {questionType === 'multiple-choice' && (
            <div className="space-y-2">
              {choices.length > 0 ? (
                choices.map((choice, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs text-foreground">
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background" />
                    {choice || `Option ${i + 1}`}
                  </label>
                ))
              ) : (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background" />
                  No options defined
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
