export const locales = ['en', 'sv'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/** Map locale to its display name (in that language) */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  sv: 'Svenska',
};

/** Map locale to HTML lang attribute */
export const localeLang: Record<Locale, string> = {
  en: 'en',
  sv: 'sv',
};
