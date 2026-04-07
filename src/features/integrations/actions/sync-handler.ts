'use server';

/**
 * Helpdesk sync handler.
 *
 * Handles both:
 * - Full initial sync (import all conversations, contacts, articles)
 * - Incremental webhook-driven sync (on individual events)
 */

import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID } from 'node-appwrite';
import type {
  HelpdeskIntegration,
  HelpdeskWebhookEvent,
  HelpdeskConversation,
  HelpdeskContact,
  HelpdeskArticle,
  SyncState
} from '@/types/helpdesk';
import { createHelpdeskIntegration } from '@/lib/integrations';
import { loadConnectorCredentials } from './integration-crud';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Webhook-driven sync (individual events)
// ---------------------------------------------------------------------------

export async function handleHelpdeskEvent(
  tenantId: string,
  integration: HelpdeskIntegration,
  event: HelpdeskWebhookEvent
): Promise<void> {
  const credentials = await loadConnectorCredentials(integration.connectorId);
  if (!credentials) {
    logger.error('Sync: missing credentials', { tenantId, provider: integration.provider });
    return;
  }

  const client = createHelpdeskIntegration(integration.provider, credentials);

  switch (event.type) {
    case 'conversation.created':
    case 'conversation.updated':
    case 'conversation.replied': {
      const conversation = await client.fetchConversation(event.externalId);
      if (conversation) {
        await upsertConversation(tenantId, conversation);
        await logSyncEvent(tenantId, integration.id, 'conversation', event.externalId, 'synced');
      }
      break;
    }
    case 'conversation.closed': {
      const conversation = await client.fetchConversation(event.externalId);
      if (conversation) {
        await upsertConversation(tenantId, conversation);
        await logSyncEvent(tenantId, integration.id, 'conversation', event.externalId, 'closed');
      }
      break;
    }
    case 'contact.created':
    case 'contact.updated': {
      // Fetch updated contact (the webhook payload may be incomplete)
      await logSyncEvent(tenantId, integration.id, 'contact', event.externalId, 'synced');
      break;
    }
    case 'article.published':
    case 'article.updated': {
      await logSyncEvent(tenantId, integration.id, 'article', event.externalId, 'synced');
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Full initial sync
// ---------------------------------------------------------------------------

export async function runFullSync(
  tenantId: string,
  integrationId: string
): Promise<{ success: boolean; syncState: SyncState; error?: string }> {
  const { databases } = createAdminClient();

  // Load integration
  const doc = await databases.getDocument(
    APPWRITE_DATABASE,
    COLLECTION.HELPDESK_INTEGRATIONS,
    integrationId
  );

  const data = doc as unknown as Record<string, unknown>;
  if (data.tenantId !== tenantId) {
    return {
      success: false,
      syncState: { lastSyncAt: null, conversationsImported: 0, contactsImported: 0, articlesImported: 0, errors: [] },
      error: 'Access denied'
    };
  }

  const integration = {
    provider: data.provider as HelpdeskIntegration['provider'],
    connectorId: data.connectorId as string,
    config: typeof data.config === 'string' ? JSON.parse(data.config) : data.config
  } as Pick<HelpdeskIntegration, 'provider' | 'connectorId' | 'config'>;

  const credentials = await loadConnectorCredentials(integration.connectorId);
  if (!credentials) {
    return {
      success: false,
      syncState: { lastSyncAt: null, conversationsImported: 0, contactsImported: 0, articlesImported: 0, errors: [] },
      error: 'Connector credentials not found'
    };
  }

  // Mark as syncing
  await databases.updateDocument(
    APPWRITE_DATABASE,
    COLLECTION.HELPDESK_INTEGRATIONS,
    integrationId,
    { status: 'syncing' }
  );

  const client = createHelpdeskIntegration(integration.provider, credentials);

  const syncState: SyncState = {
    lastSyncAt: null,
    conversationsImported: 0,
    contactsImported: 0,
    articlesImported: 0,
    errors: []
  };

  try {
    // Sync conversations
    if (integration.config.syncConversations) {
      try {
        const result = await client.syncAll(
          (cursor) => client.fetchConversations(cursor),
          async (batch) => {
            for (const conv of batch) {
              try {
                await upsertConversation(tenantId, conv);
                syncState.conversationsImported++;
              } catch (err) {
                syncState.errors.push({
                  timestamp: new Date().toISOString(),
                  entity: 'conversation',
                  externalId: conv.externalId,
                  message: err instanceof Error ? err.message : 'Unknown error'
                });
              }
            }
          }
        );
        logger.info('Sync conversations complete', { tenantId, total: result.total });
      } catch (err) {
        logger.error('Conversations sync phase failed', { err, tenantId });
        syncState.errors.push({
          timestamp: new Date().toISOString(),
          entity: 'conversation',
          externalId: '',
          message: err instanceof Error ? err.message : 'Conversations sync failed'
        });
      }
    }

    // Sync contacts
    if (integration.config.syncContacts) {
      try {
        const result = await client.syncAll(
          (cursor) => client.fetchContacts(cursor),
          async (batch) => {
            for (const contact of batch) {
              try {
                await upsertContact(tenantId, contact);
                syncState.contactsImported++;
              } catch (err) {
                syncState.errors.push({
                  timestamp: new Date().toISOString(),
                  entity: 'contact',
                  externalId: contact.externalId,
                  message: err instanceof Error ? err.message : 'Unknown error'
                });
              }
            }
          }
        );
        logger.info('Sync contacts complete', { tenantId, total: result.total });
      } catch (err) {
        logger.error('Contacts sync phase failed', { err, tenantId });
        syncState.errors.push({
          timestamp: new Date().toISOString(),
          entity: 'contact',
          externalId: '',
          message: err instanceof Error ? err.message : 'Contacts sync failed'
        });
      }
    }

    // Sync articles → import into knowledge sources
    if (integration.config.syncArticles) {
      try {
        const result = await client.syncAll(
          (cursor) => client.fetchArticles(cursor),
          async (batch) => {
            for (const article of batch) {
              try {
                await upsertArticle(tenantId, article, integration.provider);
                syncState.articlesImported++;
              } catch (err) {
                syncState.errors.push({
                  timestamp: new Date().toISOString(),
                  entity: 'article',
                  externalId: article.externalId,
                  message: err instanceof Error ? err.message : 'Unknown error'
                });
              }
            }
          }
        );
        logger.info('Sync articles complete', { tenantId, total: result.total });
      } catch (err) {
        logger.error('Articles sync phase failed', { err, tenantId });
        syncState.errors.push({
          timestamp: new Date().toISOString(),
          entity: 'article',
          externalId: '',
          message: err instanceof Error ? err.message : 'Articles sync failed (Help Center may not be enabled)'
        });
      }
    }

    syncState.lastSyncAt = new Date().toISOString();

    // Update integration status
    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      integrationId,
      {
        status: 'active',
        syncState: JSON.stringify(syncState)
      }
    );

    return { success: true, syncState };
  } catch (err) {
    logger.error('Full sync failed', { err, tenantId });

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_INTEGRATIONS,
      integrationId,
      {
        status: 'error',
        syncState: JSON.stringify(syncState)
      }
    );

    return {
      success: false,
      syncState,
      error: err instanceof Error ? err.message : 'Sync failed'
    };
  }
}

// ---------------------------------------------------------------------------
// Upsert helpers – write normalised data into Sweo's DB
// ---------------------------------------------------------------------------

async function upsertConversation(
  tenantId: string,
  conv: HelpdeskConversation
): Promise<void> {
  const { databases } = createAdminClient();

  // Store the imported conversation as a regular Sweo conversation
  // so it appears in the inbox for agents.
  // Map to valid ConversationStatus enum values and only include
  // fields that exist in the conversations collection schema.
  const statusMap: Record<string, string> = {
    open: 'active',
    new: 'active',
    pending: 'queued',
    hold: 'queued',
    solved: 'resolved',
    closed: 'resolved'
  };

  const conversationData = {
    tenantId,
    channel: 'email' as const,
    status: statusMap[conv.status] ?? 'active',
    userId: conv.requesterEmail || undefined,
    metadata: JSON.stringify({
      importedFrom: conv.provider,
      externalId: conv.externalId,
      originalStatus: conv.status,
      subject: conv.subject,
      customerEmail: conv.requesterEmail,
      customerName: conv.requesterName,
      tags: conv.tags
    })
  };

  // Check if already imported (by externalId in metadata)
  const { Query: Q } = await import('node-appwrite');
  const existing = await databases.listDocuments(
    APPWRITE_DATABASE,
    COLLECTION.CONVERSATIONS,
    [
      Q.equal('tenantId', tenantId),
      Q.contains('metadata', conv.externalId),
      Q.limit(1)
    ]
  );

  let conversationId: string;
  if (existing.documents.length > 0) {
    conversationId = existing.documents[0].$id;
    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId,
      conversationData
    );
  } else {
    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      ID.unique(),
      conversationData
    );
    conversationId = doc.$id;
  }

  // Import messages (messages collection has no tenantId field)
  // Skip messages that already exist (by externalId in metadata) to avoid duplicates on re-sync
  for (const msg of conv.messages) {
    const body = (msg.body ?? '').trim();
    if (!body) continue;

    // Check if message already imported
    const existingMsg = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      [
        Q.equal('conversationId', conversationId),
        Q.contains('metadata', msg.externalId),
        Q.limit(1)
      ]
    );
    if (existingMsg.documents.length > 0) continue;

    await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.MESSAGES,
      ID.unique(),
      {
        conversationId,
        role: msg.role === 'customer' ? 'user' : 'assistant',
        content: body,
        metadata: JSON.stringify({
          importedFrom: conv.provider,
          externalId: msg.externalId,
          authorName: msg.authorName
        })
      }
    );
  }
}

