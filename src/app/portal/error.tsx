'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function PortalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center'>
      <h2 className='text-lg font-semibold'>Something went wrong</h2>
      <p className='text-sm text-muted-foreground'>
        {error.message ||
          'An unexpected error occurred. Please try again later.'}
      </p>
      {error.digest && (
        <p className='text-xs text-muted-foreground'>
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className='rounded-md border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50'
      >
        Try again
      </button>
    </div>
  );
}
