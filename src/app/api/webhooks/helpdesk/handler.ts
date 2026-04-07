import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createHelpdeskIntegration } from '@/lib/integrations';
import type { HelpdeskProvider } from '@/types/helpdesk';
import { resolveTenantByApiKey } from '@/lib/appwrite/tenant-utils';
import {
  getIntegrationByProvider,
  loadConnectorCredentials
} from '@/features/integrations/actions/integration-crud';
import { handleHelpdeskEvent } from '@/features/integrations/actions/sync-handler';

/**
 * Shared helpdesk webhook handler.
 *
 * Each provider route (intercom/zendesk/salesforce) delegates here after
 * extracting the raw body for signature verification. The webhook:
 *
 * 1. Looks up the integration config by tenant API key
 * 2. Verifies the webhook signature
 * 3. Parses the event into a normalised HelpdeskWebhookEvent
 * 4. Dispatches to the appropriate handler (sync contact, import conversation, etc.)
 */

export async function handleHelpdeskWebhook(
  request: NextRequest,
  provider: HelpdeskProvider
) {
  // Rate limiting
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  // Tenant identification (header only — never from query params)
  const tenantApiKey =
    request.headers.get('x-tenant-api-key');

  if (!tenantApiKey) {
    return NextResponse.json(
      { error: 'Missing tenant API key' },
      { status: 401 }
    );
  }

  try {
    // Resolve tenant from API key
    const tenant = await resolveTenantByApiKey(tenantApiKey);
    if (!tenant) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Load integration config from DB
    const integration = await getIntegrationByProvider(
      tenant.$id,
      provider
    );

    if (!integration) {
      return NextResponse.json(
        { error: `No ${provider} integration configured` },
        { status: 404 }
      );
    }

    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-hub-signature-256') ??
      request.headers.get('x-intercom-signature') ??
      request.headers.get('x-zendesk-webhook-signature') ??
      '';

    // Load connector credentials
    const credentials = await loadConnectorCredentials(
      integration.connectorId
    );

    if (!credentials) {
      return NextResponse.json(
        { error: 'Connector credentials not found' },
        { status: 500 }
      );
    }

    const client = createHelpdeskIntegration(provider, credentials);

    // Verify webhook signature — MANDATORY for all providers
    if (!integration.config.webhookSecret) {
      logger.error(
        `${provider} webhook rejected — no webhookSecret configured for integration`,
        { tenantId: tenant.$id }
      );
      return NextResponse.json(
        { error: 'Webhook signature verification is not configured. Set a webhookSecret in the integration settings.' },
        { status: 500 }
      );
    }

    const valid = client.verifyWebhookSignature(
      rawBody,
      signature,
      integration.config.webhookSecret
    );
    if (!valid) {
      logger.warn(`${provider} webhook signature mismatch`, {
        tenantId: tenant.$id
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Parse event
    const body = JSON.parse(rawBody);
    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => {
      headers[k] = v;
    });

    const event = await client.parseWebhookEvent(body, headers);

    if (!event) {
      // Unknown event type — acknowledge silently
      return NextResponse.json({ ok: true, ignored: true });
    }

    logger.info(`${provider} webhook event`, {
      tenantId: tenant.$id,
      type: event.type,
      externalId: event.externalId
    });

    // Dispatch event to sync handlers
    await handleHelpdeskEvent(tenant.$id, integration, event);

    return NextResponse.json({ ok: true, event: event.type });
  } catch (err) {
    logger.error(`${provider} webhook error`, { err });
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
