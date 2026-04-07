'use server';

import { createAdminClient } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';

export interface ResetPasswordResult {
  success?: boolean;
  error?: string;
}

/**
 * Step 2b: Set a new password using the one-time reset token.
 * The token was issued after verifying the 6-digit code.
 */
export async function resetPasswordAction(
  _prev: ResetPasswordResult | null,
  formData: FormData
): Promise<ResetPasswordResult> {
  const email = formData.get('email')?.toString().trim();
  const token = formData.get('token')?.toString().trim();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();

  if (!email || !token) {
    return { error: 'Invalid reset session. Please start over.' };
  }

  if (!password || !confirmPassword) {
    return { error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    const { users } = createAdminClient();

    // Find user by email
    const userList = await users.list({
      queries: [Query.equal('email', [email.toLowerCase()])]
    });
    if (userList.total === 0) {
      return { error: 'Invalid reset session. Please start over.' };
    }

    const user = userList.users[0];

    // Verify the one-time token from prefs
    const prefs = user.prefs as Record<string, string>;
    let storedToken: { token: string; exp: number } | null = null;
    try {
      if (prefs.resetToken) {
        storedToken = JSON.parse(prefs.resetToken);
      }
    } catch {
      // corrupted
    }

    if (!storedToken || storedToken.token !== token) {
      return { error: 'Invalid or expired reset session. Please start over.' };
    }

    if (storedToken.exp < Date.now()) {
      // Clear expired token
      await users.updatePrefs(user.$id, { resetToken: '' });
      return { error: 'Reset session expired. Please start over.' };
    }

    // Update password
    await users.updatePassword(user.$id, password);

    // Clear the token from prefs
    await users.updatePrefs(user.$id, { resetToken: '' });

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to reset password. Please try again.';
    return { error: message };
  }
}
