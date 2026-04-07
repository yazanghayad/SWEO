'use client';

import ReportShell from './report-shell';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Star, TrendingUp, Users, BarChart3 } from 'lucide-react';

function KPI({
  label,
  value,
  sub,
  icon: Icon
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className='flex items-start gap-3 p-4'>
        {Icon && (
          <div className='bg-muted flex h-8 w-8 shrink-0 items-center justify-center'>
            <Icon className='text-muted-foreground h-3.5 w-3.5' />
          </div>
        )}
        <div className='min-w-0'>
          <p className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
            {label}
          </p>
          <p className='mt-0.5 text-xl font-semibold tabular-nums'>{value}</p>
          {sub && (
            <p className='text-muted-foreground mt-0.5 text-xs'>{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportSurveyedCSAT() {
  return (
    <ReportShell
      title='Surveyed CSAT'
      description='Customer satisfaction scores from post-conversation surveys'
    >
      {({ metrics }) => {
        const { aiCsatAvg, humanCsatAvg, totalRatings, positive, neutral, negative } =
          metrics.csat;
        const overallCsat =
          totalRatings > 0 ? (aiCsatAvg + humanCsatAvg) / 2 : 0;

        const distribution = [
          { rating: 5, count: positive },
          { rating: 4, count: 0 },
          { rating: 3, count: neutral },
          { rating: 2, count: 0 },
          { rating: 1, count: negative }
        ];
        const totalDist = totalRatings || 1;

        const stars = [5, 4, 3, 2, 1];
        const distMap = new Map(distribution.map((d) => [d.rating, d.count]));

        const channels = [...metrics.channelStats].sort(
          (a, b) => b.avgCsat - a.avgCsat
        );

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='Overall CSAT'
                value={overallCsat.toFixed(2)}
                sub='Combined AI + human'
                icon={Star}
              />
              <KPI
                label='AI CSAT'
                value={aiCsatAvg.toFixed(2)}
                sub='AI-handled only'
                icon={TrendingUp}
              />
              <KPI
                label='Human CSAT'
                value={humanCsatAvg.toFixed(2)}
                sub='Human-handled only'
                icon={Users}
              />
              <KPI
                label='Total ratings'
                value={totalRatings.toLocaleString()}
                sub={`${metrics.csat.satisfactionRate.toFixed(1)}% satisfied`}
                icon={BarChart3}
              />
            </div>

            <div>
              <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                Score distribution
              </h3>
              <Card>
                <CardContent className='space-y-3 p-4'>
                  {stars.map((s) => {
                    const count = distMap.get(s) ?? 0;
                    const pct = (count / totalDist) * 100;
                    return (
                      <div key={s} className='flex items-center gap-3'>
                        <span className='flex w-12 items-center gap-1 text-xs font-medium'>
                          {'★'.repeat(s)}
                          {'☆'.repeat(5 - s)}
                        </span>
                        <div className='bg-muted relative h-5 flex-1 overflow-hidden'>
                          <div
                            className='bg-foreground/15 absolute inset-y-0 left-0'
                            style={{
                              width: `${Math.min(pct, 100).toFixed(1)}%`
                            }}
                          />
                          <span className='relative z-10 flex h-full items-center pl-2 text-[11px] tabular-nums'>
                            {count}
                            <span className='text-muted-foreground ml-1'>
                              ({pct.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {channels.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  CSAT by channel
                </h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>Channel</TableHead>
                        <TableHead className='text-right text-xs'>
                          Conversations
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Avg CSAT
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Resolution %
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {channels.map((ch) => (
                        <TableRow key={ch.channel}>
                          <TableCell className='text-xs font-medium capitalize'>
                            {ch.channel}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {ch.volume}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {ch.avgCsat.toFixed(2)}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {ch.volume > 0
                              ? (
                                  (ch.resolved / ch.volume) *
                                  100
                                ).toFixed(1)
                              : '0'}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            <div className='text-muted-foreground border-t pt-4 text-xs'>
              {totalRatings.toLocaleString()} survey responses collected (
              {metrics.csat.satisfactionRate.toFixed(1)}% satisfied).
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
