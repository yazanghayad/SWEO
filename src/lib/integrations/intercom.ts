/**
 * Intercom integration – fetches conversations, contacts, and articles
 * from the Intercom REST API and normalises them into Sweo types.
 *
 * @see https://developers.intercom.com/docs/references/rest-api/api.intercom.io/
 */

import { createHmac } from 'node:crypto';
import {
  HelpdeskIntegrationBase,
  type HelpdeskCredentials,
  type FetchPageResult
} from './base';
import type {
  HelpdeskConversation,
  HelpdeskMessage,
  HelpdeskContact,
  HelpdeskArticle,
  HelpdeskWebhookEvent,
  HelpdeskWebhookEventType,
  EscalationRequest,
  EscalationResult
} from '@/types/helpdesk';

// ---------------------------------------------------------------------------
// Intercom API response shapes (subset)
// ---------------------------------------------------------------------------

interface ICConversation {
  id: string;
  title?: string;
  state: string;
  priority?: string;
  created_at: number;
  updated_at: number;
  source?: { subject?: string; author?: { email?: string; name?: string } };
  tags?: { tags: Array<{ name: string }> };
  conversation_parts?: {
    conversation_parts: ICConversationPart[];
  };
}

interface ICConversationPart {
  id: string;
  part_type: string;
  body: string | null;
  author: { type: string; name?: string; email?: string };
  created_at: number;
  attachments?: Array<{
    name: string;
    url: string;
    content_type: string;
    filesize: number;
  }>;
}

interface ICContact {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: string;
  created_at: number;
  tags?: { data: Array<{ name: string }> };
  companies?: { data: Array<{ name: string }> };
  custom_attributes?: Record<string, unknown>;
}

interface ICArticle {
  id: string;
  title: string;
  body: string;
  url: string | null;
  state: string;
  parent_id?: number;
  created_at: number;
  updated_at: number;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class IntercomIntegration extends HelpdeskIntegrationBase {
  readonly provider = 'intercom' as const;

  constructor(credentials: HelpdeskCredentials) {
    super(credentials, 'https://api.intercom.io');
  }

  protected getAuthHeaders(): Record<string, string> {
    const token = this.credentials.accessToken ?? this.credentials.apiKey ?? '';
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Intercom-Version': '2.11'
    };
  }

  // -- Test connection -------------------------------------------------------

  async testConnection(): Promise<boolean> {
    try {
      await this.apiFetch<{ type: string }>('/me');
      return true;
    } catch {
      return false;
    }
  }

  // -- Conversations ---------------------------------------------------------

