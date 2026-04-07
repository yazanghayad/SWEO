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
import { Bot, Zap, TrendingUp, Clock } from 'lucide-react';

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

export default function ReportFinAIAgent() {
  return (
    <ReportShell
      title='Fin AI Agent'
      description='AI resolution performance, confidence, and deflection rates'
    >
      {({ metrics }) => {
        const aiResolved = metrics.totalResolved;
        const total = metrics.totalConversations;
        const deflectionRate = total > 0 ? (aiResolved / total) * 100 : 0;
        const { high, medium, low } = metrics.confidenceDistribution;
        const confTotal = high + medium + low || 1;

        const confidenceRows = [
          {
            label: 'High (≥0.8)',
            count: high,
            pct: (high / confTotal) * 100
          },
          {
            label: 'Medium (0.5–0.8)',
            count: medium,
            pct: (medium / confTotal) * 100
          },
          { label: 'Low (<0.5)', count: low, pct: (low / confTotal) * 100 }
        ];

        const topicsSorted = [...metrics.topTopics]
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <KPI
                label='AI Resolved'
                value={aiResolved.toLocaleString()}
                sub={`${deflectionRate.toFixed(1)}% of total`}
                icon={Bot}
              />
              <KPI
                label='Deflection Rate'
                value={`${deflectionRate.toFixed(1)}%`}
                sub='Handled without human'
                icon={Zap}
              />
              <KPI
                label='Avg Confidence'
                value={`${(metrics.avgConfidence * 100).toFixed(1)}%`}
                sub='Across all responses'
                icon={TrendingUp}
              />
              <KPI
                label='Avg Resolution'
                value={fmtMin(metrics.aiResolutionTimeAvg)}
                sub='AI-only conversations'
                icon={Clock}
              />
            </div>

            <div>
              <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                Confidence distribution
              </h3>
              <Card>
                <CardContent className='space-y-3 p-4'>
                  {confidenceRows.map((row) => (
                    <div key={row.label} className='flex items-center gap-3'>
                      <span className='w-32 text-xs font-medium'>
                        {row.label}
                      </span>
                      <div className='bg-muted relative h-5 flex-1 overflow-hidden'>
                        <div
                          className='bg-foreground/15 absolute inset-y-0 left-0'
                          style={{
                            width: `${Math.min(row.pct, 100).toFixed(1)}%`
                          }}
                        />
                        <span className='relative z-10 flex h-full items-center pl-2 text-[11px] tabular-nums'>
                          {row.count}
                          <span className='text-muted-foreground ml-1'>
                            ({row.pct.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                AI vs Human resolution time
              </h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-xs'>Handler</TableHead>
                      <TableHead className='text-right text-xs'>
                        Avg resolution
                      </TableHead>
                      <TableHead className='text-right text-xs'>
                        CSAT
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className='text-xs font-medium'>
                        Fin AI Agent
                      </TableCell>
                      <TableCell className='text-right text-xs tabular-nums'>
                        {fmtMin(metrics.aiResolutionTimeAvg)}
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
                        {fmtMin(metrics.humanResolutionTimeAvg)}
                      </TableCell>
                      <TableCell className='text-right text-xs tabular-nums'>
                        {metrics.csat.humanCsatAvg.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>

            {topicsSorted.length > 0 && (
              <div>
                <h3 className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Top topics handled by AI
                </h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>Topic</TableHead>
                        <TableHead className='text-right text-xs'>
                          Count
                        </TableHead>
                        <TableHead className='text-right text-xs'>
                          Avg confidence
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topicsSorted.map((t) => (
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
              Fin AI Agent resolved {aiResolved.toLocaleString()} of{' '}
              {total.toLocaleString()} conversations during this period.
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
