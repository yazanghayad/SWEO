/**
 * Pre-built connector templates for popular providers.
 *
 * Selecting a provider template pre-fills the base URL, auth type,
 * and a set of commonly-used endpoints so users don't have to
 * configure everything from scratch.
 */

import type {
  DataConnectorProvider,
  DataConnectorAuthType,
  ConnectorEndpoint
} from '@/types/appwrite';

export interface ConnectorTemplate {
  provider: DataConnectorProvider;
  label: string;
  description: string;
  defaultBaseUrl: string;
  defaultAuthType: DataConnectorAuthType;
  /** Placeholder text for the primary credential field. */
  credentialPlaceholder: string;
  /** Which credential field name the primary secret maps to. */
  credentialKey: string;
  endpoints: ConnectorEndpoint[];
}

// ---------------------------------------------------------------------------
// Shopify
// ---------------------------------------------------------------------------

export const shopifyTemplate: ConnectorTemplate = {
  provider: 'shopify',
  label: 'Shopify',
  description:
    'Connect to your Shopify store to look up orders, customers, and process refunds.',
  defaultBaseUrl: 'https://{shop}.myshopify.com/admin/api/2024-01',
  defaultAuthType: 'api_key',
  credentialPlaceholder: 'shpat_...',
  credentialKey: 'apiKey',
  endpoints: [
    {
      id: 'orders.list',
      method: 'GET',
      path: '/orders.json',
      params: { email: 'string', status: 'string' },
      responseMapping: {
        'orders[0].id': 'order.id',
        'orders[0].name': 'order.name',
        'orders[0].total_price': 'order.total',
        'orders[0].financial_status': 'order.financialStatus',
        'orders[0].fulfillment_status': 'order.fulfillmentStatus'
      }
    },
    {
      id: 'orders.get',
      method: 'GET',
      path: '/orders/{{orderId}}.json',
      params: { orderId: 'string' },
      responseMapping: {
        'order.id': 'order.id',
        'order.name': 'order.name',
        'order.total_price': 'order.total',
        'order.financial_status': 'order.financialStatus',
        'order.fulfillment_status': 'order.fulfillmentStatus',
        'order.line_items': 'order.lineItems'
      }
    },
    {
      id: 'refunds.create',
      method: 'POST',
      path: '/orders/{{orderId}}/refunds.json',
      params: { orderId: 'string' },
      responseMapping: {
        'refund.id': 'refund.id',
        'refund.created_at': 'refund.createdAt'
      }
    },
    {
      id: 'customers.search',
      method: 'GET',
      path: '/customers/search.json',
      params: { query: 'string' },
      responseMapping: {
        'customers[0].id': 'customer.id',
        'customers[0].email': 'customer.email',
        'customers[0].first_name': 'customer.firstName',
        'customers[0].last_name': 'customer.lastName',
        'customers[0].orders_count': 'customer.ordersCount'
      }
    }
  ]
};

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

export const stripeTemplate: ConnectorTemplate = {
  provider: 'stripe',
  label: 'Stripe',
  description:
    'Connect to Stripe to look up payments, subscriptions, and issue refunds.',
  defaultBaseUrl: 'https://api.stripe.com/v1',
  defaultAuthType: 'api_key',
  credentialPlaceholder: 'sk_live_...',
  credentialKey: 'apiKey',
  endpoints: [
    {
      id: 'charges.list',
      method: 'GET',
      path: '/charges',
      params: { customer: 'string', limit: 'string' },
      responseMapping: {
        'data[0].id': 'charge.id',
        'data[0].amount': 'charge.amount',
        'data[0].currency': 'charge.currency',
        'data[0].status': 'charge.status',
        'data[0].receipt_url': 'charge.receiptUrl'
      }
    },
    {
      id: 'charges.get',
      method: 'GET',
      path: '/charges/{{chargeId}}',
      params: { chargeId: 'string' },
      responseMapping: {
        'id': 'charge.id',
        'amount': 'charge.amount',
        'currency': 'charge.currency',
        'status': 'charge.status',
        'receipt_url': 'charge.receiptUrl'
      }
    },
    {
      id: 'refunds.create',
      method: 'POST',
      path: '/refunds',
      params: { charge: 'string', amount: 'string' },
      responseMapping: {
        'id': 'refund.id',
        'amount': 'refund.amount',
        'status': 'refund.status'
      }
    },
    {
      id: 'customers.get',
      method: 'GET',
      path: '/customers/{{customerId}}',
      params: { customerId: 'string' },
      responseMapping: {
        'id': 'customer.id',
        'email': 'customer.email',
        'name': 'customer.name',
        'balance': 'customer.balance'
      }
    },
    {
      id: 'subscriptions.list',
      method: 'GET',
      path: '/subscriptions',
      params: { customer: 'string', status: 'string' },
      responseMapping: {
        'data[0].id': 'subscription.id',
        'data[0].status': 'subscription.status',
        'data[0].current_period_end': 'subscription.periodEnd'
      }
    }
  ]
};

