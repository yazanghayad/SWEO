/**
 * Base helpdesk integration – abstract class for helpdesk providers.
 *
 * Subclasses (Intercom, Zendesk, Salesforce) implement provider-specific
 * API calls while this base class handles common sync orchestration logic.
 */

import type {
  HelpdeskProvider,
  HelpdeskConversation,
  HelpdeskContact,
  HelpdeskArticle,
  HelpdeskWebhookEvent,
  EscalationRequest,
  EscalationResult,
  SyncState
} from '@/types/helpdesk';
import { logger } from '@/lib/logger';

export interface HelpdeskCredentials {
  apiKey?: string;
  accessToken?: string;
  email?: string;
  subdomain?: string;
  instanceUrl?: string;
  adminId?: string;
}

export interface FetchPageResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

// ---------------------------------------------------------------------------
// Abstract base
// ---------------------------------------------------------------------------

export abstract class HelpdeskIntegrationBase {
  abstract readonly provider: HelpdeskProvider;

  protected credentials: HelpdeskCredentials;
  protected baseUrl: string;

  constructor(credentials: HelpdeskCredentials, baseUrl: string) {
    this.credentials = credentials;
    this.baseUrl = baseUrl;
  }

  /** Validate credentials return true if connection is healthy */
  abstract testConnection(): Promise<boolean>;

  // -- Conversations ---------------------------------------------------------

  abstract fetchConversations(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskConversation>>;

  abstract fetchConversation(
    externalId: string
  ): Promise<HelpdeskConversation | null>;

  // -- Contacts ---------------------------------------------------------------

  abstract fetchContacts(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskContact>>;

  // -- Articles ---------------------------------------------------------------

  abstract fetchArticles(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskArticle>>;

  // -- Escalation (Sweo → Helpdesk) ------------------------------------------

  abstract escalate(
    request: EscalationRequest
  ): Promise<EscalationResult>;

  // -- Reply / Write-back (Sweo agent → Helpdesk) ----------------------------

  /** Post a reply to an existing conversation in the external helpdesk. */
  abstract addComment(
    externalId: string,
    body: string,
    isPublic?: boolean
  ): Promise<{ success: boolean; error?: string }>;

  // -- Webhooks ---------------------------------------------------------------

  abstract parseWebhookEvent(
    payload: unknown,
    headers: Record<string, string>
  ): Promise<HelpdeskWebhookEvent | null>;

  abstract verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): boolean;

  // -- Helpers ----------------------------------------------------------------

  protected async apiFetch<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...(options.headers as Record<string, string> ?? {})
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      logger.error(`${this.provider} API error`, {
        status: response.status,
        path,
        body: text.slice(0, 500)
      });
      throw new Error(
        `${this.provider} API returned ${response.status}: ${text.slice(0, 200)}`
      );
    }

    return response.json() as Promise<T>;
  }

  protected abstract getAuthHeaders(): Record<string, string>;

  /**
   * Run a full sync for a given entity type, paging through all results.
   */
  async syncAll<T>(
    fetchPage: (cursor?: string) => Promise<FetchPageResult<T>>,
    onBatch: (items: T[]) => Promise<void>,
    existingCursor?: string
  ): Promise<{ total: number; cursor?: string }> {
    let cursor = existingCursor;
    let total = 0;

    while (true) {
      const page = await fetchPage(cursor);
      if (page.items.length > 0) {
        await onBatch(page.items);
        total += page.items.length;
      }
      if (!page.hasMore || !page.nextCursor) break;
      cursor = page.nextCursor;
    }

    return { total, cursor };
  }

  /**
   * Create an empty sync state.
   */
  static emptySyncState(): SyncState {
    return {
      lastSyncAt: null,
      conversationsImported: 0,
      contactsImported: 0,
      articlesImported: 0,
      errors: []
    };
  }
}
