'use server';

import {
  verifyCode,
  type StoredVerification
} from '@/lib/mail/verification';
import { createAdminClient } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { logger } from '@/lib/logger';

export interface VerifyEmailResult {
  success: boolean;
  error?: string;
  locked?: boolean;
  hoursLeft?: number;
  attemptsLeft?: number;
}

export async function verifyEmailAction(
  code: string,
  email: string
): Promise<VerifyEmailResult> {
  if (!code || code.length !== 6) {
    return { success: false, error: 'Please enter the 6-digit code.' };
  }
  if (!email) {
    return { success: false, error: 'Email is required.' };
  }

  try {
    const { users } = createAdminClient();

    // Find user by email
    const userList = await users.list({
      queries: [Query.equal('email', [email.toLowerCase()])]
    });
    if (userList.total === 0) {
      return { success: false, error: 'Invalid code. Please try again.' };
    }

    const user = userList.users[0];

    // Already verified
    if (user.emailVerification) {
      return { success: true };
    }

    // Get stored verification code from user prefs
    const prefs = user.prefs as Record<string, string>;
    let stored: StoredVerification | null = null;
    try {
      if (prefs.emailVerification) {
        stored = JSON.parse(prefs.emailVerification);
      }
    } catch {
      // corrupted prefs
    }

    const { result, updatedStored } = verifyCode(code, stored);

    // Persist updated attempts/lockout
    if (updatedStored) {
      await users.updatePrefs(user.$id, {
        emailVerification: JSON.stringify(updatedStored)
      });
    }

    if (!result.valid) {
      if (result.reason === 'locked') {
        return {
          success: false,
          locked: true,
          hoursLeft: result.hoursLeft,
          error: `Too many failed attempts. Please try again in ${result.hoursLeft} hours.`
        };
      }
      if (result.reason === 'wrong_code') {
        return {
          success: false,
          attemptsLeft: result.attemptsLeft,
          error: `Wrong code. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? '' : 's'} remaining.`
        };
      }
      if (result.reason === 'expired') {
        return {
          success: false,
          error: 'Code expired. Please request a new one.'
        };
      }
      return {
        success: false,
        error: 'No verification code found. Please request a new one.'
      };
    }

    // Mark email as verified in Appwrite
    await users.updateEmailVerification(user.$id, true);

    // Clear the verification code from prefs
    await users.updatePrefs(user.$id, { emailVerification: '' });

    logger.info('[verify-email] Email verified via code', {
      userId: user.$id
    });

    return { success: true };
  } catch (err) {
    logger.error('[verify-email] Failed to verify', { err });
    return {
      success: false,
      error: 'Verification failed. Please try again.'
    };
  }
}
