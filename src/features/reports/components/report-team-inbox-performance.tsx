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
import { Inbox, Users, Clock, BarChart3 } from 'lucide-react';

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

export default function ReportTeamInboxPerformance() {
  return (
    <ReportShell
      title='Team Inbox Performance'
      description='Team queue, workload balance, and handle times'
    >
      {({ metrics }) => {
        const agents = [...metrics.agentStats].sort(
          (a, b) => (b.resolved + b.active) - (a.resolved + a.active)
        );
        const totalConvos = agents.reduce(
          (s, a) => s + a.resolved + a.active,
          0
        );
        const avgPerAgent =
          agents.length > 0 ? totalConvos / agents.length : 0;
        const queueSize = metrics.totalActive;
        const maxConvos = agents.length > 0 ? (agents[0].resolved + agents[0].active) : 0;

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='Queue size'
                value={queueSize.toLocaleString()}
                sub='Currently active'
                icon={Inbox}
              />
              <KPI
                label='Active agents'
                value={agents.length.toLocaleString()}
                sub='With conversations'
                icon={Users}
              />
              <KPI
                label='Avg per agent'
                value={avgPerAgent.toFixed(1)}
                sub='Conversations / agent'
                icon={BarChart3}
              />
              <KPI
                label='Avg handle time'
                value={fmtMin(metrics.resolutionTime.avg)}
                sub='Mean resolution'
                icon={Clock}
              />
            </div>

            {agents.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Agent workload
                </h3>
                <Card>
                  <CardContent className='space-y-2 p-4'>
                    {agents.map((a) => {
                      const aTotal = a.resolved + a.active;
                      const pct =
                        maxConvos > 0
                          ? (aTotal / maxConvos) * 100
                          : 0;
                      return (
                        <div
                          key={a.agent}
                          className='flex items-center gap-3'
                        >
                          <span className='w-28 truncate text-xs font-medium'>
                            {a.agent}
                          </span>
                          <div className='bg-muted relative h-5 flex-1 overflow-hidden'>
                            <div
                              className='bg-foreground/15 absolute inset-y-0 left-0'
                              style={{ width: `${pct.toFixed(1)}%` }}
                            />
                            <span className='relative z-10 flex h-full items-center pl-2 text-[11px] tabular-nums'>
                              {aTotal}
                            </span>
                          </div>
                          <span className='text-muted-foreground w-14 text-right text-[11px] tabular-nums'>
                            {a.avgCsat.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {agents.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Agent details
                </h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>Agent</TableHead>
                        <TableHead className='text-right text-xs'>
                          Conversations
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Resolved
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Avg response
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
                            {a.resolved + a.active}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {a.resolved}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {fmtMin(a.avgResolutionTime)}
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
              {agents.length} agents handling{' '}
              {totalConvos.toLocaleString()} conversations ·{' '}
              {queueSize} in queue.
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
