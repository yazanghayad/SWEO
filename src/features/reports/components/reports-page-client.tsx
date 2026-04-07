'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTenant } from '@/hooks/use-tenant';
import { getAnalyticsAction } from '@/features/analytics/actions/analytics-actions';
import type { AnalyticsMetrics } from '@/lib/analytics/analytics-engine';
import { Icons } from '@/components/icons';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  Download,
  HelpCircle,
  CalendarDays,
  Search,
  Lightbulb,
  Plus,
  FileSpreadsheet,
  FileText,
  FileType,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import ReportsSidebar, { type ReportsView } from './reports-sidebar';
import { PerformanceFunnel } from './performance-funnel';
import { PerformanceOverTime } from './performance-over-time';
import {
  exportCSV,
  exportJSON,
  exportAsPDF,
  exportAsDOCX
} from '../lib/report-export';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// All Reports list
// ---------------------------------------------------------------------------

const ALL_REPORTS = [
  { title: 'Articles', slug: 'knowledge-gaps', updated: 'Jan 15, 2025' },
  { title: 'Calls', slug: 'calls', updated: 'Feb 10, 2025' },
  { title: 'Conversation tags', slug: 'conversations', updated: 'Jan 8, 2025' },
  { title: 'Conversations', slug: 'conversations', updated: 'Feb 20, 2025' },
  { title: 'Copilot', slug: 'copilot', updated: 'Mar 1, 2025' },
  { title: 'Customer satisfaction (CSAT)', slug: 'csat', updated: 'Feb 5, 2025' },
  { title: 'Effectiveness', slug: 'effectiveness', updated: 'Jan 22, 2025' },
  { title: 'Fin AI Agent', slug: 'fin-ai-agent', updated: 'Mar 3, 2025' },
  { title: 'Messages', slug: 'conversations', updated: 'Jan 12, 2025' },
  { title: 'New conversations', slug: 'conversations', updated: 'Feb 18, 2025' },
  { title: 'Outbound engagement', slug: 'conversations', updated: 'Jan 5, 2025' },
  { title: 'Responsiveness', slug: 'responsiveness', updated: 'Feb 8, 2025' },
  { title: 'SLAs', slug: 'slas', updated: 'Jan 20, 2025' },
  { title: 'Surveyed CSAT', slug: 'surveyed-csat', updated: 'Feb 12, 2025' },
  { title: 'Team inbox performance', slug: 'team-inbox-performance', updated: 'Jan 28, 2025' },
  { title: 'Teammate performance', slug: 'team-performance', updated: 'Feb 15, 2025' },
  { title: 'Tickets', slug: 'tickets', updated: 'Jan 18, 2025' },
  { title: 'First Response Time', slug: 'first-response', updated: 'Feb 1, 2025' },
  { title: 'Resolution Time', slug: 'resolution-time', updated: 'Jan 25, 2025' },
  { title: 'Busiest Hours', slug: 'busiest-hours', updated: 'Feb 3, 2025' },
  { title: 'Channels Overview', slug: 'channels', updated: 'Jan 30, 2025' }
];

const conversationBarConfig = {
  finAI: { label: 'Fin AI agent', color: '#6C5CE7' },
  chatbot: { label: 'Chatbot', color: '#A29BFE' },
  teammate: { label: 'Teammate', color: '#74B9FF' },
  noReply: { label: 'No reply', color: '#DFE6E9' }
};

const volumeAreaConfig = {
  total: { label: 'All conversations', color: '#6C5CE7' },
  resolved: { label: 'Fin AI agent', color: '#A29BFE' },
  escalated: { label: 'Teammate', color: '#74B9FF' }
};

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

