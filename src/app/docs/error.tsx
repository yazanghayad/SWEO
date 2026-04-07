'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function DocsError({
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
      <h2 className='text-lg font-semibold'>Error loading documentation</h2>
      <p className='text-sm text-muted-foreground'>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {error.digest && (
        <p className='text-xs text-muted-foreground'>
          Error ID: {error.digest}
        </p>
      )}
      <div className='flex gap-3'>
        <button
          onClick={reset}
          className='rounded-md border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50'
        >
          Try again
        </button>
        <Link
          href='/'
          className='rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800'
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
