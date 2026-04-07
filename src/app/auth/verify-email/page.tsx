'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmailAction } from '@/features/auth/actions/verify-email';
import type { VerifyEmailResult } from '@/features/auth/actions/verify-email';
import { Icons } from '@/components/icons';
import { CheckCircle2, Mail, RefreshCw, ShieldAlert } from 'lucide-react';

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') ?? '';

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [status, setStatus] = useState<
    'idle' | 'verifying' | 'success' | 'error' | 'locked'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [hoursLeft, setHoursLeft] = useState<number | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-submit when all 6 digits are entered
  const submitCode = useCallback(
    async (code: string) => {
      if (code.length !== CODE_LENGTH) return;
      if (status === 'locked') return;
      setStatus('verifying');
      setErrorMsg('');

      const result: VerifyEmailResult = await verifyEmailAction(code, email);
      if (result.success) {
        setStatus('success');
        setTimeout(() => router.push('/setup'), 1500);
      } else if (result.locked) {
        setStatus('locked');
        setHoursLeft(result.hoursLeft ?? 24);
        setErrorMsg(result.error ?? 'Too many attempts.');
      } else {
        setStatus('error');
        setErrorMsg(result.error ?? 'Invalid code. Please try again.');
        if (result.attemptsLeft !== undefined) {
          setAttemptsLeft(result.attemptsLeft);
        }
        // Reset inputs
        setDigits(Array(CODE_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    },
    [email, router, status]
  );

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    const code = newDigits.join('');
    if (code.length === CODE_LENGTH && !newDigits.includes('')) {
      submitCode(code);
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
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasted.length >= CODE_LENGTH) {
      const newDigits = pasted.slice(0, CODE_LENGTH).split('');
      setDigits(newDigits);
      inputRefs.current[CODE_LENGTH - 1]?.focus();
      submitCode(newDigits.join(''));
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) setResent(true);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (status === 'success') {
    return (
      <div className='text-center'>
        <div className='space-y-4'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50'>
            <CheckCircle2 className='h-8 w-8 text-green-500' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Email Verified!
          </h1>
          <p className='text-sm text-gray-500'>
            Redirecting to your dashboard...
          </p>
          <Icons.spinner className='mx-auto h-5 w-5 animate-spin text-gray-400' />
        </div>
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className='text-center'>
        <div className='space-y-4'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50'>
            <ShieldAlert className='h-8 w-8 text-red-400' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Account Locked
          </h1>
          <p className='text-sm text-gray-500'>
            Too many incorrect attempts. For security, verification is locked
            for {hoursLeft ?? 24} hours.
          </p>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
            <p className='text-sm text-red-600'>
              Please try again later or contact support if you need help.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='text-center'>
      <div className='space-y-6'>
        {/* Icon */}
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50'>
          <Mail className='h-8 w-8 text-blue-500' />
        </div>

        {/* Title */}
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Verify your email
          </h1>
          <p className='text-sm text-gray-500'>
            We sent a 6-digit code to
          </p>
          {email && (
            <p className='text-sm font-medium text-gray-900'>{email}</p>
          )}
        </div>

        {/* Code input */}
        <div className='flex justify-center gap-2' onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={status === 'verifying'}
              className={`h-14 w-12 rounded-lg border-2 text-center text-2xl font-bold text-gray-900 transition-colors
                ${status === 'error' ? 'border-red-300 bg-red-50' : digit ? 'border-gray-900 bg-white' : 'border-gray-200 bg-gray-50'}
                focus:border-gray-900 focus:bg-white focus:outline-none
                disabled:opacity-50`}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Status */}
        {status === 'verifying' && (
          <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
            <Icons.spinner className='h-4 w-4 animate-spin' />
            Verifying...
          </div>
        )}

        {status === 'error' && (
          <div className='space-y-1'>
            <p className='text-sm text-red-500'>{errorMsg}</p>
            {attemptsLeft !== null && attemptsLeft > 0 && (
              <p className='text-xs text-red-400'>
                {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} remaining
                before lockout
              </p>
            )}
          </div>
        )}

        {/* Resend */}
        <div className='pt-2'>
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className='inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50'
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`}
            />
            {resent
              ? 'New code sent!'
              : resending
                ? 'Sending...'
                : "Didn't get the code? Resend"}
          </button>
        </div>

        {/* Help */}
        <p className='text-xs text-gray-400'>
          Code expires in 15 minutes. Check your spam folder if you
          don&apos;t see it.
        </p>
      </div>
    </div>
  );
}
