'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signupAction } from '@/features/auth/actions/signup';
import { getGoogleOAuthUrl } from '@/features/auth/actions/google';
import type { AuthResult } from '@/features/auth/actions/login';
import { Chrome } from 'lucide-react';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se';

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState<
    AuthResult | null,
    FormData
  >(signupAction, null);
  const [subdomain, setSubdomain] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const handleGoogleSignup = async () => {
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
      <h1 className='mb-2 text-center text-4xl font-bold text-gray-900'>
        Get started.
      </h1>
      <p className='mb-8 text-center text-sm text-gray-500'>
        Set up your workspace and start building.
      </p>

      {/* Error banner */}
      {(state?.error || confirmError) && (
        <div className='mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {confirmError || state?.error}
        </div>
      )}

      {/* Google sign up */}
      <button
        type='button'
        onClick={handleGoogleSignup}
        disabled={oauthLoading}
        className='flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-amber-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-200 disabled:opacity-50'
      >
        <Chrome className='h-5 w-5' />
        {oauthLoading ? 'Redirecting…' : 'Sign up with Google'}
      </button>

      {/* Divider */}
      <div className='my-6 flex items-center gap-4'>
        <div className='h-px flex-1 bg-gray-200' />
        <span className='text-sm text-gray-400'>Or, sign up with email</span>
        <div className='h-px flex-1 bg-gray-200' />
      </div>

      {/* Form */}
      <form
        action={(fd: FormData) => {
          setConfirmError('');
          const pw = fd.get('password')?.toString() ?? '';
          const cpw = fd.get('confirmPassword')?.toString() ?? '';
          if (pw !== cpw) {
            setConfirmError('Passwords do not match.');
            return;
          }
          // Remove confirmPassword before sending to server action
          fd.delete('confirmPassword');
          formAction(fd);
        }}
      >
        <div className='space-y-5'>
          <div>
            <label
              htmlFor='name'
              className='mb-1.5 block text-sm font-medium text-gray-700'
            >
              Full Name
            </label>
            <input
              id='name'
              name='name'
              type='text'
              required
              className='h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
            />
          </div>

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
              autoComplete='new-password'
              required
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
              required
              className='h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
            />
          </div>

          <div>
            <label
              htmlFor='subdomain'
              className='mb-1.5 block text-sm font-medium text-gray-700'
            >
              Workspace Subdomain
            </label>
            <div className='flex'>
              <input
                id='subdomain'
                name='subdomain'
                type='text'
                placeholder='my-company'
                required
                className='h-11 w-full rounded-l-md border border-r-0 border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
                value={subdomain}
                onChange={(e) =>
                  setSubdomain(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                  )
                }
                minLength={3}
                maxLength={63}
              />
              <span className='flex h-11 items-center rounded-r-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500'>
                .{ROOT_DOMAIN}
              </span>
            </div>
            {subdomain && (
              <p className='mt-1 text-xs text-gray-400'>
                Your portal will be at{' '}
                <span className='font-medium text-gray-600'>
                  {subdomain}.{ROOT_DOMAIN}
                </span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type='submit'
            disabled={isPending}
            className='h-11 w-full rounded-md bg-gray-600 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>

      {/* Bottom link */}
      <div className='mt-6 text-center'>
        <Link
          href='/auth/sign-in'
          className='text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900'
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
