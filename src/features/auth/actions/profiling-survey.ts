'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';

export interface ProfilingSurveyData {
  priorities: string[];
  hasExistingTool: string;
  preferredChannels: string[];
  role: string;
  managesTeam: string;
  startTimeline: string;
}

export async function saveProfilingSurveyAction(
  data: ProfilingSurveyData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const { databases } = createAdminClient();

    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    if (result.documents.length === 0) {
      return { success: false, error: 'Tenant not found' };
    }

    const tenant = result.documents[0];
    const config =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config ?? {});

    config.profilingSurvey = {
      completedAt: new Date().toISOString(),
      priorities: data.priorities,
      hasExistingTool: data.hasExistingTool,
      preferredChannels: data.preferredChannels,
      role: data.role,
      managesTeam: data.managesTeam,
      startTimeline: data.startTimeline
    };

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenant.$id,
      { config: JSON.stringify(config) }
    );

    return { success: true };
  } catch (err) {
    logger.error('saveProfilingSurveyAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to save survey')
    };
  }
}

export async function checkProfilingSurveyAction(): Promise<{
  completed: boolean;
}> {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const { databases } = createAdminClient();

    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    if (result.documents.length === 0) {
      return { completed: false };
    }

    const tenant = result.documents[0];
    const config =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config ?? {});

    return { completed: !!config.profilingSurvey?.completedAt };
  } catch {
    return { completed: true }; // Fail open
  }
}