// ---------------------------------------------------------------------------
// Linear
// ---------------------------------------------------------------------------

export const linearTemplate: ConnectorTemplate = {
  provider: 'linear',
  label: 'Linear',
  description:
    'Connect to Linear to create issues, look up project status, and track bugs.',
  defaultBaseUrl: 'https://api.linear.app',
  defaultAuthType: 'api_key',
  credentialPlaceholder: 'lin_api_...',
  credentialKey: 'apiKey',
  endpoints: [
    {
      id: 'issues.list',
      method: 'POST',
      path: '/graphql',
      params: {},
      responseMapping: {
        'data.issues.nodes[0].id': 'issue.id',
        'data.issues.nodes[0].title': 'issue.title',
        'data.issues.nodes[0].state.name': 'issue.status',
        'data.issues.nodes[0].assignee.name': 'issue.assignee'
      }
    },
    {
      id: 'issues.create',
      method: 'POST',
      path: '/graphql',
      params: { title: 'string', description: 'string', teamId: 'string' },
      responseMapping: {
        'data.issueCreate.issue.id': 'issue.id',
        'data.issueCreate.issue.identifier': 'issue.identifier',
        'data.issueCreate.issue.url': 'issue.url'
      }
    },
    {
      id: 'teams.list',
      method: 'POST',
      path: '/graphql',
      params: {},
      responseMapping: {
        'data.teams.nodes[0].id': 'team.id',
        'data.teams.nodes[0].name': 'team.name',
        'data.teams.nodes[0].key': 'team.key'
      }
    }
  ]
};

// ---------------------------------------------------------------------------
// Zendesk
// ---------------------------------------------------------------------------

export const zendeskTemplate: ConnectorTemplate = {
  provider: 'zendesk',
  label: 'Zendesk',
  description:
    'Connect to Zendesk to look up tickets, users, and manage support workflows.',
  defaultBaseUrl: 'https://{subdomain}.zendesk.com/api/v2',
  defaultAuthType: 'api_key',
  credentialPlaceholder: 'your-api-token',
  credentialKey: 'apiKey',
  endpoints: [
    {
      id: 'tickets.list',
      method: 'GET',
      path: '/tickets.json',
      params: {},
      responseMapping: {
        'tickets[0].id': 'ticket.id',
        'tickets[0].subject': 'ticket.subject',
        'tickets[0].status': 'ticket.status'
      }
    },
    {
      id: 'tickets.get',
      method: 'GET',
      path: '/tickets/{{ticketId}}.json',
      params: { ticketId: 'string' },
      responseMapping: {
        'ticket.id': 'ticket.id',
        'ticket.subject': 'ticket.subject',
        'ticket.status': 'ticket.status',
        'ticket.description': 'ticket.description'
      }
    },
    {
      id: 'users.search',
      method: 'GET',
      path: '/users/search.json',
      params: { query: 'string' },
      responseMapping: {
        'users[0].id': 'user.id',
        'users[0].name': 'user.name',
        'users[0].email': 'user.email'
      }
    }
  ]
};

// ---------------------------------------------------------------------------
// Salesforce
// ---------------------------------------------------------------------------

