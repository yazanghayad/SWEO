'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { legalCategories } from '@/config/legal-config';
import { useRouter } from 'next/navigation';

export function LegalHeader() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.toLowerCase();
    for (const cat of legalCategories) {
      for (const doc of cat.documents) {
        if (
          doc.title.toLowerCase().includes(q) ||
          doc.description.toLowerCase().includes(q)
        ) {
          router.push(`/legal/${cat.slug}/${doc.slug}`);
          setQuery('');
          return;
        }
      }
    }
  };

  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
      <div className='mx-auto flex h-12 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8'>
        <Link href='/legal' className='flex shrink-0 items-center gap-2'>
          <Image
            src='/logo_sweo.svg'
            alt='SWEO AI'
            width={90}
            height={32}
            className='h-6 w-auto dark:invert'
            priority
          />
          <span className='text-muted-foreground border-l pl-2 text-[13px]'>
            Terms &amp; Policies
          </span>
        </Link>

        <div className='flex-1' />

        <form onSubmit={handleSearch} className='hidden sm:block'>
          <div className='relative'>
            <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2' />
            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search…'
              className='bg-muted/50 text-foreground placeholder:text-muted-foreground focus:border-foreground/20 focus:bg-background h-7 w-44 rounded-md border pr-3 pl-8 text-[13px] transition-colors outline-none'
            />
          </div>
        </form>

        <Link
          href='/dashboard/overview'
          className='text-muted-foreground hover:text-foreground text-[13px] transition-colors'
        >
          Dashboard
        </Link>
      </div>
    </header>
  );
}
