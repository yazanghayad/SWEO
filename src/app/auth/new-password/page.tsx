'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import {
  resetPasswordAction,
  type ResetPasswordResult
} from '@/features/auth/actions/reset-password';

function NewPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const [state, formAction, isPending] = useActionState<
    ResetPasswordResult | null,
    FormData
  >(resetPasswordAction, null);

  /* ── Redirect to sign-in on success ── */
  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => router.push('/auth/sign-in'), 2000);
      return () => clearTimeout(t);
    }
  }, [state?.success, router]);

  if (!email || !token) {
    return (
      <div>
        <h1 className='mb-2 text-center text-4xl font-bold text-gray-900'>
          Invalid session.
        </h1>
        <p className='mb-8 text-center text-sm text-gray-500'>
          This password reset session is invalid or has expired.
        </p>
        <div className='text-center'>
          <Link
            href='/auth/forgot-password'
            className='text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900'
          >
            Start over
          </Link>
        </div>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
          <svg
            className='h-8 w-8 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h1 className='mb-2 text-center text-4xl font-bold text-gray-900'>
          Password updated!
        </h1>
        <p className='mb-8 text-center text-sm text-gray-500'>
          Your password has been reset. Redirecting to sign in…
        </p>
        <Link
          href='/auth/sign-in'
          className='block h-11 w-full rounded-md bg-gray-600 text-center text-sm font-medium leading-[2.75rem] text-white transition-colors hover:bg-gray-700'
        >
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className='mb-2 text-center text-4xl font-bold text-gray-900'>
        New password.
      </h1>
      <p className='mb-8 text-center text-sm text-gray-500'>
        Enter your new password below.
      </p>

      {state?.error && (
        <div className='mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <input type='hidden' name='email' value={email} />
        <input type='hidden' name='token' value={token} />

        <div className='space-y-5'>
          <div>
            <label
              htmlFor='password'
              className='mb-1.5 block text-sm font-medium text-gray-700'
            >
              New Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='new-password'
              placeholder='Minimum 8 characters'
              minLength={8}
              required
              autoFocus
              className='h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
            />
          </div>

          <div>
            <label
              htmlFor='confirmPassword'
              className='mb-1.5 block text-sm font-medium text-gray-700'
            >
              Confirm Password
            </label>
            <input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              autoComplete='new-password'
              placeholder='Repeat your password'
              minLength={8}
              required
              className='h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
            />
          </div>

          <button
            type='submit'
            disabled={isPending}
            className='h-11 w-full rounded-md bg-gray-600 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            {isPending ? 'Saving…' : 'Save new password'}
          </button>
        </div>
      </form>

      <div className='mt-6 text-center'>
        <Link
          href='/auth/sign-in'
          className='text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900'
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='text-center text-sm text-gray-500'>Loading…</div>
      }
    >
      <NewPasswordForm />
    </Suspense>
  );
}