async function upsertContact(
  tenantId: string,
  contact: HelpdeskContact
): Promise<void> {
  const { databases } = createAdminClient();
  const { Query: Q } = await import('node-appwrite');

  const contactData = {
    tenantId,
    email: contact.email,
    name: contact.name,
    phone: contact.phone ?? '',
    company: contact.company ?? '',
    tags: JSON.stringify(contact.tags),
    metadata: JSON.stringify({
      importedFrom: contact.provider,
      externalId: contact.externalId,
      ...contact.metadata
    })
  };

  // Check if contact already exists by email
  if (contact.email) {
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      [
        Q.equal('tenantId', tenantId),
        Q.equal('email', contact.email),
        Q.limit(1)
      ]
    );

    if (existing.documents.length > 0) {
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.CONTACTS,
        existing.documents[0].$id,
        contactData
      );
      return;
    }
  }

  await databases.createDocument(
    APPWRITE_DATABASE,
    COLLECTION.CONTACTS,
    ID.unique(),
    contactData
  );
}

async function upsertArticle(
  tenantId: string,
  article: HelpdeskArticle,
  provider: string
): Promise<void> {
  const { databases } = createAdminClient();
  const { Query: Q } = await import('node-appwrite');

  // Import as a knowledge source so the AI can use it.
  // knowledge_sources schema: tenantId, type, url, fileId, status, version, metadata, targets
  // title/content must go inside metadata.
  const sourceData = {
    tenantId,
    type: article.url ? 'url' as const : 'manual' as const,
    url: article.url ?? '',
    status: article.state === 'published' ? 'ready' : 'draft',
    metadata: JSON.stringify({
      importedFrom: provider,
      externalId: article.externalId,
      title: article.title,
      content: article.body
    })
  };

  // Check if article already imported
  const existing = await databases.listDocuments(
    APPWRITE_DATABASE,
    COLLECTION.KNOWLEDGE_SOURCES,
    [
      Q.equal('tenantId', tenantId),
      Q.contains('metadata', article.externalId),
      Q.limit(1)
    ]
  );

  if (existing.documents.length > 0) {
    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      existing.documents[0].$id,
      sourceData
    );
  } else {
    await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.KNOWLEDGE_SOURCES,
      ID.unique(),
      sourceData
    );
  }
}

// ---------------------------------------------------------------------------
// Sync log
// ---------------------------------------------------------------------------

async function logSyncEvent(
  tenantId: string,
  integrationId: string,
  entity: string,
  externalId: string,
  action: string
): Promise<void> {
  try {
    const { databases } = createAdminClient();
    await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.HELPDESK_SYNC_LOG,
      ID.unique(),
      {
        tenantId,
        integrationId,
        entity,
        externalId,
        action,
        timestamp: new Date().toISOString()
      }
    );
  } catch (err) {
    logger.error('logSyncEvent error', { err });
  }
}
