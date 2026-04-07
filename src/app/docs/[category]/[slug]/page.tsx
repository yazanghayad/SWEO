import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  findArticle,
  getAdjacentArticles,
  getAllArticlePaths
} from '@/config/docs-config';
import { DocsHeader, DocsFooter, TableOfContents } from '@/features/docs';
import { ChevronRight } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return getAllArticlePaths();
}

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const result = findArticle(category, slug);
  if (!result) return {};
  return {
    title: `${result.article.title} – SWEO AI Docs`,
    description: result.article.description
  };
}

export default async function DocsArticlePage({ params }: PageProps) {
  const { category, slug } = await params;
  const result = findArticle(category, slug);
  if (!result) notFound();

  const { category: cat, article } = result;
  const { prev, next } = getAdjacentArticles(category, slug);

  return (
    <div className='min-h-screen bg-gray-50'>
      <DocsHeader />

      <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Breadcrumbs */}
        <nav className='mb-8 flex items-center gap-1.5 text-sm'>
          <Link
            href='/docs'
            className='text-amber-700 underline underline-offset-2 hover:text-amber-900'
          >
            All Collections
          </Link>
          <ChevronRight className='h-3.5 w-3.5 text-gray-400' />
          <Link
            href={`/docs/${cat.slug}`}
            className='text-amber-700 underline underline-offset-2 hover:text-amber-900'
          >
            {cat.title}
          </Link>
          <ChevronRight className='h-3.5 w-3.5 text-gray-400' />
          <span className='text-gray-500'>{article.title}</span>
        </nav>

        <div className='flex gap-12'>
          {/* Main content */}
          <article className='min-w-0 flex-1'>
            <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
              {article.title}
            </h1>
            {article.description && (
              <p className='mt-2 text-sm leading-relaxed text-gray-500'>
                {article.description}
              </p>
            )}

            {/* Author + updated */}
            <div className='mt-4 flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600'>
                S
              </div>
              <div className='text-xs text-gray-500'>
                <p>Written by SWEO AI Team</p>
                <p>Updated over 2 weeks ago</p>
              </div>
            </div>

            <hr className='my-8 border-gray-200' />

            {/* Sections */}
            {article.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className='scroll-mt-16'
              >
                <h2 className='mt-10 mb-3 text-lg font-semibold text-gray-900'>
                  {section.title}
                </h2>
                <div
                  className='text-[15px] leading-[1.75] text-gray-700 [&_a]:text-amber-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-amber-900 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_h4]:mt-5 [&_h4]:mb-1.5 [&_h4]:text-[15px] [&_h4]:font-medium [&_li]:mb-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:text-[13px] [&_strong]:font-semibold [&_strong]:text-gray-900 [&_table]:my-3 [&_table]:w-full [&_table]:text-[14px] [&_td]:border-b [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5'
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
                />
              </section>
            ))}

            {/* Prev / Next */}
            {(prev || next) && (
              <>
                <hr className='my-10 border-gray-200' />
                <nav className='grid grid-cols-2 gap-4'>
                  {prev ? (
                    <Link
                      href={`/docs/${prev.category.slug}/${prev.article.slug}`}
                      className='group flex flex-col gap-0.5 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm'
                    >
                      <span className='text-xs text-gray-400'>Previous</span>
                      <span className='text-sm font-medium text-gray-900 group-hover:underline'>
                        {prev.article.title}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {next ? (
                    <Link
                      href={`/docs/${next.category.slug}/${next.article.slug}`}
                      className='group flex flex-col items-end gap-0.5 rounded-lg border border-gray-200 bg-white p-4 text-right transition-shadow hover:shadow-sm'
                    >
                      <span className='text-xs text-gray-400'>Next</span>
                      <span className='text-sm font-medium text-gray-900 group-hover:underline'>
                        {next.article.title}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                </nav>
              </>
            )}
          </article>

          {/* Right sidebar — Table of Contents */}
          <TableOfContents sections={article.sections} />
        </div>
      </main>

      <DocsFooter />
    </div>
  );
}
