import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_SESSION_COOKIE, sessionCookieOptions } from '@/lib/appwrite/constants';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') ?? '';
  const secret = request.nextUrl.searchParams.get('secret') ?? '';

  if (!userId || !secret) {
    return NextResponse.redirect(
      new URL('/auth/sign-in?error=oauth_failed', request.url)
    );
  }

  try {
    const { account } = createAdminClient();
    const session = await account.createSession(userId, secret);

    (await cookies()).set(APPWRITE_SESSION_COOKIE, session.secret,
      sessionCookieOptions(new Date(session.expire))
    );

    return NextResponse.redirect(
      new URL('/dashboard/overview', request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL('/auth/sign-in?error=oauth_failed', request.url)
    );
  }
}
