import { NextRequest } from 'next/server';
import { handleHelpdeskWebhook } from '../helpdesk/handler';

/**
 * POST /api/webhooks/salesforce
 *
 * Salesforce webhook endpoint. Receives Case/Contact platform events.
 */
export async function POST(request: NextRequest) {
  return handleHelpdeskWebhook(request, 'salesforce');
}
