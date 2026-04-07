'use client';

import Link from 'next/link';
import { useActionState, useRef, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import {
  verifyResetCodeAction,
  type VerifyResetCodeResult
} from '@/features/auth/actions/verify-reset-code';

function ResetCodeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') ?? '';

  const [state, formAction, isPending] = useActionState<
    VerifyResetCodeResult | null,
    FormData
  >(verifyResetCodeAction, null);

  /* ── Code input state (6 digits) ── */
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = text[i] ?? '';
    }
    setDigits(next);
    const focusIdx = Math.min(text.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const code = digits.join('');

  /* ── Redirect to new-password page on success ── */
  useEffect(() => {
    if (state?.success && state.token && state.email) {
      router.push(
        `/auth/new-password?email=${encodeURIComponent(state.email)}&token=${encodeURIComponent(state.token)}`
      );
    }
  }, [state, router]);

  if (!email) {
    return (
      <div>
        <h1 className='mb-2 text-center text-4xl font-bold text-gray-900'>
          Missing email.
        </h1>
        <p className='mb-8 text-center text-sm text-gray-500'>
          Please start the password reset from the beginning.
        </p>
        <div className='text-center'>
          <Link
            href='/auth/forgot-password'
            className='text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900'
          >
            Back to forgot password
          </Link>
        </div>
      </div>
    );
  }

  if (state?.locked) {
    return (
      <div>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
          <svg
            className='h-8 w-8 text-red-500'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 15v2m0 0a1 1 0 110 2 1 1 0 010-2zm0-10a3 3 0 00-3 3v2h6V10a3 3 0 00-3-3zM5 12h14a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7a1 1 0 011-1z'
            />
          </svg>
        </div>
        <h1 className='mb-2 text-center text-4xl font-bold text-gray-900'>
          Locked
        </h1>
        <p className='mb-8 text-center text-sm text-gray-500'>
          Too many failed attempts. Try again in{' '}
          <strong>
            {state.hoursLeft} hour{state.hoursLeft !== 1 ? 's' : ''}
          </strong>
          .
        </p>
        <Link
          href='/auth/sign-in'
          className='block text-center text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900'
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className='mb-2 text-center text-4xl font-bold text-gray-900'>
        Enter your code.
      </h1>
      <p className='mb-8 text-center text-sm text-gray-500'>
        We sent a 6-digit code to <strong>{email}</strong>
      </p>

      {state?.error && !state.locked && (
        <div className='mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <input type='hidden' name='email' value={email} />
        <input type='hidden' name='code' value={code} />

        <div className='space-y-5'>
          {/* 6-digit code input */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>
              Verification Code
            </label>
            <div className='flex justify-center gap-2' onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type='text'
                  inputMode='numeric'
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className='h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-semibold text-gray-900 outline-none transition-colors focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          <button
            type='submit'
            disabled={isPending || code.length < 6}
            className='h-11 w-full rounded-md bg-gray-600 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            {isPending ? 'Verifying…' : 'Verify code'}
          </button>
        </div>
      </form>

      <div className='mt-6 text-center'>
        <Link
          href='/auth/forgot-password'
          className='text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900'
        >
          Didn&apos;t get a code? Request a new one
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='text-center text-sm text-gray-500'>Loading…</div>
      }
    >
      <ResetCodeForm />
    </Suspense>
  );
}
