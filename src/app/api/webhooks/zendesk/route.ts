import { NextRequest } from 'next/server';
import { handleHelpdeskWebhook } from '../helpdesk/handler';

/**
 * POST /api/webhooks/zendesk
 *
 * Zendesk webhook endpoint. Receives ticket/user events.
 */
export async function POST(request: NextRequest) {
  return handleHelpdeskWebhook(request, 'zendesk');
}
