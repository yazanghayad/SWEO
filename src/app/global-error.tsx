'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Something went wrong</h2>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '0.375rem',
              background: '#fff',
              fontSize: '0.875rem'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
