'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function PreparingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subdomain, setSubdomain] = useState(searchParams.get('subdomain') ?? '');
  const rootDomain = 'sweo.se';
  const tenantUrl = `https://${subdomain}.${rootDomain}`;
  const [status, setStatus] = useState('Skapar din workspace...');
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  // If no subdomain in URL, fetch it from the API
  useEffect(() => {
    if (subdomain) return;
    fetch('/api/tenant/my-subdomain')
      .then((res) => res.json())
      .then((data) => {
        if (data.subdomain) {
          setSubdomain(data.subdomain);
        } else {
          router.push('/auth/sign-in');
        }
      })
      .catch(() => router.push('/auth/sign-in'));
  }, [subdomain, router]);

  const steps = [
    'Skapar din workspace...',
    'Konfigurerar DNS...',
    'Utfärdar SSL-certifikat...',
    'Nästan klar...'
  ];

  // Animate through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        const next = Math.min(prev + 1, steps.length - 1);
        setStatus(steps[next]);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Poll subdomain until it responds
  useEffect(() => {
    if (!subdomain) return;

    let cancelled = false;

    async function checkSubdomain() {
      try {
        const res = await fetch(`/api/tenant/subdomain-health?subdomain=${subdomain}`);
        const data = await res.json();
        if (data.ready && !cancelled) {
          setReady(true);
          setStatus('Din workspace är klar!');
          // Wait a moment to show success, then redirect
          setTimeout(() => {
            window.location.href = `${tenantUrl}/dashboard/overview`;
          }, 1500);
        }
      } catch {
        // Not ready yet, will retry
      }
    }

    // Start checking after 3 seconds, then every 2 seconds
    const initialDelay = setTimeout(() => {
      checkSubdomain();
      const interval = setInterval(checkSubdomain, 2000);
      // Cleanup interval
      const cleanup = () => {
        clearInterval(interval);
        cancelled = true;
      };
      // Max wait 30 seconds, then redirect anyway
      const maxWait = setTimeout(() => {
        cleanup();
        window.location.href = `${tenantUrl}/dashboard/overview`;
      }, 30000);
      // Store cleanup for effect cleanup
      (window as unknown as Record<string, unknown>).__preparingCleanup = () => {
        cleanup();
        clearTimeout(maxWait);
      };
    }, 3000);

    return () => {
      clearTimeout(initialDelay);
      const cleanup = (window as unknown as Record<string, unknown>).__preparingCleanup;
      if (typeof cleanup === 'function') cleanup();
    };
  }, [subdomain, tenantUrl]);

  if (!subdomain) {
    // Show loading while fetching subdomain from API
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400' />
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900'>
      <div className='mx-auto max-w-md space-y-8 text-center'>
        {/* Logo */}
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white'>
          S
        </div>

        {/* Spinner or checkmark */}
        <div className='flex justify-center'>
          {ready ? (
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
              <svg className='h-8 w-8 text-green-600 dark:text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
          ) : (
            <div className='h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400' />
          )}
        </div>

        {/* Status text */}
        <div className='space-y-2'>
          <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {status}
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Din workspace blir tillgänglig på{' '}
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              {subdomain}.{rootDomain}
            </span>
          </p>
        </div>

        {/* Progress bar */}
        <div className='mx-auto h-1.5 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className='h-full rounded-full bg-blue-600 transition-all duration-1000 ease-out'
            style={{ width: ready ? '100%' : `${Math.min(((step + 1) / steps.length) * 85, 85)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function PreparingPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600' />
        </div>
      }
    >
      <PreparingContent />
    </Suspense>
  );
}
