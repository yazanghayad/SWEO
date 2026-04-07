/**
 * Helpdesk integration registry.
 *
 * Factory and utilities for creating provider-specific integration instances.
 */

export { HelpdeskIntegrationBase } from './base';
export { IntercomIntegration } from './intercom';
export { ZendeskIntegration } from './zendesk';
export { SalesforceIntegration } from './salesforce';

import type { HelpdeskProvider } from '@/types/helpdesk';
import type { HelpdeskCredentials } from './base';
import { HelpdeskIntegrationBase } from './base';
import { IntercomIntegration } from './intercom';
import { ZendeskIntegration } from './zendesk';
import { SalesforceIntegration } from './salesforce';

/**
 * Create a helpdesk integration instance based on the provider.
 */
export function createHelpdeskIntegration(
  provider: HelpdeskProvider,
  credentials: HelpdeskCredentials
): HelpdeskIntegrationBase {
  switch (provider) {
    case 'intercom':
      return new IntercomIntegration(credentials);
    case 'zendesk':
      return new ZendeskIntegration(credentials);
    case 'salesforce':
      return new SalesforceIntegration(credentials);
    default:
      throw new Error(`Unsupported helpdesk provider: ${provider}`);
  }
}

/** Providers that support deep helpdesk integration */
export const HELPDESK_PROVIDERS: HelpdeskProvider[] = [
  'intercom',
  'zendesk',
  'salesforce'
];

/** Display info for each helpdesk provider */
export const HELPDESK_PROVIDER_INFO: Record<
  HelpdeskProvider,
  { label: string; description: string }
> = {
  intercom: {
    label: 'Intercom',
    description:
      'Import conversations, contacts, and help center articles from Intercom.'
  },
  zendesk: {
    label: 'Zendesk',
    description:
      'Import tickets, users, and knowledge base articles from Zendesk.'
  },
  salesforce: {
    label: 'Salesforce',
    description:
      'Import cases, contacts, and knowledge articles from Salesforce Service Cloud.'
  }
};
