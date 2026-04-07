'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const REPORT_COMPONENTS: Record<string, React.ComponentType> = {
  conversations: dynamic(() => import('./report-conversations')),
  'first-response': dynamic(() => import('./report-first-response')),
  'resolution-time': dynamic(() => import('./report-resolution-time')),
  csat: dynamic(() => import('./report-csat')),
  'sweo-performance': dynamic(() => import('./report-sweo-performance')),
  'sweo-deflection': dynamic(() => import('./report-sweo-deflection')),
  'knowledge-gaps': dynamic(() => import('./report-knowledge-gaps')),
  'team-performance': dynamic(() => import('./report-team-performance')),
  'busiest-hours': dynamic(() => import('./report-busiest-hours')),
  channels: dynamic(() => import('./report-channels')),
  'fin-ai-agent': dynamic(() => import('./report-fin-ai-agent')),
  copilot: dynamic(() => import('./report-copilot')),
  calls: dynamic(() => import('./report-calls')),
  'surveyed-csat': dynamic(() => import('./report-surveyed-csat')),
  effectiveness: dynamic(() => import('./report-effectiveness')),
  responsiveness: dynamic(() => import('./report-responsiveness')),
  slas: dynamic(() => import('./report-slas')),
  'team-inbox-performance': dynamic(() => import('./report-team-inbox-performance')),
  tickets: dynamic(() => import('./report-tickets'))
};

export default function ReportPageRouter({ slug }: { slug: string }) {
  const Component = REPORT_COMPONENTS[slug];

  if (!Component) {
    return (
      <div className='flex flex-col items-center justify-center py-20' style={{ color: 'var(--rm-text-muted)' }}>
        <p style={{ fontSize: 16 }}>Report not found</p>
        <Link href='/dashboard/reports' style={{ fontSize: 13, color: 'var(--rm-accent)', marginTop: 8 }}>Back to Reports</Link>
      </div>
    );
  }

  return <Component />;
}
