'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction, type AuthResult } from '@/features/auth/actions/login';
import { getGoogleOAuthUrl } from '@/features/auth/actions/google';
import { Chrome } from 'lucide-react';

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState<
    AuthResult | null,
    FormData
  >(loginAction, null);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const searchParams = useSearchParams();
  const signedOut = searchParams.get('signed_out') === 'true';
  const oauthError = searchParams.get('error');

  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    try {
      const url = await getGoogleOAuthUrl();
      window.location.href = url;
    } catch {
      setOauthLoading(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <h1 className='mb-8 text-center text-4xl font-bold text-gray-900'>
        Welcome.
      </h1>

      {/* Signed out banner */}
      {signedOut && (
        <div className='mb-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800'>
          Signed out successfully.
        </div>
      )}

      {/* Error banner */}
      {(state?.error || oauthError) && (
        <div className='mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {state?.error ??
            (oauthError === 'oauth_failed'
              ? 'Google-inloggningen misslyckades. Försök igen.'
              : oauthError === 'oauth_session_failed'
                ? 'Kunde inte skapa session. Försök igen.'
                : 'Ett fel uppstod.')}
        </div>
      )}

      {/* Google sign in */}
      <button
        type='button'
        onClick={handleGoogleLogin}
        disabled={oauthLoading}
        className='flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-amber-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-200 disabled:opacity-50'
      >
        <Chrome className='h-5 w-5' />
        {oauthLoading ? 'Redirecting…' : 'Sign in with Google'}
      </button>

      {/* Divider */}
      <div className='my-6 flex items-center gap-4'>
        <div className='h-px flex-1 bg-gray-200' />
        <span className='text-sm text-gray-400'>Or, sign in with your email</span>
        <div className='h-px flex-1 bg-gray-200' />
      </div>

      {/* Form */}
      <form action={formAction}>
        <div className='space-y-5'>
          <div>
            <label
              htmlFor='email'
              className='mb-1.5 block text-sm font-medium text-gray-700'
            >
              Work Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              className='h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='mb-1.5 block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              required
              className='h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:bg-white focus:ring-1 focus:ring-gray-500'
            />
          </div>

          {/* Keep signed in + forgot */}
          <div className='flex items-center justify-between'>
            <label className='flex items-center gap-2 text-sm text-gray-600'>
              <input
                type='checkbox'
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className='h-4 w-4 rounded border-gray-300'
              />
              Keep me signed in
            </label>
            <Link
              href='/auth/forgot-password'
              className='text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900'
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type='submit'
            disabled={isPending}
            className='h-11 w-full rounded-md bg-gray-600 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>

      {/* Bottom links */}
      <div className='mt-6 flex items-center justify-between'>
        <Link
          href='/auth/sign-up'
          className='text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900'
        >
          Create an account
        </Link>
        <span className='text-sm text-gray-400'>
          Data host region:{' '}
          <span className='font-medium text-blue-600'>EU (Frankfurt)</span>
        </span>
      </div>
    </div>
  );
}

