'use client';

import type { AnalyticsMetrics } from '@/lib/analytics/analytics-engine';

export function PerformanceFunnel({ metrics }: { metrics: AnalyticsMetrics }) {
  const total = metrics.totalConversations;
  const resolved = metrics.totalResolved;
  const escalated = metrics.totalEscalated;
  const resolvedPct = total > 0 ? (resolved / total) * 100 : 0;

  const topChannel = [...metrics.channelStats].sort(
    (a, b) => b.volume - a.volume
  )[0];

  return (
    <div className='bg-muted/30 rounded-lg border px-4 pb-4 pt-5'>
      <h3 className='ml-2 mb-4 text-sm font-semibold'>Performance funnel</h3>

      <div className='relative h-[400px] w-full overflow-hidden rounded-lg'>
        <svg
          viewBox='0 0 1000 400'
          className='h-full w-full'
          preserveAspectRatio='none'
        >
          <defs>
            <linearGradient id='sankey-grad' x1='0' y1='0' x2='1' y2='0'>
              <stop
                offset='0%'
                stopColor='var(--primary)'
                stopOpacity='0.6'
              />
              <stop
                offset='100%'
                stopColor='var(--muted-foreground)'
                stopOpacity='0.3'
              />
            </linearGradient>
          </defs>
          <path
            d={`M 6 0 C 300 0 700 ${400 - (resolvedPct / 100) * 400} 994 ${400 - (resolvedPct / 100) * 400} L 994 400 C 700 400 300 400 6 400 Z`}
            fill='url(#sankey-grad)'
          />
          <rect
            x='0'
            y='0'
            width='6'
            height='400'
            rx='3'
            fill='var(--primary)'
          />
          <rect
            x='994'
            y={400 - (resolvedPct / 100) * 400}
            width='6'
            height={(resolvedPct / 100) * 400 || 400}
            rx='3'
            fill='var(--muted-foreground)'
          />
        </svg>

        <div className='absolute left-6 top-1/2 -translate-y-1/2'>
          <div className='flex flex-col items-start gap-1'>
            <span className='text-muted-foreground text-[10px] font-semibold uppercase tracking-wider'>
              {topChannel?.channel ?? 'All channels'}
            </span>
            <span className='inline-flex items-center justify-center rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white'>
              {total}
            </span>
          </div>
        </div>

        <div className='absolute right-6 top-1/2 -translate-y-1/2'>
          <div className='flex flex-col items-end gap-1'>
            <span className='text-muted-foreground text-[10px] font-semibold uppercase tracking-wider'>
              {escalated > 0 ? 'Escalated' : 'Resolved'}
            </span>
            <span className='bg-muted-foreground inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold text-white'>
              {escalated > 0 ? escalated : resolved}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
