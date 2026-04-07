'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  BookOpen,
  GraduationCap,
  Plus,
  Ellipsis,
  X,
  Check,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { PreviewChatPanel } from '@/components/preview-chat-panel';
import { useTenant } from '@/hooks/use-tenant';
import {
  getGuidanceRulesByCategory,
  createGuidanceRule,
  updateGuidanceRule,
  deleteGuidanceRule,
  saveTenantGuidancePreferences,
  getTenantGuidancePreferences
} from '../actions';
import type { GuidanceRule, GuidanceCategory as GuidanceCategoryType } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToneOption = 'friendly' | 'neutral' | 'matter-of-fact' | 'professional' | 'humorous';
type LengthOption = 'concise' | 'standard' | 'thorough';
type GuidanceTab = 'chat-email' | 'voice';

interface GuidanceCategory {
  icon: React.ReactNode;
  title: string;
  description: string;
  pills: string[];
  badge?: string;
}

// ─── Icons (inline SVGs matching SWEO) ───────────────────────────────────

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'>
      <path d='M13.935 7.5a.75.75 0 0 0-1.06 0L10.93 9.445a.5.5 0 1 1-.707-.708l4.066-4.065a.75.75 0 0 0-1.06-1.061L9.162 7.677a.5.5 0 1 1-.708-.707l4.066-4.066a.75.75 0 0 0-1.06-1.06L7.395 5.908a.5.5 0 1 1-.707-.707L9.339 2.55a.75.75 0 0 0-1.06-1.06L3.34 6.426A.2.2 0 0 1 3 6.286V4.717a1.4 1.4 0 0 0-1.4-1.4h-.2a.4.4 0 0 0-.4.4l.005 5.524s-.133 2.298 1.664 4.095c1.96 1.96 4.736 1.755 6.494-.002l4.773-4.773a.75.75 0 0 0 0-1.061z' />
    </svg>
  );
}

function SweoSparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'>
      <path d='M2.125 1.02c.08 0 .158.032.215.088L5.763 4.53c.146.146.391.005.338-.195L5.314 1.4a.303.303 0 0 1 .293-.38H6.81c.137 0 .257.091.293.224l.604 2.25a.814.814 0 0 1 0 .418l-.434 1.615a2.49 2.49 0 0 1-1.76 1.76l-1.617.433a.817.817 0 0 1-.418 0l-2.251-.603A.3.3 0 0 1 1 6.825V5.622c0-.199.189-.344.38-.293l2.938.787c.2.053.34-.192.194-.338L1.09 2.358A.306.306 0 0 1 1 2.142c0-.62.504-1.124 1.125-1.124zM13.875 1a.305.305 0 0 0-.214.089l-3.424 3.42c-.146.147-.391.005-.337-.194l.786-2.934A.303.303 0 0 0 10.393 1H9.19a.304.304 0 0 0-.293.224l-.603 2.25a.814.814 0 0 0 0 .418l.433 1.615c.23.86.901 1.53 1.76 1.76l1.617.433c.137.036.28.036.418 0l2.252-.603A.3.3 0 0 0 15 6.806V5.602a.303.303 0 0 0-.38-.292l-2.938.787c-.2.053-.34-.192-.194-.338l3.423-3.42a.306.306 0 0 0 .09-.215C15 1.504 14.495 1 13.874 1zM13.875 15a.306.306 0 0 1-.214-.089l-3.424-3.42c-.146-.147-.391-.005-.337.194l.786 2.934a.303.303 0 0 1-.293.381H9.19a.304.304 0 0 1-.293-.224l-.603-2.25a.814.814 0 0 1 0-.418l.433-1.615c.23-.86.901-1.53 1.76-1.76l1.617-.433a.817.817 0 0 1 .418 0l2.252.603a.3.3 0 0 1 .226.291v1.204a.302.302 0 0 1-.38.292l-2.938-.787c-.2-.053-.34.192-.194.338l3.423 3.42a.306.306 0 0 1 .09.215c0 .62-.505 1.124-1.126 1.124zM2.125 15c.08 0 .158-.032.215-.089l3.423-3.42c.146-.147.391-.005.338.194l-.787 2.934a.303.303 0 0 0 .293.381H6.81a.304.304 0 0 0 .293-.224l.604-2.25a.814.814 0 0 0 0-.418l-.434-1.615a2.489 2.489 0 0 0-1.76-1.76L3.895 8.3a.817.817 0 0 0-.418 0l-2.251.603A.3.3 0 0 0 1 9.194v1.204c0 .198.189.344.38.292l2.938-.787c.2-.053.34.192.194.338l-3.423 3.42a.306.306 0 0 0-.09.215C1 14.496 1.505 15 2.126 15z' />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M11 1H3C2.45 1 2 1.45 2 2V13C2 13.55 2.45 14 3 14H11C12.1 14 13 13.1 13 12V3C13 1.9 12.1 1 11 1ZM7.95 10H4.05V8.3H7.95V10ZM10.92 5.92H4.02V4.22H10.92V5.92Z' />
    </svg>
  );
}

function NewspaperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M13.5 4V11.75C13.5 12.16 13.16 12.5 12.75 12.5C12.34 12.5 12 12.16 12 11.75V2H2V12C2 13.1 2.9 14 4 14H12.75C13.99 14 15 12.99 15 11.75V4H13.5ZM4 4.3H10V6H4V4.3ZM5.92 9.92H4V8H5.92V9.92ZM9 10.12C8.38 10.12 7.88 9.62 7.88 9C7.88 8.38 8.38 7.88 9 7.88C9.62 7.88 10.12 8.38 10.12 9C10.12 9.62 9.62 10.12 9 10.12Z' />
    </svg>
  );
}

function HappyFaceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M8 1.25C4.27 1.25 1.25 4.27 1.25 8C1.25 11.73 4.27 14.75 8 14.75C11.73 14.75 14.75 11.73 14.75 8C14.75 4.27 11.73 1.25 8 1.25ZM4.57 6.22C4.57 5.53 5.13 4.97 5.82 4.97C6.51 4.97 7.07 5.53 7.07 6.22C7.07 6.91 6.51 7.47 5.82 7.47C5.13 7.47 4.57 6.91 4.57 6.22ZM10.83 10.06L10.79 10.14C9.7 12.46 6.39 12.46 5.3 10.14L5.26 10.06C5.08 9.68 5.4 9.26 5.81 9.33C7.29 9.57 8.79 9.57 10.27 9.33C10.68 9.26 11 9.68 10.82 10.06H10.83ZM10.22 7.47C9.53 7.47 8.97 6.91 8.97 6.22C8.97 5.53 9.53 4.97 10.22 4.97C10.91 4.97 11.47 5.53 11.47 6.22C11.47 6.91 10.91 7.47 10.22 7.47Z' />
    </svg>
  );
}

function ShortTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M2 11H10V9.3H2V11ZM2 5V6.7H14V5H2Z' />
    </svg>
  );
}

function LongTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M2 12.7H10V11H2V12.7ZM14 7.15H2V8.85H14V7.15ZM2 3.3V5H14V3.3H2Z' />
    </svg>
  );
}

function ExtraLongTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M2 2V3.7H14V2H2ZM14 5.43H2V7.13H14V5.43ZM14 8.87H2V10.57H14V8.87ZM2 14H10V12.3H2V14Z' />
    </svg>
  );
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M13 1H3C2.45 1 2 1.45 2 2V11C2 11.55 2.45 12 3 12H10.25L13.14 14.89C13.46 15.2 13.99 14.98 13.99 14.54V11V2C13.99 1.45 13.54 1 12.99 1H13ZM11.55 7.85C10.56 8.68 9.3 9.14 8 9.14C6.7 9.14 5.45 8.68 4.45 7.85C4.09 7.55 4.04 7.01 4.34 6.65C4.64 6.29 5.17999 6.24 5.53999 6.54C6.91999 7.69 9.08 7.69 10.45 6.54C10.81 6.24 11.35 6.28 11.65 6.65C11.95 7.01 11.9 7.55 11.54 7.85H11.55Z' />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8ZM7.944 4.94C7.477 4.94 7.077 5.235 6.924 5.65C6.85116 5.8309 6.71073 5.97632 6.53247 6.05542C6.35422 6.13451 6.15217 6.14107 5.96916 6.07369C5.78615 6.00632 5.63659 5.87031 5.55218 5.69451C5.46777 5.51871 5.45515 5.31695 5.517 5.132C5.64675 4.77649 5.85292 4.45378 6.12097 4.18662C6.38902 3.91947 6.71242 3.71438 7.06836 3.58581C7.42431 3.45725 7.80412 3.40835 8.18102 3.44255C8.55792 3.47676 8.92272 3.59324 9.2497 3.78378C9.57668 3.97432 9.85788 4.23428 10.0735 4.54533C10.289 4.85637 10.4337 5.21093 10.4974 5.58399C10.561 5.95705 10.542 6.33952 10.4417 6.70445C10.3415 7.06937 10.1623 7.40784 9.917 7.696L9.901 7.716L9.883 7.735L9.064 8.576L9.059 8.582L9.054 8.587C8.812 8.827 8.694 8.967 8.694 9.23V9.507C8.694 9.70591 8.61498 9.89668 8.47433 10.0373C8.33368 10.178 8.14291 10.257 7.944 10.257C7.74509 10.257 7.55432 10.178 7.41367 10.0373C7.27302 9.89668 7.194 9.70591 7.194 9.507V9.23C7.194 8.315 7.726 7.79 7.987 7.533L7.995 7.525L8.787 6.71C8.91625 6.5506 8.9977 6.35785 9.02189 6.15406C9.04609 5.95028 9.01206 5.74381 8.92373 5.55858C8.83541 5.37334 8.6964 5.21692 8.52283 5.10745C8.34926 4.99797 8.14922 4.93991 7.944 4.94ZM7.944 12.394C8.12249 12.394 8.29367 12.3231 8.41988 12.1969C8.54609 12.0707 8.617 11.8995 8.617 11.721C8.617 11.5425 8.54609 11.3713 8.41988 11.2451C8.29367 11.1189 8.12249 11.048 7.944 11.048C7.76551 11.048 7.59433 11.1189 7.46812 11.2451C7.34191 11.3713 7.271 11.5425 7.271 11.721C7.271 11.8995 7.34191 12.0707 7.46812 12.1969C7.59433 12.3231 7.76551 12.394 7.944 12.394Z' />
    </svg>
  );
}

function KnowledgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M14.5 2C14.5 2 14.48 2 14.47 2C12.1 2.12 9.9 2.85 8 4.01C6.1 2.85 3.89 2.13 1.53 2.01C1.53 2.01 1.51 2.01 1.5 2.01C1.23 2.01 1 2.24 1 2.52V13.25C1 13.52 1.21 13.73 1.48 13.74C3.86 13.86 6.08 14.58 8 15.75C9.92 14.58 12.14 13.85 14.52 13.74C14.79 13.73 15 13.52 15 13.25V2.51C15 2.23 14.77 2 14.5 2ZM13.3 12.14C11.45 12.37 9.65 12.93 8 13.8V6.02L8.89 5.48C10.24 4.65 11.75 4.1 13.3 3.85V12.15V12.14Z' />
    </svg>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M11 2.52C9.95 2.52 8.95 2.31 8 1.99C7.05 1.68 6.05 1.46 5 1.46C3.95 1.46 2.95 1.67 2 1.99V14H3.5V10.24C3.99 10.15 4.49 10.1 5 10.1C6.05 10.1 7.05 10.31 8 10.63C8.95 10.94 9.95 11.16 11 11.16C12.05 11.16 13.05 10.95 14 10.63V1.99C13.05 2.3 12.05 2.52 11 2.52Z' />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M14 7.15H6V8.85H14V7.15ZM6 13H14V11.3H6V13ZM6 3V4.7H14V3H6ZM2.75 6.75C2.06 6.75 1.5 7.31 1.5 8C1.5 8.69 2.06 9.25 2.75 9.25C3.44 9.25 4 8.69 4 8C4 7.31 3.44 6.75 2.75 6.75ZM2.75 10.75C2.06 10.75 1.5 11.31 1.5 12C1.5 12.69 2.06 13.25 2.75 13.25C3.44 13.25 4 12.69 4 12C4 11.31 3.44 10.75 2.75 10.75ZM2.75 2.75C2.06 2.75 1.5 3.31 1.5 4C1.5 4.69 2.06 5.25 2.75 5.25C3.44 5.25 4 4.69 4 4C4 3.31 3.44 2.75 2.75 2.75Z' />
    </svg>
  );
}

