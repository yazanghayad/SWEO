'use server';

import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { logger } from '@/lib/logger';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query, ID } from 'node-appwrite';
import {
  getAuthenticatedTenantContext,
  getAuthenticatedTenantId
} from '@/lib/appwrite/get-authenticated-tenant';
import type {
  Conversation,
  ConversationStatus,
  Message,
  HandoffSummary
} from '@/types/appwrite';
import { CONVERSATION_EVENTS } from '@/lib/conversation/contracts';
import type { InboxCounts } from '@/features/inbox/components/inbox-page-client';
import { safeError } from '@/lib/safe-error';

function isLegacyStatusEnumError(err: unknown): boolean {
  const msg =
    err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  return (
    msg.includes('Attribute "status" has invalid format') &&
    msg.includes('(active, resolved, escalated)')
  );
}

/**
 * Get conversation counts by channel and status for the inbox sidebar.
 */
export async function getInboxCountsAction(
  tenantId: string
): Promise<{ success: boolean; counts?: InboxCounts; error?: string }> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    // Use parallel count queries instead of fetching 5000 documents
    const baseQueries = [Query.equal('tenantId', tenantId)];

    const [totalResult, activeResult, resolvedResult, escalatedResult] =
      await Promise.all([
        // Total count
        databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONVERSATIONS, [
          ...baseQueries,
          Query.limit(1),
          Query.select(['$id'])
        ]),
        // Active (open) count
        databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONVERSATIONS, [
          ...baseQueries,
          Query.equal('status', 'active'),
          Query.limit(1),
          Query.select(['$id'])
        ]),
        // Resolved count
        databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONVERSATIONS, [
          ...baseQueries,
          Query.equal('status', 'resolved'),
          Query.limit(1),
          Query.select(['$id'])
        ]),
        // Escalated count
        databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONVERSATIONS, [
          ...baseQueries,
          Query.equal('status', 'escalated'),
          Query.limit(1),
          Query.select(['$id'])
        ])
      ]);

    // Also get channel breakdown (limited to 500 — sufficient for counting
    // distinct channels). Only fetches two tiny fields per doc.
    const channelResult = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      [
        ...baseQueries,
        Query.limit(500),
        Query.select(['channel'])
      ]
    );

    const byChannel: Record<string, number> = {};
    for (const d of channelResult.documents as unknown as Array<{
      channel: string;
    }>) {
      const ch = d.channel ?? 'web';
      byChannel[ch] = (byChannel[ch] ?? 0) + 1;
    }

    // Use Appwrite's `total` field which counts all matching docs regardless of limit
    return {
      success: true,
      counts: {
        total: totalResult.total,
        active: activeResult.total,
        resolved: resolvedResult.total,
        escalated: escalatedResult.total,
        byChannel
      }
    };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to get inbox counts')
    };
  }
}

/**
 * List conversations for a tenant with optional filters.
 */
export async function listConversationsAction(
  tenantId: string,
  options?: {
    status?: ConversationStatus;
    channel?: string;
    source?: string;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{
  success: boolean;
  conversations?: Conversation[];
  total?: number;
  error?: string;
}> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    const queries = [
      Query.equal('tenantId', tenantId),
      Query.orderDesc('$createdAt'),
      Query.limit(options?.limit ?? 25),
      Query.offset(options?.offset ?? 0)
    ];

    if (options?.status) {
      queries.push(Query.equal('status', options.status));
    }
    if (options?.channel) {
      queries.push(Query.equal('channel', options.channel));
    }
    if (options?.source) {
      queries.push(Query.contains('metadata', options.source));
    }
    if (options?.assignedTo) {
      queries.push(Query.equal('assignedTo', options.assignedTo));
    }

    const result = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      queries
    );

    return {
      success: true,
      conversations: result.documents.map((d) =>
        JSON.parse(JSON.stringify(d))
      ) as Conversation[],
      total: result.total
    };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to list conversations')
    };
  }
}

/**
 * Get a single conversation by ID.
 */
