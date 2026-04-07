'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { legalCategories } from '@/config/legal-config';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function LegalSidebar() {
  const pathname = usePathname();

  return (
    <aside className='sticky top-0 hidden h-screen w-64 shrink-0 border-r lg:block'>
      <ScrollArea className='h-full px-6 py-8'>
        <nav className='space-y-5'>
          {legalCategories.map((cat) => (
            <SidebarCategory
              key={cat.slug}
              category={cat}
              pathname={pathname}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}

function SidebarCategory({
  category,
  pathname
}: {
  category: (typeof legalCategories)[number];
  pathname: string;
}) {
  const isActive = pathname.includes(`/legal/${category.slug}/`);
  const [open, setOpen] = useState(isActive || category.slug === 'terms');

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className='flex w-full items-center gap-1.5 py-1 text-[15px] font-semibold'
      >
        <span className='text-foreground underline decoration-1 underline-offset-2'>
          {category.title}
        </span>
        <ChevronUp
          className={cn(
            'text-foreground h-3.5 w-3.5 transition-transform',
            !open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <ul className='mt-1.5 space-y-0.5 pl-3'>
          {category.documents.map((doc) => {
            const href = `/legal/${category.slug}/${doc.slug}`;
            const active = pathname === href;
            return (
              <li key={doc.slug}>
                <Link
                  href={href}
                  className={cn(
                    'text-foreground/70 hover:text-foreground block py-1 text-[14px] underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current',
                    active &&
                      'text-foreground font-medium decoration-current'
                  )}
                >
                  {doc.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
