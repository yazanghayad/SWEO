/**
 * Timing-safe string comparison to prevent timing side-channel attacks.
 *
 * Uses `crypto.timingSafeEqual` which runs in constant time regardless of
 * where the first mismatch occurs, preventing attackers from guessing
 * secrets character by character.
 */

import { timingSafeEqual } from 'crypto';

/**
 * Compare two strings in constant time.
 * Returns `true` only if both strings are non-empty and identical.
 */
export function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;

  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  // If lengths differ, still run the comparison on equal-length buffers
  // to avoid leaking length information via timing.
  if (bufA.length !== bufB.length) {
    // Compare bufA against itself so the timing is identical to a real
    // comparison, then return false.
    timingSafeEqual(bufA, bufA);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}