export async function getConversationAction(
  conversationId: string,
  tenantId: string
): Promise<{
  success: boolean;
  conversation?: Conversation;
  error?: string;
}> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    const doc = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );

    if ((doc as unknown as Conversation).tenantId !== tenantId) {
      return { success: false, error: 'Not found' };
    }

    return {
      success: true,
      conversation: JSON.parse(JSON.stringify(doc)) as Conversation
    };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to get conversation')
    };
  }
}

/**
 * Get messages for a conversation.
 */
export async function listMessagesAction(
  conversationId: string,
  tenantId: string
): Promise<{
  success: boolean;
  messages?: Message[];
  error?: string;
}> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    // Verify conversation belongs to tenant
    const convo = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );
    if ((convo as unknown as Conversation).tenantId !== tenantId) {
      return { success: false, error: 'Not found' };
    }

    const result = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      [
        Query.equal('conversationId', conversationId),
        Query.orderAsc('$createdAt'),
        Query.limit(100)
      ]
    );

    return {
      success: true,
      messages: result.documents.map((d) =>
        JSON.parse(JSON.stringify(d))
      ) as Message[]
    };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to list messages')
    };
  }
}

/**
 * Update conversation status (resolve / escalate / reopen).
 */
export async function updateConversationStatusAction(
  conversationId: string,
  tenantId: string,
  status: ConversationStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    const convo = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );
    if ((convo as unknown as Conversation).tenantId !== tenantId) {
      return { success: false, error: 'Not found' };
    }

    const update: Record<string, unknown> = { status };
    if (status === 'resolved') {
      update.resolvedAt = new Date().toISOString();
    }

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId,
      update
    );

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        safeError(err, 'Failed to update conversation')
    };
  }
}

/**
 * Update the assignee (agent) of a conversation.
 */
export async function updateConversationAssigneeAction(
  conversationId: string,
  tenantId: string,
  assignedTo: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    const convo = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );
    if ((convo as unknown as Conversation).tenantId !== tenantId) {
      return { success: false, error: 'Not found' };
    }

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId,
      { assignedTo }
    );

    return { success: true };
  } catch (err) {
    logger.error('updateConversationAssigneeAction error', { err });
    return {
      success: false,
      error:
        safeError(err, 'Failed to update assignee')
    };
  }
}

/**
 * Update the snooze / queue state of a conversation via metadata.
 */
export async function updateConversationSnoozeAction(
  conversationId: string,
  tenantId: string,
  snoozed: boolean,
  snoozeUntil?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    const convo = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );
    const conv = convo as unknown as Conversation;
    if (conv.tenantId !== tenantId) {
      return { success: false, error: 'Not found' };
    }

    const existingMeta =
      typeof conv.metadata === 'string'
        ? JSON.parse(conv.metadata)
        : conv.metadata ?? {};

    const updatedMeta = {
      ...existingMeta,
      snoozed,
      snoozedAt: snoozed ? new Date().toISOString() : null,
      snoozeUntil: snoozed ? (snoozeUntil ?? null) : null
    };

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId,
      { metadata: JSON.stringify(updatedMeta) }
    );

    return { success: true };
  } catch (err) {
    logger.error('updateConversationSnoozeAction error', { err });
    return {
      success: false,
      error:
        safeError(err, 'Failed to update snooze state')
    };
  }
}

/**
 * Update arbitrary metadata fields on a conversation.
 *
 * This merges the provided `fields` into the existing metadata JSON,
 * so callers can update one or many keys without overwriting the rest.
 */
export async function updateConversationMetadataAction(
  conversationId: string,
  tenantId: string,
  fields: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify session is valid AND caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    const convo = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );
    const conv = convo as unknown as Conversation;
    if (conv.tenantId !== tenantId) {
      return { success: false, error: 'Not found' };
    }

    const existingMeta =
      typeof conv.metadata === 'string'
        ? JSON.parse(conv.metadata)
        : conv.metadata ?? {};

    const updatedMeta = { ...existingMeta, ...fields };

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId,
      { metadata: JSON.stringify(updatedMeta) }
    );

    return { success: true };
  } catch (err) {
    logger.error('updateConversationMetadataAction error', { err });
    return {
      success: false,
      error:
        safeError(err, 'Failed to update conversation metadata')
    };
  }
}

