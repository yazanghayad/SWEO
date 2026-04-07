'use client';

import { useLocale } from './context';
import { getDictionarySync } from './context';
import type { Dictionary } from './dictionaries/en';

/**
 * React hook that returns the full dictionary for the current locale.
 *
 * Usage:
 * ```tsx
 * const t = useTranslations();
 * <h1>{t.hero.title}</h1>
 * ```
 */
export function useTranslations(): Dictionary {
  const locale = useLocale();
  return getDictionarySync(locale);
}
