'use server';

import { createAdminClient } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { sendMail } from '@/lib/mail/send';
import {
  generateVerificationCode,
  createVerificationPayload
} from '@/lib/mail/verification';
import { passwordResetEmail } from '@/lib/mail/templates';

export interface ForgotPasswordResult {
  success?: boolean;
  error?: string;
  email?: string;
}

/**
 * Step 1: Request password reset code via Resend.
 * Generates a 6-digit code, stores it in user prefs, and emails it.
 */
export async function forgotPasswordAction(
  _prev: ForgotPasswordResult | null,
  formData: FormData
): Promise<ForgotPasswordResult> {
  const email = formData.get('email')?.toString().trim();

  if (!email) {
    return { error: 'Email is required.' };
  }

  try {
    const { users } = createAdminClient();

    // Find user by email
    const userList = await users.list({
      queries: [Query.equal('email', [email.toLowerCase()])]
    });

    if (userList.total === 0) {
      // Don't reveal if email exists — always show success
      return { success: true, email };
    }

    const user = userList.users[0];

    // Generate code and store in prefs
    const code = generateVerificationCode();
    const payload = createVerificationPayload(code);
    await users.updatePrefs(user.$id, {
      passwordReset: JSON.stringify(payload)
    });

    // Send email via Mailgun
    const emailContent = passwordResetEmail({
      name: user.name || 'there',
      code
    });

    await sendMail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: ['password-reset']
    });

    return { success: true, email };
  } catch {
    // Don't reveal errors — always show success
    return { success: true, email };
  }
}