// ─── Tone / Length Config ────────────────────────────────────────────────────

const toneOptions: { key: ToneOption; label: string; icon: React.ReactNode }[] = [
  { key: 'friendly', label: 'Friendly', icon: <WaveIcon className='h-4 w-4' /> },
  { key: 'neutral', label: 'Neutral', icon: <SweoSparkIcon className='h-4 w-4' /> },
  { key: 'matter-of-fact', label: 'Matter-of-fact', icon: <BookIcon className='h-4 w-4' /> },
  { key: 'professional', label: 'Professional', icon: <NewspaperIcon className='h-4 w-4' /> },
  { key: 'humorous', label: 'Humorous', icon: <HappyFaceIcon className='h-4 w-4' /> }
];

const lengthOptions: { key: LengthOption; label: string; icon: React.ReactNode }[] = [
  { key: 'concise', label: 'Concise', icon: <ShortTextIcon className='h-4 w-4' /> },
  { key: 'standard', label: 'Standard', icon: <LongTextIcon className='h-4 w-4' /> },
  { key: 'thorough', label: 'Thorough', icon: <ExtraLongTextIcon className='h-4 w-4' /> }
];

// ─── Guidance Categories ─────────────────────────────────────────────────────

const guidanceCategories: GuidanceCategory[] = [
  {
    icon: <MessengerIcon className='h-4 w-4' />,
    title: 'Communication style',
    description: 'Create customized guidance on the vocabulary and terms SWEO should use.',
    pills: ['Use simple language', 'Shopping Assistant', 'Use British English']
  },
  {
    icon: <HelpCircleIcon className='h-4 w-4' />,
    title: 'Context and clarification',
    description: 'Create customized guidance on the follow-up questions SWEO should ask.',
    pills: ['Clarify platform for troubleshooting', 'Clarify loan repayment type', 'Clarify plan for eligibility']
  },
  {
    icon: <KnowledgeIcon className='h-4 w-4' />,
    title: 'Content and sources',
    description: 'Create customized guidance on when and how SWEO should use specific articles or sources in responses.',
    pills: ['Link troubleshooting guide for payment failures', 'Guide 2FA setup with help content', 'Troubleshoot connection issues with snippet'],
    badge: 'Beta'
  },
  {
    icon: <FlagIcon className='h-4 w-4' />,
    title: 'Spam',
    description: 'Create customized guidance on how SWEO should identify and handle potential spam messages.',
    pills: ['Detect promotional spam messages']
  },
  {
    icon: <ListIcon className='h-4 w-4' />,
    title: 'Other',
    description: 'Any other guidance you want SWEO to follow.',
    pills: []
  }
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function PillButton({
  label,
  icon,
  selected,
  onClick
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-normal transition-colors',
        selected
          ? 'border-foreground/40 bg-accent text-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ExamplePill({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className='max-w-[220px] shrink truncate whitespace-nowrap rounded-lg border border-border bg-accent/50 px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-accent'
    >
      {label}
    </button>
  );
}

function GuidanceCategorySection({
  category,
  onNewClick,
  onPillClick
}: {
  category: GuidanceCategory;
  onNewClick?: (categoryTitle: string) => void;
  onPillClick?: (categoryTitle: string, pillLabel: string) => void;
}) {
  return (
    <div className='mb-10'>
      {/* Header */}
      <div className='mb-4 flex items-center gap-3'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground'>
          {category.icon}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-semibold text-foreground'>{category.title}</h3>
            {category.badge && (
              <span className='inline-flex items-center rounded-full border border-violet-300 bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-foreground dark:border-violet-700 dark:bg-violet-900/30'>
                {category.badge}
              </span>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>{category.description}</p>
        </div>
      </div>

      {/* Pills row */}
      <div className='flex items-center gap-2 overflow-hidden'>
        <Button
          variant='outline'
          size='sm'
          className='shrink-0 gap-1.5'
          onClick={() => onNewClick?.(category.title)}
        >
          <Plus className='h-4 w-4' />
          New
        </Button>
        {category.pills.length > 0 ? (
          <div className='flex min-w-0 flex-1 items-center gap-2 overflow-hidden'>
            {category.pills.map((pill) => (
              <ExamplePill
                key={pill}
                label={pill}
                onClick={() => onPillClick?.(category.title, pill)}
              />
            ))}
            <button className='flex shrink-0 items-center justify-center rounded-lg border border-border bg-accent/50 px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent'>
              <Ellipsis className='h-4 w-4' />
            </button>
          </div>
        ) : (
          <span className='text-sm text-muted-foreground'>
            No rules yet — click New to add one.
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Discovery Banner ────────────────────────────────────────────────────────

function DiscoveryBanner({
  onDismiss,
  onGetStarted,
  onBestPractices,
  onBasics,
  onLearnMore
}: {
  onDismiss: () => void;
  onGetStarted?: () => void;
  onBestPractices?: () => void;
  onBasics?: () => void;
  onLearnMore?: () => void;
}) {
  return (
    <div className='bg-card border-border relative mb-4 overflow-hidden rounded-xl border px-6 py-5'>
      {/* Corner decorations */}
      <span role='presentation' aria-hidden='true' className='absolute top-0 left-0 hidden h-6 w-6 border-t border-l border-border/40 z-10 md:block' />
      <span role='presentation' aria-hidden='true' className='absolute top-0 right-0 hidden h-6 w-6 border-t border-r border-border/40 z-10 md:block' />
      <span role='presentation' aria-hidden='true' className='absolute bottom-0 left-0 hidden h-6 w-6 border-b border-l border-border/40 z-10 md:block' />
      <span role='presentation' aria-hidden='true' className='absolute bottom-0 right-0 hidden h-6 w-6 border-b border-r border-border/40 z-10 md:block' />
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className='absolute right-2 top-2 z-20 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      >
        <X className='h-4 w-4' />
      </button>

      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h2 className='mb-3 font-serif text-xl font-light tracking-tight text-foreground'>
            Customize how SWEO communicates and responds
          </h2>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            Train SWEO to deliver accurate answers and use your communication style, ensuring consistent and scalable support across every workflow.
          </p>
          <div className='mt-4 flex flex-wrap gap-x-1 gap-y-2'>
            <Button variant='ghost' size='sm' className='gap-1.5 text-foreground' onClick={onGetStarted}>
              <KnowledgeIcon className='h-4 w-4' />
              Get started
            </Button>
            <Button variant='ghost' size='sm' className='gap-1.5 text-foreground' onClick={onBestPractices}>
              <KnowledgeIcon className='h-4 w-4' />
              Best practices
            </Button>
            <Button variant='ghost' size='sm' className='gap-1.5 text-foreground' onClick={onBasics}>
              <KnowledgeIcon className='h-4 w-4' />
              SWEO&apos;s basics
            </Button>
            <Button variant='ghost' size='sm' className='gap-1.5 text-foreground' onClick={onLearnMore}>
              <GraduationCap className='h-4 w-4' />
              Learn more
            </Button>
          </div>
        </div>

        {/* Banner image */}
        <div className='hidden shrink-0 overflow-hidden rounded-lg lg:block'>
          <div className='relative flex h-[140px] w-[220px] items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30'>
            <div className='pointer-events-none absolute inset-0 dot-pattern text-foreground opacity-20' />
            <SweoSparkIcon className='relative z-[1] h-12 w-12 text-foreground/30' />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Basics Accordion ────────────────────────────────────────────────────────

function BasicsAccordion({
  selectedTone,
  setSelectedTone,
  selectedLength,
  setSelectedLength,
  dirty,
  onSave,
  onCancel,
  saving = false
}: {
  selectedTone: ToneOption;
  setSelectedTone: (t: ToneOption) => void;
  selectedLength: LengthOption;
  setSelectedLength: (l: LengthOption) => void;
  dirty: boolean;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border transition-colors',
        open ? 'border-foreground/20' : 'border-border hover:border-foreground/20'
      )}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className='flex w-full items-center justify-between border-b border-border px-4 py-4'
      >
        <h3 className='text-sm font-semibold text-foreground'>Basics</h3>
        <ChevronRight
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            open && 'rotate-90'
          )}
        />
      </button>

      {/* Body */}
      {open && (
        <div className='px-6 py-4'>
          <div className='flex flex-col gap-6'>
            {/* Tone of voice */}
            <div className='flex flex-col gap-3'>
              <h3 className='text-sm font-semibold text-foreground'>SWEO&apos;s tone of voice</h3>
              <div className='flex flex-row flex-wrap gap-2'>
                {toneOptions.map((opt) => (
                  <PillButton
                    key={opt.key}
                    label={opt.label}
                    icon={opt.icon}
                    selected={selectedTone === opt.key}
                    onClick={() => setSelectedTone(opt.key)}
                  />
                ))}
              </div>
            </div>

            {/* Answer length */}
            <div className='flex flex-col gap-3'>
              <h3 className='text-sm font-semibold text-foreground'>SWEO&apos;s answer length</h3>
              <div className='flex flex-row flex-wrap gap-2'>
                {lengthOptions.map((opt) => (
                  <PillButton
                    key={opt.key}
                    label={opt.label}
                    icon={opt.icon}
                    selected={selectedLength === opt.key}
                    onClick={() => setSelectedLength(opt.key)}
                  />
                ))}
              </div>
            </div>

            {/* Separator + Actions */}
            <div className='h-px w-full bg-border' />
            <div className='flex flex-row justify-end gap-2 pr-3'>
              <Button variant='outline' size='sm' disabled={!dirty || saving} onClick={onCancel}>
                Cancel
              </Button>
              <Button size='sm' disabled={!dirty || saving} onClick={onSave} className='gap-1.5'>
                {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Check className='h-4 w-4' />}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const categoryTitleToKey: Record<string, GuidanceCategoryType> = {
  'Communication style': 'communication_style',
  'Context and clarification': 'context_clarification',
  'Content and sources': 'content_sources',
  'Spam': 'spam',
  'Other': 'other'
};

const BANNER_DISMISSED_KEY = 'guidance-banner-dismissed';

// ─── Main Component ──────────────────────────────────────────────────────

export function GuidancePage() {
  const router = useRouter();
  const { tenant, loading: tenantLoading } = useTenant();

  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(BANNER_DISMISSED_KEY) !== 'true';
  });
  const [activeTab, setActiveTab] = useState<GuidanceTab>('chat-email');
  const [selectedTone, setSelectedTone] = useState<ToneOption>('friendly');
  const [selectedLength, setSelectedLength] = useState<LengthOption>('standard');
  const [savedTone, setSavedTone] = useState<ToneOption>('friendly');
  const [savedLength, setSavedLength] = useState<LengthOption>('standard');

  // Dialog state
  const [showNewGuidanceDialog, setShowNewGuidanceDialog] = useState(false);
  const [showEditGuidanceDialog, setShowEditGuidanceDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [_selectedPill, setSelectedPill] = useState<string>('');
  const [guidanceName, setGuidanceName] = useState('');
  const [guidanceDescription, setGuidanceDescription] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Backend state
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<Record<GuidanceCategoryType, GuidanceRule[]>>({
    communication_style: [],
    context_clarification: [],
    content_sources: [],
    spam: [],
    other: []
  });

  const dirty = selectedTone !== savedTone || selectedLength !== savedLength;

  const loadData = useCallback(async () => {
    if (!tenant?.$id) return;

    setLoadingData(true);
    try {
      const [rulesData, prefsData] = await Promise.all([
        getGuidanceRulesByCategory(tenant.$id, activeTab),
        getTenantGuidancePreferences(tenant.$id, activeTab)
      ]);

      setRules(rulesData);

      if (prefsData) {
        setSelectedTone(prefsData.tone as ToneOption);
        setSavedTone(prefsData.tone as ToneOption);
        setSelectedLength(prefsData.length as LengthOption);
        setSavedLength(prefsData.length as LengthOption);
      }
    } catch (err) {
      logger.error('Failed to load guidance data', { err });
      toast.error('Failed to load guidance settings');
    } finally {
      setLoadingData(false);
    }
  }, [tenant?.$id, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!tenant?.$id) return;

    setSaving(true);
    try {
      const result = await saveTenantGuidancePreferences(tenant.$id, activeTab, selectedTone, selectedLength);
      if (!result.success) {
        logger.error('Failed to save preferences', { error: result.error });
        toast.error(result.error || 'Failed to save settings');
        return;
      }
      setSavedTone(selectedTone);
      setSavedLength(selectedLength);
      toast.success('Basics settings saved');
    } catch (err) {
      logger.error('Failed to save preferences', { err });
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedTone(savedTone);
    setSelectedLength(savedLength);
  };

  const handleNewGuidance = (categoryTitle: string) => {
    setSelectedCategory(categoryTitle);
    setEditingRuleId(null);
    setGuidanceName('');
    setGuidanceDescription('');
    setShowNewGuidanceDialog(true);
  };

  const handlePillClick = (categoryTitle: string, pillLabel: string) => {
    setSelectedCategory(categoryTitle);
    setSelectedPill(pillLabel);

    const categoryKey = categoryTitleToKey[categoryTitle];
    const existingRule = categoryKey ? rules[categoryKey]?.find(r => r.name === pillLabel) : null;

    if (existingRule) {
      setEditingRuleId(existingRule.$id);
      setGuidanceName(existingRule.name);
      setGuidanceDescription(existingRule.ruleContent);
    } else {
      setEditingRuleId(null);
      setGuidanceName(pillLabel);
      setGuidanceDescription('');
    }
    setShowEditGuidanceDialog(true);
  };

  const handleSaveNewGuidance = async () => {
    if (!guidanceName.trim()) {
      toast.error('Please enter a name for the guidance');
      return;
    }
    if (!tenant?.$id) {
      toast.error('No tenant found');
      return;
    }

    setSaving(true);
    try {
      const categoryKey = categoryTitleToKey[selectedCategory] || 'other';
      const result = await createGuidanceRule(tenant.$id, {
        channel: activeTab,
        category: categoryKey,
        name: guidanceName.trim(),
        description: guidanceDescription.trim(),
        ruleContent: guidanceDescription.trim() || guidanceName.trim(),
        enabled: true
      });

      if (!result.success) {
        logger.error('Failed to create guidance', { error: result.error });
        toast.error(result.error || 'Failed to create guidance rule');
        return;
      }

      toast.success(`New "${guidanceName}" guidance created`);
      setShowNewGuidanceDialog(false);
      setGuidanceName('');
      setGuidanceDescription('');
      await loadData();
    } catch (err) {
      logger.error('Failed to create guidance', { err });
      toast.error('Failed to create guidance rule');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditGuidance = async () => {
    if (!tenant?.$id) return;

    setSaving(true);
    try {
      if (editingRuleId) {
        const result = await updateGuidanceRule(editingRuleId, {
          name: guidanceName.trim(),
          ruleContent: guidanceDescription.trim() || guidanceName.trim()
        });
        if (!result.success) {
          toast.error(result.error || 'Failed to update guidance');
          return;
        }
        toast.success(`"${guidanceName}" guidance updated`);
      } else {
        const categoryKey = categoryTitleToKey[selectedCategory] || 'other';
        const result = await createGuidanceRule(tenant.$id, {
          channel: activeTab,
          category: categoryKey,
          name: guidanceName.trim(),
          description: guidanceDescription.trim(),
          ruleContent: guidanceDescription.trim() || guidanceName.trim(),
          enabled: true
        });
        if (!result.success) {
          toast.error(result.error || 'Failed to save guidance');
          return;
        }
        toast.success(`"${guidanceName}" guidance saved`);
      }

      setShowEditGuidanceDialog(false);
      await loadData();
    } catch (err) {
      logger.error('Failed to save guidance', { err });
      toast.error('Failed to save guidance');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuidance = async () => {
    if (!editingRuleId) return;

    setSaving(true);
    try {
      const result = await deleteGuidanceRule(editingRuleId);
      if (!result.success) {
        toast.error(result.error || 'Failed to delete guidance');
        return;
      }
      toast.success('Guidance deleted');
      setShowEditGuidanceDialog(false);
      await loadData();
    } catch (err) {
      logger.error('Failed to delete guidance', { err });
      toast.error('Failed to delete guidance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='flex h-full flex-1 overflow-hidden'>
      {/* Main content area */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Page header */}
        <div className='border-b'>
          <div className='flex items-center justify-between px-6 py-4'>
            <h1 className='font-serif text-xl font-light tracking-tight'>Guidance</h1>
            <Button variant='outline' size='sm' className='gap-1.5' onClick={() => router.push('/docs')}>
              <BookOpen className='h-4 w-4' />
              Learn
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-border px-6'>
          <button
            onClick={() => setActiveTab('chat-email')}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'chat-email'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Chat and email
            {activeTab === 'chat-email' && (
              <div className='bg-primary absolute bottom-0 left-0 right-0 h-0.5' />
            )}
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'voice'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Voice
            {activeTab === 'voice' && (
              <div className='bg-primary absolute bottom-0 left-0 right-0 h-0.5' />
            )}
          </button>
        </div>

        {/* Scrollable body */}
        <div className='flex-1 overflow-y-auto p-6'>
          {showBanner && (
            <DiscoveryBanner
              onDismiss={() => {
                setShowBanner(false);
                localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
              }}
              onGetStarted={() => router.push('/dashboard/content')}
              onBestPractices={() => router.push('/docs')}
              onBasics={() => {
                const el = document.querySelector('[data-basics-accordion]');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setActiveTab('chat-email');
              }}
              onLearnMore={() => router.push('/docs')}
            />
          )}

          {tenantLoading || loadingData ? (
            <div className='flex h-64 items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          ) : activeTab === 'chat-email' ? (
            <>
              <div data-basics-accordion>
                <BasicsAccordion
                  selectedTone={selectedTone}
                  setSelectedTone={setSelectedTone}
                  selectedLength={selectedLength}
                  setSelectedLength={setSelectedLength}
                  dirty={dirty}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  saving={saving}
                />
              </div>

              <div className='mt-6'>
                {guidanceCategories.map((cat) => {
                  const categoryKey = categoryTitleToKey[cat.title];
                  const backendRules = categoryKey ? rules[categoryKey] || [] : [];
                  const backendPillNames = backendRules
                    .filter(r => r.name !== '__preferences__')
                    .map(r => r.name);
                  const allPills = Array.from(new Set([...cat.pills, ...backendPillNames]));

                  return (
                    <GuidanceCategorySection
                      key={cat.title}
                      category={{ ...cat, pills: allPills }}
                      onNewClick={handleNewGuidance}
                      onPillClick={handlePillClick}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className='flex h-64 items-center justify-center'>
              <p className='text-sm text-muted-foreground'>
                Voice guidance settings coming soon.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right preview panel – interactive chat */}
      <PreviewChatPanel
        tenantId={tenant?.$id ?? ''}
        description='Ask a question to preview how SWEO responds with your current guidance settings.'
      />

      {/* Dialogs */}
      <Dialog open={showNewGuidanceDialog} onOpenChange={setShowNewGuidanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New {selectedCategory} Guidance</DialogTitle>
            <DialogDescription>
              Create a new guidance rule for the AI to follow.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='guidance-name'>Name</Label>
              <Input
                id='guidance-name'
                placeholder='e.g., Use formal language'
                value={guidanceName}
                onChange={(e) => setGuidanceName(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='guidance-desc'>Rule Content</Label>
              <Textarea
                id='guidance-desc'
                placeholder='Describe when and how the AI should apply this guidance...'
                value={guidanceDescription}
                onChange={(e) => setGuidanceDescription(e.target.value)}
                rows={4}
                disabled={saving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowNewGuidanceDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewGuidance} disabled={saving}>
              {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Create Guidance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditGuidanceDialog} onOpenChange={setShowEditGuidanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guidance</DialogTitle>
            <DialogDescription>
              Update this guidance rule.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='edit-guidance-name'>Name</Label>
              <Input
                id='edit-guidance-name'
                value={guidanceName}
                onChange={(e) => setGuidanceName(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-guidance-desc'>Rule Content</Label>
              <Textarea
                id='edit-guidance-desc'
                placeholder='Describe when and how the AI should apply this guidance...'
                value={guidanceDescription}
                onChange={(e) => setGuidanceDescription(e.target.value)}
                rows={4}
                disabled={saving}
              />
            </div>
          </div>
          <DialogFooter className='flex justify-between sm:justify-between'>
            {editingRuleId && (
              <Button
                variant='destructive'
                onClick={handleDeleteGuidance}
                disabled={saving}
              >
                Delete
              </Button>
            )}
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setShowEditGuidanceDialog(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditGuidance} disabled={saving}>
                {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
