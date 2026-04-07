'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { getAnalyticsAction } from '@/features/analytics/actions/analytics-actions';
import {
  listSuggestionsAction,
  approveSuggestionAction,
  dismissSuggestionAction
} from '@/features/analytics/actions/suggestion-crud';
import type { AnalyticsMetrics } from '@/lib/analytics/analytics-engine';
import type { ContentSuggestion } from '@/types/appwrite';
import { Icons } from '@/components/icons';
import { PageLoader } from '@/components/loaders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Info,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

function pctInt(n: number): string {
  return (n * 100).toFixed(0) + '%';
}

function formatMinutes(min: number): string {
  if (min < 1) return '<1m';
  if (min < 60) return `${min.toFixed(0)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ---------------------------------------------------------------------------
// Insight generation
// ---------------------------------------------------------------------------

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'action';
  title: string;
  description: string;
  action?: { label: string; href: string };
}

function generateInsights(
  metrics: AnalyticsMetrics,
  suggestions: ContentSuggestion[]
): Insight[] {
  const insights: Insight[] = [];

  // Knowledge gaps
  const lowConfTopics = metrics.topTopics.filter(
    (t) => t.avgConfidence < 0.5
  );
  if (lowConfTopics.length > 0) {
    insights.push({
      id: 'knowledge-gaps',
      type: 'warning',
      title: `${lowConfTopics.length} topic${lowConfTopics.length > 1 ? 's' : ''} with low confidence`,
      description: `Topics like "${lowConfTopics[0]?.topic}" need more training content. Add knowledge sources to improve AI responses.`,
      action: {
        label: 'View gaps',
        href: '/dashboard/reports/knowledge-gaps'
      }
    });
  }

  // Content suggestions
  if (suggestions.length > 0) {
    insights.push({
      id: 'suggestions',
      type: 'action',
      title: `${suggestions.length} content suggestion${suggestions.length > 1 ? 's' : ''} ready for review`,
      description:
        'AI has drafted answers for frequently asked but unanswered questions. Approve them to expand your knowledge base.',
      action: { label: 'Review', href: '/dashboard/analytics' }
    });
  }

  // Escalation rate
  if (metrics.totalConversations > 0) {
    const escRate = metrics.totalEscalated / metrics.totalConversations;
    if (escRate > 0.4) {
      insights.push({
        id: 'escalation',
        type: 'warning',
        title: 'High escalation rate',
        description: `${pctInt(escRate)} of conversations are escalated. Train SWEO on common escalation topics.`,
        action: { label: 'Add knowledge', href: '/dashboard/knowledge' }
      });
    }
  }

  // Speed advantage
  if (
    metrics.aiResolutionTimeAvg > 0 &&
    metrics.humanResolutionTimeAvg > 0
  ) {
    const speedup =
      metrics.humanResolutionTimeAvg / metrics.aiResolutionTimeAvg;
    if (speedup > 1.5) {
      insights.push({
        id: 'speed',
        type: 'success',
        title: `SWEO resolves ${speedup.toFixed(1)}x faster than humans`,
        description: `AI avg: ${formatMinutes(metrics.aiResolutionTimeAvg)} · Human avg: ${formatMinutes(metrics.humanResolutionTimeAvg)}`
      });
    }
  }

  // Low confidence distribution
  const distTotal =
    metrics.confidenceDistribution.high +
    metrics.confidenceDistribution.medium +
    metrics.confidenceDistribution.low;
  if (distTotal > 0) {
    const lowPct = metrics.confidenceDistribution.low / distTotal;
    if (lowPct > 0.3) {
      insights.push({
        id: 'confidence',
        type: 'warning',
        title: `${pctInt(lowPct)} of responses have low confidence`,
        description:
          'Add more procedures and knowledge sources to help SWEO answer with higher confidence.',
        action: { label: 'Add procedures', href: '/dashboard/procedures' }
      });
    }
  }

  // CSAT
  if (metrics.csat.totalRatings > 0 && metrics.csat.satisfactionRate >= 80) {
    insights.push({
      id: 'csat',
      type: 'success',
      title: `${metrics.csat.satisfactionRate.toFixed(0)}% customer satisfaction`,
      description: `Across ${metrics.csat.totalRatings} ratings. Keep up the great work.`
    });
  }

  // Resolution rate
  if (metrics.resolutionRate > 0.7) {
    insights.push({
      id: 'resolution',
      type: 'success',
      title: 'Strong automation rate',
      description: `SWEO is resolving ${pct(metrics.resolutionRate)} of conversations. Above the 70% benchmark.`
    });
  } else if (metrics.resolutionRate < 0.4 && metrics.totalConversations > 0) {
    insights.push({
      id: 'resolution-low',
      type: 'action',
      title: 'Low automation rate',
      description: `Only ${pct(metrics.resolutionRate)} resolved by SWEO. Review unresolved questions and expand training.`,
      action: {
        label: 'View unresolved',
        href: '/dashboard/reports/sweo-deflection'
      }
    });
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AIInsightsPageClient() {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  const load = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    const [metricsRes, suggestionsRes] = await Promise.all([
      getAnalyticsAction(tenant.$id, parseInt(dateRange)),
      listSuggestionsAction(tenant.$id, 'pending')
    ]);
    if (metricsRes.success && metricsRes.metrics) {
      setMetrics(metricsRes.metrics);
    }
    if (suggestionsRes.success) {
      setSuggestions(suggestionsRes.suggestions ?? []);
    }
    setLoading(false);
  }, [tenant, dateRange]);

  useEffect(() => {
    if (tenant) load();
  }, [tenant, load]);

  async function handleApprove(id: string) {
    const res = await approveSuggestionAction(id, tenant!.$id);
    if (res.success) {
      setSuggestions((prev) => prev.filter((s) => s.$id !== id));
      toast.success('Approved and added to knowledge base');
    } else {
      toast.error(res.error ?? 'Failed to approve');
    }
  }

  async function handleDismiss(id: string) {
    const res = await dismissSuggestionAction(id, tenant!.$id);
    if (res.success) {
      setSuggestions((prev) => prev.filter((s) => s.$id !== id));
      toast.success('Suggestion dismissed');
    } else {
      toast.error(res.error ?? 'Failed to dismiss');
    }
  }

  // Loading / error states ---------------------------------------------------

  if (tenantLoading || loading) {
    return <PageLoader />;
  }

  if (tenantError || !tenant) {
    return (
      <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
        {tenantError ?? 'Could not load workspace'}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
        No analytics data available yet.
      </div>
    );
  }

  // Derived data --------------------------------------------------------------

  const insights = generateInsights(metrics, suggestions);
  const escalationRate =
    metrics.totalConversations > 0
      ? metrics.totalEscalated / metrics.totalConversations
      : 0;
  const involvementRate =
    metrics.totalConversations > 0
      ? (metrics.totalResolved + metrics.totalActive) /
        metrics.totalConversations
      : 0;

  const distTotal =
    metrics.confidenceDistribution.high +
    metrics.confidenceDistribution.medium +
    metrics.confidenceDistribution.low;
  const distHigh =
    distTotal > 0
      ? (metrics.confidenceDistribution.high / distTotal) * 100
      : 0;
  const distMed =
    distTotal > 0
      ? (metrics.confidenceDistribution.medium / distTotal) * 100
      : 0;
  const distLow =
    distTotal > 0
      ? (metrics.confidenceDistribution.low / distTotal) * 100
      : 0;

  const gapTopics = [...metrics.topTopics]
    .sort((a, b) => a.avgConfidence - b.avgConfidence)
    .slice(0, 6);
  const topVolumeTopics = [...metrics.topTopics]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Render page ---------------------------------------------------------------

  return (
    <div className='bg-background flex h-full flex-col overflow-auto'>
      {/* ── Sticky header ────────────────────────────────────────────── */}
      <div className='bg-card sticky top-0 z-20 flex min-h-14 items-center justify-between rounded-t-2xl border-b border-border/40 px-6'>
        <h1 className='font-serif text-lg font-light tracking-tight'>AI Insights</h1>
        <div className='flex items-center gap-2'>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className='border-input bg-background text-foreground h-8 rounded-md border px-2 text-sm'
          >
            <option value='7'>Last 7 days</option>
            <option value='14'>Last 14 days</option>
            <option value='30'>Last 30 days</option>
            <option value='90'>Last 90 days</option>
          </select>
          <button
            onClick={load}
            className='hover:bg-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors'
          >
            <RefreshCw className='h-4 w-4' />
          </button>
        </div>
      </div>
      <Separator />

      <div className='flex flex-col gap-2 p-0'>
        {/* ── Row 1: Automation rate + CX Score ────────────────────── */}
        <div className='flex flex-row gap-2 px-0 pt-2'>
          {/* Automation rate (hero card) */}
          <div className='bg-card relative flex flex-1 flex-col rounded-2xl border'>
            {/* Corner decorations */}
            <span role='presentation' aria-hidden='true' className='absolute top-0 left-0 hidden h-6 w-6 border-t border-l border-border/40 rounded-tl-2xl md:block' />
            <span role='presentation' aria-hidden='true' className='absolute top-0 right-0 hidden h-6 w-6 border-t border-r border-border/40 rounded-tr-2xl md:block' />
            <div className='px-8 py-6'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex flex-col gap-1'>
                    <p className='section-label mb-1'>PERFORMANCE</p>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-serif text-lg font-light tracking-tight'>
                        Automation rate
                      </span>
                      <Info className='text-muted-foreground h-3.5 w-3.5' />
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      {metrics.totalResolved} conversations resolved by SWEO of{' '}
                      {metrics.totalConversations} total support volume
                    </p>
                  </div>
                  <Link
                    href='/dashboard/reports/sweo-performance'
                    className='border-input hover:bg-accent flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors'
                  >
                    Optimize
                    <ArrowRight className='h-3.5 w-3.5' />
                  </Link>
                </div>

                {/* Big percentage */}
                <span className='font-mono text-2xl font-light'>
                  {pctInt(metrics.resolutionRate)}
                </span>

                {/* Stacked bar */}
                <div className='flex h-6 w-full flex-row overflow-hidden rounded-full'>
                  <div
                    className='h-full bg-emerald-400 transition-all duration-200 dark:bg-emerald-500'
                    style={{
                      width: `${Math.max(metrics.resolutionRate * 100, metrics.totalResolved > 0 ? 2 : 0)}%`
                    }}
                  />
                  <div
                    className='bg-muted-foreground/20 h-full transition-all duration-200'
                    style={{
                      width: `${100 - metrics.resolutionRate * 100}%`
                    }}
                  />
                </div>

                {/* Legend */}
                <div className='flex items-center gap-4 text-xs'>
                  <div className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 shrink-0 rounded-sm bg-emerald-400 dark:bg-emerald-500' />
                    <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                      Resolved
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <span className='bg-muted-foreground/20 h-2 w-2 shrink-0 rounded-sm' />
                    <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                      Total volume
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='dashed-line' />

            {/* Split: Involvement rate / Escalation rate */}
            <div className='flex h-full flex-row'>
              <div className='flex flex-1 flex-col border-r px-8 py-6'>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-serif text-base font-light tracking-tight'>
                        Involvement rate
                      </span>
                      <Info className='text-muted-foreground h-3 w-3' />
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      SWEO was involved in{' '}
                      {metrics.totalResolved + metrics.totalActive} of{' '}
                      {metrics.totalConversations} conversations
                    </p>
                  </div>
                  <span className='font-mono text-xl font-light'>
                    {pctInt(involvementRate)}
                  </span>
                  <div className='flex h-3 w-full flex-row overflow-hidden rounded-full'>
                    <div
                      className='h-full bg-emerald-200 transition-all dark:bg-emerald-800'
                      style={{
                        width: `${Math.max(involvementRate * 100, involvementRate > 0 ? 2 : 0)}%`
                      }}
                    />
                    <div
                      className='bg-muted-foreground/20 h-full'
                      style={{ width: `${100 - involvementRate * 100}%` }}
                    />
                  </div>
                  <div className='flex items-center gap-4 text-xs'>
                    <div className='flex items-center gap-1.5'>
                      <span className='h-2 w-2 shrink-0 rounded-sm bg-emerald-200 dark:bg-emerald-800' />
                      <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                        Involved
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <span className='bg-muted-foreground/20 h-2 w-2 shrink-0 rounded-sm' />
                      <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                        Total volume
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex flex-1 flex-col px-8 py-6'>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-serif text-base font-light tracking-tight'>
                        Escalation rate
                      </span>
                      <Info className='text-muted-foreground h-3 w-3' />
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      {metrics.totalEscalated} routed to human agents
                    </p>
                  </div>
                  <span className='font-mono text-xl font-light'>
                    {pctInt(escalationRate)}
                  </span>
                  <div className='flex h-3 w-full flex-row overflow-hidden rounded-full'>
                    <div
                      className='h-full bg-amber-400 transition-all dark:bg-amber-500'
                      style={{
                        width: `${Math.max(escalationRate * 100, escalationRate > 0 ? 2 : 0)}%`
                      }}
                    />
                    <div
                      className='bg-muted-foreground/20 h-full'
                      style={{ width: `${100 - escalationRate * 100}%` }}
                    />
                  </div>
                  <div className='flex items-center gap-4 text-xs'>
                    <div className='flex items-center gap-1.5'>
                      <span className='h-2 w-2 shrink-0 rounded-sm bg-amber-400 dark:bg-amber-500' />
                      <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                        Escalated
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <span className='bg-muted-foreground/20 h-2 w-2 shrink-0 rounded-sm' />
                      <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                        Total volume
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CX Score card */}
          <div className='bg-card relative flex flex-1 flex-col rounded-2xl border'>
            {/* Corner decorations */}
            <span role='presentation' aria-hidden='true' className='absolute top-0 left-0 hidden h-6 w-6 border-t border-l border-border/40 rounded-tl-2xl md:block' />
            <span role='presentation' aria-hidden='true' className='absolute top-0 right-0 hidden h-6 w-6 border-t border-r border-border/40 rounded-tr-2xl md:block' />
            <div className='px-8 py-6'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex flex-col gap-1'>
                    <p className='section-label mb-1'>SATISFACTION</p>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-serif text-lg font-light tracking-tight'>CX Score</span>
                      <Info className='text-muted-foreground h-3.5 w-3.5' />
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      {metrics.csat.totalRatings > 0
                        ? `${metrics.csat.totalRatings} ratings collected`
                        : 'No ratings yet'}
                    </p>
                  </div>
                  <Link
                    href='/dashboard/reports/csat'
                    className='border-input hover:bg-accent flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors'
                  >
                    Report
                    <ArrowRight className='h-3.5 w-3.5' />
                  </Link>
                </div>

                {metrics.csat.totalRatings > 0 ? (
                  <>
                    <span className='font-mono text-2xl font-light'>
                      {metrics.csat.satisfactionRate.toFixed(0)}%
                    </span>

                    {/* Satisfaction bar */}
                    <div className='flex h-6 w-full flex-row overflow-hidden rounded-full'>
                      <div
                        className='h-full bg-blue-400 transition-all duration-200 dark:bg-blue-500'
                        style={{
                          width: `${metrics.csat.satisfactionRate}%`
                        }}
                      />
                      <div
                        className='bg-muted-foreground/20 h-full transition-all duration-200'
                        style={{
                          width: `${100 - metrics.csat.satisfactionRate}%`
                        }}
                      />
                    </div>

                    <div className='flex items-center gap-4 text-xs'>
                      <div className='flex items-center gap-1.5'>
                        <span className='h-2 w-2 shrink-0 rounded-sm bg-blue-400 dark:bg-blue-500' />
                        <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                          Satisfied
                        </span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <span className='bg-muted-foreground/20 h-2 w-2 shrink-0 rounded-sm' />
                        <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                          Total
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='text-muted-foreground flex flex-1 items-center justify-center py-8 text-sm'>
                    No data to display
                  </div>
                )}
              </div>
            </div>

            <div className='dashed-line' />

            {/* Split: Positive / Negative CX reasons */}
            <div className='flex h-full flex-row'>
              <div className='flex flex-1 flex-col border-r px-8 py-6'>
                <div className='flex flex-col gap-3'>
                  <div className='flex items-center gap-1.5'>
                    <span className='font-serif text-base font-light tracking-tight'>
                      Positive reasons
                    </span>
                    <Info className='text-muted-foreground h-3 w-3' />
                  </div>
                  {metrics.csat.positive > 0 ? (
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='flex items-center gap-1.5'>
                          <ThumbsUp className='h-3.5 w-3.5 text-emerald-500' />
                          Quick resolution
                        </span>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {metrics.csat.positive}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className='text-muted-foreground text-sm'>
                      No data to display
                    </span>
                  )}
                </div>
              </div>
              <div className='flex flex-1 flex-col px-8 py-6'>
                <div className='flex flex-col gap-3'>
                  <div className='flex items-center gap-1.5'>
                    <span className='font-serif text-base font-light tracking-tight'>
                      Negative reasons
                    </span>
                    <Info className='text-muted-foreground h-3 w-3' />
                  </div>
                  {metrics.csat.negative > 0 ? (
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='flex items-center gap-1.5'>
                          <ThumbsDown className='h-3.5 w-3.5 text-red-500' />
                          Incomplete answer
                        </span>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {metrics.csat.negative}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className='text-muted-foreground text-sm'>
                      No data to display
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: AI vs Human performance ───────────────────────── */}
        <div className='bg-card rounded-2xl border px-6 pb-3'>
          <div className='flex items-center justify-between pt-5 pr-3 pb-2'>
            <h3 className='font-serif font-light tracking-tight'>AI vs Human performance</h3>
          </div>

          <div className='grid grid-cols-4 gap-px overflow-hidden rounded-xl border'>
            {/* AI Resolved */}
            <div className='bg-card flex flex-col gap-1 p-5'>
              <span className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
                AI resolved
              </span>
              <span className='font-mono text-2xl font-light'>
                {metrics.totalResolved}
              </span>
              <span className='text-muted-foreground text-xs'>
                of {metrics.totalConversations} total
              </span>
            </div>

            {/* AI Avg time */}
            <div className='bg-card flex flex-col gap-1 border-l p-5'>
              <span className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
                AI avg resolution
              </span>
              <span className='font-mono text-2xl font-light'>
                {metrics.aiResolutionTimeAvg > 0
                  ? formatMinutes(metrics.aiResolutionTimeAvg)
                  : '—'}
              </span>
              <span className='text-muted-foreground text-xs'>
                median response time
              </span>
            </div>

            {/* Human escalated */}
            <div className='bg-card flex flex-col gap-1 border-l p-5'>
              <span className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
                Routed to human
              </span>
              <span className='font-mono text-2xl font-light'>
                {metrics.totalEscalated}
              </span>
              <span className='text-muted-foreground text-xs'>
                {pctInt(escalationRate)} escalation rate
              </span>
            </div>

            {/* Human Avg time */}
            <div className='bg-card flex flex-col gap-1 border-l p-5'>
              <span className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
                Human avg resolution
              </span>
              <span className='font-mono text-2xl font-light'>
                {metrics.humanResolutionTimeAvg > 0
                  ? formatMinutes(metrics.humanResolutionTimeAvg)
                  : '—'}
              </span>
              <span className='text-muted-foreground text-xs'>
                first response:{' '}
                {metrics.firstResponse.median > 0
                  ? formatMinutes(metrics.firstResponse.median)
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Row 3: Confidence distribution ──────────────────────── */}
        <div className='bg-card rounded-2xl border px-6 pb-4'>
          <div className='flex items-center justify-between pt-5 pr-3 pb-2'>
            <h3 className='font-serif font-light tracking-tight'>Confidence distribution</h3>
          </div>

          {distTotal > 0 ? (
            <div className='flex flex-col gap-4'>
              {/* Average confidence */}
              <div className='flex items-baseline gap-2'>
                <span className='font-mono text-2xl font-light'>
                  {pctInt(metrics.avgConfidence)}
                </span>
                <span className='text-muted-foreground text-sm'>
                  average confidence
                </span>
              </div>

              {/* Stacked bar */}
              <div className='flex h-5 w-full flex-row overflow-hidden rounded-full'>
                <div
                  className='h-full bg-emerald-400 transition-all dark:bg-emerald-500'
                  style={{ width: `${Math.max(distHigh, distHigh > 0 ? 1 : 0)}%` }}
                />
                <div
                  className='h-full bg-amber-400 transition-all dark:bg-amber-500'
                  style={{ width: `${Math.max(distMed, distMed > 0 ? 1 : 0)}%` }}
                />
                <div
                  className='h-full bg-red-400 transition-all dark:bg-red-500'
                  style={{ width: `${Math.max(distLow, distLow > 0 ? 1 : 0)}%` }}
                />
              </div>

              {/* Legend */}
              <div className='flex items-center gap-5 text-xs'>
                <div className='flex items-center gap-1.5'>
                  <span className='h-2 w-2 shrink-0 rounded-sm bg-emerald-400 dark:bg-emerald-500' />
                  <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                    High ≥70%
                  </span>
                  <span className='bg-muted ml-0.5 rounded px-1 py-0.5 font-mono text-[11px]'>
                    {metrics.confidenceDistribution.high}
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='h-2 w-2 shrink-0 rounded-sm bg-amber-400 dark:bg-amber-500' />
                  <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                    Medium 40–70%
                  </span>
                  <span className='bg-muted ml-0.5 rounded px-1 py-0.5 font-mono text-[11px]'>
                    {metrics.confidenceDistribution.medium}
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='h-2 w-2 shrink-0 rounded-sm bg-red-400 dark:bg-red-500' />
                  <span className='text-muted-foreground font-mono text-[11px] font-medium uppercase'>
                    Low &lt;40%
                  </span>
                  <span className='bg-muted ml-0.5 rounded px-1 py-0.5 font-mono text-[11px]'>
                    {metrics.confidenceDistribution.low}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground py-8 text-center text-sm'>
              No confidence data available
            </div>
          )}
        </div>

        {/* ── Row 4: Insights & recommendations ──────────────────── */}
        {insights.length > 0 && (
          <div className='bg-card rounded-2xl border px-6 pb-4'>
            <div className='flex items-center gap-2 pt-5 pr-3 pb-3'>
              <Sparkles className='h-4 w-4' />
              <h3 className='font-serif font-light tracking-tight'>Recommendations</h3>
              <Badge
                variant='secondary'
                className='ml-1 font-mono text-[11px]'
              >
                {insights.length}
              </Badge>
            </div>

            <div className='flex flex-col gap-2'>
              {insights.map((insight) => (
                <InsightRow key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* ── Row 5: Knowledge gaps + Top topics ─────────────────── */}
        <div className='flex flex-row gap-2'>
          {/* Knowledge gaps */}
          <div className='bg-card flex flex-1 flex-col rounded-2xl border'>
            <div className='flex items-center justify-between px-6 pt-5 pb-3'>
              <div className='flex items-center gap-2'>
                <h3 className='font-serif font-light tracking-tight'>Knowledge gaps</h3>
                <Info className='text-muted-foreground h-3.5 w-3.5' />
              </div>
              <Link
                href='/dashboard/reports/knowledge-gaps'
                className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors'
              >
                View all
                <ArrowRight className='h-3 w-3' />
              </Link>
            </div>
            <div className='flex-1 px-6 pb-4'>
              {gapTopics.length > 0 ? (
                <div className='flex flex-col gap-0'>
                  {gapTopics.map((topic) => {
                    const level =
                      topic.avgConfidence < 0.4
                        ? 'critical'
                        : topic.avgConfidence < 0.7
                          ? 'review'
                          : 'good';
                    return (
                      <div
                        key={topic.topic}
                        className='hover:bg-accent/50 flex items-center justify-between rounded-md px-2 py-2.5 transition-colors'
                      >
                        <span className='max-w-[240px] truncate text-sm'>
                          {topic.topic}
                        </span>
                        <div className='flex items-center gap-3'>
                          <span className='text-muted-foreground font-mono text-xs'>
                            {topic.count}
                          </span>
                          <span
                            className={`inline-flex rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                              level === 'critical'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                : level === 'review'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {(topic.avgConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='text-muted-foreground py-8 text-center text-sm'>
                  No topic data available
                </div>
              )}
            </div>
          </div>

          {/* Top topics by volume */}
          <div className='bg-card flex flex-1 flex-col rounded-2xl border'>
            <div className='flex items-center justify-between px-6 pt-5 pb-3'>
              <h3 className='font-serif font-light tracking-tight'>Top topics by volume</h3>
            </div>
            <div className='flex-1 px-6 pb-4'>
              {topVolumeTopics.length > 0 ? (
                <div className='flex flex-col gap-0'>
                  {topVolumeTopics.map((topic, i) => (
                    <div
                      key={topic.topic}
                      className='hover:bg-accent/50 flex items-center justify-between rounded-md px-2 py-2.5 transition-colors'
                    >
                      <span className='flex items-center gap-2'>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {i + 1}
                        </span>
                        <span className='max-w-[240px] truncate text-sm'>
                          {topic.topic}
                        </span>
                      </span>
                      <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {topic.count} conv
                        </span>
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                            topic.avgConfidence >= 0.7
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : topic.avgConfidence >= 0.4
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {(topic.avgConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-muted-foreground py-8 text-center text-sm'>
                  No topic data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 6: Channel breakdown ────────────────────────────── */}
        {Object.keys(metrics.channelBreakdown).length > 0 && (
          <div className='bg-card rounded-2xl border px-6 pb-4'>
            <div className='flex items-center justify-between pt-5 pr-3 pb-3'>
              <h3 className='font-serif font-light tracking-tight'>Volume by channel</h3>
            </div>
            <div className='flex flex-col gap-3'>
              {Object.entries(metrics.channelBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([channel, count]) => {
                  const channelPct =
                    metrics.totalConversations > 0
                      ? (count / metrics.totalConversations) * 100
                      : 0;
                  return (
                    <div key={channel} className='flex flex-col gap-1.5'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='font-mono text-[11px] font-medium uppercase'>
                          {channel}
                        </span>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {count} ({channelPct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className='flex h-3 w-full flex-row overflow-hidden rounded-full'>
                        <div
                          className='h-full bg-blue-400 transition-all dark:bg-blue-500'
                          style={{
                            width: `${Math.max(channelPct, count > 0 ? 2 : 0)}%`
                          }}
                        />
                        <div
                          className='bg-muted-foreground/20 h-full'
                          style={{ width: `${100 - channelPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Row 7: Content suggestions ──────────────────────────── */}
        {suggestions.length > 0 && (
          <div className='bg-card rounded-2xl border px-6 pb-4'>
            <div className='flex items-center gap-2 pt-5 pr-3 pb-3'>
              <Lightbulb className='h-4 w-4' />
              <h3 className='font-serif font-light tracking-tight'>Content suggestions</h3>
              <Badge
                variant='secondary'
                className='ml-1 font-mono text-[11px]'
              >
                {suggestions.length}
              </Badge>
            </div>

            <div className='flex flex-col gap-2'>
              {suggestions.slice(0, 4).map((s) => (
                <div
                  key={s.$id}
                  className='flex items-start justify-between rounded-xl border p-4'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium'>{s.topic}</p>
                    <p className='text-muted-foreground mt-0.5 text-xs'>
                      {s.frequency} customer
                      {s.frequency !== 1 ? 's' : ''} asked about this
                    </p>
                    {s.exampleQueries && s.exampleQueries.length > 0 && (
                      <div className='text-muted-foreground mt-2 text-xs'>
                        {s.exampleQueries
                          .slice(0, 2)
                          .map((q: string, i: number) => (
                            <span key={i} className='block'>
                              • {q}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className='ml-4 flex shrink-0 items-center gap-1.5'>
                    <Button
                      size='sm'
                      className='h-7 text-xs'
                      onClick={() => handleApprove(s.$id)}
                    >
                      <CheckCircle className='mr-1 h-3 w-3' />
                      Approve
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 text-xs'
                      onClick={() => handleDismiss(s.$id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {suggestions.length > 4 && (
              <Link
                href='/dashboard/analytics'
                className='text-muted-foreground hover:text-foreground mt-3 inline-flex items-center gap-1 text-xs transition-colors'
              >
                View all {suggestions.length} suggestions
                <ArrowRight className='h-3 w-3' />
              </Link>
            )}
          </div>
        )}

        {/* Bottom spacer */}
        <div className='h-4' />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insight row component
// ---------------------------------------------------------------------------

function InsightRow({ insight }: { insight: Insight }) {
  const iconMap = {
    success: CheckCircle,
    warning: AlertTriangle,
    action: Lightbulb
  };
  const colorMap = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    action: 'text-blue-500'
  };

  const Icon = iconMap[insight.type];

  return (
    <div className='hover:bg-accent/50 flex items-start gap-3 rounded-lg px-3 py-3 transition-colors'>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${colorMap[insight.type]}`} />
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium'>{insight.title}</p>
        <p className='text-muted-foreground mt-0.5 text-[13px] leading-relaxed'>
          {insight.description}
        </p>
      </div>
      {insight.action && (
        <Link
          href={insight.action.href}
          className='border-input hover:bg-accent flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors'
        >
          {insight.action.label}
          <ArrowRight className='h-3 w-3' />
        </Link>
      )}
    </div>
  );
}