function AllReportsView({ tenantName }: { tenantName: string }) {
  const [tab, setTab] = useState<'shared' | 'yours' | 'workspace'>('workspace');
  const [search, setSearch] = useState('');
  const filtered = ALL_REPORTS.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className='flex h-full flex-col'>
      <div className='rm-header'>
        <h1 className='rm-title'>All reports</h1>
        <button className='rm-btn'><Plus className='h-3.5 w-3.5' /> New report</button>
      </div>
      <div className='rm-tabs'>
        <button onClick={() => setTab('shared')} className={`rm-tab ${tab === 'shared' ? 'rm-tab-active' : ''}`}>Shared with you (0)</button>
        <button onClick={() => setTab('yours')} className={`rm-tab ${tab === 'yours' ? 'rm-tab-active' : ''}`}>Your reports (0)</button>
        <button onClick={() => setTab('workspace')} className={`rm-tab ${tab === 'workspace' ? 'rm-tab-active' : ''}`}>{tenantName} reports ({ALL_REPORTS.length})</button>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {tab === 'yours' ? (
          <div className='flex flex-col items-center justify-center gap-4 py-24'>
            <p className='text-sm font-medium' style={{ color: 'var(--rm-text-secondary)' }}>You haven&apos;t created any reports yet</p>
            <button className='rm-btn'><Plus className='h-3.5 w-3.5' /> New report</button>
          </div>
        ) : tab === 'shared' ? (
          <div className='flex flex-col items-center justify-center gap-3 py-24'>
            <p className='text-sm font-medium' style={{ color: 'var(--rm-text-secondary)' }}>No reports have been shared with you</p>
          </div>
        ) : (
          <div className='px-6 py-4'>
            <div className='rm-search'>
              <Search className='h-3.5 w-3.5' style={{ color: 'var(--rm-text-muted)' }} />
              <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search reports...' aria-label='Search reports' />
            </div>
            <div className='rm-table'>
              <div className='rm-table-head'>
                <span className='rm-table-col-title'>Title</span>
                <span className='rm-table-col'>Owned by</span>
                <span className='rm-table-col'>Last updated</span>
                <span className='rm-table-col'>Last updated by</span>
              </div>
              {filtered.length > 0 ? filtered.map((report, i) => (
                <Link key={`${report.title}-${i}`} href={`/dashboard/reports/${report.slug}`} className='rm-table-row'>
                  <span className='rm-table-col-title'>{report.title}</span>
                  <span className='rm-table-col'>{tenantName}</span>
                  <span className='rm-table-col'>{report.updated}</span>
                  <span className='rm-table-col'>{tenantName}</span>
                </Link>
              )) : (
                <div className='flex flex-col items-center justify-center gap-2 py-16'>
                  <p className='text-sm font-medium' style={{ color: 'var(--rm-text-secondary)' }}>
                    {search ? 'No reports match your search' : 'No reports yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicsView() {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-4'>
      <svg width='180' height='120' viewBox='0 0 180 120' fill='none'>
        <circle cx='90' cy='50' r='35' fill='rgba(108,92,231,0.1)' stroke='rgba(108,92,231,0.3)' strokeWidth='2' />
        <path d='M78 45h24M78 55h16' stroke='rgba(108,92,231,0.5)' strokeWidth='2' strokeLinecap='round' />
      </svg>
      <h2 className='text-lg font-semibold' style={{ color: 'var(--rm-text)' }}>Understand and automatically track conversation topics</h2>
      <p className='max-w-md text-center text-sm' style={{ color: 'var(--rm-text-secondary)' }}>Topics help you understand what your customers are asking about, identify trends, and improve your support.</p>
      <div className='flex gap-3'>
        <button className='rm-btn-primary'>Create topic</button>
        <button className='rm-btn'>Learn more</button>
      </div>
    </div>
  );
}

function SuggestionsView() {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-4'>
      <Lightbulb className='h-16 w-16' style={{ color: 'rgba(108,92,231,0.3)' }} />
      <h2 className='text-lg font-semibold' style={{ color: 'var(--rm-text)' }}>Suggestions</h2>
      <p className='max-w-md text-center text-sm' style={{ color: 'var(--rm-text-secondary)' }}>AI-powered suggestions to help you improve your customer support based on conversation patterns.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dataset Export
// ---------------------------------------------------------------------------

function DatasetExportView({ metrics, loading }: { metrics: AnalyticsMetrics | null; loading: boolean }) {
  const datasets = [
    { label: 'Conversations', desc: 'All conversations with status, channel, timestamps, and CSAT scores', rows: metrics?.totalConversations ?? 0 },
    { label: 'Timeseries', desc: 'Daily volume breakdown (total, resolved, escalated)', rows: metrics?.timeseries?.length ?? 0 },
    { label: 'Channels', desc: 'Per-channel stats including volume, resolution rate, response times, and CSAT', rows: metrics?.channelStats?.length ?? 0 },
    { label: 'Agents', desc: 'Per-agent performance including resolved count, resolution time, and CSAT', rows: metrics?.agentStats?.length ?? 0 },
    { label: 'Topics', desc: 'Top conversation topics with frequency and confidence scores', rows: metrics?.topTopics?.length ?? 0 }
  ];

  return (
    <div className='flex h-full flex-col'>
      <div className='rm-header'>
        <div className='flex items-center gap-3'>
          <h1 className='rm-title'>Dataset export</h1>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {loading || !metrics ? (
          <div className='flex flex-col items-center justify-center gap-2 py-24'>
            <Icons.spinner className='h-5 w-5 animate-spin' style={{ color: 'var(--rm-text-muted)' }} />
            <span className='text-xs' style={{ color: 'var(--rm-text-muted)' }}>Loading data...</span>
          </div>
        ) : (
          <div className='px-6 py-5'>
            <div className='mx-auto max-w-[720px] space-y-6'>
              <div>
                <p className='text-sm' style={{ color: 'var(--rm-text-secondary)' }}>
                  Export your analytics data for use in spreadsheets, BI tools, or custom analysis.
                </p>
              </div>

              <div className='flex flex-wrap gap-3'>
                <button onClick={() => metrics && exportCSV(metrics, 'Analytics', 'analytics')} className='rm-btn-primary flex items-center gap-2'>
                  <FileSpreadsheet className='h-4 w-4' />
                  Export as CSV
                </button>
                <button onClick={() => metrics && exportAsPDF(metrics, 'Analytics', 'analytics')} className='rm-btn flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Export as PDF
                </button>
                <button onClick={() => metrics && exportAsDOCX(metrics, 'Analytics', 'analytics')} className='rm-btn flex items-center gap-2'>
                  <FileType className='h-4 w-4' />
                  Export as DOCX
                </button>
                <button onClick={() => metrics && exportJSON(metrics, 'Analytics', 'analytics')} className='rm-btn flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Export as JSON
                </button>
              </div>

              <div>
                <h2 className='mb-3 text-xs font-semibold uppercase tracking-wider' style={{ color: 'var(--rm-text-muted)' }}>
                  Available datasets
                </h2>
                <div className='space-y-2'>
                  {datasets.map((ds) => (
                    <div key={ds.label} className='flex items-center justify-between rounded-lg border px-4 py-3' style={{ background: 'var(--rm-bg-secondary)' }}>
                      <div>
                        <p className='text-sm font-medium' style={{ color: 'var(--rm-text)' }}>{ds.label}</p>
                        <p className='text-xs' style={{ color: 'var(--rm-text-muted)' }}>{ds.desc}</p>
                      </div>
                      <span className='text-xs font-medium tabular-nums' style={{ color: 'var(--rm-text-secondary)' }}>
                        {ds.rows} {ds.rows === 1 ? 'row' : 'rows'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function OverviewContent({ metrics, loading, dateRangeDisplay, error, onRetry }: { metrics: AnalyticsMetrics | null; loading: boolean; dateRangeDisplay: string; error: string | null; onRetry: () => void }) {
  const [channelFilters, setChannelFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const allChannels = useMemo(() => {
    if (!metrics?.channelStats) return [];
    return metrics.channelStats.map((c) => c.channel);
  }, [metrics]);

  const toggleChannel = (ch: string) => {
    setChannelFilters((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const clearFilters = () => {
    setChannelFilters([]);
    setStatusFilter(null);
  };

  const hasFilters = channelFilters.length > 0 || statusFilter !== null;

  const totalConv = metrics?.totalConversations ?? 0;
  const resolvedPct = metrics && totalConv > 0 ? Math.round((metrics.totalResolved / totalConv) * 100) : 0;

  const barData = useMemo(() => {
    if (!metrics) return [];
    const ai = metrics.totalResolved;
    const esc = metrics.totalEscalated;
    const act = metrics.totalActive;
    const nr = Math.max(0, (metrics.totalConversations || 1) - ai - esc - act);
    return [{ name: 'Conv', finAI: ai, chatbot: 0, teammate: esc, noReply: nr + act }];
  }, [metrics]);

  const areaData = useMemo(() => {
    if (!metrics?.timeseries) return [];
    return metrics.timeseries.map((p) => ({ date: p.date, total: p.total, resolved: p.resolved, escalated: p.escalated }));
  }, [metrics]);

  return (
    <div className='flex h-full flex-col'>
      <div className='rm-header'>
        <div className='flex items-center gap-3'>
          <h1 className='rm-title'>Overview</h1>
          <button className='rm-btn'><HelpCircle className='h-3.5 w-3.5' /> Learn</button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='rm-btn-icon' disabled={!metrics}><Download className='h-3.5 w-3.5' /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-44'>
            <DropdownMenuItem className='text-xs' onClick={() => metrics && exportCSV(metrics, 'Overview', 'overview')}>
              <FileSpreadsheet className='mr-2 h-3.5 w-3.5 opacity-60' />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem className='text-xs' onClick={() => metrics && exportAsPDF(metrics, 'Overview', 'overview')}>
              <FileText className='mr-2 h-3.5 w-3.5 opacity-60' />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem className='text-xs' onClick={() => metrics && exportAsDOCX(metrics, 'Overview', 'overview')}>
              <FileType className='mr-2 h-3.5 w-3.5 opacity-60' />
              Export as DOCX
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-xs' onClick={() => metrics && exportJSON(metrics, 'Overview', 'overview')}>
              <FileText className='mr-2 h-3.5 w-3.5 opacity-60' />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rm-filter'>
        <div className='flex items-center gap-2'>
          <button className='rm-date'><CalendarDays className='h-3.5 w-3.5' /> {dateRangeDisplay || 'Loading...'}</button>
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className='rm-addfilter'>+ Add filter</button>
            </PopoverTrigger>
            <PopoverContent align='start' className='w-64 p-3'>
              <div className='space-y-3'>
                <div>
                  <p className='text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-wider'>Channel</p>
                  <div className='flex flex-wrap gap-1'>
                    {allChannels.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => toggleChannel(ch)}
                        className={`inline-flex items-center border px-2 py-0.5 text-xs capitalize transition-colors ${
                          channelFilters.includes(ch)
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                    {allChannels.length === 0 && (
                      <span className='text-muted-foreground text-xs'>No channels</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className='text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-wider'>Status</p>
                  <div className='flex flex-wrap gap-1'>
                    {['resolved', 'escalated', 'active'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                        className={`inline-flex items-center border px-2 py-0.5 text-xs capitalize transition-colors ${
                          statusFilter === s
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs'
                  >
                    <X className='h-3 w-3' /> Clear filters
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {hasFilters && (
            <div className='flex items-center gap-1'>
              {channelFilters.map((ch) => (
                <Badge key={ch} variant='secondary' className='gap-1 px-1.5 py-0 text-[10px] capitalize'>
                  {ch}
                  <X className='h-2.5 w-2.5 cursor-pointer' onClick={() => toggleChannel(ch)} />
                </Badge>
              ))}
              {statusFilter && (
                <Badge variant='secondary' className='gap-1 px-1.5 py-0 text-[10px] capitalize'>
                  {statusFilter}
                  <X className='h-2.5 w-2.5 cursor-pointer' onClick={() => setStatusFilter(null)} />
                </Badge>
              )}
            </div>
          )}
        </div>
        <span className='rm-tz'>Stockholm time (GMT+1)</span>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {loading ? (
          <div className='flex flex-col items-center justify-center gap-2 py-24'>
            <Icons.spinner className='h-5 w-5 animate-spin' style={{ color: 'var(--rm-text-muted)' }} />
            <span className='text-xs' style={{ color: 'var(--rm-text-muted)' }}>Loading metrics...</span>
          </div>
        ) : error ? (
          <div className='flex flex-col items-center justify-center gap-3 py-24'>
            <p className='text-sm' style={{ color: 'var(--rm-text-secondary)' }}>{error}</p>
            <button className='rm-btn' onClick={onRetry}>Try again</button>
          </div>
        ) : !metrics ? (
          <div className='flex flex-col items-center justify-center gap-3 py-24'>
            <p className='text-sm' style={{ color: 'var(--rm-text-secondary)' }}>No data available</p>
            <button className='rm-btn' onClick={onRetry}>Retry</button>
          </div>
        ) : (
          <div className='rm-content'>
            <section className='rm-section'>
              <h2 className='rm-section-title'>How you&apos;re handling conversations</h2>
              <div className='rm-card'>
                <div className='rm-card-header'>
                  <div><span className='rm-metric'>{totalConv}</span><span className='rm-metric-label'>({resolvedPct}%) Conversations</span></div>
                </div>
                <div style={{ margin: '12px 0', borderRadius: 6, overflow: 'hidden' }}>
                  <ChartContainer config={conversationBarConfig} className='h-[48px] w-full'>
                    <BarChart data={barData} layout='vertical' barSize={36} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <XAxis type='number' hide />
                      <YAxis type='category' dataKey='name' hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey='finAI' stackId='a' fill='var(--color-finAI)' radius={[4, 0, 0, 4]} />
                      <Bar dataKey='chatbot' stackId='a' fill='var(--color-chatbot)' />
                      <Bar dataKey='teammate' stackId='a' fill='var(--color-teammate)' />
                      <Bar dataKey='noReply' stackId='a' fill='var(--color-noReply)' radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className='rm-legend'>
                  {Object.entries(conversationBarConfig).map(([key, cfg]) => (
                    <div key={key} className='rm-legend-item'><span className='rm-legend-dot' style={{ background: cfg.color }} /><span>{cfg.label}</span></div>
                  ))}
                </div>
              </div>
            </section>

            <section className='rm-section'>
              <h2 className='rm-section-title'>Overall volume growth</h2>
              <div className='rm-card'>
                <div style={{ height: 280 }}>
                  <ChartContainer config={volumeAreaConfig} className='h-full w-full'>
                    <AreaChart data={areaData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id='gT' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='0%' stopColor='#6C5CE7' stopOpacity={0.3} />
                          <stop offset='100%' stopColor='#6C5CE7' stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id='gR' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='0%' stopColor='#A29BFE' stopOpacity={0.2} />
                          <stop offset='100%' stopColor='#A29BFE' stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e5e5e5' vertical={false} />
                      <XAxis dataKey='date' axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9b9b9b' }} tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} interval='preserveStartEnd' minTickGap={60} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9b9b9b' }} width={32} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type='monotone' dataKey='total' stroke='#6C5CE7' strokeWidth={2} fill='url(#gT)' />
                      <Area type='monotone' dataKey='resolved' stroke='#A29BFE' strokeWidth={1.5} fill='url(#gR)' />
                      <Area type='monotone' dataKey='escalated' stroke='#74B9FF' strokeWidth={1.5} fill='transparent' />
                    </AreaChart>
                  </ChartContainer>
                </div>
                <div className='rm-legend' style={{ borderTop: '1px solid #e5e5e5', paddingTop: 12 }}>
                  {[['#6C5CE7','All conversations'],['#A29BFE','Fin AI agent'],['#74B9FF','Chatbot'],['#00B894','Teammate'],['#636E72','No reply']].map(([c,l]) => (
                    <div key={l} className='rm-legend-item'><span className='rm-legend-line' style={{ background: c }} /><span>{l}</span></div>
                  ))}
                </div>
              </div>
            </section>

            <PerformanceFunnel metrics={metrics} />
            <PerformanceOverTime metrics={metrics} />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function ReportsPageClient() {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ReportsView>('overview');

  const load = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setMetricsError(null);
    try {
      const res = await getAnalyticsAction(tenant.$id, 84);
      if (res.success && res.metrics) {
        setMetrics(res.metrics);
      } else {
        setMetricsError(res.error ?? 'Failed to load analytics');
      }
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : 'Failed to load analytics');
    }
    setLoading(false);
  }, [tenant]);

  useEffect(() => { if (tenant) load(); }, [tenant, load]);

  const dateRangeDisplay = useMemo(() => {
    if (!metrics?.timeseries?.length) return '';
    const f = metrics.timeseries[0]?.date;
    const l = metrics.timeseries[metrics.timeseries.length - 1]?.date;
    return f && l ? `${fmtDate(f)} - ${fmtDate(l)}` : '';
  }, [metrics]);

  if (tenantLoading) {
    return (
      <div className='reports-workspace flex h-[calc(100vh-44px)] items-center justify-center'>
        <Icons.spinner className='h-5 w-5 animate-spin' style={{ color: 'var(--rm-text-muted)' }} />
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <div className='reports-workspace flex h-[calc(100vh-44px)] items-center justify-center text-sm' style={{ color: 'var(--rm-text-muted)' }}>
        {tenantError ?? 'Could not load workspace'}
      </div>
    );
  }

  return (
    <div className='reports-workspace flex h-[calc(100vh-44px)]'>
      <ReportsSidebar activeView={activeView} onViewChange={setActiveView} />
      <div className='flex flex-1 flex-col overflow-hidden'>
        {activeView === 'overview' && <OverviewContent metrics={metrics} loading={loading} dateRangeDisplay={dateRangeDisplay} error={metricsError} onRetry={load} />}
        {(activeView === 'all-reports' || activeView === 'your-reports' || activeView === 'favorites') && <AllReportsView tenantName={tenant.name} />}
        {activeView === 'topics' && <TopicsView />}
        {activeView === 'suggestions' && <SuggestionsView />}
        {activeView === 'dataset-export' && <DatasetExportView metrics={metrics} loading={loading} />}
        {activeView === 'manage-schedules' && (
          <div className='flex h-full flex-col items-center justify-center gap-4'>
            <CalendarDays className='h-16 w-16' style={{ color: 'rgba(108,92,231,0.3)' }} />
            <h2 className='text-lg font-semibold' style={{ color: 'var(--rm-text)' }}>Scheduled reports</h2>
            <p className='max-w-md text-center text-sm' style={{ color: 'var(--rm-text-secondary)' }}>Set up automatic report delivery to your inbox on a daily, weekly, or monthly schedule.</p>
          </div>
        )}
      </div>
    </div>
  );
}
