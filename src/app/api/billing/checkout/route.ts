import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import {
  stripe,
  STRIPE_CONFIGURED,
  PLAN_PRICE_IDS
} from '@/lib/stripe';
import type { Tenant, TenantConfig } from '@/types/appwrite';

/**
 * POST /api/billing/checkout — Create a Stripe Checkout session.
 *
 * Body: { plan: 'growth' | 'enterprise' }
 * Returns: { url: string } (Stripe Checkout URL to redirect to)
 */
export async function POST(req: NextRequest) {
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  try {
    // Authenticate
    const { account } = await createSessionClient();
    const user = await account.get();
    const { databases } = createAdminClient();

    // Get tenant
    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    if (result.documents.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenant = result.documents[0];
    const config: TenantConfig =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config ?? {});

    const { plan } = await req.json();

    if (!plan || !PLAN_PRICE_IDS[plan]) {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    // Reuse existing Stripe customer or create new one
    let customerId = config.stripeCustomerId as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: tenant.name,
        metadata: {
          tenantId: tenant.$id,
          userId: user.$id
        }
      });
      customerId = customer.id;

      // Persist customer ID
      config.stripeCustomerId = customerId;
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.TENANTS,
        tenant.$id,
        { config: JSON.stringify(config) }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${appUrl}/dashboard/billing?checkout=cancel`,
      metadata: {
        tenantId: tenant.$id,
        plan
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
