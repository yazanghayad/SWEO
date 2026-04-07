'use server';

import { OAuthProvider } from 'node-appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT } from '@/lib/appwrite/constants';

/**
 * Initiate Google OAuth2 login via Appwrite.
 *
 * Returns the redirect URL that the client should navigate to.
 * Appwrite will redirect the user to Google, and after consent
 * Google redirects back to our success/failure URLs.
 */
export async function getGoogleOAuthUrl(): Promise<string> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const successUrl = `${appUrl}/api/auth/callback/google`;
  const failureUrl = `${appUrl}/auth/sign-in?error=oauth_failed`;

  // Build the Appwrite OAuth2 redirect URL
  // Path: /account/tokens/oauth2/{provider} (Appwrite 1.6+)
  const endpoint = APPWRITE_ENDPOINT;
  const project = APPWRITE_PROJECT;

  const url = new URL(
    `${endpoint}/account/tokens/oauth2/${OAuthProvider.Google}`
  );
  url.searchParams.set('project', project);
  url.searchParams.set('success', successUrl);
  url.searchParams.set('failure', failureUrl);
  url.searchParams.append('scopes[]', 'openid');
  url.searchParams.append('scopes[]', 'email');
  url.searchParams.append('scopes[]', 'profile');

  return url.toString();
}
