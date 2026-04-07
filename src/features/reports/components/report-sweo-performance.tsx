'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Info,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import ReportShell from './report-shell';
import { PerformanceFunnel } from './performance-funnel';
import { PerformanceOverTime } from './performance-over-time';
import type { AnalyticsMetrics } from '@/lib/analytics/analytics-engine';

/* ================================================================== */
/*  Shared sub-components                                              */
/* ================================================================== */

function InfoIcon() {
  return (
    <Info className='text-muted-foreground inline-block h-3 w-3 shrink-0' />
  );
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center gap-2 py-10'>
      <BarChart3 className='text-muted-foreground h-7 w-7' />
      <p className='text-muted-foreground text-sm font-medium'>
        No data to display
      </p>
      <p className='text-muted-foreground text-xs'>
        Try changing the filters at the top of the page
      </p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className='flex items-center gap-1.5'>
      <span className={cn('inline-block h-2 w-2 rounded-sm', color)} />
      <span className='text-muted-foreground text-[10px] font-semibold uppercase tracking-wider'>
        {label}
      </span>
    </div>
  );
}

function ProgressBar({
  value,
  barColor,
  bgColor = 'bg-muted-foreground/25',
  height = 'h-6'
}: {
  value: number;
  barColor: string;
  bgColor?: string;
  height?: string;
}) {
  return (
    <div className={cn('flex w-full overflow-hidden rounded-lg', height)}>
      {value > 0 && (
        <div className={cn(barColor)} style={{ width: `${value}%` }} />
      )}
      <div className={cn('flex-1', bgColor)} />
    </div>
  );
}

function PillButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className='text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium transition-colors'
    >
      {label}
      <ArrowRight className='h-3 w-3' />
    </button>
  );
}

/* ================================================================== */
/*  Metric Cards                                                       */
/* ================================================================== */

function AutomationRateCard({
  metrics,
  onOptimize
}: {
  metrics: AnalyticsMetrics;
  onOptimize?: () => void;
}) {
  const aiResolved = metrics.totalResolved;
  const total = metrics.totalConversations;
  const automationRate = total > 0 ? (aiResolved / total) * 100 : 0;
  const resRate = metrics.resolutionRate * 100;

  return (
    <div className='bg-muted/30 flex flex-1 flex-col rounded-lg border'>
      <div className='p-5'>
        <div className='mb-1 flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <h3 className='text-base font-semibold'>Automation rate</h3>
            <InfoIcon />
          </div>
          <PillButton label='Optimize' onClick={onOptimize} />
        </div>
        <p className='text-muted-foreground mb-3 text-xs'>
          {aiResolved} conversations resolved by AI of {total} total support volume
        </p>
        <p className='mb-2 font-mono text-2xl font-semibold'>{automationRate.toFixed(1)}%</p>
        <ProgressBar value={automationRate} barColor='bg-emerald-500' height='h-6' />
        <div className='mt-2 flex gap-4'>
          <LegendItem color='bg-emerald-500' label='Resolved' />
          <LegendItem color='bg-muted-foreground/25' label='Total volume' />
        </div>
      </div>

      <div className='flex flex-1 border-t'>
        <div className='flex-1 border-r p-5'>
          <div className='mb-1 flex items-center gap-1.5'>
            <h4 className='text-sm font-semibold'>Involvement rate</h4>
            <InfoIcon />
          </div>
          <p className='text-muted-foreground mb-3 text-xs'>
            AI was involved in {aiResolved + metrics.totalEscalated} conversations of {total} total volume
          </p>
          <p className='mb-2 font-mono text-xl font-semibold'>
            {total > 0 ? (((aiResolved + metrics.totalEscalated) / total) * 100).toFixed(1) : '0'}%
          </p>
          <ProgressBar
            value={total > 0 ? ((aiResolved + metrics.totalEscalated) / total) * 100 : 0}
            barColor='bg-emerald-400/30'
            height='h-3'
          />
          <div className='mt-2 flex gap-4'>
            <LegendItem color='bg-emerald-400/30' label='Involved' />
            <LegendItem color='bg-muted-foreground/25' label='Total volume' />
          </div>
        </div>

        <div className='flex-1 p-5'>
          <div className='mb-1 flex items-center gap-1.5'>
            <h4 className='text-sm font-semibold'>Resolution rate</h4>
            <InfoIcon />
          </div>
          {total > 0 ? (
            <>
              <p className='text-muted-foreground mb-3 text-xs'>
                {aiResolved} resolved of {total} total
              </p>
              <p className='mb-2 font-mono text-xl font-semibold'>{resRate.toFixed(1)}%</p>
              <ProgressBar value={resRate} barColor='bg-emerald-500' height='h-3' />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function CXScoreCard({
  metrics,
  onReport
}: {
  metrics: AnalyticsMetrics;
  onReport?: () => void;
}) {
  const csatAvg = metrics.csat.avgScore;
  const hasData = metrics.csat.totalRatings > 0;

  return (
    <div className='bg-muted/30 flex flex-1 flex-col rounded-lg border'>
      <div className='p-5'>
        <div className='mb-1 flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <h3 className='text-base font-semibold'>CX Score</h3>
            <InfoIcon />
          </div>
          <PillButton label='Report' onClick={onReport} />
        </div>
        {hasData ? (
          <>
            <p className='text-muted-foreground mb-3 text-xs'>
              Based on {metrics.csat.totalRatings} ratings
            </p>
            <p className='mb-2 font-mono text-2xl font-semibold'>{csatAvg.toFixed(2)}</p>
            <ProgressBar value={(csatAvg / 5) * 100} barColor='bg-violet-500' height='h-3' />
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      <div className='flex flex-1 border-t'>
        <div className='flex-1 border-r p-5'>
          <div className='mb-1 flex items-center gap-1.5'>
            <h4 className='text-sm font-semibold'>Positive CX Score reasons</h4>
            <InfoIcon />
          </div>
          {metrics.csat.positive > 0 ? (
            <p className='text-muted-foreground text-xs'>
              {metrics.csat.positive} positive ratings ({metrics.csat.satisfactionRate.toFixed(1)}%)
            </p>
          ) : (
            <EmptyState />
          )}
        </div>
        <div className='flex-1 p-5'>
          <div className='mb-1 flex items-center gap-1.5'>
            <h4 className='text-sm font-semibold'>Negative CX Score reasons</h4>
            <InfoIcon />
          </div>
          {metrics.csat.negative > 0 ? (
            <p className='text-muted-foreground text-xs'>
              {metrics.csat.negative} negative ratings
            </p>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Page Component                                                */
/* ================================================================== */

export default function ReportSweoPerformance() {
  const router = useRouter();

  return (
    <ReportShell
      title='SWEO Performance'
      description='AI automation performance, resolution rates, and CX score'
    >
      {({ metrics }) => (
        <div className='space-y-5'>
          <div className='flex flex-col gap-4 lg:flex-row'>
            <AutomationRateCard
              metrics={metrics}
              onOptimize={() => router.push('/dashboard/guidance')}
            />
            <CXScoreCard
              metrics={metrics}
              onReport={() => router.push('/dashboard/reports/csat')}
            />
          </div>
          <PerformanceFunnel metrics={metrics} />
          <PerformanceOverTime metrics={metrics} />
        </div>
      )}
    </ReportShell>
  );
}
