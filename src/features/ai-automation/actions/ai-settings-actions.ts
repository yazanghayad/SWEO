'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';

export interface AISettings {
  enabled: boolean;
  agentName: string;
  tone: string;
  instructions: string;
  channels: {
    web: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  inboxAI: {
    compose: boolean;
    summarize: boolean;
    autofill: boolean;
    articles: boolean;
  };
  automationRules: AutomationRule[];
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export async function getAISettingsAction(): Promise<{
  success: boolean;
  settings?: AISettings;
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
      return { success: false, error: 'Tenant not found' };
    }

    const tenant = result.documents[0];
    const config =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config ?? {});

    const aiSettings: AISettings = {
      enabled: config.aiSettings?.enabled ?? true,
      agentName: config.aiSettings?.agentName ?? 'AI Agent',
      tone: config.aiSettings?.tone ?? 'professional',
      instructions: config.aiSettings?.instructions ?? '',
      channels: {
        web: config.aiSettings?.channels?.web ?? true,
        email: config.aiSettings?.channels?.email ?? true,
        whatsapp: config.aiSettings?.channels?.whatsapp ?? false,
        sms: config.aiSettings?.channels?.sms ?? false
      },
      inboxAI: {
        compose: config.aiSettings?.inboxAI?.compose ?? true,
        summarize: config.aiSettings?.inboxAI?.summarize ?? true,
        autofill: config.aiSettings?.inboxAI?.autofill ?? true,
        articles: config.aiSettings?.inboxAI?.articles ?? true
      },
      automationRules: config.aiSettings?.automationRules ?? []
    };

    return { success: true, settings: aiSettings };
  } catch (err) {
    logger.error('getAISettingsAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to load AI settings')
    };
  }
}

export async function updateAISettingsAction(
  settings: AISettings
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

    config.aiSettings = settings;

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenant.$id,
      { config: JSON.stringify(config) }
    );

    return { success: true };
  } catch (err) {
    logger.error('updateAISettingsAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to save AI settings')
    };
  }
}
