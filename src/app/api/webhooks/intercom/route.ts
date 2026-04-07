import { NextRequest } from 'next/server';
import { handleHelpdeskWebhook } from '../helpdesk/handler';

/**
 * POST /api/webhooks/intercom
 *
 * Intercom webhook endpoint. Receives conversation/contact/article events.
 */
export async function POST(request: NextRequest) {
  return handleHelpdeskWebhook(request, 'intercom');
}
