'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';

export interface OnboardingData {
  companyName: string;
  industry: string;
  companySize: string;
  timezone: string;
  language: string;
  channels: string[];
  aiAgentName: string;
  aiTone: string;
  aiInstructions: string;
}

export async function completeOnboardingAction(
  data: OnboardingData
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

    // Update config with onboarding data
    config.onboarded = true;
    config.companyName = data.companyName;
    config.industry = data.industry;
    config.companySize = data.companySize;
    config.timezone = data.timezone;
    config.language = data.language;
    config.channels = data.channels;
    config.aiSettings = {
      enabled: true,
      agentName: data.aiAgentName || 'AI Agent',
      tone: data.aiTone || 'professional',
      instructions: data.aiInstructions || ''
    };

    // Update tenant name to company name if provided
    const updateData: Record<string, unknown> = {
      config: JSON.stringify(config)
    };
    if (data.companyName) {
      updateData.name = data.companyName;
    }

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenant.$id,
      updateData
    );

    return { success: true };
  } catch (err) {
    logger.error('completeOnboardingAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to save onboarding')
    };
  }
}

export async function checkOnboardingStatusAction(): Promise<{
  onboarded: boolean;
  error?: string;
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
      return { onboarded: false };
    }

    const tenant = result.documents[0];
    const config =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config ?? {});

    return { onboarded: config.onboarded === true };
  } catch {
    return { onboarded: true }; // Fail open to not block existing users
  }
}
