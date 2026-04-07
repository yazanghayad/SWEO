/**
 * Zendesk integration – fetches tickets, users, and help center articles
 * from the Zendesk REST API and normalises them into Sweo types.
 *
 * @see https://developer.zendesk.com/api-reference/
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
// Zendesk API response shapes (subset)
// ---------------------------------------------------------------------------

interface ZDTicket {
  id: number;
  subject: string;
  status: string;
  priority: string | null;
  assignee_id: number | null;
  requester_id: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  description: string;
}

interface ZDComment {
  id: number;
  body: string;
  author_id: number;
  public: boolean;
  created_at: string;
  attachments: Array<{
    file_name: string;
    content_url: string;
    content_type: string;
    size: number;
  }>;
}

interface ZDUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  organization_id: number | null;
  tags: string[];
  created_at: string;
  user_fields: Record<string, unknown>;
}

interface ZDArticle {
  id: number;
  title: string;
  body: string;
  html_url: string;
  section_id: number | null;
  draft: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ZendeskIntegration extends HelpdeskIntegrationBase {
  readonly provider = 'zendesk' as const;

  constructor(credentials: HelpdeskCredentials) {
    // Sanitize subdomain: strip protocol, .zendesk.com suffix, slashes
    let subdomain = (credentials.subdomain ?? '').trim();
    subdomain = subdomain.replace(/^https?:\/\//, '');
    subdomain = subdomain.replace(/\.zendesk\.com.*$/i, '');
    subdomain = subdomain.replace(/\/+$/, '');
    super(credentials, `https://${subdomain}.zendesk.com/api/v2`);
  }

  protected getAuthHeaders(): Record<string, string> {
    // OAuth access tokens use Bearer
    if (this.credentials.accessToken) {
      return { Authorization: `Bearer ${this.credentials.accessToken}` };
    }
    // Zendesk API tokens require Basic auth: {email}/token:{apiToken}
    const email = this.credentials.email ?? '';
    const token = this.credentials.apiKey ?? '';
    const basic = Buffer.from(`${email}/token:${token}`).toString('base64');
    return { Authorization: `Basic ${basic}` };
  }

  // -- Test connection -------------------------------------------------------

  async testConnection(): Promise<boolean> {
    try {
      await this.apiFetch<{ user: ZDUser }>('/users/me.json');
      return true;
    } catch {
      return false;
    }
  }

  // -- Conversations (Tickets in Zendesk) ------------------------------------

  async fetchConversations(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskConversation>> {
    const url = cursor ?? '/tickets.json?page[size]=100&sort=-updated_at';
    const data = await this.apiFetch<{
      tickets: ZDTicket[];
      links: { next?: string };
      meta: { has_more: boolean; after_cursor?: string };
    }>(url);

    // For each ticket, also load comments (messages)
    const conversations = await Promise.all(
      data.tickets.map(async (t) => {
        const comments = await this.fetchTicketComments(t.id);
        const requester = await this.fetchUser(t.requester_id);
        return this.normaliseTicket(t, comments, requester);
      })
    );

    return {
      items: conversations,
      nextCursor: data.meta.after_cursor,
      hasMore: data.meta.has_more
    };
  }

  async fetchConversation(
    externalId: string
  ): Promise<HelpdeskConversation | null> {
    try {
      const data = await this.apiFetch<{ ticket: ZDTicket }>(
        `/tickets/${encodeURIComponent(externalId)}.json`
      );
      const comments = await this.fetchTicketComments(data.ticket.id);
      const requester = await this.fetchUser(data.ticket.requester_id);
      return this.normaliseTicket(data.ticket, comments, requester);
    } catch {
      return null;
    }
  }

  // -- Contacts (Users in Zendesk) -------------------------------------------

  async fetchContacts(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskContact>> {
    const url = cursor ?? '/users.json?page[size]=100&role[]=end-user';
    const data = await this.apiFetch<{
      users: ZDUser[];
      meta: { has_more: boolean; after_cursor?: string };
    }>(url);

    return {
      items: data.users.map((u) => this.normaliseUser(u)),
      nextCursor: data.meta.after_cursor,
      hasMore: data.meta.has_more
    };
  }

  // -- Articles (Help Center) ------------------------------------------------

  async fetchArticles(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskArticle>> {
    // Help Center API uses /help_center/
    const url =
      cursor ??
      `${this.baseUrl.replace('/api/v2', '')}/api/v2/help_center/articles.json?page[size]=25`;
    const data = await this.apiFetch<{
      articles: ZDArticle[];
      meta: { has_more: boolean; after_cursor?: string };
    }>(url.replace(this.baseUrl, ''));

    return {
      items: data.articles.map((a) => this.normaliseArticle(a)),
      nextCursor: data.meta.after_cursor,
      hasMore: data.meta.has_more
    };
  }

  // -- Escalation -------------------------------------------------------------

  async escalate(request: EscalationRequest): Promise<EscalationResult> {
    try {
      const transcriptBody = request.transcript
        .map((m) => `[${m.role}] ${m.authorName}: ${m.body}`)
        .join('\n');

      const data = await this.apiFetch<{
        ticket: { id: number };
      }>('/tickets.json', {
        method: 'POST',
        body: JSON.stringify({
          ticket: {
            subject: request.subject,
            comment: {
              body: `${request.description}\n\n--- AI Conversation Transcript ---\n${transcriptBody}`
            },
            requester: {
              email: request.customerEmail,
              name: request.customerName
            },
            priority: request.priority,
            tags: request.tags
          }
        })
      });

      const subdomain = this.credentials.subdomain ?? '';
      return {
        success: true,
        externalTicketId: String(data.ticket.id),
        externalTicketUrl: `https://${subdomain}.zendesk.com/agent/tickets/${data.ticket.id}`
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
    externalTicketId: string,
    body: string,
    isPublic = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiFetch(
        `/tickets/${encodeURIComponent(externalTicketId)}.json`,
        {
          method: 'PUT',
          body: JSON.stringify({
            ticket: {
              comment: {
                body,
                public: isPublic
              }
            }
          })
        }
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add comment'
      };
    }
  }

  // -- Webhooks ---------------------------------------------------------------

  async parseWebhookEvent(
    payload: unknown,
    _headers: Record<string, string>
  ): Promise<HelpdeskWebhookEvent | null> {
    const data = payload as Record<string, unknown>;
    const type = String(data.type ?? '');

    const eventMap: Record<string, HelpdeskWebhookEventType> = {
      'ticket.created': 'conversation.created',
      'ticket.updated': 'conversation.updated',
      'ticket.solved': 'conversation.closed',
      'ticket.comment_added': 'conversation.replied',
      'user.created': 'contact.created',
      'user.updated': 'contact.updated'
    };

    const eventType = eventMap[type];
    if (!eventType) return null;

    const detail = (data.detail ?? data) as Record<string, unknown>;

    return {
      type: eventType,
      provider: 'zendesk',
      externalId: String(detail.id ?? ''),
      data: detail,
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
      .digest('base64');
    return computed === signature;
  }

  // -- Internal helpers -------------------------------------------------------

  private async fetchTicketComments(ticketId: number): Promise<ZDComment[]> {
    try {
      const data = await this.apiFetch<{ comments: ZDComment[] }>(
        `/tickets/${ticketId}/comments.json`
      );
      return data.comments;
    } catch {
      return [];
    }
  }

  private async fetchUser(userId: number): Promise<ZDUser | null> {
    try {
      const data = await this.apiFetch<{ user: ZDUser }>(
        `/users/${userId}.json`
      );
      return data.user;
    } catch {
      return null;
    }
  }

  // Simple LRU to avoid re-fetching the same user repeatedly
  private userCache = new Map<number, ZDUser>();

  // -- Normalisation ----------------------------------------------------------

  private normaliseTicket(
    t: ZDTicket,
    comments: ZDComment[],
    requester: ZDUser | null
  ): HelpdeskConversation {
    return {
      externalId: String(t.id),
      provider: 'zendesk',
      subject: t.subject || '(no subject)',
      status: t.status,
      priority: t.priority ?? 'normal',
      requesterEmail: requester?.email ?? '',
      requesterName: requester?.name ?? 'Unknown',
      messages: comments.map((c) => this.normaliseComment(c)),
      tags: t.tags,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      metadata: {}
    };
  }

  private normaliseComment(c: ZDComment): HelpdeskMessage {
    return {
      externalId: String(c.id),
      role: c.public ? 'customer' : 'agent',
      body: c.body,
      authorName: String(c.author_id),
      createdAt: c.created_at,
      attachments: c.attachments.map((a) => ({
        name: a.file_name,
        url: a.content_url,
        contentType: a.content_type,
        size: a.size
      }))
    };
  }

  private normaliseUser(u: ZDUser): HelpdeskContact {
    return {
      externalId: String(u.id),
      provider: 'zendesk',
      email: u.email,
      name: u.name,
      phone: u.phone ?? undefined,
      tags: u.tags,
      metadata: u.user_fields ?? {},
      createdAt: u.created_at
    };
  }

  private normaliseArticle(a: ZDArticle): HelpdeskArticle {
    return {
      externalId: String(a.id),
      provider: 'zendesk',
      title: a.title,
      body: a.body,
      url: a.html_url,
      state: a.draft ? 'draft' : 'published',
      createdAt: a.created_at,
      updatedAt: a.updated_at
    };
  }
}
