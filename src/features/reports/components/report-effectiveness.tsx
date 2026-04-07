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
import { Target, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

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

export default function ReportEffectiveness() {
  return (
    <ReportShell
      title='Effectiveness'
      description='Resolution rates, outcomes, and conversation effectiveness'
    >
      {({ metrics }) => {
        const total = metrics.totalConversations;
        const resolved = metrics.totalResolved;
        const escalated = metrics.totalEscalated;
        const active = metrics.totalActive;
        const rate = metrics.resolutionRate * 100;

        const outcomes = [
          {
            label: 'Resolved',
            count: resolved,
            pct: total > 0 ? (resolved / total) * 100 : 0
          },
          {
            label: 'Escalated',
            count: escalated,
            pct: total > 0 ? (escalated / total) * 100 : 0
          },
          {
            label: 'Active / Open',
            count: active,
            pct: total > 0 ? (active / total) * 100 : 0
          }
        ];

        const channels = [...metrics.channelStats].sort((a, b) => {
          const rateA =
            a.volume > 0 ? a.resolved / a.volume : 0;
          const rateB =
            b.volume > 0 ? b.resolved / b.volume : 0;
          return rateB - rateA;
        });

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='Resolution rate'
                value={`${rate.toFixed(1)}%`}
                sub={`${resolved} of ${total}`}
                icon={Target}
              />
              <KPI
                label='Resolved'
                value={resolved.toLocaleString()}
                sub='Successfully closed'
                icon={CheckCircle}
              />
              <KPI
                label='Escalated'
                value={escalated.toLocaleString()}
                sub='Transferred to human'
                icon={XCircle}
              />
              <KPI
                label='Avg confidence'
                value={`${(metrics.avgConfidence * 100).toFixed(1)}%`}
                sub='AI response quality'
                icon={TrendingUp}
              />
            </div>

            <div>
              <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                Outcome breakdown
              </h3>
              <Card>
                <CardContent className='space-y-3 p-4'>
                  {outcomes.map((o) => (
                    <div key={o.label} className='flex items-center gap-3'>
                      <span className='w-24 text-xs font-medium'>
                        {o.label}
                      </span>
                      <div className='bg-muted relative h-5 flex-1 overflow-hidden'>
                        <div
                          className='bg-foreground/15 absolute inset-y-0 left-0'
                          style={{
                            width: `${Math.min(o.pct, 100).toFixed(1)}%`
                          }}
                        />
                        <span className='relative z-10 flex h-full items-center pl-2 text-[11px] tabular-nums'>
                          {o.count.toLocaleString()}
                          <span className='text-muted-foreground ml-1'>
                            ({o.pct.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {channels.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Effectiveness by channel
                </h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>Channel</TableHead>
                        <TableHead className='text-right text-xs'>
                          Total
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Resolved
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Resolution %
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          CSAT
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
                            {ch.resolved}
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
                          <TableCell className='text-right text-xs tabular-nums'>
                            {ch.avgCsat.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            <div>
              <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                AI vs Human effectiveness
              </h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-xs'>Handler</TableHead>
                      <TableHead className='text-right text-xs'>
                        CSAT
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className='text-xs font-medium'>
                        Fin AI
                      </TableCell>
                      <TableCell className='text-right text-xs tabular-nums'>
                        {metrics.csat.aiCsatAvg.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='text-xs font-medium'>
                        Human agents
                      </TableCell>
                      <TableCell className='text-right text-xs tabular-nums'>
                        {metrics.csat.humanCsatAvg.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>

            <div className='text-muted-foreground border-t pt-4 text-xs'>
              {rate.toFixed(1)}% resolution rate across{' '}
              {total.toLocaleString()} conversations.
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
