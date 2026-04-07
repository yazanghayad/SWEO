'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  forgotPasswordAction,
  type ForgotPasswordResult
} from '@/features/auth/actions/forgot-password';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    ForgotPasswordResult | null,
    FormData
  >(forgotPasswordAction, null);

  // Redirect to reset-password page with email when code is sent
  useEffect(() => {
    if (state?.success && state.email) {
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(state.email)}`
      );
    }
  }, [state, router]);

  return (
    <div>
      <h1 className='mb-2 text-center text-4xl font-bold text-gray-900'>
        Forgot password?
      </h1>
      <p className='mb-8 text-center text-sm text-gray-500'>
        Enter your email and we&apos;ll send you a reset code.
      </p>

      {state?.error && (
        <div className='mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {state.error}
        </div>
      )}

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

          <button
            type='submit'
            disabled={isPending}
            className='h-11 w-full rounded-md bg-gray-600 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            {isPending ? 'Sending…' : 'Send reset code'}
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
