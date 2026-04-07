'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/use-tenant';
import { getAnalyticsAction } from '@/features/analytics/actions/analytics-actions';
import type { AnalyticsMetrics } from '@/lib/analytics/analytics-engine';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
  Globe,
  RefreshCw
} from 'lucide-react';
import {
  exportCSV,
  exportJSON,
  exportAsPDF,
  exportAsDOCX
} from '../lib/report-export';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportShellProps {
  title: string;
  description: string;
  children: (props: {
    metrics: AnalyticsMetrics;
    dateRange: string;
    loading: boolean;
  }) => ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportShell({
  title,
  description: _description,
  children
}: ReportShellProps) {
  const router = useRouter();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [timezone, setTimezone] = useState('UTC');

  const load = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsAction(tenant.$id, parseInt(dateRange));
      if (res.success && res.metrics) {
        setMetrics(res.metrics);
      } else {
        setError(res.error ?? 'Failed to load analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    }
    setLoading(false);
  }, [tenant, dateRange]);

  useEffect(() => {
    if (tenant) load();
  }, [tenant, load]);

  // Export handlers
  const slug = title.toLowerCase().replace(/\s+/g, '-');

  const handleCSV = () => {
    if (metrics) exportCSV(metrics, title, slug);
  };
  const handleJSON = () => {
    if (metrics) exportJSON(metrics, title, slug);
  };
  const handlePDF = async () => {
    if (metrics) await exportAsPDF(metrics, title, slug);
  };
  const handleDOCX = async () => {
    if (metrics) await exportAsDOCX(metrics, title, slug);
  };

  // States
  if (tenantLoading) {
    return (
      <div className='flex h-[calc(100vh-120px)] items-center justify-center'>
        <Icons.spinner className='text-muted-foreground h-5 w-5 animate-spin' />
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <div className='text-muted-foreground flex h-[calc(100vh-120px)] items-center justify-center text-sm'>
        {tenantError ?? 'Could not load workspace'}
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col'>
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div className='border-b'>
        <div className='flex h-12 items-center gap-3 px-6'>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 shrink-0'
                  onClick={() => router.push('/dashboard/reports')}
                >
                  <ArrowLeft className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='text-xs'>
                All reports
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation='vertical' className='h-4' />

          <div className='min-w-0 flex-1'>
            <h1 className='truncate text-sm leading-tight font-semibold'>
              {title}
            </h1>
          </div>

          {/* Right controls */}
          <div className='flex items-center gap-1.5'>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className='h-7 w-[130px] text-xs font-normal'>
                <Calendar className='mr-1 h-3 w-3 opacity-40' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7'>Last 7 days</SelectItem>
                <SelectItem value='14'>Last 14 days</SelectItem>
                <SelectItem value='30'>Last 30 days</SelectItem>
                <SelectItem value='90'>Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className='h-7 w-[90px] text-xs font-normal'>
                <Globe className='mr-1 h-3 w-3 opacity-40' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='UTC'>UTC</SelectItem>
                <SelectItem value='local'>Local</SelectItem>
                <SelectItem value='EST'>EST</SelectItem>
                <SelectItem value='CET'>CET</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation='vertical' className='mx-0.5 h-4' />

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={load}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='text-xs'>Refresh</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 px-2.5 text-xs'
                  disabled={!metrics}
                >
                  <Download className='mr-1 h-3 w-3' />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem onClick={handleCSV} className='text-xs'>
                  <FileSpreadsheet className='mr-2 h-3.5 w-3.5 opacity-60' />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePDF} className='text-xs'>
                  <FileText className='mr-2 h-3.5 w-3.5 opacity-60' />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDOCX} className='text-xs'>
                  <FileType className='mr-2 h-3.5 w-3.5 opacity-60' />
                  Export as DOCX
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleJSON} className='text-xs'>
                  <FileText className='mr-2 h-3.5 w-3.5 opacity-60' />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-[1400px] px-6 py-6'>
          {loading ? (
            <div className='flex flex-col items-center justify-center gap-2 py-24'>
              <Icons.spinner className='text-muted-foreground h-5 w-5 animate-spin' />
              <span className='text-muted-foreground text-xs'>
                Loading report…
              </span>
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center gap-3 py-24'>
              <p className='text-muted-foreground text-sm'>{error}</p>
              <Button variant='outline' size='sm' onClick={load}>
                Try again
              </Button>
            </div>
          ) : !metrics ? (
            <div className='flex flex-col items-center justify-center gap-3 py-24'>
              <p className='text-muted-foreground text-sm'>No data available</p>
              <Button variant='outline' size='sm' onClick={load}>
                Retry
              </Button>
            </div>
          ) : (
            children({ metrics, dateRange, loading })
          )}
        </div>
      </div>
    </div>
  );
}
