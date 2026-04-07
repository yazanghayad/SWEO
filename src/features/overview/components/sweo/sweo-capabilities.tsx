'use client';

import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useMemo } from 'react';
import {
  knowledgeSourceData,
  sourceTypeBreakdown as sourceTypeBreakdownRaw,
  knowledgeTargets as knowledgeTargetsRaw,
  procedureStepData as procedureStepDataRaw,
  procedureMetrics as procedureMetricsRaw,
  procedureFlowSteps as procedureFlowStepsRaw,
  channelVolumeData,
  channelTimeData,
  inboxViews as inboxViewsRaw,
} from './data';
import { useTranslations } from '@/lib/i18n';

/* ─── Capabilities Section ─── */
const SOURCE_TYPE_KEYS: Record<string, keyof typeof import('@/lib/i18n/dictionaries/en').default.data> = {
  'URL Crawling': 'urlCrawling',
  'File Upload': 'fileUpload',
  'Manual Entry': 'manualEntry',
};
const TARGET_KEYS: Record<string, keyof typeof import('@/lib/i18n/dictionaries/en').default.data> = {
  'AI Agent': 'aiAgent',
  'Copilot': 'copilot',
  'Help Center': 'helpCenter',
};
const STEP_KEYS: Record<string, keyof typeof import('@/lib/i18n/dictionaries/en').default.data> = {
  'Message': 'message',
  'API Call': 'apiCall',
  'Data Lookup': 'dataLookup',
  'Conditional': 'conditional',
  'Approval': 'approval',
};
const METRIC_KEYS: Record<string, keyof typeof import('@/lib/i18n/dictionaries/en').default.data> = {
  'Active Procedures': 'activeProcedures',
  'Avg. Steps/Procedure': 'avgStepsProcedure',
  'Auto-resolved': 'autoResolved',
  'Avg. Execution Time': 'avgExecutionTime',
};
const FLOW_KEYS: Record<string, keyof typeof import('@/lib/i18n/dictionaries/en').default.data> = {
  'Intent Match': 'intentMatch',
  'Data Lookup': 'dataLookup',
  'Conditional': 'conditional',
  'Approval Gate': 'approvalGate',
  'API Call': 'apiCall',
  'Send Message': 'sendMessage',
};
const VIEW_KEYS: Record<string, keyof typeof import('@/lib/i18n/dictionaries/en').default.data> = {
  'Your Inbox': 'yourInbox',
  'Unassigned': 'unassigned',
  'SWEO Resolved': 'sweoResolved',
  'SWEO Escalated': 'sweoEscalated',
  'All': 'all',
};

