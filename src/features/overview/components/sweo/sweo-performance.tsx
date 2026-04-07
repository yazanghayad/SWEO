/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  resolutionTimeData,
  competitorData,
  videoTestimonials as videoTestimonialsRaw,
} from './data';
import { useTranslations } from '@/lib/i18n';

const VIDEO_TITLE_KEYS: Record<string, keyof typeof import('@/lib/i18n/dictionaries/en').default.data> = {
  'anthropic': 'videoAnthropic',
  'lightspeed': 'videoLightspeed',
  'rocket': 'videoRocket',
};

/* ─── Performance Section ─── */
export function SweoPerformance() {
  const t = useTranslations();
  const [activeVideo, setActiveVideo] = useState(0);
  const videoTestimonials = useMemo(() => videoTestimonialsRaw.map(v => ({
    ...v,
    title: (t.data as Record<string, string>)[VIDEO_TITLE_KEYS[v.id]] ?? v.title,
  })), [t]);

  return (
    <section id="performance" className="sweo-perf-section sweo-theme-light">
      {/* Corner decorations */}
      <span className="sweo-perf-corner sweo-perf-corner-tl" aria-hidden="true" />
      <span className="sweo-perf-corner sweo-perf-corner-tr" aria-hidden="true" />
      <span className="sweo-perf-corner sweo-perf-corner-bl" aria-hidden="true" />
      <span className="sweo-perf-corner sweo-perf-corner-br" aria-hidden="true" />

      {/* Section Label */}
      <span className="sweo-perf-label">
        <span className="sweo-perf-label-dot" />
        Unrivaled Performance
      </span>

      <div className="sweo-perf-content">
        {/* Main Heading */}
        <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-12">
          <h3 className="sweo-perf-heading">
            <span className="block max-w-[13ch]">{t.performance.heading1}</span>
            <span className="block lg:text-right">{t.performance.heading2}</span>
          </h3>
        </div>

        {/* Fig 2.A - Resolution Rate Line Chart */}
        <div className="flex flex-col gap-2 md:gap-3 xl:gap-4 mb-8">
          <div className="mb-8 flex w-full flex-col lg:mb-3">
            <span className="sweo-perf-fig-label">
              <span className="block w-auto">Fig 2.A&nbsp;-&nbsp;</span>
              <span className="flex-1">{t.performance.fig2a}</span>
            </span>
            <div className="sweo-perf-chart-box">
              {/* Dashed connectors (hidden on mobile) */}
              <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

              <div className="w-full" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={resolutionTimeData} margin={{ top: 10, right: 0, bottom: 60, left: 0 }}>
                    <defs>
                      <linearGradient id="perfVertGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0" stopColor="#FF5600" stopOpacity={0} />
                        <stop offset="0.2" stopColor="#FF5600" stopOpacity={0.3} />
                        <stop offset="0.5" stopColor="#FF5600" stopOpacity={0.7} />
                        <stop offset="0.8" stopColor="#FF5600" stopOpacity={0.9} />
                        <stop offset="1" stopColor="#FF5600" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="8 8" strokeWidth={0.5} stroke="#c5c5c140" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                      angle={-90}
                      textAnchor="end"
                      interval="preserveStartEnd"
                      tickLine={false}
                      axisLine={false}
                      height={70}
                    />
                    <YAxis
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                      domain={[0, 70]}
                      ticks={[10, 20, 30, 40, 50, 60, 70]}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #ccc',
                        fontFamily: 'var(--sweo-font-mono)',
                        fontSize: 11,
                      }}
                      formatter={(value: number) => [`${value}%`, 'Resolution Rate']}
                    />
                    <Area
                      type="linear"
                      dataKey="rate"
                      stroke="#FF5600"
                      strokeWidth={2}
                      fill="url(#perfVertGrad)"
                      dot={{ r: 3, stroke: '#FF5600', strokeWidth: 1, fill: '#F4F3EC' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Fig 2.B + Fig 2.C Row */}
        <div className="grid grid-cols-1 gap-2 pb-8 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-3 lg:py-10 min-w-0">
          {/* Fig 2.B - Bar Chart */}
          <div className="relative row-span-2 grid w-full min-w-0" style={{ gridTemplateRows: 'subgrid' }}>
            <div>
              <span className="sweo-perf-fig-label">
                <span className="block w-auto">Fig 2.B&nbsp;-&nbsp;</span>
                <span className="flex-1">{t.performance.fig2b}</span>
              </span>
            </div>
            <div className="sweo-perf-chart-box md:pl-4">
              <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

              <div className="mt-8 w-full">
                <div className="flex items-end gap-3 sm:gap-6 md:gap-10 justify-center pb-4" style={{ height: 220 }}>
                  {competitorData.map((comp) => {
                    const isSweo = comp.name === 'SWEO';
                    const barHeight = `${(comp.rate / 80) * 100}%`;
                    return (
                      <div key={comp.name} className="flex flex-col items-center gap-2 flex-1 min-w-0 sm:max-w-[120px] h-full justify-end">
                        {/* Value label */}
                        <div
                          className="sweo-perf-bar-label"
                          style={{
                            borderColor: isSweo ? '#FF5600' : '#00000060',
                          }}
                        >
                          <span className={`font-[var(--sweo-font-mono)] text-xs uppercase tracking-wider ${isSweo ? 'opacity-80' : 'opacity-60'}`}>
                            {comp.rate}%
                          </span>
                        </div>
                        {/* Bar */}
                        <div
                          className="w-full relative"
                          style={{
                            height: barHeight,
                            backgroundColor: isSweo ? '#FF5600' : '#E8E7E0',
                            border: `1px solid ${isSweo ? '#FF5600' : '#00000060'}`,
                          }}
                        >
                          {/* Dot pattern overlay */}
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `radial-gradient(circle, ${isSweo ? '#EFEFEF' : '#00000040'} 1px, transparent 1px)`,
                              backgroundSize: '6.67px 6.67px',
                            }}
                          />
                        </div>
                        {/* Label */}
                        <span
                          className={`font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider ${isSweo ? 'text-black font-semibold' : 'text-black/60'}`}
                        >
                          {comp.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-black/60 px-2 pb-5 lg:pr-4 lg:pb-0 lg:pl-0">
                  {t.performance.resolutionRateDisclaimer}
                </p>
              </div>
            </div>
          </div>

          {/* Fig 2.C - Customer Testimonial */}
          <div className="relative row-span-2 mt-8 grid w-full min-w-0 lg:mt-0" style={{ gridTemplateRows: 'subgrid' }}>
            <div>
              <span className="sweo-perf-fig-label">
                <span className="block w-auto">Fig 2.C&nbsp;-&nbsp;</span>
                <span className="flex-1">OptiTech Sverige AB</span>
              </span>
            </div>
            <div className="sweo-perf-chart-box flex-col justify-between p-2 sm:p-4">
              <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

              {/* Decorative side ticks */}
              <svg className="absolute top-0 bottom-0 -left-3 hidden h-full lg:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 382" aria-hidden="true">
                <g stroke="#C3C2BD">{Array.from({ length: 19 }, (_, i) => <line key={`g1-${i}`} x1="0" y1={327 + i * 3} x2="10" y2={327 + i * 3} />)}</g>
                <g stroke="#FF5600">{Array.from({ length: 19 }, (_, i) => <line key={`o1-${i}`} x1="0" y1={216 + i * 3} x2="10" y2={216 + i * 3} />)}</g>
                <g stroke="#C3C2BD">{Array.from({ length: 19 }, (_, i) => <line key={`g2-${i}`} x1="0" y1={107 + i * 3} x2="10" y2={107 + i * 3} />)}</g>
                <g stroke="#FF5600">{Array.from({ length: 18 }, (_, i) => <line key={`o2-${i}`} x1="0" y1={1 + i * 3} x2="10" y2={1 + i * 3} />)}</g>
              </svg>

              {/* Avatar */}
              <div className="mb-3 sm:mb-4 size-[60px] sm:size-[85px]">
                <div className="overflow-hidden rounded-sm">
                  <img
                    alt="Yazan Ghayad, Vice President of OptiTech Sverige AB"
                    width={85}
                    height={85}
                    className="w-full"
                    src="/fin/images/image_21.jpg"
                  />
                </div>
              </div>

              <div>
                <blockquote>
                  <p className="font-[var(--sweo-font-sans)] font-light text-base sm:text-xl md:text-xl xl:text-2xl leading-[1.4] md:leading-[1.4] xl:leading-[1.33] mb-3 sm:mb-5">
                    &ldquo;SWEO is in a completely different league. It&apos;s now involved in 99% of conversations and{' '}
                    <span className="bg-[#FF5600] text-white px-1">successfully resolves up to 65% end-to-end—even the more complex ones.</span>&rdquo;
                  </p>
                </blockquote>
                <p className="text-sm text-black/60">
                  <cite className="not-italic">Yazan Ghayad, Vice President of OptiTech Sverige AB</cite>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Testimonials */}
        <div className="mt-4">
          {/* Active Video Player */}
          <div className="relative overflow-hidden rounded-md bg-[var(--sweo-dark-blue)]">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={videoTestimonials[activeVideo].thumbnail}
                alt={videoTestimonials[activeVideo].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                {/* Overlay text */}
                <div className="absolute top-0 left-0 w-full p-3 lg:p-6 xl:p-8">
                  <p className="font-[var(--sweo-font-sans)] font-light text-sm sm:text-xl md:text-2xl xl:text-[2rem] text-white leading-tight max-w-[50ch]">
                    {t.performance.videoQuote}
                  </p>
                </div>
                {/* Play button */}
                <button className="flex items-center gap-2 rounded-full border border-white/80 bg-white/20 backdrop-blur-lg px-4 py-3 text-white shadow-lg hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 25" className="w-5">
                    <path d="m6.972 3.903 12.444 8-12.444 8z" />
                  </svg>
                    <span className="font-[var(--sweo-font-mono)] text-xs uppercase tracking-wider">{t.performance.play}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Video Picker */}
          <div className="mt-2 flex flex-col sm:flex-row sm:snap-x sm:snap-mandatory sm:overflow-x-auto gap-2 sm:gap-0 md:gap-3">
            {videoTestimonials.map((video, idx) => (
              <button
                key={video.id}
                data-active={idx === activeVideo}
                onClick={() => setActiveVideo(idx)}
                className="sweo-perf-video-card"
              >
                <div className="relative flex aspect-[4/3] w-[60px] sm:w-[85px] flex-none items-center justify-center overflow-hidden rounded-sm bg-[#161e2e] lg:w-[107px]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid">
                  <span className="font-[var(--sweo-font-mono)] text-[10px] sm:text-xs uppercase tracking-wider mb-1 text-black/50">
                    {idx === activeVideo ? t.performance.nowPlaying : t.performance.playNext}
                  </span>
                  <span className="text-sm sm:text-base leading-snug line-clamp-2 pr-5 text-black">
                    {video.title}
                  </span>
                </div>
                <div className={`absolute top-2.5 right-2.5 flex h-5 w-6 rounded-md border ${idx === activeVideo ? 'border-black bg-black text-white' : 'border-black/50 text-black/50'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 25" className="m-auto w-4">
                    <path d="m6.972 3.903 12.444 8-12.444 8z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
