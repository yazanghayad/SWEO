import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  findLegalDocument,
  getAdjacentLegalDocuments,
  getAllLegalPaths
} from '@/config/legal-config';
import { LegalSidebar, LegalMobileNav, PrintButton } from '@/features/legal';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return getAllLegalPaths();
}

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const result = findLegalDocument(category, slug);
  if (!result) return {};
  return {
    title: `${result.document.title} – SWEO AI Legal`,
    description: result.document.description
  };
}

export default async function LegalDocumentPage({ params }: PageProps) {
  const { category, slug } = await params;
  const result = findLegalDocument(category, slug);
  if (!result) notFound();

  const { document: doc } = result;
  const { prev, next } = getAdjacentLegalDocuments(category, slug);

  return (
    <>
      {/* Page title */}
      <div className='mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8'>
        <h1 className='text-foreground text-3xl font-bold tracking-tight sm:text-4xl'>
          Terms &amp; Policies
        </h1>
      </div>

      <LegalMobileNav />

      <div className='mx-auto flex max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>
        <LegalSidebar />

        <article className='min-w-0 flex-1 py-2 lg:px-12'>
          {/* Document title + print */}
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-foreground text-2xl font-bold tracking-tight sm:text-3xl'>
                {doc.title}
              </h2>
              <p className='text-muted-foreground mt-2 text-sm font-medium uppercase tracking-wide'>
                Effective day{' '}
                {new Date(doc.lastUpdated).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).toUpperCase()}
              </p>
            </div>
            <PrintButton />
          </div>

          <hr className='border-border my-8' />

          {/* Sections */}
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className='scroll-mt-16'>
              <h3 className='text-foreground mt-8 mb-3 text-lg font-semibold'>
                {section.title}
              </h3>
              <div
                className='text-foreground/90 [&_a]:text-primary [&_code]:bg-muted [&_pre]:bg-muted [&_strong]:text-foreground text-[15px] leading-[1.75] [&_a]:underline [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_h4]:mt-5 [&_h4]:mb-1.5 [&_h4]:text-[15px] [&_h4]:font-medium [&_li]:mb-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:text-[13px] [&_strong]:font-semibold [&_table]:my-3 [&_table]:w-full [&_table]:text-[14px] [&_td]:border-b [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5'
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
              />
            </section>
          ))}

          <hr className='border-border my-10' />

          {/* Prev / Next */}
          <nav className='grid grid-cols-2 gap-4'>
            {prev ? (
              <Link
                href={`/legal/${prev.category.slug}/${prev.document.slug}`}
                className='group hover:bg-muted/50 flex flex-col gap-0.5 rounded-md border p-3 transition-colors'
              >
                <span className='text-muted-foreground flex items-center gap-1 text-[11px]'>
                  <ArrowLeft className='h-3 w-3' />
                  Previous
                </span>
                <span className='text-foreground text-[13px] font-medium'>
                  {prev.document.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/legal/${next.category.slug}/${next.document.slug}`}
                className='group hover:bg-muted/50 flex flex-col items-end gap-0.5 rounded-md border p-3 transition-colors'
              >
                <span className='text-muted-foreground flex items-center gap-1 text-[11px]'>
                  Next
                  <ArrowRight className='h-3 w-3' />
                </span>
                <span className='text-foreground text-[13px] font-medium'>
                  {next.document.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </article>
      </div>
    </>
  );
}
