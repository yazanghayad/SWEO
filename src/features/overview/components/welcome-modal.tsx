'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import {
  saveProfilingSurveyAction,
  checkProfilingSurveyAction,
  type ProfilingSurveyData
} from '@/features/auth/actions/profiling-survey';
import { toast } from 'sonner';

// ─── Survey Questions ──────────────────────────────────────────────────────

const TOTAL_QUESTIONS = 6;

const priorityOptions = [
  'Lead generation',
  'Customer experience',
  'AI-first customer service',
  'Marketing campaigns',
  'Onboarding customers',
  'Support team efficiency',
  'Improving CSAT',
  'Self-serve support',
  'Other'
];

const channelOptions = [
  'Live chat',
  'Email',
  'Phone',
  'SMS',
  'WhatsApp',
  'Social media',
  'Other'
];

const roleOptions = [
  'Founder / CEO',
  'CX / Support Lead',
  'Product Manager',
  'Engineering',
  'Marketing',
  'Operations',
  'Other'
];

const timelineOptions = [
  '0–1 month',
  '1–3 months',
  '3–6 months',
  '6–12 months',
  'Not sure'
];

// ─── Badge Toggle ──────────────────────────────────────────────────────────

function ToggleBadge({
  label,
  selected,
  onClick
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:bg-muted'
      )}
    >
      {label}
    </button>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className='flex gap-1.5'>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 w-8 rounded-full transition-colors',
            i < current ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 = welcome, 1-6 = questions
  const [saving, setSaving] = useState(false);

  // Survey state
  const [priorities, setPriorities] = useState<string[]>([]);
  const [hasExistingTool, setHasExistingTool] = useState('');
  const [preferredChannels, setPreferredChannels] = useState<string[]>([]);
  const [role, setRole] = useState('');
  const [managesTeam, setManagesTeam] = useState('');
  const [startTimeline, setStartTimeline] = useState('');

  useEffect(() => {
    checkProfilingSurveyAction().then(({ completed }) => {
      if (!completed) setOpen(true);
    });
  }, []);

  function toggleList(
    list: string[],
    setList: (v: string[]) => void,
    value: string
  ) {
    setList(
      list.includes(value) ? list.filter((v2) => v2 !== value) : [...list, value]
    );
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const data: ProfilingSurveyData = {
        priorities,
        hasExistingTool,
        preferredChannels,
        role,
        managesTeam,
        startTimeline
      };
      const result = await saveProfilingSurveyAction(data);
      if (!result.success) {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
      setOpen(false);
    }
  }, [priorities, hasExistingTool, preferredChannels, role, managesTeam, startTimeline]);

  function handleNext() {
    if (step < TOTAL_QUESTIONS) {
      setStep((s) => s + 1);
    } else {
      handleSave();
    }
  }

  function handleSkip() {
    if (step < TOTAL_QUESTIONS) {
      setStep((s) => s + 1);
    } else {
      handleSave();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSave(); }}>
      <DialogContent className='max-w-lg gap-0 overflow-hidden p-0 [&>button]:hidden'>
        {/* Step 0: Welcome */}
        {step === 0 && (
          <>
            <img
              src='/images/onboarding-welcome.png'
              alt='Welcome illustration'
              className='h-48 w-full object-cover'
            />
            <div className='space-y-4 p-6'>
              <DialogTitle className='text-xl font-semibold tracking-tight'>
                Welcome to your free 14-day trial
              </DialogTitle>
              <DialogDescription className='text-sm leading-relaxed text-muted-foreground'>
                Explore the Advanced plan including our next-generation Helpdesk and
                unlimited outcomes for SWEO AI Agent. Let&apos;s get started by
                personalizing your experience.
              </DialogDescription>
              <Button onClick={() => setStep(1)} variant='outline' className='gap-2'>
                Continue
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          </>
        )}

        {/* Questions 1-6 */}
        {step >= 1 && (
          <div className='space-y-5 p-6'>
            {/* Progress */}
            <div className='space-y-2'>
              <p className='text-xs text-muted-foreground'>
                Question {step} of {TOTAL_QUESTIONS}
              </p>
              <ProgressBar current={step} total={TOTAL_QUESTIONS} />
            </div>

            {/* Q1: Priorities */}
            {step === 1 && (
              <div className='space-y-3'>
                <DialogTitle className='text-base font-semibold'>
                  What matters most to your team?
                </DialogTitle>
                <DialogDescription className='text-sm text-muted-foreground'>
                  This will help us personalize your setup experience
                </DialogDescription>
                <p className='text-xs font-medium text-muted-foreground'>
                  Select all that apply:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {priorityOptions.map((opt) => (
                    <ToggleBadge
                      key={opt}
                      label={opt}
                      selected={priorities.includes(opt)}
                      onClick={() => toggleList(priorities, setPriorities, opt)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q2: Existing tool */}
            {step === 2 && (
              <div className='space-y-3'>
                <DialogTitle className='text-base font-semibold'>
                  Do you already use a customer service tool?
                </DialogTitle>
                <DialogDescription className='text-sm text-muted-foreground'>
                  This lets us know how to help you best if you&apos;re switching to SWEO
                </DialogDescription>
                <div className='flex gap-2'>
                  {['Yes', 'No'].map((opt) => (
                    <ToggleBadge
                      key={opt}
                      label={opt}
                      selected={hasExistingTool === opt}
                      onClick={() => setHasExistingTool(opt)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q3: Support channels */}
            {step === 3 && (
              <div className='space-y-3'>
                <DialogTitle className='text-base font-semibold'>
                  Which support channels do you prefer?
                </DialogTitle>
                <DialogDescription className='text-sm text-muted-foreground'>
                  We support many channels: tell us which ones you&apos;ll use most
                </DialogDescription>
                <p className='text-xs font-medium text-muted-foreground'>
                  Select all that apply:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {channelOptions.map((opt) => (
                    <ToggleBadge
                      key={opt}
                      label={opt}
                      selected={preferredChannels.includes(opt)}
                      onClick={() =>
                        toggleList(preferredChannels, setPreferredChannels, opt)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q4: Role */}
            {step === 4 && (
              <div className='space-y-3'>
                <DialogTitle className='text-base font-semibold'>
                  What best describes your role?
                </DialogTitle>
                <DialogDescription className='text-sm text-muted-foreground'>
                  We&apos;ll tailor the experience to your responsibilities
                </DialogDescription>
                <div className='flex flex-wrap gap-2'>
                  {roleOptions.map((opt) => (
                    <ToggleBadge
                      key={opt}
                      label={opt}
                      selected={role === opt}
                      onClick={() => setRole(opt)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q5: Manages team */}
            {step === 5 && (
              <div className='space-y-3'>
                <DialogTitle className='text-base font-semibold'>
                  Do you manage your support team?
                </DialogTitle>
                <DialogDescription className='text-sm text-muted-foreground'>
                  We&apos;ll provide relevant insights tailored to your role
                </DialogDescription>
                <div className='flex gap-2'>
                  {['Yes', 'No', "I don't have a team yet"].map((opt) => (
                    <ToggleBadge
                      key={opt}
                      label={opt}
                      selected={managesTeam === opt}
                      onClick={() => setManagesTeam(opt)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q6: Timeline */}
            {step === 6 && (
              <div className='space-y-3'>
                <DialogTitle className='text-base font-semibold'>
                  When will you start using SWEO with customers?
                </DialogTitle>
                <DialogDescription className='text-sm text-muted-foreground'>
                  This will help us suggest the best setup for you
                </DialogDescription>
                <div className='flex flex-wrap gap-2'>
                  {timelineOptions.map((opt) => (
                    <ToggleBadge
                      key={opt}
                      label={opt}
                      selected={startTimeline === opt}
                      onClick={() => setStartTimeline(opt)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='flex items-center gap-3 pt-2'>
              <Button
                onClick={handleNext}
                variant='outline'
                className='gap-2'
                disabled={saving}
              >
                Continue
                <ArrowRight className='h-4 w-4' />
              </Button>
              <button
                type='button'
                onClick={handleSkip}
                className='text-sm text-muted-foreground hover:text-foreground'
                disabled={saving}
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
