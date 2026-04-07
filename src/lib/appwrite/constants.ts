export const APPWRITE_SESSION_COOKIE = 'appwrite_session';

export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? '';
export const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT ?? '';
export const APPWRITE_PROJECT_NAME = process.env.APPWRITE_PROJECT_NAME ?? '';
export const APPWRITE_DATABASE =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE ?? '';
export const APPWRITE_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET ?? '';

/**
 * Whether session cookies should use the `secure` flag.
 * Always true in production. Also true in GitHub Codespaces because
 * the forwarded URL is HTTPS-only (*.app.github.dev).
 */
export const SESSION_COOKIE_SECURE =
  process.env.NODE_ENV === 'production' || process.env.CODESPACES === 'true';

/** Standard cookie options for the Appwrite session. Provide `expires` separately. */
export function sessionCookieOptions(expires: Date) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: SESSION_COOKIE_SECURE,
    expires,
    // Set cookie on .sweo.se so it works across app.sweo.se and acme.sweo.se
    ...(rootDomain && process.env.NODE_ENV === 'production'
      ? { domain: `.${rootDomain}` }
      : {})
  };
}
