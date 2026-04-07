'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SetupWorkspacePage() {
  const router = useRouter();
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubdomainChange = (val: string) => {
    setSubdomain(val.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain || subdomain.length < 3) {
      setError('Subdomänen måste vara minst 3 tecken.');
      return;
    }

    setIsPending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/setup-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Något gick fel.');
        setIsPending(false);
        return;
      }

      // Redirect to preparing page or dashboard
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        router.push('/dashboard/overview');
      }
    } catch {
      setError('Nätverksfel. Försök igen.');
      setIsPending(false);
    }
  };

  return (
    <div>
      <h1 className='mb-2 text-center text-3xl font-bold text-gray-900'>
        Skapa din workspace
      </h1>
      <p className='mb-8 text-center text-sm text-gray-500'>
        Välj en URL för din workspace. Du kan inte ändra detta senare.
      </p>

      {error && (
        <div className='mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='space-y-5'>
          <div>
            <label
              htmlFor='subdomain'
              className='mb-1.5 block text-sm font-medium text-gray-700'
            >
              Workspace URL
            </label>
            <div className='flex items-center'>
              <input
                id='subdomain'
                type='text'
                value={subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                placeholder='ditt-foretag'
                required
                minLength={3}
                maxLength={40}
                className='h-11 flex-1 rounded-l-md border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
              />
              <span className='flex h-11 items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500'>
                .sweo.se
              </span>
            </div>
            {subdomain && (
              <p className='mt-1.5 text-xs text-gray-500'>
                Din workspace blir tillgänglig på{' '}
                <span className='font-medium text-gray-700'>
                  {subdomain}.sweo.se
                </span>
              </p>
            )}
          </div>

          <button
            type='submit'
            disabled={isPending}
            className='h-11 w-full rounded-md bg-gray-600 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            {isPending ? 'Skapar...' : 'Skapa workspace'}
          </button>
        </div>
      </form>
    </div>
  );
}
