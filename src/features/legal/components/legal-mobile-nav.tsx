'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { legalCategories } from '@/config/legal-config';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function LegalMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeCat = legalCategories.find((c) =>
    pathname.includes(`/legal/${c.slug}/`)
  );

  return (
    <div className='sticky top-0 z-40 border-b bg-white lg:hidden'>
      <div className='flex items-center px-4 py-2'>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 gap-2 px-2 text-sm font-medium'
            >
              <Menu className='h-4 w-4' />
              {activeCat?.title ?? 'Menu'}
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-72 bg-white p-0'>
            <ScrollArea className='h-full px-6 pt-10 pb-6'>
              <nav className='space-y-6'>
                {legalCategories.map((cat) => {
                  const isActive = pathname.includes(`/legal/${cat.slug}/`);
                  return (
                    <MobileCategory
                      key={cat.slug}
                      category={cat}
                      pathname={pathname}
                      defaultOpen={isActive}
                      onNavigate={() => setOpen(false)}
                    />
                  );
                })}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function MobileCategory({
  category,
  pathname,
  defaultOpen,
  onNavigate
}: {
  category: (typeof legalCategories)[number];
  pathname: string;
  defaultOpen: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className='flex w-full items-center justify-between py-1'
      >
        <span className='text-sm font-medium text-gray-900 underline'>
          {category.title}
        </span>
        <ChevronUp
          className={cn(
            'h-4 w-4 text-gray-500 transition-transform',
            !open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <ul className='mt-2 space-y-1 pl-1'>
          {category.documents.map((doc) => {
            const href = `/legal/${category.slug}/${doc.slug}`;
            const active = pathname === href;
            return (
              <li key={doc.slug}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    'block py-1 text-sm text-gray-600 transition-colors hover:text-gray-900 hover:underline',
                    active && 'font-medium text-gray-900'
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
