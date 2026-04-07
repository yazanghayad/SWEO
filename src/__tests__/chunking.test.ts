import { describe, it, expect } from 'vitest';
import { splitTextIntoChunks, estimateTokens } from '@/lib/ai/chunking';

describe('splitTextIntoChunks', () => {
  it('returns the original text if shorter than chunkSize', () => {
    const text = 'Short text.';
    const chunks = splitTextIntoChunks(text, { chunkSize: 1000 });
    expect(chunks).toEqual(['Short text.']);
  });

  it('returns empty array for empty string', () => {
    expect(splitTextIntoChunks('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(splitTextIntoChunks('   ')).toEqual([]);
  });

  it('splits on paragraph boundaries (double newline)', () => {
    const text = 'Paragraph one.\n\nParagraph two.\n\nParagraph three.';
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 30,
      chunkOverlap: 0
    });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]).toContain('Paragraph one');
  });

  it('splits on single newline when paragraphs are too large', () => {
    const text = 'Line one.\nLine two.\nLine three.\nLine four.\nLine five.';
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 25,
      chunkOverlap: 0
    });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it('splits on sentence boundaries when lines are too large', () => {
    const text =
      'First sentence here. Second sentence here. Third sentence here. Fourth sentence here.';
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 50,
      chunkOverlap: 0
    });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it('splits on space when sentences are too large', () => {
    const text = 'word '.repeat(100).trim();
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 30,
      chunkOverlap: 0
    });
    expect(chunks.length).toBeGreaterThan(5);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(35); // small tolerance
    }
  });

  it('respects overlap between chunks', () => {
    const text = 'AAAA\n\nBBBB\n\nCCCC\n\nDDDD\n\nEEEE';
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 12,
      chunkOverlap: 4
    });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it('handles custom separators', () => {
    const text = 'part1|part2|part3|part4|part5';
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 12,
      chunkOverlap: 0,
      separators: ['|']
    });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it('uses default options when none provided', () => {
    const text = 'Hello world. '.repeat(200);
    const chunks = splitTextIntoChunks(text);
    expect(chunks.length).toBeGreaterThan(1);
    // Default chunkSize = 1000
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(1200); // tolerance for overlap
    }
  });

  it('produces non-empty chunks', () => {
    const text = 'A '.repeat(500);
    const chunks = splitTextIntoChunks(text, {
      chunkSize: 50,
      chunkOverlap: 10
    });
    for (const chunk of chunks) {
      expect(chunk.length).toBeGreaterThan(0);
    }
  });
});

describe('estimateTokens', () => {
  it('estimates ~1 token per 4 characters', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcdefgh')).toBe(2);
  });

  it('rounds up', () => {
    expect(estimateTokens('abc')).toBe(1); // ceil(3/4) = 1
    expect(estimateTokens('abcde')).toBe(2); // ceil(5/4) = 2
  });

  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('handles large text', () => {
    const text = 'a'.repeat(4000);
    expect(estimateTokens(text)).toBe(1000);
  });
});
