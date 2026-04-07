'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';

const localeConfig: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
];

/** Build the equivalent path for the target locale */
function getLocalePath(targetLocale: Locale, pathname: string): string {
  const cleanPath = pathname.replace(/^\/sv(\/|$)/, '/');

  if (targetLocale === 'en') {
    return cleanPath || '/';
  }
  return `/sv${cleanPath === '/' ? '' : cleanPath}`;
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.6 9h16.8M3.6 15h16.8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c2.21 2.3 3.46 5.09 3.5 8-.04 2.91-1.29 5.7-3.5 8-2.21-2.3-3.46-5.09-3.5-8 .04-2.91 1.29-5.7 3.5-8Z"
      />
    </svg>
  );
}

/**
 * Language switcher for the navbar.
 * Globe icon with dropdown to choose language.
 */
export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = localeConfig.find((l) => l.code === currentLocale)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="sweo-nav-link flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Select language"
      >
        <GlobeIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLabel.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path fill="currentColor" d="M15.48 10a.25.25 0 0 1 .195.406l-3.48 4.35a.25.25 0 0 1-.39 0l-3.48-4.35A.25.25 0 0 1 8.52 10z" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute right-0 top-full mt-2 min-w-[160px] rounded-md border border-white/10 bg-[#0a0f1a]/95 backdrop-blur-md py-1 shadow-xl z-50"
          role="menu"
          aria-label="Language options"
        >
          {localeConfig.map((locale) => {
            const href = mounted
              ? getLocalePath(locale.code, pathname)
              : locale.code === 'en'
                ? '/'
                : '/sv';
            const isActive = locale.code === currentLocale;

            return (
              <li key={locale.code} role="menuitem">
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{locale.flag}</span>
                  <span>{locale.label}</span>
                  {isActive && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="ml-auto h-3.5 w-3.5 text-white/60">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
