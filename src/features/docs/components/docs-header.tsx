'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Globe } from 'lucide-react';
import { useState } from 'react';
import { docsCategories } from '@/config/docs-config';
import { useRouter } from 'next/navigation';

export function DocsHeader() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.toLowerCase();
    for (const cat of docsCategories) {
      for (const article of cat.articles) {
        if (
          article.title.toLowerCase().includes(q) ||
          article.description.toLowerCase().includes(q)
        ) {
          router.push(`/docs/${cat.slug}/${article.slug}`);
          setQuery('');
          return;
        }
      }
    }
  };

  return (
    <div
      className='relative bg-cover bg-center'
      style={{ backgroundImage: "url('/get-help-background.jpeg')" }}
    >
      {/* Overlay */}
      <div className='absolute inset-0 bg-black/20' />

      {/* Top nav bar */}
      <header className='relative z-10'>
        <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <Link href='/docs' className='flex shrink-0 items-center gap-2'>
            <Image
              src='/logo_sweo.svg'
              alt='SWEO AI'
              width={100}
              height={32}
              className='h-7 w-auto brightness-0 invert'
              priority
            />
          </Link>

          <nav className='flex items-center gap-6'>
            <Link
              href='/docs'
              className='hidden text-sm text-white/80 transition-colors hover:text-white sm:block'
            >
              Community
            </Link>
            <Link
              href='/docs'
              className='hidden text-sm text-white/80 transition-colors hover:text-white sm:block'
            >
              Academy
            </Link>
            <Link
              href='/docs'
              className='hidden text-sm text-white/80 transition-colors hover:text-white sm:block'
            >
              Developer Hub
            </Link>
            <button className='flex items-center gap-1 text-sm text-white/80 transition-colors hover:text-white'>
              <Globe className='h-4 w-4' />
              <span className='hidden sm:inline'>English</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero content — search only (compact for inner pages) */}
      <div className='relative z-10 px-4 pb-6 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <form onSubmit={handleSearch}>
            <div className='relative max-w-xl'>
              <Search className='pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search for articles...'
                className='h-12 w-full rounded-lg bg-white pr-4 pl-12 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400'
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Extended hero for the homepage with large title */
export function DocsHero() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.toLowerCase();
    for (const cat of docsCategories) {
      for (const article of cat.articles) {
        if (
          article.title.toLowerCase().includes(q) ||
          article.description.toLowerCase().includes(q)
        ) {
          router.push(`/docs/${cat.slug}/${article.slug}`);
          setQuery('');
          return;
        }
      }
    }
  };

  return (
    <div
      className='relative bg-cover bg-center'
      style={{ backgroundImage: "url('/get-help-background.jpeg')" }}
    >
      {/* Overlay */}
      <div className='absolute inset-0 bg-black/20' />

      {/* Top nav */}
      <header className='relative z-10'>
        <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <Link href='/docs' className='flex shrink-0 items-center gap-2'>
            <Image
              src='/logo_sweo.svg'
              alt='SWEO AI'
              width={100}
              height={32}
              className='h-7 w-auto brightness-0 invert'
              priority
            />
          </Link>
          <nav className='flex items-center gap-6'>
            <Link
              href='/docs'
              className='hidden text-sm text-white/80 transition-colors hover:text-white sm:block'
            >
              Community
            </Link>
            <Link
              href='/docs'
              className='hidden text-sm text-white/80 transition-colors hover:text-white sm:block'
            >
              Academy
            </Link>
            <Link
              href='/docs'
              className='hidden text-sm text-white/80 transition-colors hover:text-white sm:block'
            >
              Developer Hub
            </Link>
            <button className='flex items-center gap-1 text-sm text-white/80 transition-colors hover:text-white'>
              <Globe className='h-4 w-4' />
              <span className='hidden sm:inline'>English</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero content with large title */}
      <div className='relative z-10 px-4 pt-8 pb-10 sm:px-6 sm:pt-14 sm:pb-14 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <h1 className='mb-6 text-2xl font-bold text-white sm:text-3xl lg:text-4xl'>
            Great support starts here.
          </h1>
          <form onSubmit={handleSearch}>
            <div className='relative max-w-xl'>
              <Search className='pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search for articles...'
                className='h-12 w-full rounded-lg bg-white pr-4 pl-12 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400'
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
