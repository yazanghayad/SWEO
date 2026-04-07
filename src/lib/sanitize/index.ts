/**
 * Input sanitization utilities.
 *
 * Uses sanitize-html (pure JS, no native deps) to strip dangerous
 * HTML/JavaScript from user input. Works in all runtimes including
 * Vercel serverless (unlike isomorphic-dompurify which requires jsdom).
 */

import sanitize from 'sanitize-html';

// ---------------------------------------------------------------------------
// HTML sanitization (keeps safe formatting tags)
// ---------------------------------------------------------------------------

const ALLOWED_TAGS = [
  'b',
  'i',
  'em',
  'strong',
  'a',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'code',
  'pre',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6'
];

const ALLOWED_ATTR_MAP: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel']
};

/**
 * Sanitize HTML content – strips dangerous tags/attributes but keeps
 * safe formatting (bold, italic, links, lists, code blocks, etc.).
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  return sanitize(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR_MAP,
    disallowedTagsMode: 'discard'
  });
}

// ---------------------------------------------------------------------------
// Plain text sanitization (strips ALL HTML)
// ---------------------------------------------------------------------------

/**
 * Strip all HTML tags and normalize whitespace.
 * Use for chat messages, search queries, and other plain-text fields.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  // Strip all HTML
  const stripped = sanitize(input, {
    allowedTags: [],
    allowedAttributes: {}
  });

  // Normalize whitespace: collapse multiple spaces/newlines
  return stripped.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Object sanitization
// ---------------------------------------------------------------------------

/**
 * Sanitize specific string fields on an object.
 * Non-string fields and fields not in the list are left unchanged.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
  mode: 'html' | 'text' = 'text'
): T {
  const sanitized = { ...obj };
  const sanitizer = mode === 'html' ? sanitizeHtml : sanitizeText;

  for (const field of fields) {
    const value = sanitized[field];
    if (typeof value === 'string') {
      (sanitized[field] as unknown) = sanitizer(value);
    }
  }

  return sanitized;
}

/**
 * Sanitize a value that should be plain text.
 * Returns an empty string if the input is not a string.
 */
export function sanitizeInput(value: unknown): string {
  if (typeof value !== 'string') return '';
  return sanitizeText(value);
}
