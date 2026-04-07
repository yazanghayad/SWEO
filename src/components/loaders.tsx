'use client';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Standardised loading spinners for the dashboard.
//
// Usage:
//   <PageLoader />           – full-section spinner (h-8 w-8), py-20
//   <ContentLoader />        – content-area spinner (h-6 w-6), py-12
//   <InlineLoader />         – inline/button spinner (h-4 w-4)
// ---------------------------------------------------------------------------

interface LoaderProps {
  className?: string;
  label?: string;
}

/**
 * Full-page / full-section loading spinner.
 * Use as the top-level return when the entire page is loading.
 */
export function PageLoader({ className, label }: LoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-2 py-20',
        className
      )}
    >
      <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      {label && (
        <span className='text-muted-foreground text-sm'>{label}</span>
      )}
    </div>
  );
}

/**
 * Content-area loading spinner.
 * Use inside a card or section when only part of the page is loading.
 */
export function ContentLoader({ className, label }: LoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-12',
        className
      )}
    >
      <Icons.spinner className='text-muted-foreground h-6 w-6 animate-spin' />
      {label && (
        <span className='text-muted-foreground text-sm'>{label}</span>
      )}
    </div>
  );
}

/**
 * Inline / button-level spinner.
 * Use inside buttons or inline with text.
 */
export function InlineLoader({ className }: { className?: string }) {
  return (
    <Icons.spinner
      className={cn('text-muted-foreground h-4 w-4 animate-spin', className)}
    />
  );
}
