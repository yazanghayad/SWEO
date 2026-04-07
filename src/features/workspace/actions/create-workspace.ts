'use server';

import { createSessionClient } from '@/lib/appwrite/server';
import { getOrCreateTenant } from '@/lib/appwrite/tenant-helpers';
import { redirect } from 'next/navigation';

/**
 * Server action to create a new workspace (tenant) for the current user.
 */
export async function createWorkspace(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  if (!name || name.length < 2 || name.length > 100) {
    throw new Error('Workspace name must be 2-100 characters');
  }

  const { account } = await createSessionClient();
  const user = await account.get();

  await getOrCreateTenant(user.$id, name);

  redirect('/dashboard/overview');
}
