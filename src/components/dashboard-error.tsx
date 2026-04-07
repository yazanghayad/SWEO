'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  section?: string;
}

/**
 * Reusable error boundary for dashboard pages.
 *
 * Captures the error in Sentry, displays a user-friendly message,
 * and provides a retry button.
 */
export function DashboardError({ error, reset, section }: DashboardErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 p-8'>
      <Alert variant='destructive' className='max-w-lg'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>
          {section ? `Error loading ${section}` : 'Something went wrong'}
        </AlertTitle>
        <AlertDescription className='mt-2'>
          {error.message || 'An unexpected error occurred. Please try again.'}
          {error.digest && (
            <span className='mt-1 block text-xs text-muted-foreground'>
              Error ID: {error.digest}
            </span>
          )}
        </AlertDescription>
      </Alert>
      <Button onClick={reset} variant='outline'>
        Try again
      </Button>
    </div>
  );
}
