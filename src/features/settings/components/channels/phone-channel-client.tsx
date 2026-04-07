'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { BookOpen, Phone } from 'lucide-react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  SWEO Voice Discovery Module                                         */
/* ------------------------------------------------------------------ */

function SweoVoiceDiscoveryCard() {
  const router = useRouter();

  const handleRegisterInterest = () => {
    toast.success(
      'Thank you! We will contact you when SWEO Voice is available for your account.'
    );
  };

  return (
    <div className='overflow-hidden rounded-2xl border bg-emerald-500/5'>
      <div className='flex items-center gap-8 p-8'>
        {/* Left content */}
        <div className='flex-1'>
          {/* Managed Availability badge */}
          <div className='mb-4 flex items-center gap-2'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' />
            <span className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>
              Managed Availability
            </span>
          </div>

          {/* Headline */}
          <h2 className='mb-3 text-2xl font-semibold leading-tight'>
            Use SWEO Voice to handle your support calls
          </h2>

          {/* Description */}
          <p className='text-muted-foreground mb-2 text-sm leading-relaxed'>
            SWEO picks up calls instantly, answers accurately, and keeps
            conversations flowing with relevant follow-ups—helping you resolve
            more issues across more channels, 24/7.
          </p>
          <p className='text-muted-foreground mb-6 text-sm leading-relaxed'>
            SWEO Voice is in{' '}
            <span className='border-b border-dotted border-current'>
              Managed Availability
            </span>
            .
          </p>

          {/* Action buttons */}
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='sm' onClick={handleRegisterInterest}>
              Register your interest
            </Button>
            <button
              onClick={() => router.push('/docs')}
              className='text-primary flex items-center gap-1.5 text-sm font-medium hover:underline'
            >
              <BookOpen className='h-3.5 w-3.5' />
              Learn more
            </button>
          </div>
        </div>

        {/* Right image / placeholder */}
        <div className='hidden shrink-0 lg:block'>
          <div className='flex h-40 w-56 items-center justify-center rounded-xl bg-emerald-500/10'>
            <Phone className='h-20 w-20 text-emerald-500' />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function PhoneChannelClient() {
  const { loading } = useTenantSettings();

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex min-h-full flex-1 flex-col overflow-y-auto'>
      {/* Page Header */}
      <div className='flex items-center justify-between border-b px-6 py-3'>
        <div className='flex items-center gap-2.5'>
          <Image src='/icons/channels/phone.png' alt='Phone' width={28} height={28} className='rounded-lg' />
          <h1 className='text-lg font-semibold'>Phone</h1>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto px-6 py-5'>
        <div className='w-full'>
          <SweoVoiceDiscoveryCard />
        </div>
      </div>
    </div>
  );
}
