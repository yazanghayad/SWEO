/**
 * AES-256-GCM encryption for sensitive data (connector credentials, etc.).
 *
 * Uses Node.js built-in `crypto` module — zero external dependencies.
 *
 * Format: `iv:authTag:ciphertext` (all base64-encoded)
 *
 * Configuration:
 *   ENCRYPTION_KEY – 32 bytes as hex (64 hex chars)
 */

import crypto from 'node:crypto';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits – recommended for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Get the encryption key from environment.
 * Returns null if not configured.
 */
function getKey(): Buffer | null {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    return null;
  }
  return Buffer.from(hex, 'hex');
}

// ---------------------------------------------------------------------------
// Startup check — hard fail in production, warn in dev
// ---------------------------------------------------------------------------
const _encryptionConfigured = getKey() !== null;
if (!_encryptionConfigured && typeof process !== 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'ENCRYPTION_KEY is not configured — refusing to start in production. ' +
        'Connector credentials require encryption. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  logger.warn(
    'ENCRYPTION_KEY is not configured — connector credentials will be stored in PLAINTEXT. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if encryption is configured.
 */
export function isEncryptionConfigured(): boolean {
  return getKey() !== null;
}

/**
 * Encrypt a plaintext string.
 * Returns the encrypted string in format `iv:authTag:ciphertext` (base64).
 * In production, throws if ENCRYPTION_KEY is not configured.
 * In development, returns plaintext unchanged with a warning.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ENCRYPTION_KEY is not configured — refusing to store credentials in plaintext in production.'
      );
    }
    return plaintext;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string.
 * If the input doesn't look encrypted (no colons), returns it unchanged.
 * In production, throws if ENCRYPTION_KEY is not configured.
 */
export function decrypt(encrypted: string): string {
  const key = getKey();
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ENCRYPTION_KEY is not configured — cannot decrypt credentials in production.'
      );
    }
    return encrypted;
  }

  // Check if the string looks encrypted (format: iv:authTag:ciphertext)
  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    // Not encrypted – return as-is (backwards compatibility)
    return encrypted;
  }

  try {
    const [ivB64, authTagB64, ciphertext] = parts;
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    logger.error('[encryption] Decryption failed', { err });
    // Throw instead of returning raw ciphertext — returning encrypted
    // data as plaintext could expose it to clients.
    throw new Error('Decryption failed: invalid key or corrupted data');
  }
}

/**
 * Encrypt a credentials object (Record<string, string>).
 * Encrypts each value individually.
 */
export function encryptCredentials(
  credentials: Record<string, string>
): Record<string, string> {
  const encrypted: Record<string, string> = {};
  for (const [k, v] of Object.entries(credentials)) {
    encrypted[k] = encrypt(v);
  }
  return encrypted;
}

/**
 * Decrypt a credentials object.
 */
export function decryptCredentials(
  credentials: Record<string, string>
): Record<string, string> {
  const decrypted: Record<string, string> = {};
  for (const [k, v] of Object.entries(credentials)) {
    decrypted[k] = decrypt(v);
  }
  return decrypted;
}

/**
 * Mask credential values for display (show first 4 chars + ***).
 */
export function maskCredentials(
  credentials: Record<string, string>
): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [k, v] of Object.entries(credentials)) {
    if (v.length > 4) {
      masked[k] = `${v.slice(0, 4)}${'*'.repeat(Math.min(v.length - 4, 20))}`;
    } else {
      masked[k] = '****';
    }
  }
  return masked;
}
