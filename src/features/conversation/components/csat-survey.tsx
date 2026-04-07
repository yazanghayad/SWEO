'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CsatSurveyProps {
  /** ID of the resolved conversation. */
  conversationId: string;
  /** Base URL for API calls. Defaults to '' (same origin). */
  apiUrl?: string;
  /** Called after successful submission. */
  onSubmitted?: (score: number) => void;
  /** Called if user dismisses the survey. */
  onDismiss?: () => void;
  /** Extra class names. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * CSAT (Customer Satisfaction) survey component.
 *
 * Shows a 1-5 star rating and optional free-text feedback input.
 * Submits to POST /api/conversations/csat.
 */
export function CsatSurvey({
  conversationId,
  apiUrl = '',
  onSubmitted,
  onDismiss,
  className
}: CsatSurveyProps) {
  const [hoveredStar, setHoveredStar] = React.useState(0);
  const [selectedScore, setSelectedScore] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);

  const handleStarClick = (star: number) => {
    setSelectedScore(star);
    setShowFeedback(true);
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedScore === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/conversations/csat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          score: selectedScore,
          feedback: feedback.trim() || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? 'Failed to submit'
        );
      }

      setSubmitted(true);
      onSubmitted?.(selectedScore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit rating'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submitted state ─────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center',
          className
        )}
      >
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600'>
          <Check className='h-5 w-5' />
        </div>
        <p className='text-sm font-medium'>Thank you for your feedback!</p>
        <p className='text-xs text-muted-foreground'>
          Your rating helps us improve our AI assistant.
        </p>
      </div>
    );
  }

  // ── Rating labels ───────────────────────────────────────────────────
  const labels = ['', 'Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'];
  const displayStar = hoveredStar || selectedScore;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg border bg-card p-5',
        className
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium'>How was your experience?</p>
          <p className='text-xs text-muted-foreground'>
            Rate your conversation with our AI assistant
          </p>
        </div>
        {onDismiss && (
          <Button
            variant='ghost'
            size='sm'
            className='h-6 px-2 text-xs text-muted-foreground'
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </div>

      {/* Stars */}
      <div className='flex flex-col items-center gap-2'>
        <div className='flex gap-1'>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= displayStar;
            return (
              <button
                key={star}
                type='button'
                className={cn(
                  'rounded-md p-1 transition-all',
                  filled
                    ? 'text-yellow-500 hover:text-yellow-400'
                    : 'text-muted-foreground/30 hover:text-yellow-400'
                )}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleStarClick(star)}
                aria-label={`Rate ${star} out of 5`}
              >
                {filled ? (
                  <Star className='h-7 w-7' />
                ) : (
                  <Star className='h-7 w-7' />
                )}
              </button>
            );
          })}
        </div>
        {displayStar > 0 && (
          <span className='text-xs font-medium text-muted-foreground'>
            {labels[displayStar]}
          </span>
        )}
      </div>

      {/* Feedback input (shown after selecting a score) */}
      {showFeedback && (
        <div className='space-y-2'>
          <Textarea
            placeholder='Tell us more about your experience (optional)...'
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className='resize-none text-sm'
          />
        </div>
      )}

      {/* Error */}
      {error && <p className='text-xs text-destructive'>{error}</p>}

      {/* Submit */}
      {selectedScore > 0 && (
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size='sm'
          className='w-full'
        >
          {submitting ? 'Submitting…' : 'Submit Rating'}
        </Button>
      )}
    </div>
  );
}
