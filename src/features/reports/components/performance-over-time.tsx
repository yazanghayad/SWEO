'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';
import type { AnalyticsMetrics } from '@/lib/analytics/analytics-engine';

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

export function PerformanceOverTime({
  metrics
}: {
  metrics: AnalyticsMetrics;
}) {
  const [mode, setMode] = useState<'rates' | 'absolute'>('rates');
  const ts = metrics.timeseries;

  if (ts.length === 0) {
    return (
      <div className='bg-muted/30 rounded-lg border px-6 pb-4 pt-5'>
        <h3 className='text-sm font-semibold'>Performance over time</h3>
        <EmptyState />
      </div>
    );
  }

  const sampled =
    ts.length > 10
      ? ts.filter(
          (_, i) =>
            i % Math.ceil(ts.length / 10) === 0 || i === ts.length - 1
        )
      : ts;

  const maxVal =
    mode === 'rates' ? 100 : Math.max(...ts.map((p) => p.total), 1);

  const chartW = 940;
  const chartH = 220;
  const marginL = 40;
  const marginT = 40;

  const toX = (i: number) => marginL + (chartW / (ts.length - 1 || 1)) * i;
  const toY = (val: number) => marginT + chartH - (val / maxVal) * chartH;

  const buildLine = (getData: (p: (typeof ts)[0]) => number) =>
    ts
      .map(
        (p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(getData(p))}`
      )
      .join(' ');

  const resRateLine = buildLine((p) =>
    mode === 'rates'
      ? p.total > 0
        ? (p.resolved / p.total) * 100
        : 0
      : p.resolved
  );
  const totalLine = buildLine((p) =>
    mode === 'rates' ? 100 : p.total
  );
  const escLine = buildLine((p) =>
    mode === 'rates'
      ? p.total > 0
        ? (p.escalated / p.total) * 100
        : 0
      : p.escalated
  );

  return (
    <div className='bg-muted/30 rounded-lg border px-6 pb-4 pt-5'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-sm font-semibold'>Performance over time</h3>
        <div className='flex overflow-hidden rounded-lg border'>
          <button
            onClick={() => setMode('rates')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              mode === 'rates'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Rates
          </button>
          <button
            onClick={() => setMode('absolute')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              mode === 'absolute'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Absolute numbers
          </button>
        </div>
      </div>

      <div className='relative h-[300px] w-full'>
        <svg viewBox='0 0 1000 300' className='h-full w-full'>
          <line
            x1='40'
            y1='40'
            x2='980'
            y2='40'
            stroke='currentColor'
            strokeOpacity='0.1'
          />
          <line
            x1='40'
            y1='260'
            x2='980'
            y2='260'
            stroke='currentColor'
            strokeOpacity='0.1'
          />
          <text
            x='30'
            y='44'
            textAnchor='end'
            className='fill-muted-foreground text-[11px]'
          >
            {mode === 'rates' ? '100%' : maxVal}
          </text>
          <text
            x='30'
            y='264'
            textAnchor='end'
            className='fill-muted-foreground text-[11px]'
          >
            0{mode === 'rates' ? '%' : ''}
          </text>
          {sampled.map((p) => {
            const origIdx = ts.indexOf(p);
            const x = toX(origIdx);
            const d = new Date(p.date);
            const label = d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
            return (
              <text
                key={p.date}
                x={x}
                y='290'
                textAnchor='middle'
                className='fill-muted-foreground text-[11px]'
              >
                {label}
              </text>
            );
          })}
          {mode !== 'rates' && (
            <path
              d={totalLine}
              fill='none'
              stroke='#6C5CE7'
              strokeWidth='2'
            />
          )}
          <path
            d={resRateLine}
            fill='none'
            stroke='#10B981'
            strokeWidth='2'
          />
          <path
            d={escLine}
            fill='none'
            stroke='#EF4444'
            strokeWidth='1.5'
            strokeDasharray='4 2'
          />
        </svg>
      </div>

      <div className='flex items-center justify-center gap-6 pt-2'>
        {mode !== 'rates' && (
          <div className='flex items-center gap-1.5'>
            <span className='inline-block h-0.5 w-4 rounded bg-violet-500' />
            <span className='text-muted-foreground text-xs'>Total</span>
          </div>
        )}
        <div className='flex items-center gap-1.5'>
          <span className='inline-block h-0.5 w-4 rounded bg-emerald-500' />
          <span className='text-muted-foreground text-xs'>
            {mode === 'rates' ? 'Resolution rate' : 'Resolved'}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='inline-block h-0.5 w-4 rounded border-t-2 border-dashed border-red-500' />
          <span className='text-muted-foreground text-xs'>
            {mode === 'rates' ? 'Escalation rate' : 'Escalated'}
          </span>
        </div>
      </div>
    </div>
  );
}
