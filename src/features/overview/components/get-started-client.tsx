'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  SweoIcon,
  GlobeIcon,
  MultiplatformIcon,
  ClickElementIcon,
  ShoppingCartIcon,
  CashIcon,
  InfoIcon,
  ClockFilledIcon
} from '@/components/icons/sweo-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// ─── Section Header Pattern (SWEO mono uppercase with orange dot) ──────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center border-b border-border/50 pt-1 pb-2 mb-6">
      <span className="inline-block size-1.5 rounded-[1px] bg-primary mr-2" />
      <h2 className="font-mono text-[11px] font-normal uppercase leading-[1.273] tracking-[1.5px] text-primary">
        {title}
      </h2>
    </div>
  );
}

// ─── Corner Decorations (SWEO pattern) ─────────────────────────────────────

function CornerDecorations() {
  return (
    <>
      <span className="absolute top-0 left-0 hidden h-6 w-6 border-t border-l border-border/60 md:block" />
      <span className="absolute top-0 right-0 hidden h-6 w-6 border-t border-r border-border/60 md:block" />
      <span className="absolute bottom-0 left-0 hidden h-6 w-6 border-b border-l border-border/60 md:block" />
      <span className="absolute right-0 bottom-0 hidden h-6 w-6 border-r border-b border-border/60 md:block" />
    </>
  );
}

// ─── Dashed Line Separator (SWEO decorative border) ────────────────────────

function DashedLine() {
  return (
    <div
      className="h-px w-full"
      style={{
        background: 'linear-gradient(to right, var(--border) 5px, transparent 5px)',
        backgroundSize: '10px 1px',
        backgroundRepeat: 'repeat-x'
      }}
    />
  );
}

// ─── Flywheel Illustration ───────────────────────────────────────────────────

function FlywheelIllustration() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  return (
    <div className="relative flex h-[200px] w-[310px] shrink-0 items-center justify-center">
      {/* Outer track (dashed, stadium shape) */}
      <svg
        className="text-foreground/20 absolute"
        width="276"
        height="168"
        viewBox="0 0 276 168"
        aria-hidden="true"
      >
        <path
          d="M84 0 H192 A84 84 0 0 1 192 168 H84 A84 84 0 0 1 84 0 Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Middle track (solid, stadium shape + animated dot) */}
      <svg
        className="text-foreground absolute"
        width="228"
        height="120"
        viewBox="0 0 228 120"
        aria-hidden="true"
      >
        <path
          id="sweo-track"
          d="M60 0 H168 A60 60 0 0 1 168 120 H60 A60 60 0 0 1 60 0 Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <g>
          <circle r="3" fill="white" />
          <circle r="2" fill="currentColor" />
          <animateMotion dur="12s" repeatCount="indefinite" rotate="auto">
            <mpath xlinkHref="#sweo-track" />
          </animateMotion>
        </g>
      </svg>

      {/* Inner area: dashed track + play button OR video */}
      {!playing ? (
        <>
          {/* Inner dashed track (stadium shape) */}
          <svg
            className="text-foreground/20 absolute"
            width="180"
            height="72"
            viewBox="0 0 180 72"
            aria-hidden="true"
          >
            <path
              d="M36 0 H144 A36 36 0 0 1 144 72 H36 A36 36 0 0 1 36 0 Z"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Play button */}
          <button
            onClick={handlePlay}
            className="bg-foreground text-background absolute z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110"
            aria-label="Play"
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.05 13.89L13.21 8.6C13.68 8.33 13.68 7.65999 13.21 7.38999L4.05 2.1C3.58 1.83 3 2.17 3 2.71V13.29C3 13.83 3.58 14.17 4.05 13.9V13.89Z" />
            </svg>
          </button>
        </>
      ) : (
        <div
          className="absolute z-10 overflow-hidden rounded-xl"
          style={{ width: 180, height: 72 }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src=""
            controls
            playsInline
            preload="metadata"
          />
        </div>
      )}

      {/* Badges */}
      <Badge
        label="ANALYZE"
        className="absolute left-0 top-1/2 -translate-y-1/2"
      />
      <Badge
        label="TRAIN"
        className="absolute top-0 left-1/2 -translate-x-1/2"
      />
      <Badge
        label="TEST"
        className="absolute right-0 top-1/2 -translate-y-1/2"
      />
      <Badge
        label="DEPLOY"
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
      />
    </div>
  );
}

function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        'border-border rounded-md border px-2.5 py-1 font-mono text-[10px] font-normal uppercase tracking-[1px] text-muted-foreground',
        className
      )}
    >
      {label}
    </div>
  );
}

