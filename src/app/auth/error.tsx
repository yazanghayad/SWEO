'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function AuthError({
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
    <div className='flex flex-col items-center gap-4 text-center'>
      <h2 className='text-lg font-semibold text-gray-900'>
        Something went wrong
      </h2>
      <p className='text-sm text-gray-600'>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {error.digest && (
        <p className='text-xs text-gray-400'>Error ID: {error.digest}</p>
      )}
      <div className='flex gap-3'>
        <button
          onClick={reset}
          className='rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
        >
          Try again
        </button>
        <Link
          href='/auth/sign-in'
          className='rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800'
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
