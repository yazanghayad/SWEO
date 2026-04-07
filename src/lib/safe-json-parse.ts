/**
 * Safe JSON parsing utility.
 *
 * Wraps JSON.parse in a try-catch to prevent unhandled exceptions
 * from corrupted or unexpected data in database fields.
 */

/**
 * Safely parse a JSON string, returning a fallback value on failure.
 *
 * @param value - The value to parse. If not a string, returns it as-is.
 * @param fallback - Value to return when parsing fails. Defaults to `{}`.
 */
export function safeJsonParse<T = Record<string, unknown>>(
  value: unknown,
  fallback: T = {} as T
): T {
  if (typeof value !== 'string') return (value ?? fallback) as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
