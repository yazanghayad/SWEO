'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Channel data                                                       */
/* ------------------------------------------------------------------ */

interface Channel {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  href: string;
  iconClass?: string;
}

const recommendedChannels: Channel[] = [
  {
    id: 'messenger',
    name: 'Messenger',
    subtitle: 'Included in your plan',
    description:
      'Give proactive help, self-service, and personal assistance via chat on your website.',
    icon: '/icons/channels/messenger.png',
    href: '/dashboard/settings/channels/messenger'
  },
  {
    id: 'email',
    name: 'Email',
    subtitle: 'Included in your plan',
    description:
      'Respond to customer queries and start conversations with email.',
    icon: '/icons/channels/email.png',
    href: '/dashboard/settings/channels/email'
  },
  {
    id: 'phone',
    name: 'Phone',
    subtitle: 'Billed on usage',
    description:
      'Initiate phone calls, video calls and screen sharing to quickly help your customers.',
    icon: '/icons/channels/phone.png',
    href: '/dashboard/settings/channels/phone'
  }
];

const otherChannels: Channel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    subtitle: 'Billed on usage',
    description:
      'Respond to WhatsApp messages and interact with customers directly from your inbox.',
    icon: '/icons/channels/whatsapp.png',
    href: '/dashboard/settings/channels/whatsapp'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    subtitle: 'Included in your plan',
    description:
      'Respond to Instagram messages and interact with customers directly from your inbox.',
    icon: '/icons/channels/instagram.svg',
    href: '/dashboard/settings/channels/instagram'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    subtitle: 'Included in your plan',
    description:
      'Respond to Facebook messages and interact with customers directly from your inbox.',
    icon: '/icons/channels/facebook.png',
    href: '/dashboard/settings/channels/messenger',
    iconClass: 'rounded-full'
  },
  {
    id: 'slack',
    name: 'Slack',
    subtitle: 'Included in your plan',
    description:
      'Respond to Slack messages and interact with customers directly from your inbox.',
    icon: '/icons/channels/slack.svg',
    href: '/dashboard/settings/channels/slack'
  },
  {
    id: 'sms',
    name: 'SMS',
    subtitle: 'Billed on usage',
    description:
      'Respond to customer queries and start conversations with SMS messages.',
    icon: '/icons/channels/sms.png',
    href: '/dashboard/settings/channels/sms'
  },
  {
    id: 'outbound',
    name: 'Outbound',
    subtitle: 'Included in your plan',
    description:
      'Proactively reach out to customers with targeted messages across channels.',
    icon: '/icons/channels/outbound.svg',
    href: '/dashboard/settings/channels/outbound',
    iconClass: 'dark:invert'
  }
];

/* ------------------------------------------------------------------ */
/*  Hero banner                                                        */
/* ------------------------------------------------------------------ */

function HeroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className='relative overflow-hidden rounded-xl bg-[#1e1e2e] px-8 py-7 text-white'>
      <button
        onClick={onDismiss}
        className='absolute top-3 right-3 rounded-md p-1 text-white/60 hover:text-white'
      >
        <X className='h-4 w-4' />
      </button>

      <div className='flex items-center justify-between gap-8'>
        {/* Text */}
        <div className='max-w-md'>
          <h2 className='text-lg font-semibold'>
            Every channel, one inbox
          </h2>
          <p className='mt-2 text-sm leading-relaxed text-white/70'>
            Meet your customers where they are, from live chat and email to phone
            and social channels. All conversations route directly to your inbox,
            so you can prioritize and resolve issues faster.
          </p>
          <a
            href='#'
            className='mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white hover:underline'
          >
            <span className='flex h-5 w-5 items-center justify-center rounded bg-white/15 text-[10px]'>
              📋
            </span>
            Channels
          </a>
        </div>

        {/* Illustration */}
        <div className='hidden flex-shrink-0 items-center gap-4 md:flex'>
          {/* Scattered channel icons – no backgrounds, bigger, more spacing */}
          <div className='relative h-[140px] w-[170px]'>
            {/* Row 1: Phone + WhatsApp */}
            <div className='absolute top-0 left-[28px]'>
              <Image src='/icons/channels/phone.png' alt='Phone' width={36} height={36} className='rounded-lg' />
            </div>
            <div className='absolute top-0 left-[84px]'>
              <Image src='/icons/channels/whatsapp.png' alt='WhatsApp' width={36} height={36} className='rounded-lg' />
            </div>

            {/* Row 2: Slack + Messenger */}
            <div className='absolute top-[48px] left-0'>
              <Image src='/icons/channels/slack.svg' alt='Slack' width={36} height={36} />
            </div>
            <div className='absolute top-[48px] left-[56px]'>
              <Image src='/icons/channels/messenger.png' alt='Messenger' width={36} height={36} className='rounded-lg' />
            </div>

            {/* Row 3: Instagram + Email + Facebook */}
            <div className='absolute top-[96px] left-[8px]'>
              <Image src='/icons/channels/instagram.svg' alt='Instagram' width={36} height={36} className='rounded-lg' />
            </div>
            <div className='absolute top-[96px] left-[64px]'>
              <Image src='/icons/channels/email.png' alt='Email' width={36} height={36} className='rounded-lg' />
            </div>
            <div className='absolute top-[96px] left-[120px]'>
              <Image src='/icons/channels/facebook.png' alt='Facebook' width={36} height={36} className='rounded-full' />
            </div>
          </div>

          {/* Dashed line */}
          <div className='w-16 border-t-2 border-dashed border-white/30' />

          {/* Inbox + user avatars */}
          <div className='relative flex flex-col items-center gap-1'>
            <span className='text-[10px] font-medium text-white/60'>
              Inbox
            </span>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2a2a3d]'>
              <svg
                className='h-7 w-7 text-white/80'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3'
                />
              </svg>
            </div>
            {/* User dots */}
            <div className='absolute -top-1 -right-6 flex h-6 w-6 items-center justify-center rounded-full bg-[#3b3b5c]'>
              <div className='h-3.5 w-3.5 rounded-full bg-emerald-400' />
            </div>
            <div className='absolute -right-10 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[#3b3b5c]'>
              <div className='h-2.5 w-2.5 rounded-full bg-amber-400' />
            </div>
            <div className='absolute -right-7 bottom-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#3b3b5c]'>
              <div className='h-2.5 w-2.5 rounded-full bg-violet-400' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Channel card                                                       */
/* ------------------------------------------------------------------ */

function ChannelCard({ channel }: { channel: Channel }) {
  const isUpgrade = channel.subtitle === 'Available with upgrade';

  return (
    <Link
      href={channel.href}
      className='group flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-md'
    >
      <div className='mb-3 flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center'>
          <Image
            src={channel.icon}
            alt={channel.name}
            width={40}
            height={40}
            className={channel.iconClass ?? 'rounded-lg'}
          />
        </div>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-semibold'>{channel.name}</h3>
            {isUpgrade && (
              <Badge
                variant='secondary'
                className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]'
              >
                Get feature
              </Badge>
            )}
          </div>
          <p className='text-muted-foreground text-xs'>{channel.subtitle}</p>
        </div>
      </div>
      <p className='text-muted-foreground text-xs leading-relaxed'>
        {channel.description}
      </p>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function AllChannelsClient() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className='flex h-full flex-col overflow-y-auto'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-6 py-4'>
        <div className='flex items-center gap-2'>
          <h1 className='text-lg font-semibold'>All Channels</h1>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='space-y-8'>
          {/* Hero */}
          {showBanner && (
            <HeroBanner onDismiss={() => setShowBanner(false)} />
          )}

          {/* Recommended */}
          <div>
            <h2 className='mb-4 text-sm font-semibold text-muted-foreground'>
              Recommended
            </h2>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {recommendedChannels.map((ch) => (
                <ChannelCard key={ch.id} channel={ch} />
              ))}
            </div>
          </div>

          {/* Other channels */}
          <div>
            <h2 className='mb-4 text-sm font-semibold text-muted-foreground'>
              Other channels
            </h2>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {otherChannels.map((ch) => (
                <ChannelCard key={ch.id} channel={ch} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
