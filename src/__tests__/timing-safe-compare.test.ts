import { describe, it, expect } from 'vitest';
import { safeCompare } from '@/lib/security/timing-safe-compare';

describe('safeCompare (timing-safe)', () => {
  it('returns true for identical strings', () => {
    expect(safeCompare('secret123', 'secret123')).toBe(true);
  });

  it('returns false for different strings', () => {
    expect(safeCompare('secret123', 'secret456')).toBe(false);
  });

  it('returns false for different length strings', () => {
    expect(safeCompare('short', 'a-much-longer-string')).toBe(false);
  });

  it('returns false when first arg is empty', () => {
    expect(safeCompare('', 'notempty')).toBe(false);
  });

  it('returns false when second arg is empty', () => {
    expect(safeCompare('notempty', '')).toBe(false);
  });

  it('returns false when both are empty', () => {
    expect(safeCompare('', '')).toBe(false);
  });

  // Verifies the cron secret fix uses this function correctly
  it('handles Bearer token extraction scenario', () => {
    const cronSecret = 'my-cron-secret-2024';
    const authHeader = `Bearer ${cronSecret}`;
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : '';
    expect(safeCompare(token, cronSecret)).toBe(true);
  });

  it('rejects partial match in Bearer token', () => {
    const cronSecret = 'my-cron-secret-2024';
    const token = 'my-cron-secret-2025'; // Off by one char
    expect(safeCompare(token, cronSecret)).toBe(false);
  });
});
