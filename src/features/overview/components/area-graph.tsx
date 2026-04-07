'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import type { TimeseriesPoint } from '@/lib/analytics/analytics-engine';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartConfig = {
  resolved: {
    label: 'Resolved',
    color: 'var(--primary)'
  },
  escalated: {
    label: 'Escalated',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

interface AreaGraphProps {
  data: TimeseriesPoint[];
}

export function AreaGraph({ data }: AreaGraphProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric'
    }),
    resolved: d.resolved,
    escalated: d.escalated
  }));

  const totalResolved = data.reduce((sum, d) => sum + d.resolved, 0);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Conversations – Resolved vs Escalated</CardTitle>
        <CardDescription>
          Daily breakdown for the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillResolved' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-resolved)'
                  stopOpacity={1.0}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-resolved)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillEscalated' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-escalated)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-escalated)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey='escalated'
              type='natural'
              fill='url(#fillEscalated)'
              stroke='var(--color-escalated)'
              stackId='a'
            />
            <Area
              dataKey='resolved'
              type='natural'
              fill='url(#fillResolved)'
              stroke='var(--color-resolved)'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              {totalResolved} resolved this period{' '}
              <TrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              Last 30 days
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
