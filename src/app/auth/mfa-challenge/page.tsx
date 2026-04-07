'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createMfaChallengeAction,
  verifyMfaChallengeAction
} from '@/features/auth/actions/mfa';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from '@/components/ui/input-otp';
import { Icons } from '@/components/icons';

export default function MfaChallengePage() {
  const router = useRouter();
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const result = await createMfaChallengeAction();
      if (result.error || !result.challengeId) {
        setError(result.error ?? 'Failed to start verification');
      } else {
        setChallengeId(result.challengeId);
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleVerify = async () => {
    if (!challengeId || otp.length !== 6) return;
    setVerifying(true);
    setError(null);

    const result = await verifyMfaChallengeAction(challengeId, otp);
    setVerifying(false);

    if (result.success) {
      router.push('/dashboard/overview');
    } else {
      setError(result.error ?? 'Invalid code. Please try again.');
      setOtp('');
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div>
      {/* Shield icon */}
      <div className='mb-6 flex justify-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
          <svg
            className='h-8 w-8 text-gray-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={1.5}
          >
            <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
          </svg>
        </div>
      </div>

      <h1 className='mb-2 text-center text-2xl font-bold text-gray-900'>
        Two-factor authentication
      </h1>
      <p className='mb-8 text-center text-sm text-gray-500'>
        Enter the 6-digit code from your authenticator app
      </p>

      {/* Error banner */}
      {error && (
        <div className='mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {/* OTP Input */}
      <div className='mb-6 flex justify-center'>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          onComplete={handleVerify}
          autoFocus
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Verify button */}
      <button
        type='button'
        onClick={handleVerify}
        disabled={otp.length !== 6 || verifying || !challengeId}
        className='h-11 w-full rounded-md bg-gray-600 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
      >
        {verifying ? 'Verifying…' : 'Verify'}
      </button>

      {/* Help text */}
      <p className='mt-6 text-center text-xs text-gray-400'>
        Open Microsoft Authenticator or your TOTP app to find the code.
      </p>
    </div>
  );
}
