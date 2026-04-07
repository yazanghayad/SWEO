'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

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

const CHANNEL_COLORS: Record<string, string> = {
  web: 'var(--primary)',
  email: 'var(--chart-2, hsl(var(--primary)))',
  whatsapp: 'var(--chart-3, hsl(var(--primary)))',
  sms: 'var(--chart-4, hsl(var(--primary)))',
  voice: 'var(--chart-5, hsl(var(--primary)))',
  other: 'var(--muted-foreground)'
};

interface PieGraphProps {
  data: Record<string, number>;
}

export function PieGraph({ data }: PieGraphProps) {
  const chartData = React.useMemo(() => {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return [{ channel: 'No data', count: 1, fill: 'var(--muted-foreground)' }];
    }
    return entries.map(([channel, count], _index) => ({
      channel: channel.charAt(0).toUpperCase() + channel.slice(1),
      count,
      fill: CHANNEL_COLORS[channel] || `var(--primary)`
    }));
  }, [data]);

  const chartConfig = React.useMemo(() => {
    const config: Record<string, { label: string; color?: string }> = {
      count: { label: 'Conversations' }
    };
    chartData.forEach((item) => {
      config[item.channel] = {
        label: item.channel,
        color: item.fill
      };
    });
    return config satisfies ChartConfig;
  }, [chartData]);

  const totalCount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  const topChannel = React.useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((a, b) => (a.count > b.count ? a : b));
  }, [chartData]);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Channel Distribution</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Conversations by channel for the last 30 days
          </span>
          <span className='@[540px]/card:hidden'>Channel breakdown</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              {chartData.map((item, index) => (
                <linearGradient
                  key={item.channel}
                  id={`fill${item.channel}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor='var(--primary)'
                    stopOpacity={1 - index * 0.15}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--primary)'
                    stopOpacity={0.8 - index * 0.15}
                  />
                </linearGradient>
              ))}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.channel})`
              }))}
              dataKey='count'
              nameKey='channel'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Conversations
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {topChannel
            ? `${topChannel.channel} leads with ${totalCount > 0 ? ((topChannel.count / totalCount) * 100).toFixed(0) : 0}%`
            : 'No conversation data yet'}{' '}
          <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Last 30 days
        </div>
      </CardFooter>
    </Card>
  );
}