  async fetchConversations(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskConversation>> {
    const params = new URLSearchParams({ per_page: '20' });
    if (cursor) params.set('starting_after', cursor);

    const data = await this.apiFetch<{
      conversations: ICConversation[];
      pages: { next?: { starting_after: string } };
    }>(`/conversations?${params}`);

    return {
      items: data.conversations.map((c) => this.normaliseConversation(c)),
      nextCursor: data.pages.next?.starting_after,
      hasMore: !!data.pages.next
    };
  }

  async fetchConversation(
    externalId: string
  ): Promise<HelpdeskConversation | null> {
    try {
      const c = await this.apiFetch<ICConversation>(
        `/conversations/${encodeURIComponent(externalId)}`
      );
      return this.normaliseConversation(c);
    } catch {
      return null;
    }
  }

  // -- Contacts ---------------------------------------------------------------

  async fetchContacts(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskContact>> {
    const params = new URLSearchParams({ per_page: '50' });
    if (cursor) params.set('starting_after', cursor);

    const data = await this.apiFetch<{
      data: ICContact[];
      pages: { next?: { starting_after: string } };
    }>(`/contacts?${params}`);

    return {
      items: data.data.map((c) => this.normaliseContact(c)),
      nextCursor: data.pages.next?.starting_after,
      hasMore: !!data.pages.next
    };
  }

  // -- Articles ---------------------------------------------------------------

  async fetchArticles(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskArticle>> {
    const params = new URLSearchParams({ per_page: '25' });
    if (cursor) params.set('page', cursor ?? '1');

    const data = await this.apiFetch<{
      data: ICArticle[];
      pages: { page: number; total_pages: number };
    }>(`/articles?${params}`);

    const nextPage = data.pages.page + 1;
    const hasMore = nextPage <= data.pages.total_pages;

    return {
      items: data.data.map((a) => this.normaliseArticle(a)),
      nextCursor: hasMore ? String(nextPage) : undefined,
      hasMore
    };
  }

  // -- Escalation -------------------------------------------------------------

  async escalate(request: EscalationRequest): Promise<EscalationResult> {
    try {
      // Find or create contact in Intercom
      const contact = await this.findOrCreateContact(
        request.customerEmail,
        request.customerName
      );

      // Build conversation body with transcript context
      const body = [
        request.description,
        '',
        '--- Transcript ---',
        ...request.transcript.map(
          (m) => `[${m.role}] ${m.authorName}: ${m.body}`
        )
      ].join('\n');

      // Create a new conversation on behalf of the contact
      const conversation = await this.apiFetch<{ id: string }>(
        '/conversations',
        {
          method: 'POST',
          body: JSON.stringify({
            from: { type: 'user', id: contact.externalId },
            body
          })
        }
      );

      return {
        success: true,
        externalTicketId: conversation.id,
        externalTicketUrl: `https://app.intercom.com/a/apps/_/inbox/conversation/${conversation.id}`
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Escalation failed'
      };
    }
  }

  // -- Reply / Write-back -----------------------------------------------------

  async addComment(
    externalConversationId: string,
    body: string,
    _isPublic?: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiFetch(
        `/conversations/${encodeURIComponent(externalConversationId)}/reply`,
        {
          method: 'POST',
          body: JSON.stringify({
            message_type: 'comment',
            type: 'admin',
            body,
            admin_id: this.credentials.adminId ?? 'unknown'
          })
        }
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to reply'
      };
    }
  }

  // -- Webhooks ---------------------------------------------------------------

  async parseWebhookEvent(
    payload: unknown,
    _headers: Record<string, string>
  ): Promise<HelpdeskWebhookEvent | null> {
    const data = payload as Record<string, unknown>;
    const topic = data.topic as string | undefined;
    if (!topic) return null;
    const eventMap: Record<string, HelpdeskWebhookEventType> = {
      'conversation.created': 'conversation.created',
      'conversation.user.created': 'conversation.created',
      'conversation.user.replied': 'conversation.replied',
      'conversation.admin.replied': 'conversation.replied',
      'conversation.admin.closed': 'conversation.closed',
      'conversation.admin.assigned': 'conversation.updated',
      'contact.created': 'contact.created',
      'contact.updated': 'contact.updated',
      'article.published': 'article.published',
      'article_content.published': 'article.published'
    };

    const eventType = eventMap[topic];
    if (!eventType) return null;

    const item = data.data as Record<string, unknown> | undefined;
    const itemData = (item?.item ?? item) as Record<string, unknown>;

    return {
      type: eventType,
      provider: 'intercom',
      externalId: String(itemData?.id ?? ''),
      data: itemData ?? {},
      timestamp: new Date().toISOString()
    };
  }

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): boolean {
    const computed = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return `sha256=${computed}` === signature || computed === signature;
  }

  // -- Normalisation ----------------------------------------------------------

  private normaliseConversation(c: ICConversation): HelpdeskConversation {
    const parts = c.conversation_parts?.conversation_parts ?? [];
    return {
      externalId: c.id,
      provider: 'intercom',
      subject: c.title ?? c.source?.subject ?? '(no subject)',
      status: c.state ?? 'open',
      priority: c.priority ?? 'normal',
      assignee: undefined,
      requesterEmail: c.source?.author?.email ?? '',
      requesterName: c.source?.author?.name ?? 'Unknown',
      messages: parts.map((p) => this.normalisePart(p)),
      tags: c.tags?.tags?.map((t) => t.name) ?? [],
      createdAt: new Date(c.created_at * 1000).toISOString(),
      updatedAt: new Date(c.updated_at * 1000).toISOString(),
      metadata: {}
    };
  }

  private normalisePart(p: ICConversationPart): HelpdeskMessage {
    const role: HelpdeskMessage['role'] =
      p.author.type === 'admin' || p.author.type === 'bot'
        ? 'agent'
        : p.author.type === 'user'
          ? 'customer'
          : 'system';

    return {
      externalId: p.id,
      role,
      body: p.body ?? '',
      authorName: p.author.name ?? 'Unknown',
      authorEmail: p.author.email,
      createdAt: new Date(p.created_at * 1000).toISOString(),
      attachments: p.attachments?.map((a) => ({
        name: a.name,
        url: a.url,
        contentType: a.content_type,
        size: a.filesize
      }))
    };
  }

  private normaliseContact(c: ICContact): HelpdeskContact {
    return {
      externalId: c.id,
      provider: 'intercom',
      email: c.email ?? '',
      name: c.name ?? '',
      phone: c.phone ?? undefined,
      company: c.companies?.data?.[0]?.name,
      tags: c.tags?.data?.map((t) => t.name) ?? [],
      metadata: c.custom_attributes ?? {},
      createdAt: new Date(c.created_at * 1000).toISOString()
    };
  }

  private normaliseArticle(a: ICArticle): HelpdeskArticle {
    return {
      externalId: String(a.id),
      provider: 'intercom',
      title: a.title,
      body: a.body,
      url: a.url ?? undefined,
      state: a.state === 'published' ? 'published' : 'draft',
      createdAt: new Date(a.created_at * 1000).toISOString(),
      updatedAt: new Date(a.updated_at * 1000).toISOString()
    };
  }

  private async findOrCreateContact(
    email: string,
    name: string
  ): Promise<HelpdeskContact> {
    // Search by email
    const searchResult = await this.apiFetch<{ data: ICContact[] }>(
      '/contacts/search',
      {
        method: 'POST',
        body: JSON.stringify({
          query: {
            field: 'email',
            operator: '=',
            value: email
          }
        })
      }
    );

    if (searchResult.data.length > 0) {
      return this.normaliseContact(searchResult.data[0]);
    }

    // Create new contact
    const created = await this.apiFetch<ICContact>('/contacts', {
      method: 'POST',
      body: JSON.stringify({ role: 'user', email, name })
    });

    return this.normaliseContact(created);
  }
}
