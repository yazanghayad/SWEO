import OutboundSlugClient from '@/features/outbound/components/outbound-slug-client';

const OUTBOUND_TITLES: Record<string, string> = {
  series: 'Series Templates',
  templates: 'Quick Starters',
  new: 'New Message',
  compose: 'Compose Message'
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: OUTBOUND_TITLES[slug] ?? 'Outbound' };
}

export default async function OutboundSlugPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <OutboundSlugClient slug={slug} />;
}
