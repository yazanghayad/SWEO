'use client';

import { createContext, useContext } from 'react';
import type { Locale } from './config';
import { defaultLocale } from './config';
import type { Dictionary } from './dictionaries/en';

/* ─── Context ─── */
const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/* ─── Dictionary cache (lazy loaded) ─── */
const dictionaryCache: Partial<Record<Locale, Dictionary>> = {};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (dictionaryCache[locale]) return dictionaryCache[locale]!;

  const dict =
    locale === 'sv'
      ? (await import('./dictionaries/sv')).default
      : (await import('./dictionaries/en')).default;

  dictionaryCache[locale] = dict;
  return dict;
}

/** Synchronous getter – works because we eagerly import both dicts below */
export function getDictionarySync(locale: Locale): Dictionary {
  if (locale === 'sv') return require('./dictionaries/sv').default;
  return require('./dictionaries/en').default;
}
