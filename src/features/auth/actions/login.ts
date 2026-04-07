'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Query } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite/server';
import {
  APPWRITE_SESSION_COOKIE,
  APPWRITE_DATABASE,
  sessionCookieOptions
} from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { checkIpRateLimit } from '@/lib/rate-limit';
import { logAuditEventAsync, maskEmail } from '@/lib/audit/logger';

export interface AuthResult {
  error?: string;
}

export async function loginAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  // Rate-limit login by IP to prevent brute-force attacks
  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    '127.0.0.1';
  const rateLimit = await checkIpRateLimit(`login:${ip}`);
  if (!rateLimit.success) {
    logAuditEventAsync('system', 'auth.rate_limited', {
      ip,
      email: maskEmail(formData.get('email')?.toString())
    });
    return { error: 'Too many login attempts. Please try again later.' };
  }

  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  // Keep redirect path OUTSIDE try-catch so redirect() is never caught.
  // Next.js redirect() throws internally — if caught, it breaks the response.
  let redirectTo = '/dashboard/overview';

  try {
    const { account, users, databases } = createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set(
      APPWRITE_SESSION_COOKIE,
      session.secret,
      sessionCookieOptions(new Date(session.expire))
    );

    logAuditEventAsync('system', 'auth.login', { email: maskEmail(email), ip });

    // Check if the user has MFA enabled
    try {
      const user = await users.get(session.userId);
      if (user.mfa) {
        redirectTo = '/auth/mfa-challenge';
      }
    } catch {
      // MFA check failed — continue to dashboard
    }

    // Subdomain is provisioned in the background during signup
    // but users always stay on app.sweo.se for now
  } catch (err: unknown) {
    logAuditEventAsync('system', 'auth.login_failed', {
      email: maskEmail(email),
      ip,
      reason: err instanceof Error ? err.message : 'unknown'
    });
    return { error: 'Login failed. Check your credentials.' };
  }

  redirect(redirectTo);
}
