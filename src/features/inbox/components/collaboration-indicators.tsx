'use client';

import { cn } from '@/lib/utils';
import type { PresenceEntry } from '@/hooks/use-presence';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// ---------------------------------------------------------------------------
// Participant Avatars — shows active agents viewing a conversation
// ---------------------------------------------------------------------------

interface ParticipantAvatarsProps {
  participants: PresenceEntry[];
  className?: string;
}

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-teal-500'
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColor(agentId: string): string {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = agentId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function ParticipantAvatars({
  participants,
  className
}: ParticipantAvatarsProps) {
  if (participants.length === 0) return null;

  const visible = participants.slice(0, 5);
  const overflow = participants.length - 5;

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('flex items-center -space-x-1.5', className)}>
        {visible.map((p) => (
          <Tooltip key={p.agentId}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-medium text-white',
                  getColor(p.agentId),
                  p.typing && 'ring-2 ring-green-400 ring-offset-1 ring-offset-background'
                )}
              >
                {getInitials(p.agentName)}
              </div>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              {p.agentName}
              {p.typing && ' — typing…'}
            </TooltipContent>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <div className='flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium'>
            +{overflow}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Typing Indicator — shows "X is typing…" banner
// ---------------------------------------------------------------------------

interface TypingIndicatorProps {
  typingAgents: PresenceEntry[];
  className?: string;
}

export function TypingIndicator({
  typingAgents,
  className
}: TypingIndicatorProps) {
  if (typingAgents.length === 0) return null;

  const names = typingAgents.map((a) => a.agentName);
  let text: string;

  if (names.length === 1) {
    text = `${names[0]} is typing…`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing…`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing…`;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground',
        className
      )}
    >
      <span className='flex gap-0.5'>
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]' />
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]' />
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]' />
      </span>
      {text}
    </div>
  );
}
