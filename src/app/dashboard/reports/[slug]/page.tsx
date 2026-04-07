import ReportSlugClient from '@/features/reports/components/report-slug-client';

const REPORT_TITLES: Record<string, string> = {
  conversations: 'Conversations Report',
  'first-response': 'First Response Time',
  'resolution-time': 'Resolution Time',
  csat: 'Customer Satisfaction',
  'sweo-performance': 'SWEO AI Performance',
  'sweo-deflection': 'SWEO Deflection Rate',
  'knowledge-gaps': 'Knowledge Gaps',
  'team-performance': 'Team Performance',
  'busiest-hours': 'Busiest Hours',
  channels: 'Channels Overview',
  'fin-ai-agent': 'Fin AI Agent',
  copilot: 'Copilot',
  calls: 'Calls',
  'surveyed-csat': 'Surveyed CSAT',
  effectiveness: 'Effectiveness',
  responsiveness: 'Responsiveness',
  slas: 'SLAs',
  'team-inbox-performance': 'Team Inbox Performance',
  tickets: 'Tickets'
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: REPORT_TITLES[slug] ?? 'Report' };
}

export default async function ReportSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ReportSlugClient slug={slug} />;
}
