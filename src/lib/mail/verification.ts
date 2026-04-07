/**
 * Email verification via 6-digit code.
 *
 * Flow:
 *  1. User signs up → generate a 6-digit code, store in Appwrite user prefs
 *  2. Code is emailed to the user
 *  3. User enters code on /auth/verify-email page
 *  4. We verify the code matches and hasn't expired → mark email verified
 *
 * Codes expire after 15 minutes.
 */

import { createHmac } from 'crypto';

const CODE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generate a cryptographically random 6-digit code (100000–999999).
 */
export function generateVerificationCode(): string {
  const raw = createHmac('sha256', Date.now().toString() + Math.random())
    .update(crypto.randomUUID())
    .digest('hex');
  const num = (parseInt(raw.slice(0, 8), 16) % 900000) + 100000;
  return num.toString();
}

const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface StoredVerification {
  code: string;
  exp: number;
  attempts: number;
  lockedUntil?: number; // timestamp — set after MAX_ATTEMPTS
}

/**
 * Create a verification payload to store in Appwrite user prefs.
 */
export function createVerificationPayload(code: string): StoredVerification {
  return {
    code,
    exp: Date.now() + CODE_EXPIRY_MS,
    attempts: 0
  };
}

export type VerifyResult =
  | { valid: true }
  | { valid: false; reason: 'locked'; hoursLeft: number }
  | { valid: false; reason: 'wrong_code'; attemptsLeft: number }
  | { valid: false; reason: 'expired' | 'missing' };

/**
 * Verify a code against the stored payload.
 * Returns a result object with details for the UI.
 */
export function verifyCode(
  input: string,
  stored: StoredVerification | null | undefined
): { result: VerifyResult; updatedStored: StoredVerification | null } {
  if (!stored) {
    return { result: { valid: false, reason: 'missing' }, updatedStored: null };
  }

  // Check lockout
  if (stored.lockedUntil && stored.lockedUntil > Date.now()) {
    const hoursLeft = Math.ceil((stored.lockedUntil - Date.now()) / (60 * 60 * 1000));
    return {
      result: { valid: false, reason: 'locked', hoursLeft },
      updatedStored: stored
    };
  }

  // Check expiry
  if (stored.exp < Date.now()) {
    return { result: { valid: false, reason: 'expired' }, updatedStored: stored };
  }

  // Check code
  if (input.trim() === stored.code) {
    return { result: { valid: true }, updatedStored: null };
  }

  // Wrong code — increment attempts
  const newAttempts = (stored.attempts ?? 0) + 1;
  const updated: StoredVerification = { ...stored, attempts: newAttempts };

  if (newAttempts >= MAX_ATTEMPTS) {
    updated.lockedUntil = Date.now() + LOCKOUT_MS;
    return {
      result: { valid: false, reason: 'locked', hoursLeft: 24 },
      updatedStored: updated
    };
  }

  return {
    result: { valid: false, reason: 'wrong_code', attemptsLeft: MAX_ATTEMPTS - newAttempts },
    updatedStored: updated
  };
}
