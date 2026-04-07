/* eslint-disable @next/next/no-img-element */

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ArticleIcon,
  ReferenceIcon,
  CheckedCircleIcon,
  EmptyCircleIcon
} from './knowledge-icons';
import { GreenCheckIcon } from './knowledge-icons';
import type { SourceRow, SourceSection, ChecklistItem } from './knowledge-types';

/* ------------------------------------------------------------------ */
/*  Source Row Component                                               */
/* ------------------------------------------------------------------ */

export function SourceRowItem({ row, isLast }: { row: SourceRow; isLast: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-4', !isLast && 'border-b border-border')}>
      <div className='flex items-center gap-3'>
        {row.hasCheckmark && <GreenCheckIcon className='flex-shrink-0' />}
        <div className='flex items-center gap-2.5'>
          <span className='text-muted-foreground'>{row.logo}</span>
          <span className='text-sm text-foreground'>{row.name}</span>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <span className='text-sm text-muted-foreground'>{row.statusText}</span>
        <Button
          variant='outline'
          size='sm'
          onClick={row.onAction}
          className='border-border bg-accent hover:bg-accent text-foreground'
        >
          {row.actionLabel}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Source Section Card                                                */
/* ------------------------------------------------------------------ */

export function SourceSectionCard({ section }: { section: SourceSection }) {
  return (
    <section className='rounded-lg border border-border bg-muted/30 px-6 py-5'>
      {/* Header */}
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-accent text-muted-foreground'>
            {section.icon}
          </div>
          <div>
            <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
              {section.title}
              {section.badge && (
                <span className={cn(
                  'rounded px-1.5 py-0.5 text-xs font-medium',
                  section.badge.variant === 'beta'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-blue-500/20 text-primary'
                )}>
                  {section.badge.label}
                </span>
              )}
            </h2>
            <p className='text-sm text-muted-foreground'>{section.description}</p>
          </div>
        </div>
        {section.headerAction && (
          <div className='flex-shrink-0'>{section.headerAction}</div>
        )}
      </div>

      {/* Rows */}
      {section.rows.length > 0 ? (
        <div className='ml-11'>
          {section.rows.map((row, i) => (
            <SourceRowItem
              key={row.id ?? row.name}
              row={row}
              isLast={i === section.rows.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className='ml-11 py-4 text-center'>
          <p className='text-sm text-muted-foreground'>
            No content added yet. Use the button above to add your first source.
          </p>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab Bar                                                            */
/* ------------------------------------------------------------------ */

export type TabType = 'All sources' | 'AI Agent' | 'Copilot' | 'Help Center';

export function SourcesTabs({ active, onChange }: { active: TabType; onChange: (tab: TabType) => void }) {
  const tabs: TabType[] = ['All sources', 'AI Agent', 'Copilot', 'Help Center'];
  
  return (
    <div className='flex gap-1 border-b border-border'>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'relative px-3 py-2.5 text-sm font-medium transition-colors',
            active === tab
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          type='button'
        >
          {tab}
          {active === tab && (
            <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500' />
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Checklist Card                                                     */
/* ------------------------------------------------------------------ */

export function ChecklistCard({
  title,
  items,
  onClose
}: {
  title: string;
  items: ChecklistItem[];
  onClose: () => void;
}) {
  return (
    <div className='relative rounded-lg border border-border bg-muted/30 p-5'>
      <button
        onClick={onClose}
        className='absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground'
        type='button'
      >
        <X className='h-4 w-4' />
      </button>
      <h3 className='mb-4 text-sm font-semibold text-foreground'>{title}</h3>
      <div className='flex flex-col gap-3'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex items-center gap-3 text-sm'
            onClick={item.onClick}
            role={item.onClick ? 'button' : undefined}
            tabIndex={item.onClick ? 0 : undefined}
          >
            {item.done ? (
              <CheckedCircleIcon className='flex-shrink-0' />
            ) : (
              <EmptyCircleIcon className='flex-shrink-0 text-muted-foreground/60' />
            )}
            <span className={cn(
              item.done ? 'text-muted-foreground' : 'text-foreground',
              item.onClick && !item.done && 'cursor-pointer hover:underline'
            )}>
              {item.linkText ? (
                <>
                  {item.label.split(item.linkText)[0]}
                  <span className='text-primary'>{item.linkText}</span>
                  {item.label.split(item.linkText)[1]}
                </>
              ) : (
                item.label
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Cards                                                         */
/* ------------------------------------------------------------------ */

export function AllSourcesBanner({
  onClose,
  onSetupAIAgent,
  onGoToInbox,
  onSetupHelpCenter
}: {
  onClose: () => void;
  onSetupAIAgent: () => void;
  onGoToInbox: () => void;
  onSetupHelpCenter: () => void;
}) {
  return (
    <div className='relative rounded-lg border border-border bg-muted/30 p-6'>
      <button
        onClick={onClose}
        className='absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground'
        type='button'
      >
        <X className='h-4 w-4' />
      </button>
      <h2 className='mb-4 text-base font-semibold text-foreground'>
        Optimize your content for SWEO AI Agent, Copilot, and Help Center
      </h2>
      <div className='grid grid-cols-3 gap-4'>
        {/* AI Agent Card */}
        <div className='overflow-hidden rounded-lg border border-border bg-accent'>
          <div className='aspect-video'>
            <img src='/assets/sweo-ai-agent.png' alt='SWEO AI Agent' className='h-full w-full object-cover' />
          </div>
          <div className='p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <span className='font-semibold text-foreground'>SWEO AI Agent</span>
              <span className='rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400'>Not live</span>
            </div>
            <p className='mb-3 text-xs text-muted-foreground'>
              SWEO uses your knowledge to generate accurate answers for customers.
            </p>
            <button
              onClick={onSetupAIAgent}
              className='flex items-center gap-1 text-sm text-foreground hover:underline'
            >
              <span>Set up now</span>
              <ReferenceIcon className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>

        {/* Copilot Card */}
        <div className='overflow-hidden rounded-lg border border-primary/50 bg-accent'>
          <div className='aspect-video'>
            <img src='/assets/sweo-copilot.svg' alt='SWEO Copilot' className='h-full w-full object-cover' />
          </div>
          <div className='p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <img src='/assets/copilot-logo.png' alt='Copilot' className='h-5 w-5' />
              <span className='font-semibold text-foreground'>Copilot</span>
              <span className='rounded bg-teal-500/20 px-1.5 py-0.5 text-xs text-teal-400'>Live</span>
            </div>
            <p className='mb-3 text-xs text-muted-foreground'>
              Copilot uses your knowledge to give your teammates the answers they need.
            </p>
            <button
              onClick={onGoToInbox}
              className='flex items-center gap-1 text-sm text-foreground hover:underline'
            >
              <span>Go to Inbox</span>
              <ReferenceIcon className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>

        {/* Help Center Card */}
        <div className='overflow-hidden rounded-lg border border-border bg-accent'>
          <div className='aspect-video'>
            <img src='/assets/sweo-help-center.svg' alt='Help Center' className='h-full w-full object-cover' />
          </div>
          <div className='p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <span className='font-semibold text-foreground'>Help Center</span>
              <span className='rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400'>Not live</span>
            </div>
            <p className='mb-3 text-xs text-muted-foreground'>
              Customers use your knowledge to find accurate answers themselves.
            </p>
            <button
              onClick={onSetupHelpCenter}
              className='flex items-center gap-1 text-sm text-foreground hover:underline'
            >
              <span>Set up now</span>
              <ReferenceIcon className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIAgentHero({ onSetup, onLearnMore }: { onSetup: () => void; onLearnMore: () => void }) {
  return (
    <div className='relative flex rounded-lg border border-border bg-muted/30 overflow-hidden'>
      <div className='flex-1 p-8'>
        <div className='mb-3 flex items-center gap-2'>
          <h2 className='text-xl font-semibold text-foreground'>SWEO AI Agent</h2>
          <span className='rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400'>Not live</span>
        </div>
        <p className='mb-6 max-w-md text-sm leading-relaxed text-muted-foreground'>
          SWEO uses your support content to answer questions via Messenger and email, to
          increase self-serve support, customer experience, and CSAT scores.
        </p>
        <div className='flex items-center gap-5'>
          <button
            onClick={onSetup}
            className='flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline'
          >
            <ReferenceIcon className='h-4 w-4' />
            Set up now
          </button>
          <button
            onClick={onLearnMore}
            className='flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline'
          >
            <ArticleIcon className='h-4 w-4' />
            Learn more
          </button>
        </div>
      </div>
      <div className='hidden w-80 md:block'>
        <img src='/assets/sweo-ai-agent.png' alt='SWEO AI Agent' className='h-full w-full object-cover' />
      </div>
    </div>
  );
}

export function CopilotHero({ onGoToInbox, onWatchGuide, onLearnMore }: { onGoToInbox: () => void; onWatchGuide: () => void; onLearnMore: () => void }) {
  return (
    <div className='relative flex rounded-lg border border-primary/30 bg-muted/30 overflow-hidden'>
      <div className='flex-1 p-8'>
        <div className='mb-3 flex items-center gap-2'>
          <img src='/assets/copilot-logo.png' alt='Copilot' className='h-6 w-6' />
          <h2 className='text-xl font-semibold text-foreground'>Copilot</h2>
          <span className='rounded bg-teal-500/20 px-2 py-0.5 text-xs text-teal-400'>Live</span>
        </div>
        <p className='mb-6 max-w-md text-sm leading-relaxed text-muted-foreground'>
          Copilot uses your support content to quickly find answers, giving each teammate
          an AI assistant that enhances team efficiency and customer experience.
        </p>
        <div className='flex items-center gap-5'>
          <button
            onClick={onGoToInbox}
            className='flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline'
          >
            <ReferenceIcon className='h-4 w-4' />
            Go to Inbox
          </button>
          <button
            onClick={onWatchGuide}
            className='flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline'
          >
            <ArticleIcon className='h-4 w-4' />
            Watch guide
          </button>
          <button
            onClick={onLearnMore}
            className='flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline'
          >
            <ArticleIcon className='h-4 w-4' />
            Learn more
          </button>
        </div>
      </div>
      <div className='hidden w-80 md:block'>
        <img src='/assets/sweo-copilot.svg' alt='SWEO Copilot' className='h-full w-full object-cover' />
      </div>
    </div>
  );
}

export function HelpCenterHero({ onSetup, onLearnMore }: { onSetup: () => void; onLearnMore: () => void }) {
  return (
    <div className='relative flex rounded-lg border border-border bg-muted/30 overflow-hidden'>
      <div className='flex-1 p-8'>
        <div className='mb-3 flex items-center gap-2'>
          <h2 className='text-xl font-semibold text-foreground'>Help Center</h2>
          <span className='rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400'>Not live</span>
        </div>
        <p className='mb-6 max-w-md text-sm leading-relaxed text-muted-foreground'>
          Help Center lets you create articles and organize them into collections, so
          customers can find answers to common questions quickly on your website or app.
        </p>
        <div className='flex items-center gap-5'>
          <button
            onClick={onSetup}
            className='flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline'
          >
            <ReferenceIcon className='h-4 w-4' />
            Set up now
          </button>
          <button
            onClick={onLearnMore}
            className='flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline'
          >
            <ArticleIcon className='h-4 w-4' />
            Learn more
          </button>
        </div>
      </div>
      <div className='hidden w-80 md:block'>
        <img src='/assets/sweo-help-center.svg' alt='Help Center' className='h-full w-full object-cover' />
      </div>
    </div>
  );
}
