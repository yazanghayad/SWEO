'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant, TenantConfig } from '@/types/appwrite';
import { safeError } from '@/lib/safe-error';
import { logger } from '@/lib/logger';

// ── Types ──────────────────────────────────────────────────

export interface BillingAddress {
  companyName: string;
  orgNumber: string;
  vatNumber: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  reference: string;
  email: string;
}

export interface SavedPaymentMethod {
  id: string;
  type: string;
  label: string;
  details: string;
  isDefault: boolean;
  addedDate: string;
}

export interface BillingData {
  address: BillingAddress | null;
  paymentMethods: SavedPaymentMethod[];
  plan: string;
  tenantName: string;
}

// ── Helpers ────────────────────────────────────────────────

async function getTenantForCurrentUser() {
  const { account } = await createSessionClient();
  const user = await account.get();
  const { databases } = createAdminClient();

  const result = await databases.listDocuments<Tenant>(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('userId', user.$id), Query.limit(1)]
  );

  if (result.documents.length === 0) {
    throw new Error('Tenant not found');
  }

  const tenant = result.documents[0];
  const config: TenantConfig =
    typeof tenant.config === 'string'
      ? JSON.parse(tenant.config)
      : (tenant.config ?? {});

  return { tenant, config, databases };
}

// ── Actions ────────────────────────────────────────────────

export async function getBillingDataAction(): Promise<{
  success: boolean;
  data?: BillingData;
  error?: string;
}> {
  try {
    const { tenant, config } = await getTenantForCurrentUser();

    return {
      success: true,
      data: {
        address: config.billingAddress ?? null,
        paymentMethods: config.paymentMethods ?? [],
        plan: tenant.plan,
        tenantName: tenant.name,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to load billing data'),
    };
  }
}

export async function saveBillingAddressAction(
  address: BillingAddress
): Promise<{ success: boolean; error?: string }> {
  try {
    const { tenant, config, databases } = await getTenantForCurrentUser();

    config.billingAddress = address;

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenant.$id,
      { config: JSON.stringify(config) }
    );

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to save billing address'),
    };
  }
}

export async function savePaymentMethodsAction(
  methods: SavedPaymentMethod[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { tenant, config, databases } = await getTenantForCurrentUser();

    config.paymentMethods = methods;

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenant.$id,
      { config: JSON.stringify(config) }
    );

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: safeError(err, 'Failed to save payment methods'),
    };
  }
}

// ── Stripe Actions ─────────────────────────────────────────

export async function createCheckoutAction(
  plan: 'growth' | 'enterprise'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { stripe, STRIPE_CONFIGURED, PLAN_PRICE_IDS } = await import('@/lib/stripe');

    if (!STRIPE_CONFIGURED) {
      return { success: false, error: 'Stripe is not configured' };
    }

    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return { success: false, error: `Price ID not configured for plan: ${plan}` };
    }

    const { tenant, config, databases } = await getTenantForCurrentUser();

    const { account } = await createSessionClient();
    const user = await account.get();

    // Reuse existing Stripe customer or create new one
    let customerId = config.stripeCustomerId as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: tenant.name,
        metadata: { tenantId: tenant.$id, userId: user.$id },
      });
      customerId = customer.id;

      config.stripeCustomerId = customerId;
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.TENANTS,
        tenant.$id,
        { config: JSON.stringify(config) }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/settings/billing?checkout=success`,
      cancel_url: `${appUrl}/dashboard/settings/billing?checkout=cancel`,
      metadata: { tenantId: tenant.$id, plan },
    });

    return { success: true, url: session.url ?? undefined };
  } catch (err) {
    logger.error('Billing checkout error', { err });
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

export async function createPortalAction(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const { stripe, STRIPE_CONFIGURED } = await import('@/lib/stripe');

    if (!STRIPE_CONFIGURED) {
      return { success: false, error: 'Stripe is not configured' };
    }

    const { tenant, config } = await getTenantForCurrentUser();

    const customerId = config.stripeCustomerId as string | undefined;

    if (!customerId) {
      return {
        success: false,
        error: 'No Stripe customer linked. Please subscribe first.',
      };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/settings/billing`,
    });

    return { success: true, url: session.url };
  } catch (err) {
    logger.error('Billing portal error', { err });
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}