export const salesforceTemplate: ConnectorTemplate = {
  provider: 'salesforce',
  label: 'Salesforce',
  description:
    'Connect to Salesforce to look up accounts, contacts, and cases.',
  defaultBaseUrl: 'https://{instance}.salesforce.com/services/data/v59.0',
  defaultAuthType: 'oauth',
  credentialPlaceholder: 'Bearer token',
  credentialKey: 'accessToken',
  endpoints: [
    {
      id: 'accounts.query',
      method: 'GET',
      path: '/query',
      params: { q: 'string' },
      responseMapping: {
        'records[0].Id': 'account.id',
        'records[0].Name': 'account.name',
        'records[0].Industry': 'account.industry'
      }
    },
    {
      id: 'contacts.get',
      method: 'GET',
      path: '/sobjects/Contact/{{contactId}}',
      params: { contactId: 'string' },
      responseMapping: {
        'Id': 'contact.id',
        'Name': 'contact.name',
        'Email': 'contact.email',
        'Phone': 'contact.phone'
      }
    },
    {
      id: 'cases.create',
      method: 'POST',
      path: '/sobjects/Case',
      params: { Subject: 'string', Description: 'string' },
      responseMapping: {
        'id': 'case.id',
        'success': 'case.created'
      }
    }
  ]
};

// ---------------------------------------------------------------------------
// Intercom
// ---------------------------------------------------------------------------

export const intercomTemplate: ConnectorTemplate = {
  provider: 'intercom',
  label: 'Intercom',
  description:
    'Connect to Intercom to sync conversations, contacts, and help center articles.',
  defaultBaseUrl: 'https://api.intercom.io',
  defaultAuthType: 'api_key',
  credentialPlaceholder: 'your-access-token',
  credentialKey: 'apiKey',
  endpoints: [
    {
      id: 'conversations.list',
      method: 'GET',
      path: '/conversations',
      params: {},
      responseMapping: {
        'conversations[0].id': 'conversation.id',
        'conversations[0].title': 'conversation.title',
        'conversations[0].state': 'conversation.state',
        'conversations[0].created_at': 'conversation.createdAt'
      }
    },
    {
      id: 'conversations.get',
      method: 'GET',
      path: '/conversations/{{conversationId}}',
      params: { conversationId: 'string' },
      responseMapping: {
        'id': 'conversation.id',
        'title': 'conversation.title',
        'state': 'conversation.state',
        'conversation_parts.conversation_parts': 'conversation.parts'
      }
    },
    {
      id: 'contacts.list',
      method: 'GET',
      path: '/contacts',
      params: {},
      responseMapping: {
        'data[0].id': 'contact.id',
        'data[0].email': 'contact.email',
        'data[0].name': 'contact.name',
        'data[0].role': 'contact.role'
      }
    },
    {
      id: 'contacts.search',
      method: 'POST',
      path: '/contacts/search',
      params: { query: 'string' },
      responseMapping: {
        'data[0].id': 'contact.id',
        'data[0].email': 'contact.email',
        'data[0].name': 'contact.name'
      }
    },
    {
      id: 'articles.list',
      method: 'GET',
      path: '/articles',
      params: {},
      responseMapping: {
        'data[0].id': 'article.id',
        'data[0].title': 'article.title',
        'data[0].state': 'article.state',
        'data[0].url': 'article.url'
      }
    },
    {
      id: 'tags.list',
      method: 'GET',
      path: '/tags',
      params: {},
      responseMapping: {
        'data[0].id': 'tag.id',
        'data[0].name': 'tag.name'
      }
    }
  ]
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const CONNECTOR_TEMPLATES: Record<
  Exclude<DataConnectorProvider, 'custom'>,
  ConnectorTemplate
> = {
  shopify: shopifyTemplate,
  stripe: stripeTemplate,
  linear: linearTemplate,
  zendesk: zendeskTemplate,
  salesforce: salesforceTemplate,
  intercom: intercomTemplate
};

/**
 * Get a connector template by provider name.
 * Returns undefined for 'custom' or unknown providers.
 */
export function getConnectorTemplate(
  provider: DataConnectorProvider
): ConnectorTemplate | undefined {
  if (provider === 'custom') return undefined;
  return CONNECTOR_TEMPLATES[provider];
}