/**
 * Save an agent (human) reply message to a conversation.
 * This bypasses the AI orchestrator — it's a direct write.
 *
 * If the conversation is in 'queued' or 'escalated' status, automatically
 * transitions to 'human_active' so the AI stops responding.
 */
export async function saveAgentReplyAction(input: {
  conversationId: string;
  tenantId: string;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Verify session is valid AND caller can access this tenant
    const authCtx = await getAuthenticatedTenantContext(input.tenantId);
    const authenticatedTenantId = authCtx.tenantId;
    if (authenticatedTenantId !== input.tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    // Verify conversation belongs to tenant
    const convo = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      input.conversationId
    );
    const conv = convo as unknown as Conversation;
    if (conv.tenantId !== input.tenantId) {
      return { success: false, error: 'Not found' };
    }
    if (conv.status === 'resolved') {
      return { success: false, error: 'Conversation is already closed' };
    }

    if (conv.assignedTo) {
      const normalizedAssignee = conv.assignedTo.trim().toLowerCase();
      const identityCandidates = [
        authCtx.userId,
        authCtx.userName ?? '',
        authCtx.userEmail ?? ''
      ]
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean);

      const isAssignedAgent = identityCandidates.includes(normalizedAssignee);
      if (!isAssignedAgent) {
        return {
          success: false,
          error: 'Forbidden: conversation assigned to another agent'
        };
      }
    }

    // Mark message as sent by a human agent
    const msgMetadata = {
      ...input.metadata,
      senderType: 'human_agent'
    };

    // Create the message
    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      ID.unique(),
      {
        conversationId: input.conversationId,
        role: 'assistant',
        content: input.content,
        confidence: 1,
        citations: JSON.stringify([]),
        metadata: JSON.stringify(msgMetadata)
      }
    );

    // Auto-transition to human_active if coming from queue/escalated/active.
    // Clear resolvedAt defensively to avoid stale "closed" timestamps.
    const updates: Record<string, unknown> = {};
    if (['queued', 'escalated', 'active', 'handoff_requested'].includes(conv.status)) {
      updates.status = 'human_active';
      updates.resolvedAt = null;
    }

    // Track first response time if not set
    if (!conv.firstResponseAt) {
      updates.firstResponseAt = new Date().toISOString();
    }

    // Update assignedTo with handoff metadata
    if (conv.status === 'queued') {
      const existingMeta =
        typeof conv.metadata === 'string'
          ? JSON.parse(conv.metadata)
          : conv.metadata ?? {};

      if (existingMeta.handoff) {
        existingMeta.handoff.assignedAt = new Date().toISOString();
        updates.metadata = JSON.stringify(existingMeta);
      }
    }

    if (Object.keys(updates).length > 0) {
      try {
        await databases.updateDocument(
          APPWRITE_DATABASE,
          COLLECTION.CONVERSATIONS,
          input.conversationId,
          updates
        );
      } catch (err) {
        // Backward compatibility: some deployed DBs still have the old enum
        // for status (active/resolved/escalated). Fall back to escalated.
        if (updates.status === 'human_active' && isLegacyStatusEnumError(err)) {
          await databases.updateDocument(
            APPWRITE_DATABASE,
            COLLECTION.CONVERSATIONS,
            input.conversationId,
            { ...updates, status: 'escalated' }
          );
        } else {
          throw err;
        }
      }
    }

    // -- Write-back to external helpdesk (Zendesk, Intercom, Salesforce) ------
    // If this conversation was imported from a helpdesk, send the reply back
    // so the customer sees it in their original support channel.
    try {
      const meta =
        typeof conv.metadata === 'string'
          ? JSON.parse(conv.metadata)
          : conv.metadata ?? {};

      if (meta.importedFrom && meta.externalId) {
        const { getIntegrationByProvider } = await import(
          '@/features/integrations/actions/integration-crud'
        );
        const { loadConnectorCredentials } = await import(
          '@/features/integrations/actions/integration-crud'
        );
        const { createHelpdeskIntegration } = await import(
          '@/lib/integrations'
        );

        const integration = await getIntegrationByProvider(
          input.tenantId,
          meta.importedFrom
        );

        if (integration) {
          const config =
            typeof integration.config === 'string'
              ? JSON.parse(integration.config)
              : integration.config;

          if (config.writeBack !== false) {
            const credentials = await loadConnectorCredentials(
              integration.connectorId
            );
            if (credentials) {
              const client = createHelpdeskIntegration(
                meta.importedFrom,
                credentials
              );
              const result = await client.addComment(
                meta.externalId,
                input.content
              );
              if (!result.success) {
                logger.warn('Helpdesk write-back failed', {
                  provider: meta.importedFrom,
                  externalId: meta.externalId,
                  error: result.error
                });
              } else {
                // After successful write-back, schedule a delayed sync
                // to pick up any auto-replies from the helpdesk.
                // We use a short delay because Zendesk may take a moment
                // to generate auto-responses.
                syncExternalConversation(
                  input.tenantId,
                  input.conversationId,
                  meta.importedFrom,
                  meta.externalId,
                  credentials,
                  client
                ).catch((e) =>
                  logger.warn('Post-writeback sync failed', { err: e })
                );
              }
            }
          }
        }
      }
    } catch (writeBackErr) {
      // Write-back is best-effort — don't fail the agent's reply
      logger.warn('Helpdesk write-back error', { err: writeBackErr });
    }

    return { success: true, messageId: doc.$id };
  } catch (err) {
    logger.error('saveAgentReplyAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to save reply')
    };
  }
}

