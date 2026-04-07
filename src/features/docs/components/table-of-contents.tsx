'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { DocsSection } from '@/config/docs-config';

interface Props {
  sections: DocsSection[];
}

export function TableOfContents({ sections }: Props) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <aside className='sticky top-32 hidden w-56 shrink-0 xl:block'>
      <div>
        <p className='mb-3 text-sm font-semibold text-gray-900'>
          {sections[0]?.title ?? 'In this article'}
        </p>
        <nav className='space-y-1'>
          {sections.slice(1).map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                'block py-1 pl-3 text-sm text-gray-500 transition-colors hover:text-gray-900',
                activeId === s.id && 'text-gray-900'
              )}
            >
              {s.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
