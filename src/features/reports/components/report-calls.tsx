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
import { Phone, Clock, TrendingDown, BarChart3 } from 'lucide-react';

function fmtMin(n: number): string {
  if (n < 1) return `${Math.round(n * 60)}s`;
  if (n < 60) return `${n.toFixed(1)}m`;
  const h = Math.floor(n / 60);
  const m = Math.round(n % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

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

export default function ReportCalls() {
  return (
    <ReportShell
      title='Calls'
      description='Voice channel performance and call metrics'
    >
      {({ metrics }) => {
        const voiceChannel = metrics.channelStats.find(
          (c) => c.channel === 'voice'
        );
        const voiceConvos = voiceChannel?.volume ?? 0;
        const voiceResolved = voiceChannel?.resolved ?? 0;
        const voiceRate =
          voiceConvos > 0 ? (voiceResolved / voiceConvos) * 100 : 0;
        const totalConvos = metrics.totalConversations;
        const voicePct =
          totalConvos > 0 ? (voiceConvos / totalConvos) * 100 : 0;

        const channels = [...metrics.channelStats].sort(
          (a, b) => b.volume - a.volume
        );

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='Total calls'
                value={voiceConvos.toLocaleString()}
                sub={`${voicePct.toFixed(1)}% of all conversations`}
                icon={Phone}
              />
              <KPI
                label='Calls resolved'
                value={voiceResolved.toLocaleString()}
                sub={`${voiceRate.toFixed(1)}% resolution rate`}
                icon={TrendingDown}
              />
              <KPI
                label='Avg call duration'
                value={fmtMin(metrics.resolutionTime.median)}
                sub='Median duration'
                icon={Clock}
              />
              <KPI
                label='Other channels'
                value={(totalConvos - voiceConvos).toLocaleString()}
                sub='Non-voice conversations'
                icon={BarChart3}
              />
            </div>

            {channels.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Voice vs other channels
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
                          Resolved
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Resolution %
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Avg CSAT
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {channels.map((ch) => (
                        <TableRow
                          key={ch.channel}
                          className={
                            ch.channel === 'voice' ? 'bg-muted/50' : undefined
                          }
                        >
                          <TableCell className='text-xs font-medium capitalize'>
                            {ch.channel === 'voice'
                              ? '📞 Voice'
                              : ch.channel}
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
                Response time (all channels)
              </h3>
              <Card>
                <CardContent className='p-4'>
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <p className='text-muted-foreground text-[11px]'>
                        Median
                      </p>
                      <p className='text-lg font-semibold tabular-nums'>
                        {fmtMin(metrics.resolutionTime.median)}
                      </p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-[11px]'>
                        Average
                      </p>
                      <p className='text-lg font-semibold tabular-nums'>
                        {fmtMin(metrics.resolutionTime.avg)}
                      </p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-[11px]'>P90</p>
                      <p className='text-lg font-semibold tabular-nums'>
                        {fmtMin(metrics.resolutionTime.p90)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className='text-muted-foreground border-t pt-4 text-xs'>
              {voiceConvos.toLocaleString()} voice calls out of{' '}
              {totalConvos.toLocaleString()} total conversations.
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
