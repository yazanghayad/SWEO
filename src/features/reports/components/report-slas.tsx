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
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

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

const SLA_TARGETS = {
  firstResponse: 5,
  resolution: 60
};

export default function ReportSLAs() {
  return (
    <ReportShell
      title='SLAs'
      description='Service level agreement compliance and targets'
    >
      {({ metrics }) => {
        const frMedian = metrics.firstResponse.median;
        const resMedian = metrics.resolutionTime.median;

        const frCompliance = frMedian <= SLA_TARGETS.firstResponse;
        const resCompliance = resMedian <= SLA_TARGETS.resolution;

        const frBuckets = metrics.firstResponse.distribution;
        const withinSLA = frBuckets
          .filter((b) => {
            const val = parseFloat(b.label);
            return !isNaN(val) && val <= SLA_TARGETS.firstResponse;
          })
          .reduce((s, b) => s + b.count, 0);
        const totalFR = frBuckets.reduce((s, b) => s + b.count, 0) || 1;
        const slaRate = (withinSLA / totalFR) * 100;

        const channels = [...metrics.channelStats].sort(
          (a, b) => b.volume - a.volume
        );

        const slaItems = [
          {
            name: 'First response time',
            target: `< ${SLA_TARGETS.firstResponse}m`,
            actual: fmtMin(frMedian),
            met: frCompliance
          },
          {
            name: 'Resolution time',
            target: `< ${SLA_TARGETS.resolution}m`,
            actual: fmtMin(resMedian),
            met: resCompliance
          },
          {
            name: 'P90 resolution',
            target: `< ${SLA_TARGETS.resolution * 2}m`,
            actual: fmtMin(metrics.resolutionTime.p90),
            met: metrics.resolutionTime.p90 <= SLA_TARGETS.resolution * 2
          }
        ];

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='SLA compliance'
                value={`${slaRate.toFixed(1)}%`}
                sub='First response within target'
                icon={Shield}
              />
              <KPI
                label='First response'
                value={fmtMin(frMedian)}
                sub={`Target: < ${SLA_TARGETS.firstResponse}m`}
                icon={Clock}
              />
              <KPI
                label='Resolution time'
                value={fmtMin(resMedian)}
                sub={`Target: < ${SLA_TARGETS.resolution}m`}
                icon={frCompliance ? CheckCircle : AlertTriangle}
              />
              <KPI
                label='Breaches'
                value={`${(100 - slaRate).toFixed(1)}%`}
                sub='Outside SLA target'
                icon={AlertTriangle}
              />
            </div>

            <div>
              <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                SLA targets vs actual
              </h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-xs'>Metric</TableHead>
                      <TableHead className='text-right text-xs'>
                        Target
                      </TableHead>
                      <TableHead className='text-right text-xs'>
                        Actual (median)
                      </TableHead>
                      <TableHead className='text-right text-xs'>
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slaItems.map((s) => (
                      <TableRow key={s.name}>
                        <TableCell className='text-xs font-medium'>
                          {s.name}
                        </TableCell>
                        <TableCell className='text-right text-xs tabular-nums'>
                          {s.target}
                        </TableCell>
                        <TableCell className='text-right text-xs tabular-nums'>
                          {s.actual}
                        </TableCell>
                        <TableCell className='text-right text-xs'>
                          {s.met ? (
                            <span className='text-green-600'>✓ Met</span>
                          ) : (
                            <span className='text-red-500'>✗ Breached</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {channels.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  SLA by channel
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
                          Resolution %
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

            <div className='text-muted-foreground border-t pt-4 text-xs'>
              SLA compliance: {slaRate.toFixed(1)}% within first response
              target of {SLA_TARGETS.firstResponse} minutes.
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
