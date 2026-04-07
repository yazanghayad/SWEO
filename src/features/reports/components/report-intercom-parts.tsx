'use client';

import { type ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';

export function ReportKPI({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className='rm-kpi'>
      <p className='rm-kpi-label'>{label}</p>
      <p className='rm-kpi-value'>{value}</p>
      {sub && <p className='rm-kpi-sub'>{sub}</p>}
    </div>
  );
}

export function EmptyChart({ height = 200 }: { height?: number }) {
  return (
    <div className='rm-empty-chart' style={{ minHeight: height }}>
      <BarChart3 className='h-8 w-8 opacity-40' />
      <p className='text-sm font-medium'>This chart has no data</p>
    </div>
  );
}

export function ReportHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className='rm-header'>
      <h1 className='rm-title'>{title}</h1>
      <div className='flex items-center gap-2'>
        {children}
        <button className='rm-btn'>Share</button>
        <button className='rm-btn'>Edit</button>
      </div>
    </div>
  );
}

export function ReportFilterBar({ dateRange, extraFilters }: { dateRange?: string; extraFilters?: ReactNode }) {
  return (
    <div className='rm-filter'>
      <div className='flex items-center gap-2'>
        <button className='rm-date'>
          <span>{dateRange ?? 'Dec 16, 2025 - Mar 9, 2026'}</span>
        </button>
        {extraFilters}
        <button className='rm-addfilter'>+ Add filter</button>
      </div>
      <span className='rm-tz'>Stockholm time (GMT+1)</span>
    </div>
  );
}

export function ReportProgress() {
  return (
    <div className='rm-progress'>
      <div className='rm-progress-bar' />
    </div>
  );
}
