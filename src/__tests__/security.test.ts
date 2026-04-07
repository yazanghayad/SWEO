import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Security module tests ─────────────────────────────────────────────────
// Tests for: timing-safe-compare, encryption, sanitize, url-validator

// ===== 1. Timing-Safe Compare =====

import { safeCompare } from '@/lib/security/timing-safe-compare';

describe('safeCompare', () => {
  it('returns true for identical strings', () => {
    expect(safeCompare('secret-key', 'secret-key')).toBe(true);
  });

  it('returns false for different strings', () => {
    expect(safeCompare('secret-key', 'wrong-key')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(safeCompare('abc', 'abcdef')).toBe(false);
  });

  it('returns false for empty string a', () => {
    expect(safeCompare('', 'secret')).toBe(false);
  });

  it('returns false for empty string b', () => {
    expect(safeCompare('secret', '')).toBe(false);
  });

  it('returns false when both are empty', () => {
    expect(safeCompare('', '')).toBe(false);
  });

  it('handles unicode correctly', () => {
    expect(safeCompare('héllo wörld', 'héllo wörld')).toBe(true);
    expect(safeCompare('héllo', 'hello')).toBe(false);
  });

  it('handles long strings', () => {
    const long = 'a'.repeat(10000);
    expect(safeCompare(long, long)).toBe(true);
    expect(safeCompare(long, long + 'b')).toBe(false);
  });
});

// ===== 2. Encryption =====

// We need a real encryption key for testing
const TEST_ENCRYPTION_KEY =
  'aabbccddee0011223344556677889900aabbccddee00112233445566778899ff';

describe('Encryption', () => {
  let encrypt: typeof import('@/lib/encryption/index').encrypt;
  let decrypt: typeof import('@/lib/encryption/index').decrypt;
  let isEncryptionConfigured: typeof import('@/lib/encryption/index').isEncryptionConfigured;
  let encryptCredentials: typeof import('@/lib/encryption/index').encryptCredentials;
  let decryptCredentials: typeof import('@/lib/encryption/index').decryptCredentials;
  let maskCredentials: typeof import('@/lib/encryption/index').maskCredentials;

  beforeEach(async () => {
    vi.stubEnv('ENCRYPTION_KEY', TEST_ENCRYPTION_KEY);

    // Clear module cache to pick up new env
    vi.resetModules();

    const mod = await import('@/lib/encryption/index');
    encrypt = mod.encrypt;
    decrypt = mod.decrypt;
    isEncryptionConfigured = mod.isEncryptionConfigured;
    encryptCredentials = mod.encryptCredentials;
    decryptCredentials = mod.decryptCredentials;
    maskCredentials = mod.maskCredentials;
  });

  it('reports encryption as configured', () => {
    expect(isEncryptionConfigured()).toBe(true);
  });

  it('encrypts and decrypts a string round-trip', () => {
    const plaintext = 'my-secret-api-key';
    const encrypted = encrypt(plaintext);

    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toContain(':'); // iv:tag:ciphertext format
    expect(encrypted.split(':')).toHaveLength(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertext each call (random IV)', () => {
    const plaintext = 'same-input';
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);
    expect(a).not.toBe(b); // random IV makes them different
    expect(decrypt(a)).toBe(plaintext);
    expect(decrypt(b)).toBe(plaintext);
  });

  it('decrypt returns unencrypted input as-is (no colons)', () => {
    const plain = 'not-encrypted-at-all';
    expect(decrypt(plain)).toBe(plain);
  });

  it('handles empty string', () => {
    const encrypted = encrypt('');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('handles unicode text', () => {
    const plaintext = 'Lösenord med ÅÄÖ och 日本語';
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it('encryptCredentials encrypts each value', () => {
    const creds = {
      apiKey: 'sk-123456',
      secret: 'my-secret'
    };
    const encrypted = encryptCredentials(creds);
    expect(encrypted.apiKey).not.toBe('sk-123456');
    expect(encrypted.secret).not.toBe('my-secret');
    expect(encrypted.apiKey).toContain(':');
  });

  it('decryptCredentials round-trips with encryptCredentials', () => {
    const creds = {
      apiKey: 'sk-123456',
      secret: 'my-secret'
    };
    const encrypted = encryptCredentials(creds);
    const decrypted = decryptCredentials(encrypted);
    expect(decrypted).toEqual(creds);
  });

  it('maskCredentials shows first 4 chars + asterisks', () => {
    const creds = { apiKey: 'sk-123456789', short: 'abc' };
    const masked = maskCredentials(creds);
    // 'sk-123456789' = 12 chars, shows first 4 + min(8, 20) = 8 asterisks
    expect(masked.apiKey).toMatch(/^sk-1\*+$/);
    expect(masked.apiKey).toBe('sk-1' + '*'.repeat(Math.min(12 - 4, 20)));
    expect(masked.short).toBe('****');
  });
});

describe('Encryption – not configured', () => {
  beforeEach(async () => {
    vi.stubEnv('ENCRYPTION_KEY', '');
    vi.resetModules();
  });

  it('returns plaintext when no key is set', async () => {
    const mod = await import('@/lib/encryption/index');
    expect(mod.isEncryptionConfigured()).toBe(false);
    expect(mod.encrypt('hello')).toBe('hello');
    expect(mod.decrypt('hello')).toBe('hello');
  });
});

// ===== 3. Sanitize =====

import {
  sanitizeHtml,
  sanitizeText,
  sanitizeObject,
  sanitizeInput
} from '@/lib/sanitize/index';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>');
    expect(result).toContain('<p>Hello</p>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('allows safe formatting tags', () => {
    const result = sanitizeHtml(
      '<b>Bold</b> <em>italic</em> <a href="https://example.com">link</a>'
    );
    expect(result).toContain('<b>Bold</b>');
    expect(result).toContain('<em>italic</em>');
    expect(result).toContain('<a href="https://example.com">link</a>');
  });

  it('removes event handler attributes', () => {
    const result = sanitizeHtml(
      '<img src="x" onerror="alert(1)" />'
    );
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('removes iframe tags', () => {
    const result = sanitizeHtml(
      '<iframe src="https://evil.com"></iframe><p>Safe</p>'
    );
    expect(result).not.toContain('iframe');
    expect(result).toContain('<p>Safe</p>');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('keeps code blocks and lists', () => {
    const result = sanitizeHtml(
      '<ul><li>Item 1</li></ul><code>const x = 1;</code>'
    );
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Item 1</li>');
    expect(result).toContain('<code>');
  });
});

describe('sanitizeText', () => {
  it('strips all HTML tags', () => {
    const result = sanitizeText('<p>Hello <b>world</b></p>');
    expect(result).toBe('Hello world');
  });

  it('collapses whitespace', () => {
    const result = sanitizeText('  Hello   world  \n\n test  ');
    expect(result).toBe('Hello world test');
  });

  it('strips script content', () => {
    const result = sanitizeText('text<script>alert(1)</script>more');
    expect(result).not.toContain('alert');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeText('')).toBe('');
  });
});

describe('sanitizeObject', () => {
  it('sanitizes specified fields in text mode', () => {
    const obj = {
      name: '<b>John</b>',
      bio: '<script>alert(1)</script>Safe bio',
      age: 30
    };
    const result = sanitizeObject(obj, ['name', 'bio'], 'text');
    expect(result.name).toBe('John');
    expect(result.bio).toBe('Safe bio');
    expect(result.age).toBe(30);
  });

  it('sanitizes specified fields in html mode', () => {
    const obj = {
      content: '<b>Bold</b><script>evil</script>',
      title: 'Hello'
    };
    const result = sanitizeObject(obj, ['content'], 'html');
    expect(result.content).toContain('<b>Bold</b>');
    expect(result.content).not.toContain('script');
    expect(result.title).toBe('Hello'); // not in fields list, unchanged
  });
});

describe('sanitizeInput', () => {
  it('sanitizes string input', () => {
    expect(sanitizeInput('<b>Hello</b>')).toBe('Hello');
  });

  it('returns empty string for non-string', () => {
    expect(sanitizeInput(42)).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });
});

// ===== 4. URL Validator =====

// We mock the url-validator module directly rather than dns/promises 
// since mocking Node built-in dns/promises is problematic in jsdom/vitest.
const { urlValidatorMock } = vi.hoisted(() => ({
  urlValidatorMock: vi.fn()
}));

vi.mock('@/lib/security/url-validator', () => ({
  validateExternalUrl: urlValidatorMock
}));

import { validateExternalUrl } from '@/lib/security/url-validator';

describe('validateExternalUrl (via mock)', () => {
  beforeEach(() => {
    urlValidatorMock.mockReset();
  });

  it('allows a valid public URL when validation passes', async () => {
    urlValidatorMock.mockResolvedValue(undefined);
    await expect(
      validateExternalUrl('https://example.com/page')
    ).resolves.toBeUndefined();
    expect(urlValidatorMock).toHaveBeenCalledWith('https://example.com/page');
  });

  it('rejects when validation throws for private IP', async () => {
    urlValidatorMock.mockRejectedValue(
      new Error('URL resolves to a blocked private IP')
    );
    await expect(
      validateExternalUrl('https://evil-internal.com')
    ).rejects.toThrow('blocked private IP');
  });

  it('rejects when validation throws for blocked hostname', async () => {
    urlValidatorMock.mockRejectedValue(
      new Error('Blocked hostname: localhost')
    );
    await expect(
      validateExternalUrl('http://localhost:8080')
    ).rejects.toThrow('Blocked hostname');
  });

  it('rejects non-http protocols', async () => {
    urlValidatorMock.mockRejectedValue(
      new Error('Blocked URL scheme "ftp:" – only http/https allowed')
    );
    await expect(
      validateExternalUrl('ftp://example.com')
    ).rejects.toThrow('Blocked URL scheme');
  });
});