/**
 * Close a conversation — sets status to 'resolved' and saves a system
 * message so the customer's widget clearly shows the chat is finished.
 */
export async function closeConversationAction(
  conversationId: string,
  tenantId: string,
  closedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    const convo = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );
    if ((convo as unknown as Conversation).tenantId !== tenantId) {
      return { success: false, error: 'Not found' };
    }

    // Save a system message visible to the customer
    await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      ID.unique(),
      {
        conversationId,
        role: 'system',
        content: 'This conversation has been closed. Thank you for contacting us!',
        confidence: null,
        citations: JSON.stringify([]),
        metadata: JSON.stringify({
          senderType: 'system',
          eventType: CONVERSATION_EVENTS.CLOSED,
          closedBy: closedBy ?? 'agent'
        })
      }
    );

    // Update conversation status
    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId,
      {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      }
    );

    return { success: true };
  } catch (err) {
    logger.error('closeConversationAction error', { err });
    return {
      success: false,
      error: safeError(err, 'Failed to close conversation')
    };
  }
}

/**
 * Get the handoff summary for a conversation (from metadata).
 */
export async function getHandoffSummaryAction(
  conversationId: string,
  tenantId: string
): Promise<{
  success: boolean;
  summary?: HandoffSummary;
  error?: string;
}> {
  try {
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }
    const { databases } = createAdminClient();

    const convo = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );
    const conv = convo as unknown as Conversation;
    if (conv.tenantId !== tenantId) {
      return { success: false, error: 'Not found' };
    }

    const meta =
      typeof conv.metadata === 'string'
        ? JSON.parse(conv.metadata)
        : conv.metadata ?? {};

    return {
      success: true,
      summary: meta.handoff?.summary ?? null
    };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to get handoff summary')
    };
  }
}

// ---------------------------------------------------------------------------
// External helpdesk sync helpers
// ---------------------------------------------------------------------------

/**
 * Sync a single conversation from the external helpdesk, importing any
 * new messages that don't already exist locally. Called after write-back
 * and by the polling action.
 */
