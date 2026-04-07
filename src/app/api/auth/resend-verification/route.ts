import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { sendMail } from '@/lib/mail/send';
import {
  generateVerificationCode,
  createVerificationPayload
} from '@/lib/mail/verification';
import { welcomeVerificationEmail } from '@/lib/mail/templates';
import { resendVerificationSchema, formatZodError } from '@/lib/api-schemas';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const { users, databases } = createAdminClient();

    // Find user by email
    const userList = await users.list({
      queries: [Query.equal('email', [email])]
    });
    if (userList.total === 0) {
      // Don't reveal whether the email exists
      return NextResponse.json({ ok: true });
    }

    const user = userList.users[0];

    // Already verified — no need to resend
    if (user.emailVerification) {
      return NextResponse.json({ ok: true });
    }

    // Generate new code and store in prefs
    const code = generateVerificationCode();
    const verificationPayload = createVerificationPayload(code);
    await users.updatePrefs(user.$id, {
      emailVerification: JSON.stringify(verificationPayload)
    });

    // Find tenant for subdomain
    let subdomain = '';
    try {
      const tenants = await databases.listDocuments(
        APPWRITE_DATABASE,
        COLLECTION.TENANTS,
        [Query.equal('userId', [user.$id]), Query.limit(1)]
      );
      if (tenants.total > 0) {
        subdomain = tenants.documents[0].subdomain ?? '';
      }
    } catch {
      // ignore — subdomain is optional for the email
    }

    const emailContent = welcomeVerificationEmail({
      name: user.name || 'there',
      code,
      subdomain
    });

    await sendMail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: ['resend-verification']
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Resend verification error', { err });
    return NextResponse.json(
      { error: 'Failed to resend verification email.' },
      { status: 500 }
    );
  }
}
