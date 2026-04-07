'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/appwrite';
import { logger } from '@/lib/logger';
import { safeError } from '@/lib/safe-error';

export interface WorkspaceUpdateData {
  name?: string;
  timezone?: string;
  language?: string;
}

export async function updateWorkspaceAction(
  data: WorkspaceUpdateData
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

    // Update config fields
    if (data.timezone) config.timezone = data.timezone;
    if (data.language) config.language = data.language;

    const updateData: Record<string, unknown> = {
      config: JSON.stringify(config)
    };

    if (data.name) {
      updateData.name = data.name;
    }

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenant.$id,
      updateData
    );

    return { success: true };
  } catch (err) {
    logger.error('updateWorkspaceAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to update workspace')
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Security settings                                                  */
/* ------------------------------------------------------------------ */

export interface SecuritySettingsData {
  twoFactor?: boolean;
  sso?: boolean;
  ssoProviderUrl?: string;
  ssoEntityId?: string;
  ssoCertificate?: string;
  passwordPolicy?: string;
  ipAllowlist?: boolean;
  allowedIps?: string;
  sessionTimeout?: string;
  maxSessions?: string;
}

export async function updateSecuritySettingsAction(
  data: SecuritySettingsData
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

    // Merge security settings into config.security
    config.security = {
      ...config.security,
      ...data
    };

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenant.$id,
      { config: JSON.stringify(config) }
    );

    return { success: true };
  } catch (err) {
    logger.error('updateSecuritySettingsAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to update security settings')
    };
  }
}
