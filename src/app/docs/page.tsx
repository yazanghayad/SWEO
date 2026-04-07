import Link from 'next/link';
import { docsCategories } from '@/config/docs-config';
import { Icons } from '@/components/icons';
import { DocsHero, DocsFooter } from '@/features/docs';
import { ChevronRight } from 'lucide-react';

const quickLinks = [
  {
    label: 'Getting started with SWEO AI',
    href: '/docs/getting-started/introduction'
  },
  {
    label: 'Onboarding guide',
    href: '/docs/getting-started/onboarding'
  },
  {
    label: 'Setting up the Inbox',
    href: '/docs/inbox'
  },
  {
    label: 'Leveraging AI and automation',
    href: '/docs/ai-automation'
  },
  {
    label: 'Customize AI behavior with Guidance',
    href: '/docs/ai-automation/guidance'
  },
  {
    label: 'Cases & ticket management',
    href: '/docs/inbox/cases'
  },
  {
    label: 'Creating content for self-serve and AI-powered support',
    href: '/docs/knowledge'
  },
  {
    label: 'Outbound campaigns & messaging',
    href: '/docs/outbound'
  },
  {
    label: 'All 19 report types',
    href: '/docs/analytics/report-types'
  },
  {
    label: 'White-label & custom branding',
    href: '/docs/channels/white-label'
  },
  {
    label: 'Multilingual support',
    href: '/docs/team-management/multilingual'
  },
  {
    label: 'Plans & billing',
    href: '/docs/getting-started/billing'
  }
];

export default function DocsPage() {
  return (
    <main className='min-h-screen bg-gray-50'>
      <DocsHero />

      {/* "Get the most out of SWEO AI" quick-links */}
      <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8'>
          <h2 className='mb-5 text-lg font-bold text-gray-900'>
            Get the most out of SWEO AI
          </h2>
          <div className='grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3'>
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='group flex items-center gap-2 text-sm'
              >
                <span className='text-amber-700 underline underline-offset-2 group-hover:text-amber-900'>
                  {link.label}
                </span>
                <ChevronRight className='h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5' />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Collection cards grid */}
      <section className='mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {docsCategories.map((cat) => {
            const IconComponent =
              Icons[cat.icon as keyof typeof Icons] ?? Icons.knowledge;
            return (
              <Link
                key={cat.slug}
                href={`/docs/${cat.slug}`}
                className='group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600'>
                  <IconComponent className='h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <h3 className='text-sm font-semibold text-gray-900'>
                    {cat.title}
                  </h3>
                  <p className='mt-0.5 text-xs text-gray-500'>
                    {cat.articles.length} articles
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <DocsFooter />
    </main>
  );
}
