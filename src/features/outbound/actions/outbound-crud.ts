'use server';

import { Query } from 'node-appwrite';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { OutboundMessage, OutboundMessageStatus, OutboundChannel } from '@/types/appwrite';
import { safeError } from '@/lib/safe-error';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuthenticatedTenantId(): Promise<string> {
  const { account } = await createSessionClient();
  const user = await account.get();
  const { databases } = createAdminClient();
  const tenants = await databases.listDocuments(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('userId', user.$id), Query.limit(1)]
  );
  if (tenants.documents.length === 0) {
    throw new Error('No tenant found');
  }
  return tenants.documents[0].$id;
}

function serializeDoc<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

// ---------------------------------------------------------------------------
// List outbound messages
// ---------------------------------------------------------------------------

export async function listOutboundMessages(options?: {
  status?: OutboundMessageStatus;
  channel?: OutboundChannel;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: OutboundMessage[];
  total?: number;
  error?: string;
}> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const queries: string[] = [
      Query.equal('tenantId', tenantId),
      Query.limit(options?.limit ?? 50),
      Query.offset(options?.offset ?? 0),
      Query.orderDesc('$createdAt')
    ];

    if (options?.status) {
      queries.push(Query.equal('status', options.status));
    }
    if (options?.channel) {
      queries.push(Query.equal('channel', options.channel));
    }
    if (options?.search) {
      queries.push(Query.search('title', options.search));
    }

    const result = await databases.listDocuments<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      queries
    );

    return {
      success: true,
      data: result.documents.map(serializeDoc),
      total: result.total
    };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to list outbound messages');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Get single outbound message
// ---------------------------------------------------------------------------

export async function getOutboundMessage(
  messageId: string
): Promise<{ success: boolean; data?: OutboundMessage; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const doc = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );

    if (doc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to get outbound message');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Create outbound message
// ---------------------------------------------------------------------------

export async function createOutboundMessage(data: {
  title: string;
  channel: OutboundChannel;
  status?: OutboundMessageStatus;
  content?: Record<string, unknown>;
  audience?: { type: string; rules: Array<{ field: string; operator: string; value: string }> };
  schedule?: { type: 'immediate' | 'scheduled'; sendAt?: string };
}): Promise<{ success: boolean; data?: OutboundMessage; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();
    const { ID } = await import('node-appwrite');

    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      ID.unique(),
      {
        tenantId,
        title: data.title,
        channel: data.channel,
        status: data.status ?? 'draft',
        content: JSON.stringify(data.content ?? { body: '' }),
        audience: JSON.stringify(data.audience ?? { type: 'all', rules: [] }),
        schedule: JSON.stringify(data.schedule ?? { type: 'immediate' }),
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        metadata: '{}'
      } as Record<string, unknown>
    ) as unknown as OutboundMessage;

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to create outbound message');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Update outbound message
// ---------------------------------------------------------------------------

export async function updateOutboundMessage(
  messageId: string,
  data: Partial<{
    title: string;
    channel: OutboundChannel;
    status: OutboundMessageStatus;
    content: Record<string, unknown>;
    audience: { type: string; rules: Array<{ field: string; operator: string; value: string }> };
    schedule: { type: 'immediate' | 'scheduled'; sendAt?: string };
    sentCount: number;
    openRate: number;
    clickRate: number;
  }>
): Promise<{ success: boolean; data?: OutboundMessage; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.channel !== undefined) updatePayload.channel = data.channel;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.content !== undefined) updatePayload.content = JSON.stringify(data.content);
    if (data.audience !== undefined) updatePayload.audience = JSON.stringify(data.audience);
    if (data.schedule !== undefined) updatePayload.schedule = JSON.stringify(data.schedule);
    if (data.sentCount !== undefined) updatePayload.sentCount = data.sentCount;
    if (data.openRate !== undefined) updatePayload.openRate = data.openRate;
    if (data.clickRate !== undefined) updatePayload.clickRate = data.clickRate;

    const doc = await databases.updateDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId,
      updatePayload
    );

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to update outbound message');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Delete outbound message
// ---------------------------------------------------------------------------

export async function deleteOutboundMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );

    return { success: true };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to delete outbound message');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Send / Schedule outbound message
// ---------------------------------------------------------------------------

export async function sendOutboundMessage(
  messageId: string
): Promise<{ success: boolean; scheduled?: boolean; sendAt?: string; sent?: number; failed?: number; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    if (!['draft', 'active'].includes(existing.status)) {
      return { success: false, error: `Cannot send message with status "${existing.status}"` };
    }

    const schedule = JSON.parse(existing.schedule);

    if (schedule.type === 'scheduled' && schedule.sendAt) {
      const sendAt = new Date(schedule.sendAt);
      if (sendAt > new Date()) {
        // Future schedule — mark as active; cron picks it up
        await databases.updateDocument(
          APPWRITE_DATABASE,
          COLLECTION.OUTBOUND_MESSAGES,
          messageId,
          { status: 'active' }
        );
        return { success: true, scheduled: true, sendAt: schedule.sendAt };
      }
    }

    // Send now
    const { sendCampaign } = await import('@/lib/outbound/campaign-sender');
    const result = await sendCampaign(messageId);

    return {
      success: true,
      scheduled: false,
      sent: result.sent,
      failed: result.failed
    };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to send outbound message');
    return { success: false, error: message };
  }
}
