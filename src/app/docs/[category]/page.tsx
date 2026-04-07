import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  findCategory,
  getAllCategoryPaths
} from '@/config/docs-config';
import { DocsHeader, DocsFooter } from '@/features/docs';
import { Icons } from '@/components/icons';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return getAllCategoryPaths();
}

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) return {};
  return {
    title: `${cat.title} – SWEO AI Docs`,
    description: cat.description
  };
}

export default async function DocsCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();

  const IconComponent =
    Icons[cat.icon as keyof typeof Icons] ?? Icons.knowledge;

  return (
    <div className='min-h-screen bg-gray-50'>
      <DocsHeader />

      <main className='mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Breadcrumbs */}
        <nav className='mb-8 flex items-center gap-1.5 text-sm'>
          <Link
            href='/docs'
            className='text-amber-700 underline underline-offset-2 hover:text-amber-900'
          >
            All Collections
          </Link>
          <ChevronRight className='h-3.5 w-3.5 text-gray-400' />
          <span className='text-gray-500'>{cat.title}</span>
        </nav>

        {/* Collection header */}
        <div className='mb-8'>
          <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white'>
            <IconComponent className='h-6 w-6' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            {cat.title}
          </h1>
          <p className='mt-2 text-sm leading-relaxed text-gray-500'>
            {cat.description}
          </p>
          <p className='mt-3 text-sm text-gray-400'>
            {cat.articles.length} articles
          </p>
        </div>

        {/* Article list */}
        <div className='divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white'>
          {cat.articles.map((article) => (
            <Link
              key={article.slug}
              href={`/docs/${cat.slug}/${article.slug}`}
              className='group flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50'
            >
              <div className='min-w-0'>
                <span className='text-sm font-medium text-gray-900 group-hover:underline'>
                  {article.title}
                </span>
                {article.description && (
                  <p className='mt-0.5 truncate text-xs text-gray-500'>
                    {article.description}
                  </p>
                )}
              </div>
              <ChevronRight className='h-4 w-4 shrink-0 text-gray-400' />
            </Link>
          ))}
        </div>
      </main>

      <DocsFooter />
    </div>
  );
}