// ─── Industry Selector ───────────────────────────────────────────────────────

const industries = [
  { label: 'Overall', icon: GlobeIcon, pctSweo: 89, pctHuman: 11, saved: '$6,176', infoQueries: '39%' },
  {
    label: 'Software & Technology',
    icon: MultiplatformIcon,
    pctSweo: 86,
    pctHuman: 14,
    saved: '$5,780',
    infoQueries: '36%'
  },
  {
    label: 'Gaming & Gambling',
    icon: ClickElementIcon,
    pctSweo: 91,
    pctHuman: 9,
    saved: '$7,230',
    infoQueries: '42%'
  },
  { label: 'eCommerce', icon: ShoppingCartIcon, pctSweo: 88, pctHuman: 12, saved: '$5,940', infoQueries: '38%' },
  {
    label: 'Financial Services',
    icon: CashIcon,
    pctSweo: 84,
    pctHuman: 16,
    saved: '$5,420',
    infoQueries: '34%'
  }
];

// ─── Bar Chart Segments ──────────────────────────────────────────────────────

function AutomationBar({ pctSweo, pctHuman }: { pctSweo: number; pctHuman: number }) {
  // Breakdown percentages inside the SWEO portion
  const informational = Math.round(pctSweo * 0.44);
  const personalized = Math.round(pctSweo * 0.34);
  const tasks = pctSweo - informational - personalized;

  return (
    <div className="flex h-8 w-full gap-0.5 overflow-hidden rounded-md">
      <div
        className="flex items-center justify-center rounded-l-md bg-violet-400/80 text-xs font-medium text-white dark:bg-violet-500/50"
        style={{ flex: informational }}
      />
      <div
        className="flex items-center justify-center bg-violet-500/80 text-xs font-medium text-white dark:bg-violet-600/50"
        style={{ flex: personalized }}
      />
      <div
        className="flex items-center justify-center bg-violet-600/80 text-xs font-medium text-white dark:bg-violet-700/50"
        style={{ flex: tasks }}
      />
      <div
        className="flex items-center justify-center rounded-r-md bg-lime-600/60 text-xs font-medium text-white dark:bg-lime-700/40"
        style={{ flex: pctHuman }}
      />
    </div>
  );
}

