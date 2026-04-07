'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { logger } from '@/lib/logger';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import {
  getAnalytics,
  type AnalyticsMetrics
} from '@/lib/analytics/analytics-engine';
import type { Tenant } from '@/types/appwrite';
import { safeError } from '@/lib/safe-error';
import { cache } from 'react';

export interface OverviewData {
  metrics: AnalyticsMetrics;
  recentConversations: RecentConversation[];
  tenant: Tenant;
}

export interface RecentConversation {
  id: string;
  visitorName: string;
  visitorEmail: string;
  firstMessage: string;
  status: string;
  channel: string;
  createdAt: string;
}

/**
 * React.cache() deduplicates calls within the same server request.
 * The four overview parallel routes all invoke this action, so without
 * caching the same analytics query would run 4×.  With cache() the
 * heavy work happens once and subsequent calls return the memoised result.
 */
export const getOverviewDataAction = cache(async function getOverviewDataAction(): Promise<{
  success: boolean;
  data?: OverviewData;
  error?: string;
}> {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    const { databases } = createAdminClient();

    // Get tenant
    const tenantResult = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    if (tenantResult.documents.length === 0) {
      return { success: false, error: 'No tenant found' };
    }

    const tenant = tenantResult.documents[0] as unknown as Tenant;
    const tenantId = tenant.$id;

    // Get analytics for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const metrics = await getAnalytics(tenantId, startDate, endDate);

    // Get recent conversations
    let recentConversations: RecentConversation[] = [];
    try {
      const convResult = await databases.listDocuments(
        APPWRITE_DATABASE,
        COLLECTION.CONVERSATIONS,
        [
          Query.equal('tenantId', tenantId),
          Query.orderDesc('$createdAt'),
          Query.limit(5)
        ]
      );
      recentConversations = convResult.documents.map((doc) => ({
        id: doc.$id,
        visitorName: (doc.visitorName as string) || 'Anonymous',
        visitorEmail: (doc.visitorEmail as string) || '',
        firstMessage: (doc.firstMessage as string) || '',
        status: (doc.status as string) || 'active',
        channel: (doc.channel as string) || 'web',
        createdAt: doc.$createdAt
      }));
    } catch {
      // Conversations collection may not exist yet
    }

    return {
      success: true,
      data: {
        metrics,
        recentConversations,
        tenant: JSON.parse(JSON.stringify(tenant))
      }
    };
  } catch (err) {
    logger.error('getOverviewDataAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to load overview')
    };
  }
});
