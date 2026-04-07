'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ID } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite/server';
import { logger } from '@/lib/logger';
import {
  APPWRITE_SESSION_COOKIE,
  APPWRITE_DATABASE,
  sessionCookieOptions
} from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import {
  validateSubdomain,
  normalizeSubdomain,
  isSubdomainAvailable
} from '@/lib/tenant/subdomain';
import { sendMail } from '@/lib/mail/send';
import {
  generateVerificationCode,
  createVerificationPayload
} from '@/lib/mail/verification';
import { welcomeVerificationEmail } from '@/lib/mail/templates';
import type { AuthResult } from './login';
import { safeError } from '@/lib/safe-error';
import { logAuditEventAsync, maskEmail } from '@/lib/audit/logger';

export async function signupAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  const rawSubdomain = formData.get('subdomain')?.toString().trim();

  if (!email || !password || !name) {
    return { error: 'Name, email, and password are required.' };
  }

  // ── Validate subdomain ──
  const subdomain = rawSubdomain ? normalizeSubdomain(rawSubdomain) : '';
  if (!subdomain) {
    return { error: 'A subdomain is required for your workspace.' };
  }
  const subdomainError = validateSubdomain(subdomain);
  if (subdomainError) {
    return { error: subdomainError };
  }
  const available = await isSubdomainAvailable(subdomain);
  if (!available) {
    return { error: 'This subdomain is already taken. Please choose another.' };
  }

  try {
    const { users, account, databases } = createAdminClient();

    // Create user
    const newUser = await users.create({
      userId: ID.unique(),
      email,
      password,
      name
    });

    // Create session
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set(APPWRITE_SESSION_COOKIE, session.secret,
      sessionCookieOptions(new Date(session.expire))
    );

    // Create Appwrite Team for multi-user collaboration
    let teamId: string | undefined;
    try {
      const { createTeam } = await import('@/lib/appwrite/teams');
      teamId = await createTeam(name, newUser.$id);
    } catch (teamErr) {
      logger.warn('Failed to create team during signup', { err: teamErr });
    }

    // Auto-create tenant with subdomain + onboarding flag
    await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      ID.unique(),
      {
        name: name,
        plan: 'trial',
        config: JSON.stringify({
          subdomain,
          timezone: 'UTC',
          language: 'en',
          teamId,
          onboarded: false,
          companyName: '',
          industry: '',
          companySize: '',
          channels: [],
          aiSettings: {
            enabled: true,
            agentName: 'AI Agent',
            tone: 'professional',
            instructions: ''
          }
        }),
        apiKey: crypto.randomUUID().replace(/-/g, ''),
        userId: newUser.$id,
        subdomain
      }
    );

    // ── Send welcome + verification code email ─────────────────────────
    const code = generateVerificationCode();
    const verificationPayload = createVerificationPayload(code);

    // Store code in Appwrite user prefs
    await users.updatePrefs(newUser.$id, {
      emailVerification: JSON.stringify(verificationPayload)
    });

    const emailContent = welcomeVerificationEmail({
      name,
      code,
      subdomain
    });

    // Fire-and-forget — don't block signup if email fails
    sendMail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: ['welcome', 'verification']
    }).catch(() => {}); // logged internally

    // Fire-and-forget — provision subdomain DNS + Vercel domain
    import('@/lib/dns/provision')
      .then(({ provisionSubdomain }) => provisionSubdomain(subdomain))
      .catch(() => {}); // logged internally

    logAuditEventAsync('system', 'auth.signup', { email: maskEmail(email), subdomain, userId: newUser.$id });
  } catch (err: unknown) {
    logAuditEventAsync('system', 'auth.signup_failed', { email: maskEmail(email), subdomain, reason: err instanceof Error ? err.message : 'unknown' });
    const message =
      safeError(err, 'Sign-up failed. Please try again.');
    return { error: message };
  }

  redirect(`/auth/verify-email?email=${encodeURIComponent(email!)}`);
}
