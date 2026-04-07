'use server';

import { createAdminClient } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { createHmac } from 'crypto';
import {
  verifyCode,
  type StoredVerification
} from '@/lib/mail/verification';

export interface VerifyResetCodeResult {
  success?: boolean;
  token?: string;
  email?: string;
  error?: string;
  locked?: boolean;
  hoursLeft?: number;
  attemptsLeft?: number;
}

/**
 * Generate a one-time reset token (expires in 10 minutes).
 */
function generateResetToken(): string {
  return createHmac('sha256', Date.now().toString() + Math.random())
    .update(crypto.randomUUID())
    .digest('hex')
    .slice(0, 64);
}

/**
 * Step 2a: Verify the 6-digit code.
 * On success, generates a one-time token so the user can set a new password.
 */
export async function verifyResetCodeAction(
  _prev: VerifyResetCodeResult | null,
  formData: FormData
): Promise<VerifyResetCodeResult> {
  const email = formData.get('email')?.toString().trim();
  const code = formData.get('code')?.toString().trim();

  if (!email) {
    return { error: 'Email is required.' };
  }

  if (!code || code.length !== 6) {
    return { error: 'Please enter the 6-digit code.' };
  }

  try {
    const { users } = createAdminClient();

    // Find user by email
    const userList = await users.list({
      queries: [Query.equal('email', [email.toLowerCase()])]
    });
    if (userList.total === 0) {
      return { error: 'Invalid code. Please try again.' };
    }

    const user = userList.users[0];

    // Get stored reset code from user prefs
    const prefs = user.prefs as Record<string, string>;
    let stored: StoredVerification | null = null;
    try {
      if (prefs.passwordReset) {
        stored = JSON.parse(prefs.passwordReset);
      }
    } catch {
      // corrupted prefs
    }

    const { result, updatedStored } = verifyCode(code, stored);

    // Persist updated attempts/lockout
    if (updatedStored) {
      await users.updatePrefs(user.$id, {
        passwordReset: JSON.stringify(updatedStored)
      });
    }

    if (!result.valid) {
      if (result.reason === 'locked') {
        return {
          locked: true,
          hoursLeft: result.hoursLeft,
          error: `Too many failed attempts. Please try again in ${result.hoursLeft} hours.`
        };
      }
      if (result.reason === 'wrong_code') {
        return {
          attemptsLeft: result.attemptsLeft,
          error: `Wrong code. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? '' : 's'} remaining.`
        };
      }
      if (result.reason === 'expired') {
        return { error: 'Code expired. Please request a new one.' };
      }
      return { error: 'No reset code found. Please request a new one.' };
    }

    // Code is valid → generate a one-time token (10 min expiry)
    const token = generateResetToken();
    await users.updatePrefs(user.$id, {
      passwordReset: '',
      resetToken: JSON.stringify({
        token,
        exp: Date.now() + 10 * 60 * 1000 // 10 minutes
      })
    });

    return { success: true, token, email };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Something went wrong. Please try again.';
    return { error: message };
  }
}
