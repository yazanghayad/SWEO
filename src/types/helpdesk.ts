/**
 * Helpdesk integration types.
 *
 * These types model the sync / migration layer that connects external helpdesks
 * (Intercom, Zendesk, Salesforce) to the Sweo platform, enabling:
 * - Conversation import & bi-directional sync
 * - Contact/user import
 * - Knowledge base article import
 * - Ticket escalation routing
 * - Webhook-driven real-time updates
 */

// ---------------------------------------------------------------------------
// Provider specifics
// ---------------------------------------------------------------------------

export type HelpdeskProvider = 'intercom' | 'zendesk' | 'salesforce';

// ---------------------------------------------------------------------------
// Integration configuration
// ---------------------------------------------------------------------------

export interface HelpdeskIntegration {
  id: string;
  tenantId: string;
  provider: HelpdeskProvider;
  /** Reference to the data_connector doc that holds credentials */
  connectorId: string;
  status: IntegrationStatus;
  config: IntegrationConfig;
  syncState: SyncState;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationStatus =
  | 'setup'          // initial configuration
  | 'connecting'     // OAuth / credential validation in progress
  | 'connected'      // credentials validated
  | 'syncing'        // initial data import running
  | 'active'         // fully operational
  | 'paused'         // manually paused
  | 'error';         // requires attention

export interface IntegrationConfig {
  /** Which data categories to sync */
  syncConversations: boolean;
  syncContacts: boolean;
  syncArticles: boolean;
  /** Bi-directional sync: write resolved conversations back */
  writeBack: boolean;
  /** Auto-escalate to helpdesk when AI can't resolve */
  autoEscalate: boolean;
  /** Webhook secret for verifying inbound events */
  webhookSecret?: string;
  /** Provider-specific settings */
  providerConfig: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Sync state tracking
// ---------------------------------------------------------------------------

export interface SyncState {
  lastSyncAt: string | null;
  conversationsImported: number;
  contactsImported: number;
  articlesImported: number;
  errors: SyncError[];
  /** Cursor/pagination token for incremental sync */
  cursor?: string;
}

export interface SyncError {
  timestamp: string;
  entity: 'conversation' | 'contact' | 'article';
  externalId: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Normalised helpdesk entities
// ---------------------------------------------------------------------------

export interface HelpdeskConversation {
  externalId: string;
  provider: HelpdeskProvider;
  subject: string;
  status: string;
  priority: string;
  assignee?: string;
  requesterEmail: string;
  requesterName: string;
  messages: HelpdeskMessage[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface HelpdeskMessage {
  externalId: string;
  role: 'customer' | 'agent' | 'system';
  body: string;
  authorName: string;
  authorEmail?: string;
  createdAt: string;
  attachments?: HelpdeskAttachment[];
}

export interface HelpdeskAttachment {
  name: string;
  url: string;
  contentType: string;
  size: number;
}

export interface HelpdeskContact {
  externalId: string;
  provider: HelpdeskProvider;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface HelpdeskArticle {
  externalId: string;
  provider: HelpdeskProvider;
  title: string;
  body: string;
  url?: string;
  category?: string;
  state: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Webhook event (normalised from provider-specific payloads)
// ---------------------------------------------------------------------------

export type HelpdeskWebhookEventType =
  | 'conversation.created'
  | 'conversation.updated'
  | 'conversation.closed'
  | 'conversation.replied'
  | 'contact.created'
  | 'contact.updated'
  | 'article.published'
  | 'article.updated';

export interface HelpdeskWebhookEvent {
  type: HelpdeskWebhookEventType;
  provider: HelpdeskProvider;
  externalId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Escalation request (Sweo → Helpdesk)
// ---------------------------------------------------------------------------

export interface EscalationRequest {
  tenantId: string;
  conversationId: string;
  provider: HelpdeskProvider;
  subject: string;
  description: string;
  customerEmail: string;
  customerName: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  /** Conversation transcript so the agent has context */
  transcript: HelpdeskMessage[];
}

export interface EscalationResult {
  success: boolean;
  externalTicketId?: string;
  externalTicketUrl?: string;
  error?: string;
}