export function SweoCapabilities() {
  const t = useTranslations();

  // Build translated data arrays
  const sourceTypeBreakdown = useMemo(() => sourceTypeBreakdownRaw.map(s => ({ ...s, type: (t.data as Record<string, string>)[SOURCE_TYPE_KEYS[s.type]] ?? s.type })), [t]);
  const knowledgeTargets = useMemo(() => knowledgeTargetsRaw.map(k => ({ ...k, target: (t.data as Record<string, string>)[TARGET_KEYS[k.target]] ?? k.target })), [t]);
  const procedureStepData = useMemo(() => procedureStepDataRaw.map(s => ({ ...s, step: (t.data as Record<string, string>)[STEP_KEYS[s.step]] ?? s.step })), [t]);
  const procedureMetrics = useMemo(() => procedureMetricsRaw.map(m => ({ ...m, name: (t.data as Record<string, string>)[METRIC_KEYS[m.name]] ?? m.name })), [t]);
  const procedureFlowSteps = useMemo(() => procedureFlowStepsRaw.map(s => ({ ...s, label: (t.data as Record<string, string>)[FLOW_KEYS[s.label]] ?? s.label })), [t]);
  const inboxViews = useMemo(() => inboxViewsRaw.map(v => ({ ...v, view: (t.data as Record<string, string>)[VIEW_KEYS[v.view]] ?? v.view })), [t]);
  return (
    <section id="capabilities" className="space-y-0">
      {/* ─── 01a Knowledge ─── */}
      <div className="sweo-perf-section sweo-theme-light">
        <span className="sweo-perf-corner sweo-perf-corner-tl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-tr" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-bl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-br" aria-hidden="true" />

        <span className="sweo-perf-label">
          <span className="sweo-perf-label-dot" />
          01a — Knowledge
        </span>

        <div className="sweo-perf-content">
          <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-12">
            <h3 className="sweo-perf-heading">
              <span className="block max-w-[16ch]">{t.capabilities.knowledgeHeading}</span>
            </h3>
            <p className="text-sm sm:text-base text-black/60 max-w-[65ch]">
              {t.capabilities.knowledgeDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/knowledge" className="sweo-btn-secondary">
                {t.capabilities.knowledgeCta}
              </Link>
            </div>
          </div>

          {/* Fig 1.A + Fig 1.B Row */}
          <div className="grid grid-cols-1 gap-2 pb-8 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-3 lg:py-10 min-w-0">
            {/* Fig 1.A - Knowledge Growth Area Chart */}
            <div className="relative row-span-2 grid w-full min-w-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.A&nbsp;-&nbsp;</span>
                  <span className="flex-1">{t.capabilities.fig1a}</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="w-full" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={knowledgeSourceData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                      <defs>
                        <linearGradient id="gradUrls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF5600" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#FF5600" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="gradFiles" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#313130" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#313130" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradManual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C3C2BD" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#C3C2BD" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="8 8" strokeWidth={0.5} stroke="#c5c5c140" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #ccc', fontFamily: 'var(--sweo-font-mono)', fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="urls" stackId="1" stroke="#FF5600" strokeWidth={2} fill="url(#gradUrls)" name="URLs" />
                      <Area type="monotone" dataKey="files" stackId="1" stroke="#313130" strokeWidth={1.5} fill="url(#gradFiles)" name="Files" />
                      <Area type="monotone" dataKey="manual" stackId="1" stroke="#C3C2BD" strokeWidth={1} fill="url(#gradManual)" name="Manual" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fig 1.B - Source Type Breakdown + Targets */}
            <div className="relative row-span-2 mt-8 grid w-full min-w-0 lg:mt-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.B&nbsp;-&nbsp;</span>
                  <span className="flex-1">{t.capabilities.fig1b}</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box flex-col justify-between p-2 sm:p-4">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                {/* Source types as horizontal bars */}
                <div className="space-y-4 mb-6">
                  <p className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50 mb-3">{t.capabilities.sourceDistribution}</p>
                  {sourceTypeBreakdown.map((src) => (
                    <div key={src.type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-[var(--sweo-font-mono)] uppercase tracking-wider text-black/80">{src.type}</span>
                        <span className="font-[var(--sweo-font-mono)] text-black/50">{src.count} ({src.pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-black/5 overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${src.pct}%`,
                            backgroundColor: src.type === 'URL Crawling' ? '#FF5600' : src.type === 'File Upload' ? '#313130' : '#C3C2BD',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Deployment targets */}
                <div>
                  <p className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50 mb-3">{t.capabilities.deploymentTargets}</p>
                  <div className="space-y-2">
                    {knowledgeTargets.map((item) => (
                      <div key={item.target} className="flex items-center justify-between py-2 border-b border-black/10 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#FF5600]" />
                          <span className="text-sm text-black/80">{item.target}</span>
                        </div>
                        <span className="font-[var(--sweo-font-mono)] text-xs text-black/50">{item.sources} {t.capabilities.sources}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-black/10">
                  <div className="flex items-center gap-2 text-xs text-black/50">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span>{t.capabilities.supportsFormats}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 01b Procedures ─── */}
      <div className="sweo-perf-section sweo-theme-light" style={{ borderTop: '1px solid #c5c5c140' }}>
        <span className="sweo-perf-corner sweo-perf-corner-tl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-tr" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-bl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-br" aria-hidden="true" />

        <span className="sweo-perf-label">
          <span className="sweo-perf-label-dot" />
          01b — Procedures
        </span>

        <div className="sweo-perf-content">
          <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-12">
            <h3 className="sweo-perf-heading">
              <span className="block max-w-[18ch]">{t.capabilities.proceduresHeading}</span>
            </h3>
            <p className="text-sm sm:text-base text-black/60 max-w-[65ch]">
              {t.capabilities.proceduresDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/procedures" className="sweo-btn-secondary">
                {t.capabilities.proceduresCta}
              </Link>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-8">
            {procedureMetrics.map((m) => (
              <div key={m.name} className="sweo-perf-chart-box flex-col p-2 sm:p-4">
                <span className="font-[var(--sweo-font-mono)] text-[10px] sm:text-[11px] uppercase tracking-wider text-black/50 mb-1 sm:mb-2">{m.name}</span>
                <div className="flex items-end gap-1 sm:gap-2">
                  <span className="text-xl sm:text-3xl font-light text-black">{m.value}</span>
                  <span className="font-[var(--sweo-font-mono)] text-[10px] sm:text-xs text-[#FF5600] mb-0.5 sm:mb-1">{m.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Fig 1.C + Fig 1.D Row */}
          <div className="grid grid-cols-1 gap-2 pb-8 lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-3 lg:py-10 min-w-0">
            {/* Fig 1.C - Step Types Bar Chart */}
            <div className="relative row-span-2 grid w-full min-w-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.C&nbsp;-&nbsp;</span>
                  <span className="flex-1">{t.capabilities.fig1c}</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="w-full h-[220px] sm:h-[300px] lg:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={procedureStepData} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 5 }}>
                      <CartesianGrid strokeDasharray="8 8" strokeWidth={0.5} stroke="#c5c5c140" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="step"
                        tick={{ fontSize: 10, fill: '#00000090', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #ccc', fontFamily: 'var(--sweo-font-mono)', fontSize: 11 }}
                        formatter={(value: number) => [`${value} ${t.data.steps}`, t.data.count]}
                      />
                      <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={20}>
                        {procedureStepData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx === 0 ? '#FF5600' : '#E8E7E0'} stroke={idx === 0 ? '#FF5600' : '#00000030'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fig 1.D - Procedure Flow Visualization */}
            <div className="relative row-span-2 mt-8 grid w-full min-w-0 lg:mt-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.D&nbsp;-&nbsp;</span>
                  <span className="flex-1">{t.capabilities.fig1d}</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box flex-col p-2 sm:p-4">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="flex flex-col gap-0">
                  {procedureFlowSteps.map((step, idx) => (
                    <div key={step.id} className="flex items-stretch gap-3">
                      {/* Vertical line + dot */}
                      <div className="flex flex-col items-center w-4 flex-shrink-0">
                        <div
                          className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                          style={{
                            borderColor: step.id === 'trigger' || step.id === 'message' ? '#FF5600' : '#C3C2BD',
                            backgroundColor: step.id === 'trigger' || step.id === 'message' ? '#FF5600' : 'transparent',
                          }}
                        />
                        {idx < procedureFlowSteps.length - 1 && (
                          <div className="w-px flex-1 min-h-[28px]" style={{ backgroundColor: '#C3C2BD' }} />
                        )}
                      </div>
                      {/* Step card */}
                      <div
                        className="flex-1 mb-2 px-3 py-2 border text-sm"
                        style={{
                          borderColor: step.id === 'trigger' || step.id === 'message' ? '#FF5600' : '#c5c5c140',
                          backgroundColor: step.id === 'trigger' || step.id === 'message' ? '#FF560010' : '#f8f8f4',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50">{step.type.replace('_', ' ')}</span>
                          {step.id === 'condition' && (
                            <span className="font-[var(--sweo-font-mono)] text-[10px] text-[#FF5600]">IF amount &gt; $100</span>
                          )}
                        </div>
                        <p className="text-black/80 mt-0.5">{step.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-black/10 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-black/50">
                    <span className="w-2 h-2 rounded-full bg-[#FF5600]" />
                    <span>{t.capabilities.triggerOutput}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-black/50">
                    <span className="w-2 h-2 rounded-full border border-[#C3C2BD]" />
                    <span>{t.capabilities.processing}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 01c Channels ─── */}
      <div className="sweo-perf-section sweo-theme-light" style={{ borderTop: '1px solid #c5c5c140' }}>
        <span className="sweo-perf-corner sweo-perf-corner-tl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-tr" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-bl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-br" aria-hidden="true" />

        <span className="sweo-perf-label">
          <span className="sweo-perf-label-dot" />
          01c — Channels
        </span>

        <div className="sweo-perf-content">
          <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-12">
            <h3 className="sweo-perf-heading">
              <span className="block max-w-[16ch]">{t.capabilities.channelsHeading1}</span>
              <span className="block lg:text-right">{t.capabilities.channelsHeading2}</span>
            </h3>
            <p className="text-sm sm:text-base text-black/60 max-w-[65ch]">
              {t.capabilities.channelsDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/inbox" className="sweo-btn-secondary">
                {t.capabilities.channelsCta}
              </Link>
            </div>
          </div>

          {/* Fig 1.E - Channel Volume + Resolution Rate */}
          <div className="flex flex-col gap-2 md:gap-3 xl:gap-4 mb-8">
            <div className="mb-8 flex w-full flex-col lg:mb-3">
              <span className="sweo-perf-fig-label">
                <span className="block w-auto">Fig 1.E&nbsp;-&nbsp;</span>
                  <span className="flex-1">{t.capabilities.fig1e}</span>
              </span>
              <div className="sweo-perf-chart-box">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="w-full mt-4">
                  <div className="flex items-end gap-2 sm:gap-4 md:gap-8 justify-center pb-4" style={{ height: 200 }}>
                    {channelVolumeData.map((ch) => {
                      const maxVol = 4520;
                      const totalHeight = `${(ch.volume / maxVol) * 100}%`;
                      const resolvedHeight = `${(ch.resolved / ch.volume) * 100}%`;
                      return (
                        <div key={ch.channel} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-0 h-full justify-end">
                          <div className="sweo-perf-bar-label" style={{ borderColor: '#00000060' }}>
                            <span className="font-[var(--sweo-font-mono)] text-[9px] sm:text-[11px] uppercase tracking-wider text-black/60">
                              {ch.volume.toLocaleString('en-US')}
                            </span>
                          </div>
                          <div
                            className="w-full relative overflow-hidden"
                            style={{
                              height: totalHeight,
                              border: '1px solid #00000020',
                              backgroundColor: '#E8E7E0',
                            }}
                          >
                            {/* Resolved portion */}
                            <div
                              className="absolute bottom-0 left-0 right-0"
                              style={{
                                height: resolvedHeight,
                                backgroundColor: '#FF5600',
                              }}
                            >
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: 'radial-gradient(circle, #EFEFEF 1px, transparent 1px)',
                                  backgroundSize: '6.67px 6.67px',
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-center min-w-0">
                            <span className="font-[var(--sweo-font-mono)] text-[9px] sm:text-[11px] uppercase tracking-wider text-black/80 block truncate">
                              {ch.channel}
                            </span>
                            <span className="font-[var(--sweo-font-mono)] text-[9px] sm:text-[10px] text-[#FF5600]">
                              {ch.rate}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-2 px-2">
                    <div className="flex items-center gap-1.5 text-xs text-black/50">
                      <span className="w-3 h-2 bg-[#FF5600] inline-block" />
                      <span>{t.capabilities.resolvedBySweo}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-black/50">
                      <span className="w-3 h-2 bg-[#E8E7E0] border border-black/20 inline-block" />
                      <span>{t.capabilities.totalVolume}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fig 1.F + Inbox Views Row */}
          <div className="grid grid-cols-1 gap-2 pb-8 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-3 lg:py-10 min-w-0">
            {/* Fig 1.F - Channel Growth Over Time */}
            <div className="relative row-span-2 grid w-full min-w-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.F&nbsp;-&nbsp;</span>
                  <span className="flex-1">{t.capabilities.fig1f}</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="w-full h-[180px] sm:h-[260px] lg:h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={channelTimeData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                      <defs>
                        <linearGradient id="gradWeb" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF5600" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#FF5600" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradEmail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#313130" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#313130" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="8 8" strokeWidth={0.5} stroke="#c5c5c140" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #ccc', fontFamily: 'var(--sweo-font-mono)', fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="web" stackId="1" stroke="#FF5600" strokeWidth={2} fill="url(#gradWeb)" name="Web Chat" />
                      <Area type="monotone" dataKey="email" stackId="1" stroke="#313130" strokeWidth={1.5} fill="url(#gradEmail)" name="Email" />
                      <Area type="monotone" dataKey="whatsapp" stackId="1" stroke="#25D366" strokeWidth={1} fill="#25D36615" name="WhatsApp" />
                      <Area type="monotone" dataKey="sms" stackId="1" stroke="#7C3AED" strokeWidth={1} fill="#7C3AED10" name="SMS" />
                      <Area type="monotone" dataKey="voice" stackId="1" stroke="#C3C2BD" strokeWidth={1} fill="#C3C2BD10" name="Voice" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Unified Inbox Panel */}
            <div className="relative row-span-2 mt-8 grid w-full min-w-0 lg:mt-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.G&nbsp;-&nbsp;</span>
                  <span className="flex-1">{t.capabilities.fig1g}</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box flex-col p-2 sm:p-4">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                {/* Mock inbox sidebar */}
                <div className="space-y-0 mb-4">
                  <p className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50 mb-3">{t.capabilities.inboxNavigation}</p>
                  {inboxViews.map((v, idx) => (
                    <div
                      key={v.view}
                      className="flex items-center justify-between py-2.5 px-3 text-sm border-b border-black/5 last:border-0"
                      style={{
                        backgroundColor: idx === 2 ? '#FF560010' : 'transparent',
                        borderLeft: idx === 2 ? '2px solid #FF5600' : '2px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={idx === 2 ? 'text-black font-medium' : 'text-black/70'}>{v.view}</span>
                      </div>
                      <span
                        className="font-[var(--sweo-font-mono)] text-[11px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: idx === 2 ? '#FF5600' : '#E8E7E0',
                          color: idx === 2 ? '#fff' : '#00000060',
                        }}
                      >
                        {v.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Channel icons */}
                <div className="mt-auto pt-4 border-t border-black/10">
                  <p className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50 mb-3">{t.capabilities.activeChannels}</p>
                  <div className="flex flex-wrap gap-2">
                    {['Messenger', 'Email', 'WhatsApp', 'SMS', 'Voice'].map((ch) => (
                      <div
                        key={ch}
                        className="py-2 px-3 text-center border border-black/10 rounded text-[10px] font-[var(--sweo-font-mono)] uppercase tracking-wider text-black/60 hover:border-[#FF5600] hover:text-[#FF5600] transition-colors cursor-default"
                      >
                        {ch}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
