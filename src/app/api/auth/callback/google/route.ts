import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Query, ID } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite/server';
import {
  APPWRITE_SESSION_COOKIE,
  APPWRITE_DATABASE,
  sessionCookieOptions
} from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { logAuditEventAsync, maskEmail } from '@/lib/audit/logger';
import { logger } from '@/lib/logger';
import { applyIpRateLimit } from '@/lib/rate-limit/middleware';

/**
 * GET /api/auth/callback/google
 *
 * Appwrite redirects here after Google OAuth consent.
 * Query params: userId, secret (from Appwrite OAuth2 token exchange).
 *
 * Flow:
 * 1. Exchange userId + secret for an Appwrite session
 * 2. Set session cookie
 * 3. Check if user has a tenant — if not, redirect to onboarding
 * 4. Redirect to dashboard
 */
export async function GET(request: NextRequest) {
  // Rate limit auth callbacks to prevent abuse
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const userId = request.nextUrl.searchParams.get('userId');
  const secret = request.nextUrl.searchParams.get('secret');

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!userId || !secret) {
    return NextResponse.redirect(
      new URL('/auth/sign-in?error=missing_oauth_params', appUrl)
    );
  }

  try {
    const { account, databases, users } = createAdminClient();

    // Exchange the OAuth2 token for a session
    const session = await account.createSession(userId, secret);

    // Set session cookie
    (await cookies()).set(
      APPWRITE_SESSION_COOKIE,
      session.secret,
      sessionCookieOptions(new Date(session.expire))
    );

    // Get user info
    const user = await users.get(userId);

    logAuditEventAsync('system', 'auth.oauth_login', {
      email: maskEmail(user.email),
      provider: 'google',
      userId
    });

    // Check if MFA is enabled
    if (user.mfa) {
      return NextResponse.redirect(new URL('/auth/mfa-challenge', appUrl));
    }

    // Check if user already has a tenant
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', userId), Query.limit(1)]
    );

    if (existing.documents.length > 0) {
      // Existing user — go to dashboard
      return NextResponse.redirect(new URL('/dashboard/overview', appUrl));
    }

    // New user via Google OAuth — redirect to workspace setup
    return NextResponse.redirect(
      new URL('/auth/setup-workspace', appUrl)
    );
  } catch (err) {
    logger.error('[OAuth Callback] Failed to create session', { err });
    logAuditEventAsync('system', 'auth.oauth_failed', {
      userId,
      reason: err instanceof Error ? err.message : 'unknown'
    });

    return NextResponse.redirect(
      new URL('/auth/sign-in?error=oauth_session_failed', appUrl)
    );
  }
}
