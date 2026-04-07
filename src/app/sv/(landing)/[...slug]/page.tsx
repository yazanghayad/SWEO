import { redirect } from 'next/navigation';

/**
 * Catch-all route for /sv/(landing) subpages.
 *
 * The navbar, footer, and all shared SWEO components are already
 * localised via the Swedish LocaleProvider in /sv/layout.tsx.
 * Individual subpage content (inline JSX) will be incrementally
 * translated in future iterations.
 *
 * For now this catch-all re-renders the equivalent English subpage
 * within the Swedish layout context so at minimum the site chrome
 * (nav, footer, chapter-nav, CTA banner) appears in Swedish.
 */

// Dynamically import the English subpage modules
const subpageModules: Record<
  string,
  () => Promise<{ default: React.ComponentType }>
> = {
  capabilities: () => import('@/app/(landing)/capabilities/page'),
  channels: () => import('@/app/(landing)/channels/page'),
  integrations: () => import('@/app/(landing)/integrations/page'),
  'ai-engine': () => import('@/app/(landing)/ai-engine/page'),
  pricing: () => import('@/app/(landing)/pricing/page'),
  'contact-sales': () => import('@/app/(landing)/contact-sales/page'),
  voice: () => import('@/app/(landing)/voice/page'),
  procedures: () => import('@/app/(landing)/procedures/page'),
  insights: () => import('@/app/(landing)/insights/page'),
  testing: () => import('@/app/(landing)/testing/page'),
  train: () => import('@/app/(landing)/train/page'),
  'trust-reliability': () =>
    import('@/app/(landing)/trust-reliability/page'),
  'customer-agent': () => import('@/app/(landing)/customer-agent/page'),
  'cx-models': () => import('@/app/(landing)/cx-models/page'),
  glossary: () => import('@/app/(landing)/glossary/page'),
  guarantee: () => import('@/app/(landing)/guarantee/page'),
  updates: () => import('@/app/(landing)/updates/page'),
  'view-demos': () => import('@/app/(landing)/view-demos/page'),
  'fin-sales-agent': () => import('@/app/(landing)/fin-sales-agent/page'),
  fin3: () => import('@/app/(landing)/fin3/page'),
  learn: () => import('@/app/(landing)/learn/page'),
  'roi-calculator': () => import('@/app/(landing)/roi-calculator/page'),
  'professional-services': () =>
    import('@/app/(landing)/professional-services/page'),
  'salesforce-integration': () =>
    import('@/app/(landing)/salesforce-integration/page'),
  'zendesk-integration': () =>
    import('@/app/(landing)/zendesk-integration/page'),
  'channels/live-chat': () =>
    import('@/app/(landing)/channels/live-chat/page'),
  'channels/email': () => import('@/app/(landing)/channels/email/page'),
  'solutions/technology': () =>
    import('@/app/(landing)/solutions/technology/page'),
  'solutions/enterprise': () =>
    import('@/app/(landing)/solutions/enterprise/page'),
  'solutions/financial-services': () =>
    import('@/app/(landing)/solutions/financial-services/page'),
  'solutions/gaming': () =>
    import('@/app/(landing)/solutions/gaming/page'),
  'solutions/ecommerce': () =>
    import('@/app/(landing)/solutions/ecommerce/page'),
};

export default async function SvCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const key = slug.join('/');

  const loader = subpageModules[key];
  if (!loader) {
    redirect(`/${key}`);
  }

  try {
    const mod = await loader();
    const PageComponent = mod.default;
    return <PageComponent />;
  } catch {
    redirect(`/${key}`);
  }
}
