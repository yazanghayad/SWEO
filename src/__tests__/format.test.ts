import { describe, it, expect } from 'vitest';
import { formatDate, formatDistanceToNow } from '@/lib/format';

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2025-06-15'));
    expect(result).toContain('June');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('formats a date string', () => {
    const result = formatDate('2025-01-01');
    expect(result).toContain('January');
    expect(result).toContain('2025');
  });

  it('formats a timestamp number', () => {
    const result = formatDate(Date.UTC(2024, 11, 25)); // Dec 25, 2024
    expect(result).toContain('December');
    expect(result).toContain('25');
    expect(result).toContain('2024');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('respects custom formatting options', () => {
    const result = formatDate('2025-06-15', {
      month: 'short',
      day: '2-digit',
      year: '2-digit'
    });
    expect(result).toContain('Jun');
    expect(result).toContain('15');
  });
});

describe('formatDistanceToNow', () => {
  it('returns "just now" for recent dates', () => {
    const result = formatDistanceToNow(new Date());
    expect(result).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatDistanceToNow(fiveMinAgo);
    expect(result).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const result = formatDistanceToNow(threeHoursAgo);
    expect(result).toBe('3h ago');
  });

  it('returns days ago', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = formatDistanceToNow(tenDaysAgo);
    expect(result).toBe('10d ago');
  });

  it('returns months ago', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const result = formatDistanceToNow(sixtyDaysAgo);
    expect(result).toBe('2mo ago');
  });

  it('returns years ago', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
    const result = formatDistanceToNow(twoYearsAgo);
    expect(result).toContain('y ago');
  });

  it('returns empty string for undefined', () => {
    expect(formatDistanceToNow(undefined)).toBe('');
  });

  it('handles string date input', () => {
    const recent = new Date(Date.now() - 10 * 1000).toISOString();
    const result = formatDistanceToNow(recent);
    expect(result).toBe('just now');
  });

  it('handles timestamp number input', () => {
    const timestamp = Date.now() - 120 * 60 * 1000; // 2 hours ago
    const result = formatDistanceToNow(timestamp);
    expect(result).toBe('2h ago');
  });
});