async function syncExternalConversation(
  tenantId: string,
  localConversationId: string,
  provider: string,
  externalId: string,
  _credentials: unknown,
  helpdeskClient: { fetchConversation: (id: string) => Promise<{ messages: Array<{ externalId: string; role: string; body: string; authorName?: string }> } | null> }
): Promise<number> {
  const { databases } = createAdminClient();
  const { Query: Q } = await import('node-appwrite');

  const externalConv = await helpdeskClient.fetchConversation(externalId);
  if (!externalConv) return 0;

  // Get existing message externalIds to avoid duplicates
  const existingMsgs = await databases.listDocuments(
    APPWRITE_DATABASE,
    COLLECTION.MESSAGES,
    [
      Q.equal('conversationId', localConversationId),
      Q.limit(500)
    ]
  );

  const existingExternalIds = new Set<string>();
  for (const doc of existingMsgs.documents) {
    try {
      const meta = typeof doc.metadata === 'string'
        ? JSON.parse(doc.metadata)
        : doc.metadata ?? {};
      if (meta.externalId) existingExternalIds.add(String(meta.externalId));
    } catch {
      // ignore parse errors
    }
  }

  // Also check content-based duplicates to avoid re-importing agent replies
  const existingContents = new Set(
    existingMsgs.documents.map((d) => (d as unknown as Message).content?.trim())
  );

  let imported = 0;
  for (const msg of externalConv.messages) {
    const body = (msg.body ?? '').trim();
    if (!body) continue;

    // Skip if we already have this message by externalId or content match
    if (existingExternalIds.has(String(msg.externalId))) continue;
    if (existingContents.has(body)) continue;

    await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      ID.unique(),
      {
        conversationId: localConversationId,
        role: msg.role === 'customer' ? 'user' : 'assistant',
        content: body,
        metadata: JSON.stringify({
          importedFrom: provider,
          externalId: msg.externalId,
          authorName: msg.authorName
        })
      }
    );
    imported++;
  }

  return imported;
}

/**
 * Public server action: refresh messages for an imported conversation
 * by fetching the latest from the external helpdesk.
 * Called by the inbox thread via polling.
 */
export async function refreshExternalMessagesAction(
  conversationId: string,
  tenantId: string
): Promise<{ success: boolean; newMessages: number; error?: string }> {
  try {
    const authenticatedTenantId = await getAuthenticatedTenantId(tenantId);
    if (authenticatedTenantId !== tenantId) {
      return { success: false, newMessages: 0, error: 'Forbidden' };
    }

    const { databases } = createAdminClient();
    const conv = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );

    if ((conv as unknown as Conversation).tenantId !== tenantId) {
      return { success: false, newMessages: 0, error: 'Not found' };
    }

    const meta = typeof conv.metadata === 'string'
      ? JSON.parse(conv.metadata)
      : conv.metadata ?? {};

    if (!meta.importedFrom || !meta.externalId) {
      return { success: true, newMessages: 0 }; // Not an imported conversation
    }

    const { getIntegrationByProvider, loadConnectorCredentials } = await import(
      '@/features/integrations/actions/integration-crud'
    );
    const { createHelpdeskIntegration } = await import('@/lib/integrations');

    const integration = await getIntegrationByProvider(tenantId, meta.importedFrom);
    if (!integration) {
      return { success: false, newMessages: 0, error: 'Integration not found' };
    }

    const credentials = await loadConnectorCredentials(integration.connectorId);
    if (!credentials) {
      return { success: false, newMessages: 0, error: 'Credentials not found' };
    }

    const client = createHelpdeskIntegration(meta.importedFrom, credentials);
    const imported = await syncExternalConversation(
      tenantId,
      conversationId,
      meta.importedFrom,
      meta.externalId,
      credentials,
      client
    );

    return { success: true, newMessages: imported };
  } catch (err) {
    logger.error('refreshExternalMessagesAction error', { err });
    return {
      success: false,
      newMessages: 0,
      error: safeError(err, 'Failed to refresh')
    };
  }
}
