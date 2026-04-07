/**
 * Centralised timezone and language options.
 *
 * All workspace / settings UIs should import from here so that adding a new
 * entry is a one-line change instead of hunting through multiple components.
 */

export interface LanguageOption {
  /** IETF language tag, e.g. "en", "sv" */
  value: string;
  /** Human-readable label, e.g. "English" */
  label: string;
}

/**
 * IANA timezone identifiers shown in workspace settings.
 * Sorted roughly west→east; add new entries in geographical order.
 */
export const TIMEZONE_OPTIONS: readonly string[] = [
  'UTC',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Atlantic/Reykjavik',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Stockholm',
  'Europe/Helsinki',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland'
] as const;

/**
 * Languages available as workspace default language.
 * Keep alphabetical by `value` for easy scanning.
 */
export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { value: 'ar', label: 'العربية' },
  { value: 'da', label: 'Dansk' },
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fi', label: 'Suomi' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'nb', label: 'Norsk Bokmål' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pl', label: 'Polski' },
  { value: 'pt', label: 'Português' },
  { value: 'sv', label: 'Svenska' },
  { value: 'zh', label: '中文' }
] as const;
