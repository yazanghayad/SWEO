/**
 * Salesforce integration – fetches Cases, Contacts, and Knowledge articles
 * from the Salesforce REST API and normalises them into Sweo types.
 *
 * @see https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
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
// Salesforce API response shapes (subset)
// ---------------------------------------------------------------------------

interface SFCase {
  Id: string;
  Subject: string;
  Status: string;
  Priority: string;
  Description: string;
  ContactId: string | null;
  ContactEmail?: string;
  ContactName?: string;
  CaseNumber: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

interface SFCaseComment {
  Id: string;
  CommentBody: string;
  CreatedById: string;
  CreatedByName?: string;
  IsPublished: boolean;
  CreatedDate: string;
}

interface SFContact {
  Id: string;
  Email: string;
  Name: string;
  FirstName: string;
  LastName: string;
  Phone: string | null;
  AccountName?: string;
  CreatedDate: string;
}

interface SFKnowledgeArticle {
  Id: string;
  Title: string;
  Summary?: string;
  ArticleBody__c?: string;
  UrlName: string;
  PublishStatus: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

interface SFQueryResult<T> {
  totalSize: number;
  done: boolean;
  nextRecordsUrl?: string;
  records: T[];
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SalesforceIntegration extends HelpdeskIntegrationBase {
  readonly provider = 'salesforce' as const;

  constructor(credentials: HelpdeskCredentials) {
    const instanceUrl =
      credentials.instanceUrl ?? 'https://login.salesforce.com';
    super(credentials, `${instanceUrl}/services/data/v59.0`);
  }

  protected getAuthHeaders(): Record<string, string> {
    const token = this.credentials.accessToken ?? '';
    return { Authorization: `Bearer ${token}` };
  }

  // -- Test connection -------------------------------------------------------

  async testConnection(): Promise<boolean> {
    try {
      await this.apiFetch<Record<string, unknown>>('/sobjects');
      return true;
    } catch {
      return false;
    }
  }

  // -- Conversations (Cases in Salesforce) -----------------------------------

  async fetchConversations(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskConversation>> {
    const soql = encodeURIComponent(
      'SELECT Id, Subject, Status, Priority, Description, ContactId, CaseNumber, ' +
        'CreatedDate, LastModifiedDate FROM Case ORDER BY LastModifiedDate DESC LIMIT 100'
    );
    const url = cursor ?? `/query?q=${soql}`;
    const data = await this.apiFetch<SFQueryResult<SFCase>>(url);

    const conversations = await Promise.all(
      data.records.map(async (c) => {
        const comments = await this.fetchCaseComments(c.Id);
        return this.normaliseCase(c, comments);
      })
    );

    return {
      items: conversations,
      nextCursor: data.nextRecordsUrl,
      hasMore: !data.done
    };
  }

  async fetchConversation(
    externalId: string
  ): Promise<HelpdeskConversation | null> {
    try {
      const c = await this.apiFetch<SFCase>(
        `/sobjects/Case/${encodeURIComponent(externalId)}`
      );
      const comments = await this.fetchCaseComments(c.Id);
      return this.normaliseCase(c, comments);
    } catch {
      return null;
    }
  }

  // -- Contacts ---------------------------------------------------------------

  async fetchContacts(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskContact>> {
    const soql = encodeURIComponent(
      'SELECT Id, Email, Name, FirstName, LastName, Phone, Account.Name, ' +
        'CreatedDate FROM Contact ORDER BY CreatedDate DESC LIMIT 200'
    );
    const url = cursor ?? `/query?q=${soql}`;
    const data = await this.apiFetch<SFQueryResult<SFContact>>(url);

    return {
      items: data.records.map((c) => this.normaliseContact(c)),
      nextCursor: data.nextRecordsUrl,
      hasMore: !data.done
    };
  }

  // -- Articles (Salesforce Knowledge) ----------------------------------------

  async fetchArticles(
    cursor?: string
  ): Promise<FetchPageResult<HelpdeskArticle>> {
    const soql = encodeURIComponent(
      'SELECT Id, Title, Summary, UrlName, PublishStatus, ' +
        'CreatedDate, LastModifiedDate FROM KnowledgeArticleVersion ' +
        'WHERE PublishStatus = \'Online\' AND Language = \'en_US\' LIMIT 100'
    );
    const url = cursor ?? `/query?q=${soql}`;
    const data = await this.apiFetch<SFQueryResult<SFKnowledgeArticle>>(url);

    return {
      items: data.records.map((a) => this.normaliseArticle(a)),
      nextCursor: data.nextRecordsUrl,
      hasMore: !data.done
    };
  }

  // -- Escalation -------------------------------------------------------------

  async escalate(request: EscalationRequest): Promise<EscalationResult> {
    try {
      const transcriptBody = request.transcript
        .map((m) => `[${m.role}] ${m.authorName}: ${m.body}`)
        .join('\n');

      const result = await this.apiFetch<{ id: string; success: boolean }>(
        '/sobjects/Case',
        {
          method: 'POST',
          body: JSON.stringify({
            Subject: request.subject,
            Description: `${request.description}\n\n--- AI Conversation Transcript ---\n${transcriptBody}`,
            SuppliedEmail: request.customerEmail,
            SuppliedName: request.customerName,
            Priority: this.mapPriority(request.priority),
            Origin: 'AI Agent'
          })
        }
      );

      const instanceHost = new URL(this.baseUrl).origin;
      return {
        success: true,
        externalTicketId: result.id,
        externalTicketUrl: `${instanceHost}/${result.id}`
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
    externalCaseId: string,
    body: string,
    isPublic = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Salesforce uses CaseComment object for replies
      await this.apiFetch('/sobjects/CaseComment', {
        method: 'POST',
        body: JSON.stringify({
          ParentId: externalCaseId,
          CommentBody: body,
          IsPublished: isPublic
        })
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add comment'
      };
    }
  }

  // -- Webhooks (Salesforce Platform Events / Outbound Messages) ---------------

  async parseWebhookEvent(
    payload: unknown,
    _headers: Record<string, string>
  ): Promise<HelpdeskWebhookEvent | null> {
    const data = payload as Record<string, unknown>;
    const eventType = data.eventType as string | undefined;
    if (!eventType) return null;

    const eventMap: Record<string, HelpdeskWebhookEventType> = {
      'Case.created': 'conversation.created',
      'Case.updated': 'conversation.updated',
      'Case.closed': 'conversation.closed',
      'CaseComment.created': 'conversation.replied',
      'Contact.created': 'contact.created',
      'Contact.updated': 'contact.updated'
    };

    const mapped = eventMap[eventType];
    if (!mapped) return null;

    const record = (data.record ?? data) as Record<string, unknown>;

    return {
      type: mapped,
      provider: 'salesforce',
      externalId: String(record.Id ?? record.id ?? ''),
      data: record,
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
    return computed === signature;
  }

  // -- Internal helpers -------------------------------------------------------

  private async fetchCaseComments(
    caseId: string
  ): Promise<SFCaseComment[]> {
    try {
      const soql = encodeURIComponent(
        `SELECT Id, CommentBody, CreatedById, IsPublished, CreatedDate FROM CaseComment WHERE ParentId = '${caseId}' ORDER BY CreatedDate ASC`
      );
      const data = await this.apiFetch<SFQueryResult<SFCaseComment>>(
        `/query?q=${soql}`
      );
      return data.records;
    } catch {
      return [];
    }
  }

  private mapPriority(
    p: 'low' | 'normal' | 'high' | 'urgent'
  ): string {
    const map: Record<string, string> = {
      low: 'Low',
      normal: 'Medium',
      high: 'High',
      urgent: 'High'
    };
    return map[p] ?? 'Medium';
  }

  // -- Normalisation ----------------------------------------------------------

  private normaliseCase(
    c: SFCase,
    comments: SFCaseComment[]
  ): HelpdeskConversation {
    return {
      externalId: c.Id,
      provider: 'salesforce',
      subject: c.Subject || '(no subject)',
      status: c.Status,
      priority: c.Priority ?? 'Medium',
      requesterEmail: c.ContactEmail ?? '',
      requesterName: c.ContactName ?? 'Unknown',
      messages: [
        // The case description is the first "message"
        {
          externalId: `${c.Id}-desc`,
          role: 'customer' as const,
          body: c.Description ?? '',
          authorName: c.ContactName ?? 'Customer',
          createdAt: c.CreatedDate,
          authorEmail: c.ContactEmail
        },
        ...comments.map((cm) => this.normaliseComment(cm))
      ],
      tags: [],
      createdAt: c.CreatedDate,
      updatedAt: c.LastModifiedDate,
      metadata: { caseNumber: c.CaseNumber }
    };
  }

  private normaliseComment(c: SFCaseComment): HelpdeskMessage {
    return {
      externalId: c.Id,
      role: c.IsPublished ? 'customer' : 'agent',
      body: c.CommentBody ?? '',
      authorName: c.CreatedByName ?? String(c.CreatedById),
      createdAt: c.CreatedDate
    };
  }

  private normaliseContact(c: SFContact): HelpdeskContact {
    return {
      externalId: c.Id,
      provider: 'salesforce',
      email: c.Email ?? '',
      name: c.Name ?? `${c.FirstName ?? ''} ${c.LastName ?? ''}`.trim(),
      phone: c.Phone ?? undefined,
      company: c.AccountName,
      tags: [],
      metadata: {},
      createdAt: c.CreatedDate
    };
  }

  private normaliseArticle(a: SFKnowledgeArticle): HelpdeskArticle {
    return {
      externalId: a.Id,
      provider: 'salesforce',
      title: a.Title,
      body: a.ArticleBody__c ?? a.Summary ?? '',
      state: a.PublishStatus === 'Online' ? 'published' : 'draft',
      createdAt: a.CreatedDate,
      updatedAt: a.LastModifiedDate
    };
  }
}
