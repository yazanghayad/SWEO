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
import { Sparkles, Users, TrendingUp, MessageSquare } from 'lucide-react';

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

export default function ReportCopilot() {
  return (
    <ReportShell
      title='Copilot'
      description='AI-assisted productivity metrics for human agents'
    >
      {({ metrics }) => {
        const agents = [...metrics.agentStats]
          .sort((a, b) => (b.resolved + b.active) - (a.resolved + a.active))
          .slice(0, 15);
        const totalAgentConvos = agents.reduce(
          (s, a) => s + a.resolved + a.active,
          0
        );
        const avgPerAgent =
          agents.length > 0 ? totalAgentConvos / agents.length : 0;
        const topTopics = [...metrics.topTopics]
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='Active agents'
                value={agents.length.toLocaleString()}
                sub='Agents with conversations'
                icon={Users}
              />
              <KPI
                label='Avg per agent'
                value={avgPerAgent.toFixed(1)}
                sub='Conversations / agent'
                icon={MessageSquare}
              />
              <KPI
                label='AI Suggestions used'
                value={`${(metrics.avgConfidence * 100).toFixed(0)}%`}
                sub='Avg confidence score'
                icon={Sparkles}
              />
              <KPI
                label='Resolution rate'
                value={`${(metrics.resolutionRate * 100).toFixed(1)}%`}
                sub='All conversations'
                icon={TrendingUp}
              />
            </div>

            {agents.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Agent productivity
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
                          Resolution %
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Avg CSAT
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((a) => {
                        const aTotal = a.resolved + a.active;
                        return (
                        <TableRow key={a.agent}>
                          <TableCell className='text-xs font-medium'>
                            {a.agent}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {aTotal}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {a.resolved}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {aTotal > 0
                              ? (
                                  (a.resolved / aTotal) *
                                  100
                                ).toFixed(1)
                              : '0'}
                            %
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {a.avgCsat.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {topTopics.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Topic confidence
                </h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>Topic</TableHead>
                        <TableHead className='text-right text-xs'>
                          Volume
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Avg confidence
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topTopics.map((t) => (
                        <TableRow key={t.topic}>
                          <TableCell className='text-xs font-medium'>
                            {t.topic}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {t.count}
                          </TableCell>
                          <TableCell className='text-right text-xs tabular-nums'>
                            {(t.avgConfidence * 100).toFixed(0)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            <div className='text-muted-foreground border-t pt-4 text-xs'>
              {agents.length} agents handled{' '}
              {totalAgentConvos.toLocaleString()} conversations during this
              period.
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
