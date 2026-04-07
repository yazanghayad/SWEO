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
import { Clock, Zap, Timer, BarChart3 } from 'lucide-react';

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

export default function ReportResponsiveness() {
  return (
    <ReportShell
      title='Responsiveness'
      description='First response and resolution time metrics'
    >
      {({ metrics }) => {
        const { firstResponse, resolutionTime } = metrics;
        const frBuckets = firstResponse.distribution;
        const frTotal = frBuckets.reduce((s, b) => s + b.count, 0) || 1;

        const channels = [...metrics.channelStats].sort(
          (a, b) => b.volume - a.volume
        );
        const agents = [...metrics.agentStats]
          .sort((a, b) => a.avgResolutionTime - b.avgResolutionTime)
          .slice(0, 10);

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='First response (median)'
                value={fmtMin(firstResponse.median)}
                sub='50th percentile'
                icon={Zap}
              />
              <KPI
                label='First response (avg)'
                value={fmtMin(firstResponse.avg)}
                sub='Mean time'
                icon={Clock}
              />
              <KPI
                label='Resolution (median)'
                value={fmtMin(resolutionTime.median)}
                sub='50th percentile'
                icon={Timer}
              />
              <KPI
                label='Resolution (P90)'
                value={fmtMin(resolutionTime.p90)}
                sub='90th percentile'
                icon={BarChart3}
              />
            </div>

            <div>
              <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                First response distribution
              </h3>
              <Card>
                <CardContent className='space-y-3 p-4'>
                  {frBuckets.map((b) => {
                    const pct = (b.count / frTotal) * 100;
                    return (
                      <div key={b.label} className='flex items-center gap-3'>
                        <span className='w-20 text-xs font-medium'>
                          {b.label}
                        </span>
                        <div className='bg-muted relative h-5 flex-1 overflow-hidden'>
                          <div
                            className='bg-foreground/15 absolute inset-y-0 left-0'
                            style={{
                              width: `${Math.min(pct, 100).toFixed(1)}%`
                            }}
                          />
                          <span className='relative z-10 flex h-full items-center pl-2 text-[11px] tabular-nums'>
                            {b.count}
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
                  Response time by channel
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {agents.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Fastest responding agents
                </h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>Agent</TableHead>
                        <TableHead className='text-right text-xs'>
                          Avg response
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Conversations
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          CSAT
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((a) => (
                        <TableRow key={a.agent}>
                          <TableCell className='text-xs font-medium'>
                            {a.agent}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {fmtMin(a.avgResolutionTime)}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {a.resolved + a.active}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {a.avgCsat.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            <div className='text-muted-foreground border-t pt-4 text-xs'>
              Median first response: {fmtMin(firstResponse.median)} · Median
              resolution: {fmtMin(resolutionTime.median)}
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
