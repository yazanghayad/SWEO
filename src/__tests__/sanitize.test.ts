import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeObject,
  sanitizeInput
} from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('keeps safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong>, <em>goodbye</em></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });

  it('strips script tags', () => {
    const input = '<p>Safe</p><script>alert("XSS")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('Safe');
  });

  it('strips event handlers', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('allows links with href', () => {
    const input = '<a href="https://example.com" title="Link">Click</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('title="Link"');
  });

  it('strips dangerous attributes', () => {
    const input = '<a href="javascript:alert(1)">Bad</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('strips style tags', () => {
    const input = '<style>body { display:none }</style><p>Content</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<style>');
    expect(result).toContain('Content');
  });

  it('strips iframe', () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<iframe');
  });

  it('keeps code blocks', () => {
    const input = '<pre><code>const x = 1;</code></pre>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<pre>');
    expect(result).toContain('<code>');
  });

  it('keeps headings', () => {
    const input = '<h1>Title</h1><h2>Subtitle</h2><h3>Sub</h3>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<h1>');
    expect(result).toContain('<h2>');
    expect(result).toContain('<h3>');
  });

  it('keeps lists', () => {
    const input = '<ul><li>One</li><li>Two</li></ul>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
  });
});

describe('sanitizeText', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(null as unknown as string)).toBe('');
  });

  it('strips ALL HTML tags', () => {
    const input = '<p>Hello <b>world</b></p>';
    const result = sanitizeText(input);
    expect(result).toBe('Hello world');
    expect(result).not.toContain('<');
  });

  it('strips script content', () => {
    const input = 'Hello <script>alert("XSS")</script> world';
    const result = sanitizeText(input);
    expect(result).not.toContain('script');
    expect(result).not.toContain('alert');
  });

  it('collapses whitespace', () => {
    const input = 'Hello    world   \n\n  test';
    const result = sanitizeText(input);
    expect(result).toBe('Hello world test');
  });

  it('trims leading and trailing whitespace', () => {
    const input = '   Hello world   ';
    const result = sanitizeText(input);
    expect(result).toBe('Hello world');
  });
});

describe('sanitizeObject', () => {
  it('sanitizes specified fields in text mode', () => {
    const obj = {
      name: '<b>Test</b>',
      email: 'test@example.com',
      bio: '<script>bad</script>Nice person',
      age: 25
    };

    const result = sanitizeObject(obj, ['name', 'bio'], 'text');
    expect(result.name).toBe('Test');
    expect(result.bio).toBe('Nice person');
    expect(result.email).toBe('test@example.com'); // untouched
    expect(result.age).toBe(25); // non-string untouched
  });

  it('sanitizes specified fields in html mode', () => {
    const obj = {
      content: '<p>Good</p><script>bad</script>',
      title: 'Normal'
    };

    const result = sanitizeObject(obj, ['content'], 'html');
    expect(result.content).toContain('<p>');
    expect(result.content).not.toContain('<script>');
    expect(result.title).toBe('Normal'); // untouched
  });
});

describe('sanitizeInput', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(123)).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput({ obj: true })).toBe('');
  });

  it('sanitizes string input', () => {
    expect(sanitizeInput('<b>Hello</b> world')).toBe('Hello world');
  });
});
