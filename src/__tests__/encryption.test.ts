import { describe, it, expect, vi, beforeEach } from 'vitest';

// Don't use the global encryption mock – test the real module
vi.unmock('@/lib/encryption/index');

// But we need to mock the logger
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

describe('encryption module', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe('without ENCRYPTION_KEY', () => {
    beforeEach(() => {
      vi.stubEnv('ENCRYPTION_KEY', '');
      vi.stubEnv('NODE_ENV', 'test');
    });

    it('isEncryptionConfigured returns false', async () => {
      const { isEncryptionConfigured } = await import(
        '@/lib/encryption/index'
      );
      expect(isEncryptionConfigured()).toBe(false);
    });

    it('encrypt returns plaintext in non-production', async () => {
      const { encrypt } = await import('@/lib/encryption/index');
      const result = encrypt('my-secret-value');
      expect(result).toBe('my-secret-value');
    });

    it('decrypt returns input unchanged', async () => {
      const { decrypt } = await import('@/lib/encryption/index');
      const result = decrypt('plaintext-value');
      expect(result).toBe('plaintext-value');
    });
  });

  describe('with valid ENCRYPTION_KEY', () => {
    const testKey =
      'a'.repeat(64); // 32 bytes hex = 64 hex chars

    beforeEach(() => {
      vi.stubEnv('ENCRYPTION_KEY', testKey);
      vi.stubEnv('NODE_ENV', 'test');
    });

    it('isEncryptionConfigured returns true', async () => {
      const { isEncryptionConfigured } = await import(
        '@/lib/encryption/index'
      );
      expect(isEncryptionConfigured()).toBe(true);
    });

    it('encrypt produces iv:authTag:ciphertext format', async () => {
      const { encrypt } = await import('@/lib/encryption/index');
      const result = encrypt('hello world');

      const parts = result.split(':');
      expect(parts).toHaveLength(3);
      // Each part should be base64
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('decrypt reverses encrypt', async () => {
      const { encrypt, decrypt } = await import('@/lib/encryption/index');

      const original = 'super-secret-api-key-12345';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
      expect(encrypted).not.toBe(original);
    });

    it('different encryptions produce different ciphertexts (random IV)', async () => {
      const { encrypt } = await import('@/lib/encryption/index');

      const a = encrypt('same-value');
      const b = encrypt('same-value');

      expect(a).not.toBe(b); // Different IVs
    });
  });

  describe('encryptCredentials / decryptCredentials', () => {
    const testKey = 'b'.repeat(64);

    beforeEach(() => {
      vi.stubEnv('ENCRYPTION_KEY', testKey);
    });

    it('encrypts and decrypts all fields in an object', async () => {
      const { encryptCredentials, decryptCredentials } = await import(
        '@/lib/encryption/index'
      );

      const creds = {
        clientId: 'abc123',
        clientSecret: 'supersecret',
        apiKey: 'sk-xxx-yyy-zzz'
      };

      const encrypted = encryptCredentials(creds);

      // All values should be encrypted (contain colons)
      expect(encrypted.clientId).toContain(':');
      expect(encrypted.clientSecret).toContain(':');

      const decrypted = decryptCredentials(encrypted);
      expect(decrypted).toEqual(creds);
    });
  });

  describe('maskCredentials', () => {
    it('masks values showing first 4 chars', async () => {
      const { maskCredentials } = await import('@/lib/encryption/index');

      const result = maskCredentials({
        token: 'sk_live_1234567890',
        short: 'abc'
      });

      // 'sk_live_1234567890' is 18 chars: first 4 + min(14, 20) = 14 stars
      expect(result.token).toBe('sk_l**************');
      expect(result.short).toBe('****');
    });
  });
});
