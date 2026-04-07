'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionClient } from '@/lib/appwrite/server';
import { APPWRITE_SESSION_COOKIE } from '@/lib/appwrite/constants';

export async function logoutAction() {
  const { account } = await createSessionClient();

  await account.deleteSession('current');

  const cookieStore = await cookies();
  cookieStore.delete(APPWRITE_SESSION_COOKIE);

  // Also clear cross-subdomain cookie (.sweo.se)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (rootDomain && process.env.NODE_ENV === 'production') {
    cookieStore.set(APPWRITE_SESSION_COOKIE, '', {
      path: '/',
      domain: `.${rootDomain}`,
      expires: new Date(0),
      httpOnly: true,
      secure: true
    });
    redirect(`https://app.${rootDomain}/auth/sign-in`);
  }
  redirect('/auth/sign-in');
}
