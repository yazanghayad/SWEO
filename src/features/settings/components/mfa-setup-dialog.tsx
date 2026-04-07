/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  createTotpAuthenticatorAction,
  verifyTotpAuthenticatorAction
} from '@/features/auth/actions/mfa';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface MfaSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = 'loading' | 'scan' | 'verify' | 'done';

export function MfaSetupDialog({
  open,
  onOpenChange,
  onSuccess
}: MfaSetupDialogProps) {
  const [step, setStep] = useState<Step>('loading');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initSetup = useCallback(async () => {
    setStep('loading');
    setOtp('');
    setError(null);

    const result = await createTotpAuthenticatorAction();
    if (result.error || !result.uri) {
      setError(result.error ?? 'Failed to initialize authenticator');
      setStep('scan');
      return;
    }

    setSecret(result.secret ?? '');
    try {
      const dataUrl = await QRCode.toDataURL(result.uri, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrDataUrl(dataUrl);
    } catch {
      setError('Failed to generate QR code');
    }
    setStep('scan');
  }, []);

  useEffect(() => {
    if (open) {
      initSetup();
    }
  }, [open, initSetup]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setVerifying(true);
    setError(null);

    const result = await verifyTotpAuthenticatorAction(otp);
    setVerifying(false);

    if (result.success) {
      setStep('done');
      toast.success('Authenticator app enabled successfully');
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } else {
      setError(result.error ?? 'Verification failed');
      setOtp('');
    }
  };

  // Format secret into groups of 4 for readability
  const formattedSecret = secret.replace(/(.{4})/g, '$1 ').trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {step === 'done'
              ? 'Authenticator enabled'
              : 'Set up authenticator app'}
          </DialogTitle>
          <DialogDescription>
            {step === 'done'
              ? 'Two-factor authentication is now active on your account.'
              : 'Use Microsoft Authenticator, Google Authenticator, or any TOTP app.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'loading' && (
          <div className='flex items-center justify-center py-12'>
            <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
          </div>
        )}

        {step === 'scan' && (
          <div className='space-y-4'>
            {/* Step 1: QR Code */}
            <div className='space-y-3'>
              <p className='text-sm font-medium'>
                1. Scan this QR code with your authenticator app
              </p>
              {qrDataUrl ? (
                <div className='flex justify-center'>
                  <div className='rounded-lg border bg-white p-3'>
                    <img
                      src={qrDataUrl}
                      alt='TOTP QR Code'
                      width={200}
                      height={200}
                    />
                  </div>
                </div>
              ) : (
                <p className='text-destructive text-center text-sm'>
                  {error ?? 'Failed to generate QR code'}
                </p>
              )}
            </div>

            {/* Manual entry fallback */}
            {secret && (
              <div className='space-y-1.5'>
                <p className='text-muted-foreground text-xs'>
                  Or enter this key manually:
                </p>
                <code className='bg-muted block rounded-md px-3 py-2 text-center text-xs font-mono tracking-wider select-all'>
                  {formattedSecret}
                </code>
              </div>
            )}

            {/* Step 2: Verify */}
            <div className='space-y-3'>
              <p className='text-sm font-medium'>
                2. Enter the 6-digit code from your app
              </p>
              <div className='flex justify-center'>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleVerify}
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
              {error && otp.length === 0 && (
                <p className='text-destructive text-center text-xs'>{error}</p>
              )}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className='flex flex-col items-center gap-3 py-6'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
              <svg
                className='h-6 w-6 text-green-600 dark:text-green-400'
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
            <p className='text-sm font-medium'>
              Two-factor authentication is active
            </p>
          </div>
        )}

        {step === 'scan' && (
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || verifying}
            >
              {verifying ? (
                <>
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                  Verifying…
                </>
              ) : (
                'Verify & Enable'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
