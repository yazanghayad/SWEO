'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Building2, Users } from 'lucide-react';
import {
  completeOnboardingAction,
  type OnboardingData
} from '@/features/auth/actions/onboarding';

const companySizes = [
  { value: '1-15', label: '1\u201415 employees' },
  { value: '16-49', label: '16\u201449 employees' },
  { value: '50-199', label: '50\u2014199 employees' },
  { value: '200-1999', label: '200\u20141,999 employees' },
  { value: '2000+', label: '2000+ employees' }
];

const industries = [
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'ecommerce', label: 'E-commerce / Retail' },
  { value: 'fintech', label: 'Fintech / Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'travel', label: 'Travel / Hospitality' },
  { value: 'media', label: 'Media / Entertainment' },
  { value: 'other', label: 'Other' }
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'sv', label: 'Svenska' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' }
];

/** Best-effort timezone from the browser. */
function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone] = useState(detectTimezone);

  async function handleComplete() {
    setSaving(true);
    try {
      const data: OnboardingData = {
        companyName,
        industry,
        companySize,
        timezone,
        language,
        channels: ['web'],
        aiAgentName: 'AI Agent',
        aiTone: 'professional',
        aiInstructions: ''
      };

      const result = await completeOnboardingAction(data);
      if (result.success) {
        toast.success('Workspace configured successfully!');
        router.push('/dashboard/overview');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='grid min-h-screen lg:grid-cols-2'>
      {/* Left Side – Form */}
      <div className='flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20'>
        <div className='mx-auto w-full max-w-md space-y-8'>
          {/* Step 0: Company Name */}
          {step === 0 && (
            <div className='space-y-6'>
              <div>
                <h1 className='text-3xl font-semibold tracking-tight'>
                  Set up your workspace
                </h1>
                <p className='text-muted-foreground mt-2 text-[15px]'>
                  Add your company name — it appears on customer-facing
                  surfaces. You can change it later.
                </p>
              </div>

              <div className='rounded-xl border bg-card p-6 shadow-sm'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='company-name' className='text-sm font-medium'>
                      Company name
                    </Label>
                    <Input
                      id='company-name'
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder='Acme'
                      className='h-11'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && companyName.trim()) setStep(1);
                      }}
                    />
                  </div>
                  <Button
                    className='w-full h-11 text-[15px]'
                    onClick={() => setStep(1)}
                    disabled={!companyName.trim()}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Company Size */}
          {step === 1 && (
            <div className='space-y-6'>
              <div>
                <h1 className='text-3xl font-semibold tracking-tight'>
                  Personalize your setup
                </h1>
                <p className='text-muted-foreground mt-2 text-[15px]'>
                  Add your company size. This will be used to ensure you receive
                  the right setup experience for your needs.
                </p>
              </div>

              <div className='rounded-xl border bg-card p-6 shadow-sm'>
                <div className='space-y-4'>
                  <Label className='text-sm font-medium'>Company size</Label>
                  <div className='space-y-2'>
                    {companySizes.map((size) => (
                      <button
                        key={size.value}
                        type='button'
                        onClick={() => setCompanySize(size.value)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                          companySize === size.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                            companySize === size.value
                              ? 'border-primary'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {companySize === size.value && (
                            <div className='h-2.5 w-2.5 rounded-full bg-primary' />
                          )}
                        </div>
                        {size.label}
                      </button>
                    ))}
                  </div>
                  <Button
                    className='w-full h-11 text-[15px]'
                    onClick={() => setStep(2)}
                    disabled={!companySize}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Industry, Language & Timezone */}
          {step === 2 && (
            <div className='space-y-6'>
              <div>
                <h1 className='text-3xl font-semibold tracking-tight'>
                  A few more details
                </h1>
                <p className='text-muted-foreground mt-2 text-[15px]'>
                  Help us tailor the experience to your business.
                </p>
              </div>

              <div className='rounded-xl border bg-card p-6 shadow-sm'>
                <div className='space-y-5'>
                  {/* Industry */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Industry</Label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className='h-11 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    >
                      <option value=''>Select your industry…</option>
                      {industries.map((ind) => (
                        <option key={ind.value} value={ind.value}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Default language</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className='h-11 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timezone (auto-detected, shown as read-only) */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Timezone</Label>
                    <Input
                      value={timezone}
                      readOnly
                      className='h-11 bg-muted/50'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Auto-detected from your browser. You can change it later in settings.
                    </p>
                  </div>

                  <div className='flex gap-3'>
                    <Button
                      variant='outline'
                      className='h-11 flex-1 text-[15px]'
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      className='h-11 flex-1 text-[15px]'
                      onClick={handleComplete}
                      disabled={saving}
                    >
                      {saving ? (
                        <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                      ) : null}
                      Start free trial
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side – Preview */}
      <div className='hidden items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100 p-10 dark:from-stone-900 dark:to-stone-950 lg:flex'>
        {step >= 1 ? (
          <div className='flex flex-col items-center gap-6'>
            <h2 className='text-center text-xl font-semibold tracking-tight text-stone-800 dark:text-stone-200'>
              Get deep insights on your teams
            </h2>
            <div className='w-full max-w-[540px]'>
              <img
                src='/images/onboarding-company-size.png'
                alt='Topics Explorer preview'
                className='w-full rounded-xl border border-stone-200/60 shadow-2xl dark:border-stone-700/40'
              />
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-6'>
            <h2 className='text-center text-xl font-semibold tracking-tight text-stone-800 dark:text-stone-200'>
              Customer support, when and where they need it
            </h2>
            <div className='relative w-full max-w-[540px]'>
              <img
                src='/images/onboarding-helpcenter-desktop.png'
                alt='Help center desktop preview'
                className='w-full rounded-xl border border-stone-200/60 shadow-2xl dark:border-stone-700/40'
              />
              <img
                src='/images/onboarding-helpcenter-mobile.png'
                alt='Help center mobile preview'
                className='absolute -right-8 -bottom-6 w-[200px] rounded-xl border border-stone-200/60 shadow-2xl dark:border-stone-700/40'
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
