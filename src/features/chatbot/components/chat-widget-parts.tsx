'use client';

import { cn } from '@/lib/utils';
import { DEPARTMENTS } from '../types';
import type { ChatMessage, ChatDepartment } from '../types';
import { motion } from 'motion/react';
import { X, ArrowLeft, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { formatTime } from './chat-widget-utils';

// ── Conversation Header ───────────────────────────────────────────────────
export function ConversationHeader({
  department,
  onBack,
  onClose,
  onEndChat
}: {
  department: ChatDepartment | null;
  onBack: () => void;
  onClose: () => void;
  onEndChat: () => void;
}) {
  const deptInfo = department
    ? DEPARTMENTS.find((d) => d.id === department)
    : null;

  return (
    <div className='border-border flex items-center gap-3 border-b px-4 py-3'>
      <button
        onClick={onBack}
        className='text-muted-foreground hover:text-foreground hover:bg-accent -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors'
        aria-label='Tillbaka'
      >
        <ArrowLeft className='h-[18px] w-[18px]' strokeWidth={2} />
      </button>

      <div className='flex min-w-0 flex-1 items-center gap-2.5'>
        <Image
          src='/logo-icon-light.svg'
          alt='SWEO'
          width={28}
          height={28}
          className='shrink-0 dark:hidden'
        />
        <Image
          src='/logo-icon-dark.svg'
          alt='SWEO'
          width={28}
          height={28}
          className='hidden shrink-0 dark:block'
        />
        <div className='min-w-0'>
          <p className='text-foreground text-[14px] leading-tight font-semibold'>
            {deptInfo?.label ?? 'SWEO'}
          </p>
          <p className='text-muted-foreground truncate text-[12px] leading-tight'>
            Teamet kan också hjälpa dig
          </p>
        </div>
      </div>

      <button
        onClick={onEndChat}
        className='text-muted-foreground hover:text-foreground hover:bg-accent flex h-8 w-8 items-center justify-center rounded-full transition-colors'
        aria-label='Avsluta chatt'
        title='Avsluta chatt'
      >
        <RotateCcw className='h-[16px] w-[16px]' strokeWidth={2} />
      </button>

      <button
        onClick={onClose}
        className='text-muted-foreground hover:text-foreground hover:bg-accent flex h-8 w-8 items-center justify-center rounded-full transition-colors'
        aria-label='Stäng'
      >
        <X className='h-[18px] w-[18px]' strokeWidth={2} />
      </button>
    </div>
  );
}

// ── Powered By ────────────────────────────────────────────────────────────
export function PoweredBy() {
  return (
    <div className='mt-2.5 flex items-center justify-center gap-1.5'>
      <Image
        src='/logo-icon-light.svg'
        alt=''
        width={14}
        height={14}
        className='opacity-40 dark:hidden'
      />
      <Image
        src='/logo-icon-dark.svg'
        alt=''
        width={14}
        height={14}
        className='hidden opacity-40 dark:block'
      />
      <span className='text-muted-foreground/50 text-[11px]'>
        Powered by SWEO
      </span>
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────
export function MessageBubble({
  message,
  isLast,
  isStreaming
}: {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const isUser = message.role === 'user';
  const timeLabel = formatTime(message.timestamp);

  return (
    <motion.div
      initial={isLast ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      className={cn('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className='bg-muted mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full'>
          <Image
            src='/logo-icon-light.svg'
            alt='SWEO'
            width={18}
            height={18}
            className='dark:hidden'
          />
          <Image
            src='/logo-icon-dark.svg'
            alt='SWEO'
            width={18}
            height={18}
            className='hidden dark:block'
          />
        </div>
      )}

      <div className={cn('flex max-w-[78%] flex-col', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.55]',
            isUser
              ? 'bg-foreground text-background rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          {isStreaming && !message.content && (
            <span className='inline-flex items-center gap-1 py-1'>
              <span className='bg-muted-foreground/60 h-2 w-2 animate-[typing-dot_1.4s_ease-in-out_0s_infinite] rounded-full' />
              <span className='bg-muted-foreground/60 h-2 w-2 animate-[typing-dot_1.4s_ease-in-out_0.2s_infinite] rounded-full' />
              <span className='bg-muted-foreground/60 h-2 w-2 animate-[typing-dot_1.4s_ease-in-out_0.4s_infinite] rounded-full' />
            </span>
          )}

          {message.content && (
            <span className='break-words whitespace-pre-wrap'>
              {message.content}
              {isStreaming && (
                <span className='ml-px inline-block h-3.5 w-[1.5px] translate-y-[2px] animate-pulse bg-current opacity-50' />
              )}
            </span>
          )}
        </div>

        <span className='text-muted-foreground/60 mt-1 px-1 text-[11px]'>
          {isUser ? timeLabel : `SWEO · AI Agent · ${timeLabel}`}
        </span>
      </div>
    </motion.div>
  );
}
