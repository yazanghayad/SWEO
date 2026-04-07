import { NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import { stripe, STRIPE_CONFIGURED } from '@/lib/stripe';
import type { Tenant, TenantConfig } from '@/types/appwrite';

/**
 * POST /api/billing/portal — Create a Stripe Customer Portal session.
 *
 * Allows customers to manage subscriptions, payment methods, and invoices
 * through Stripe's hosted portal.
 *
 * Returns: { url: string }
 */
export async function POST() {
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    const { databases } = createAdminClient();

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

    const customerId = config.stripeCustomerId as string | undefined;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No Stripe customer linked. Please subscribe first.' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/billing`
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Portal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
