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
import { Ticket, TrendingUp, Clock, Layers } from 'lucide-react';

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

export default function ReportTickets() {
  return (
    <ReportShell
      title='Tickets'
      description='Ticket volume, backlog, and status breakdown'
    >
      {({ metrics }) => {
        const total = metrics.totalConversations;
        const resolved = metrics.totalResolved;
        const active = metrics.totalActive;
        const escalated = metrics.totalEscalated;
        const rate = metrics.resolutionRate * 100;

        const statuses = [
          {
            label: 'Resolved',
            count: resolved,
            pct: total > 0 ? (resolved / total) * 100 : 0
          },
          {
            label: 'Active / Open',
            count: active,
            pct: total > 0 ? (active / total) * 100 : 0
          },
          {
            label: 'Escalated',
            count: escalated,
            pct: total > 0 ? (escalated / total) * 100 : 0
          }
        ];

        const dailyData = metrics.timeseries.slice(-14);
        const channels = [...metrics.channelStats].sort(
          (a, b) => b.volume - a.volume
        );

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='Total tickets'
                value={total.toLocaleString()}
                sub='All conversations'
                icon={Ticket}
              />
              <KPI
                label='Resolved'
                value={resolved.toLocaleString()}
                sub={`${rate.toFixed(1)}% resolution`}
                icon={TrendingUp}
              />
              <KPI
                label='Open backlog'
                value={active.toLocaleString()}
                sub='Currently active'
                icon={Layers}
              />
              <KPI
                label='Escalated'
                value={escalated.toLocaleString()}
                sub='Needs human review'
                icon={Clock}
              />
            </div>

            <div>
              <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                Status breakdown
              </h3>
              <Card>
                <CardContent className='space-y-3 p-4'>
                  {statuses.map((s) => (
                    <div key={s.label} className='flex items-center gap-3'>
                      <span className='w-24 text-xs font-medium'>
                        {s.label}
                      </span>
                      <div className='bg-muted relative h-5 flex-1 overflow-hidden'>
                        <div
                          className='bg-foreground/15 absolute inset-y-0 left-0'
                          style={{
                            width: `${Math.min(s.pct, 100).toFixed(1)}%`
                          }}
                        />
                        <span className='relative z-10 flex h-full items-center pl-2 text-[11px] tabular-nums'>
                          {s.count.toLocaleString()}
                          <span className='text-muted-foreground ml-1'>
                            ({s.pct.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {dailyData.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Daily ticket volume (last 14 days)
                </h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>Date</TableHead>
                        <TableHead className='text-right text-xs'>
                          Conversations
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Resolved
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Escalated
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyData.map((d, i) => (
                        <TableRow key={`${d.date}-${i}`}>
                          <TableCell className='text-xs font-medium'>
                            {d.date}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {d.total}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {d.resolved}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {d.escalated}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {channels.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Tickets by channel
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
              {total.toLocaleString()} tickets · {active.toLocaleString()}{' '}
              open · {rate.toFixed(1)}% resolved.
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