function BarLegend({ pctSweo, pctHuman }: { pctSweo: number; pctHuman: number }) {
  const informational = Math.round(pctSweo * 0.44);
  const personalized = Math.round(pctSweo * 0.34);
  const tasks = pctSweo - informational - personalized;

  return (
    <div className="mt-3 flex items-start justify-between gap-4 text-xs">
      {/* SWEO side */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="h-2 w-2 rounded-[2px] bg-violet-400/80 dark:bg-violet-500/50" />
            <div className="h-2 w-2 rounded-[2px] bg-violet-500/80 dark:bg-violet-600/50" />
            <div className="h-2 w-2 rounded-[2px] bg-violet-600/80 dark:bg-violet-700/50" />
          </div>
          <span className="font-mono text-xs font-medium uppercase text-foreground">
            {pctSweo}% SWEO
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[2px] bg-violet-400/80 dark:bg-violet-500/50" />
            <span className="font-mono text-[10px] font-medium uppercase text-muted-foreground">
              {informational}% informational
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[2px] bg-violet-500/80 dark:bg-violet-600/50" />
            <span className="font-mono text-[10px] font-medium uppercase text-muted-foreground">
              {personalized}% personalized
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[2px] bg-violet-600/80 dark:bg-violet-700/50" />
            <span className="font-mono text-[10px] font-medium uppercase text-muted-foreground">
              {tasks}% tasks
            </span>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Conversations that could be automated by SWEO
        </p>
      </div>

      {/* Human side */}
      <div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-[2px] bg-lime-600/60 dark:bg-lime-700/40" />
          <span className="font-mono text-xs font-medium uppercase text-foreground">
            {pctHuman}% human/complex
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Conversations that still require a teammate
        </p>
      </div>
    </div>
  );
}

// ─── See SWEO in Action — Data & Components ──────────────────────────────────

interface TabScenario {
  title: string;
  description: string;
  question: string;
  answer: string;
}

interface TabData {
  intro: string;
  scenarios: TabScenario[];
}

type TabType = 'informational' | 'personalized' | 'handoff';

const tabData: Record<TabType, TabData> = {
  informational: {
    intro:
      'SWEO answers common questions instantly using your support content — accurately, in your brand\u2019s voice.',
    scenarios: [
      {
        title: 'Product or feature questions',
        description:
          'When customers ask how something works, SWEO pulls the answer directly from your help center articles and documentation.',
        question:
          "I\u2019m having trouble reaching someone \u2014 when\u2019s your support team available?",
        answer:
          'Our chat support is open 24/7. Phone and email support run on weekdays during business hours, so there\u2019s always someone around when you need help.'
      },
      {
        title: 'Pricing and plan comparisons',
        description:
          'SWEO surfaces plan details, feature breakdowns, and pricing info so customers can make informed decisions without waiting.',
        question:
          "I\u2019m comparing plans \u2014 where can I see what\u2019s included?",
        answer:
          'You can compare all our plans on the pricing page. Each tier lists the features, limits, and support level included.'
      },
      {
        title: 'Getting started and setup guides',
        description:
          'When customers need help with onboarding or configuration, SWEO links to docs and walks them through the steps.',
        question:
          "I\u2019m trying to set something up \u2014 where can I find your docs?",
        answer:
          'You can find our documentation at docs.example.com \u2014 it covers setup guides, API references, and troubleshooting tips.'
      }
    ]
  },
  personalized: {
    intro:
      'SWEO can look up customer data and take actions on their behalf using your connected systems.',
    scenarios: [
      {
        title: 'Order and account lookups',
        description:
          'SWEO accesses your backend to fetch real-time data like order status, billing details, or subscription info.',
        question: 'Can you check the status of my latest order?',
        answer:
          'I can look that up for you. Could you share your order number or the email address associated with your account?'
      },
      {
        title: 'Account changes and updates',
        description:
          'SWEO can help customers update profile details, change plans, or modify preferences through connected systems.',
        question: 'I need to update the billing email on my account.',
        answer:
          "Sure! I can help you update your billing email. For security, I\u2019ll need to verify your account first."
      },
      {
        title: 'Billing and payment tasks',
        description:
          'SWEO handles common billing requests like applying promo codes, generating invoices, or checking payment history.',
        question: 'I need an invoice for my last 3 months of payments.',
        answer:
          "Of course! I\u2019ll generate those invoices for you. They\u2019ll be sent to your registered email address."
      }
    ]
  },
  handoff: {
    intro:
      "SWEO automatically hands over when it can\u2019t resolve an issue or when customers ask for help.",
    scenarios: [
      {
        title: "When SWEO can\u2019t confidently answer",
        description:
          "When SWEO can\u2019t find a reliable answer in the available content, it may share partial context, ask clarifying questions, or escalate if it still can\u2019t resolve the issue.",
        question: 'Can I change the email on my account?',
        answer:
          "I\u2019m not fully certain which method applies to your account.\n\nOur help content shows two paths: some accounts can change the login email in Settings \u2192 Profile, while others need a verification step via support.\n\nWhich applies to you?\n\u2022 I can see Settings \u2192 Profile\n\u2022 I don\u2019t see that option\n\u2022 Not sure \u2014 once I know, I\u2019ll give the exact steps."
      },
      {
        title: 'When SWEO is guided to escalate',
        description:
          'When a topic matches your escalation rules or procedures, SWEO routes the conversation to the right team automatically.',
        question: 'I want to cancel my account and get a full refund.',
        answer:
          "I understand you\u2019d like to cancel. Let me connect you with a specialist who can review your account and process this for you."
      },
      {
        title: 'When a customer asks for a human',
        description:
          'If the customer explicitly asks to speak with a human, SWEO respects their preference and hands off immediately.',
        question: 'Can I just talk to a real person please?',
        answer:
          'Of course \u2014 I\u2019ll connect you with a teammate right away. One moment please.'
      }
    ]
  }
};

function MessengerPreview({
  question,
  answer
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="border-border bg-card flex h-[420px] w-full max-w-[360px] shrink-0 flex-col overflow-hidden rounded-md border">
      {/* Messenger header (black) */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            S
          </div>
          <div>
            <p className="text-sm font-semibold">SWEO AI</p>
            <div className="flex items-center gap-1 text-xs text-white/70">
              <ClockFilledIcon className="h-3 w-3" />
              <span>As soon as we can</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <p className="mb-2 break-words text-center text-xs text-muted-foreground">
          Ask us anything, or share your feedback.
        </p>

        {/* User bubble */}
        <div className="flex justify-end px-0 py-1">
          <div className="bg-muted max-w-[80%] rounded-2xl border px-3 py-3 text-xs leading-relaxed text-foreground">
            {question}
          </div>
        </div>

        {/* SWEO response */}
        <div className="flex justify-start px-0 py-1">
          <div className="bg-card border-border max-w-[80%] rounded-2xl border px-3 py-3 text-xs leading-relaxed text-foreground">
            <div className="mb-2 flex items-center gap-1.5 font-semibold">
              <SweoIcon className="h-3.5 w-3.5" />
              <span className="text-[11px]">SWEO &bull; AI Agent</span>
            </div>
            <div className="whitespace-pre-line">{answer}</div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="border-border border-t px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Select a question on the left
        </p>
      </div>
    </div>
  );
}

// ─── Main Get Started Component ──────────────────────────────────────────────

export function GetStartedClient() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('handoff');
  const [selectedScenario, setSelectedScenario] = useState(0);

  const industry = industries[selectedIndustry];
  const currentTab = tabData[activeTab];
  const scenarios = currentTab.scenarios;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center overflow-y-auto bg-background px-6 py-6 md:px-10 md:pt-6 md:pb-12 lg:px-16">
      <div className="flex w-full max-w-[1000px] flex-col gap-12">
        {/* ─── SECTION 1: HERO ─────────────────────────────────────────── */}
        <section className="relative py-8">
          <CornerDecorations />
          <DashedLine />
          <div className="flex flex-col items-center justify-between gap-8 py-8 md:flex-row">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <h3 className="max-w-md font-serif text-[1.5rem] font-light leading-[1.1] tracking-[-0.03em] text-foreground md:text-[2.25rem]">
                Meet SWEO: the #1 AI Agent for
                <br />
                all your customer service
              </h3>
              <div>
                <Button
                  className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-md px-4 py-2.5 font-normal tracking-tight"
                  onClick={() => router.push('/dashboard/knowledge')}
                >
                  <SweoIcon className="h-4 w-4" />
                  Set up SWEO
                </Button>
              </div>
            </div>

            {/* Right: Flywheel */}
            <FlywheelIllustration />
          </div>
          <DashedLine />
        </section>

        {/* ─── SECTION 2: SELECT YOUR INDUSTRY ─────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h3 className="font-serif text-[1.25rem] font-light leading-[1.1] tracking-[-0.02em] text-foreground md:text-[1.5rem]">
            Select your industry
          </h3>
          <p className="max-w-lg text-[13px] leading-relaxed text-muted-foreground">
            See how companies like yours automate with SWEO — and what kind of
            impact you could achieve.
          </p>
          <div className="flex flex-wrap gap-2">
            {industries.map((ind, idx) => {
              const Icon = ind.icon;
              return (
                <Button
                  key={ind.label}
                  variant={idx === selectedIndustry ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setSelectedIndustry(idx)}
                >
                  <Icon className="h-4 w-4" />
                  {ind.label}
                </Button>
              );
            })}
          </div>
        </section>

        {/* ─── SECTION 3: AUTOMATION OPPORTUNITY ───────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="AUTOMATION OPPORTUNITY" />
          <p className="font-serif text-[1.125rem] font-light leading-[1.3] text-foreground md:text-[1.25rem]">
            Based on customer benchmarks, SWEO can automate
            <br className="hidden md:block" /> up to{' '}
            <span className="text-primary font-medium">
              {industry.pctSweo}%
            </span>{' '}
            of conversations.
          </p>
          <AutomationBar
            pctSweo={industry.pctSweo}
            pctHuman={industry.pctHuman}
          />
          <BarLegend
            pctSweo={industry.pctSweo}
            pctHuman={industry.pctHuman}
          />
        </section>

        {/* ─── SECTION 4: WHERE TO START ───────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <SectionHeader title="WHERE TO START" />
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left column */}
            <div className="flex flex-1 flex-col justify-center gap-4">
              <h3 className="font-serif text-[1.125rem] font-light leading-[1.2] tracking-[-0.02em] text-foreground md:text-[1.25rem]">
                Set up SWEO to
                <br />
                handle FAQs first
              </h3>
              <p className="max-w-md text-[13px] leading-relaxed text-foreground">
                Give SWEO content from your Help Center and it will answer common
                questions instantly. Start small with a few informational
                queries, like your top FAQs. Visit SWEO Studio to see how it&apos;s
                done.
              </p>
              <div>
                <Button
                  className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-md px-4 py-2.5 font-normal tracking-tight"
                  onClick={() => router.push('/dashboard/knowledge')}
                >
                  <SweoIcon className="h-4 w-4" />
                  Set up SWEO
                </Button>
              </div>
            </div>

            {/* Right column - data table */}
            <div className="relative grid max-w-[556px] min-w-0 grid-cols-2 lg:min-w-[400px]">
              <CornerDecorations />
              {/* Headers */}
              <div className="border-border border-b border-l px-4 pt-4 pb-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  INFORMATIONAL QUERIES
                </span>
              </div>
              <div className="border-border flex items-start gap-1 border-b border-l border-r px-4 pt-4 pb-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  AMOUNT SAVED USING SWEO
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="mt-px h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[200px] text-xs">
                        Estimated monthly savings based on average employee cost
                        per conversation
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Data */}
              <div className="border-border border-b border-l px-4 pb-4 pt-4 bg-[radial-gradient(hsl(0_0%_0%/0.06)_1px,transparent_1px)] [background-size:20px_20px]">
                <span className="font-mono text-5xl font-light tabular-nums text-foreground lg:text-[60px]">
                  {industry.infoQueries}
                </span>
              </div>
              <div className="border-border border-b border-l border-r px-4 pb-4 pt-4 bg-[radial-gradient(hsl(0_0%_0%/0.06)_1px,transparent_1px)] [background-size:20px_20px]">
                <span className="font-mono text-5xl font-light tabular-nums text-foreground lg:text-[60px]">
                  {industry.saved}
                </span>
              </div>

              {/* Captions */}
              <div className="border-border border-b border-l px-4 pb-4 pt-3">
                <p className="max-w-[224px] text-[11px] leading-relaxed text-muted-foreground">
                  On average, companies automate this share of conversations
                  with access to Help Center content alone.
                </p>
              </div>
              <div className="border-border border-b border-l border-r px-4 pb-4 pt-3">
                <p className="max-w-[224px] text-[11px] leading-relaxed text-muted-foreground">
                  On average, companies save this much in employee costs each
                  month by automating informational queries alone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: SEE SWEO IN ACTION ────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <SectionHeader title="See SWEO in action" />
          <p className="text-[13px] leading-relaxed text-foreground">
            This is a preview of how SWEO would respond to real customer
            questions,
            <br />
            and how it seamlessly hands off to a human when needed.
          </p>

          {/* Tab bar (pill group) */}
          <div className="flex w-full overflow-hidden rounded-md border border-border">
            {(
              [
                { key: 'informational', label: 'Informational' },
                { key: 'personalized', label: 'Personalized & Tasks' },
                { key: 'handoff', label: 'Handoff' }
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setSelectedScenario(0);
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1 border-border px-4 py-2 text-[13px] font-medium transition-colors [&:not(:first-child)]:border-l',
                  activeTab === t.key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content: Left scenarios + Right messenger */}
          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Left column */}
            <div className="flex flex-1 flex-col pr-0 lg:pr-10">
              <p className="mb-4 text-[13px] font-semibold text-foreground">
                {currentTab.intro}
              </p>
              <div className="flex max-w-[480px] flex-col gap-2">
                {scenarios.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedScenario(idx)}
                    className={cn(
                      'cursor-pointer rounded-md border px-3 py-4 text-left transition-colors',
                      idx === selectedScenario
                        ? 'border-foreground/30 text-foreground'
                        : 'border-border/50 text-muted-foreground hover:border-foreground/20'
                    )}
                  >
                    <p
                      className={cn(
                        'text-[13px] font-semibold',
                        idx === selectedScenario
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {s.title}
                    </p>
                    {idx === selectedScenario && (
                      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right column: Messenger */}
            <div className="flex flex-1 items-start justify-center">
              <MessengerPreview
                question={scenarios[selectedScenario].question}
                answer={scenarios[selectedScenario].answer}
              />
            </div>
          </div>
        </section>

        {/* ─── SECTION 6: CTA BANNER ──────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="TURN THESE INSIGHTS INTO IMPACT WITH SWEO" />
          <div className="relative flex flex-col items-start gap-4 rounded-md border border-border bg-accent/40 p-6 md:flex-row md:items-center">
            <CornerDecorations />
            <div className="flex-1">
              <h3 className="font-serif text-[1.125rem] font-light text-foreground md:text-[1.25rem]">
                Turn these insights into impact with SWEO
              </h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Go to SWEO Studio and start setting up SWEO to get the results you
                want.
              </p>
            </div>
            <Button
              className="shrink-0 gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-md px-4 py-2.5 font-normal tracking-tight"
              onClick={() => router.push('/dashboard/knowledge')}
            >
              <SweoIcon className="h-4 w-4" />
              Set up SWEO
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
