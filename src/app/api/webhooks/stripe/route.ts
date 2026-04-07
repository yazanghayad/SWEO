import { NextRequest, NextResponse } from 'next/server';
import {
  stripe,
  STRIPE_CONFIGURED,
  STRIPE_WEBHOOK_SECRET
} from '@/lib/stripe';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant, TenantConfig } from '@/types/appwrite';
import type Stripe from 'stripe';
import { logger } from '@/lib/logger';

/**
 * Stripe Webhook Handler
 *
 * Verifies the webhook signature using the raw request body,
 * then processes relevant events to sync subscription state
 * back to the Appwrite tenant document.
 *
 * Events handled:
 * - checkout.session.completed — new subscription created
 * - customer.subscription.updated — plan changed, renewal
 * - customer.subscription.deleted — subscription cancelled
 * - invoice.payment_succeeded — payment confirmed
 * - invoice.payment_failed — payment failure
 */

// Disable Next.js body parsing — we need the raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    );
  }

  // ── 1. Read raw body ────────────────────────────────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  // ── 2. Verify webhook signature ─────────────────────────────────────
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    logger.error('Stripe webhook signature verification failed', { error: message });
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // ── 3. Handle event ─────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // Unhandled event type — acknowledge anyway
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Handler error';
    logger.error('Stripe webhook handler error', { eventType: event.type, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

/**
 * Checkout completed — customer just subscribed.
 * Link Stripe customer to Appwrite tenant and activate plan.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  if (!tenantId) {
    logger.warn('Stripe checkout.session.completed missing tenantId in metadata', {
      sessionId: session.id
    });
    return;
  }

  const { databases } = createAdminClient();
  const tenant = await databases.getDocument<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    tenantId
  );

  const config = parseTenantConfig(tenant.config);

  // Store Stripe IDs
  config.stripeCustomerId = session.customer as string;
  config.stripeSubscriptionId = session.subscription as string;
  config.subscriptionStatus = 'active';

  // Determine plan from metadata or price
  const plan = session.metadata?.plan ?? 'growth';

  await databases.updateDocument(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    tenantId,
    {
      plan,
      config: JSON.stringify(config)
    }
  );
}

/**
 * Subscription updated — plan changed, renewed, or payment method updated.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tenant = await findTenantByStripeCustomer(
    subscription.customer as string
  );
  if (!tenant) return;

  const { databases } = createAdminClient();
  const config = parseTenantConfig(tenant.config);

  config.stripeSubscriptionId = subscription.id;
  config.subscriptionStatus = subscription.status;

  // Check if plan changed via price lookup
  const priceId = subscription.items.data[0]?.price.id;
  const plan = planFromPriceId(priceId) ?? tenant.plan;

  await databases.updateDocument(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    tenant.$id,
    {
      plan,
      config: JSON.stringify(config)
    }
  );
}

/**
 * Subscription deleted — customer cancelled or payment failed permanently.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenant = await findTenantByStripeCustomer(
    subscription.customer as string
  );
  if (!tenant) return;

  const { databases } = createAdminClient();
  const config = parseTenantConfig(tenant.config);

  config.subscriptionStatus = 'cancelled';
  config.stripeSubscriptionId = null;

  await databases.updateDocument(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    tenant.$id,
    {
      plan: 'trial', // Downgrade to trial
      config: JSON.stringify(config)
    }
  );
}

/**
 * Invoice payment succeeded — record last payment date.
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  const tenant = await findTenantByStripeCustomer(
    invoice.customer as string
  );
  if (!tenant) return;

  const { databases } = createAdminClient();
  const config = parseTenantConfig(tenant.config);

  config.lastPaymentDate = new Date().toISOString();
  config.lastPaymentAmount = invoice.amount_paid;
  config.lastPaymentCurrency = invoice.currency;
  config.subscriptionStatus = 'active';

  await databases.updateDocument(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    tenant.$id,
    { config: JSON.stringify(config) }
  );
}

/**
 * Invoice payment failed — mark subscription as past_due.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  const tenant = await findTenantByStripeCustomer(
    invoice.customer as string
  );
  if (!tenant) return;

  const { databases } = createAdminClient();
  const config = parseTenantConfig(tenant.config);

  config.subscriptionStatus = 'past_due';
  config.lastPaymentError = new Date().toISOString();

  await databases.updateDocument(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    tenant.$id,
    { config: JSON.stringify(config) }
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTenantConfig(raw: unknown): Record<string, unknown> {
  try {
    if (typeof raw === 'string') return JSON.parse(raw);
    return (raw as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

/**
 * Find tenant by Stripe customer ID stored in config.stripeCustomerId.
 */
async function findTenantByStripeCustomer(
  customerId: string
): Promise<Tenant | null> {
  const { databases } = createAdminClient();

  // Appwrite can't query inside JSON config, so we scan
  // In production, consider a dedicated stripeCustomerId attribute
  const result = await databases.listDocuments<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.limit(200)]
  );

  for (const tenant of result.documents) {
    const config = parseTenantConfig(tenant.config);
    if (config.stripeCustomerId === customerId) {
      return tenant;
    }
  }

  logger.warn('No tenant found for Stripe customer', { customerId });
  return null;
}

/**
 * Reverse-map a Stripe price ID to a plan name.
 */
function planFromPriceId(priceId?: string): string | null {
  if (!priceId) return null;
  const growthPrice = process.env.STRIPE_PRICE_GROWTH;
  const enterprisePrice = process.env.STRIPE_PRICE_ENTERPRISE;

  if (priceId === growthPrice) return 'growth';
  if (priceId === enterprisePrice) return 'enterprise';
  return null;
}
