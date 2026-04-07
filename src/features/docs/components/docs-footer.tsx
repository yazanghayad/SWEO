import Link from 'next/link';
import Image from 'next/image';
import { docsCategories } from '@/config/docs-config';

export function DocsFooter() {
  return (
    <footer className='border-t border-gray-200 bg-white'>
      <div className='mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8'>
        {/* Logo */}
        <div className='mb-8'>
          <Link href='/docs'>
            <Image
              src='/logo_sweo.svg'
              alt='SWEO AI'
              width={90}
              height={28}
              className='h-6 w-auto'
            />
          </Link>
        </div>

        {/* Links grid */}
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {docsCategories.slice(0, 4).map((cat) => (
            <div key={cat.slug}>
              <h4 className='mb-3 text-xs font-semibold tracking-wider text-gray-900 uppercase'>
                {cat.title}
              </h4>
              <ul className='space-y-2'>
                {cat.articles.slice(0, 4).map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/docs/${cat.slug}/${article.slug}`}
                      className='text-sm text-gray-500 transition-colors hover:text-gray-900'
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className='mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row'>
          <p className='text-xs text-gray-400'>
            &copy; {new Date().getFullYear()} SWEO AI. All rights reserved.
          </p>
          <nav className='flex gap-6'>
            <Link
              href='/legal/terms/terms-of-service'
              className='text-xs text-gray-400 transition-colors hover:text-gray-600'
            >
              Terms of Service
            </Link>
            <Link
              href='/legal/privacy/privacy-policy'
              className='text-xs text-gray-400 transition-colors hover:text-gray-600'
            >
              Privacy Policy
            </Link>
            <Link
              href='/legal/policies/cookie-policy'
              className='text-xs text-gray-400 transition-colors hover:text-gray-600'
            >
              Cookie Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
