import Stripe from 'stripe';
import { logger } from '@/lib/logger';

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('STRIPE_SECRET_KEY is not set — Stripe features disabled');
}

/**
 * Server-side Stripe client.
 * Only use in API routes and server actions — never expose to the client.
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true
    })
  : (null as unknown as Stripe);

/** Whether Stripe is configured */
export const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY;

/** Webhook signing secret for verifying Stripe webhook payloads */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

/** Map plan names to Stripe Price IDs */
export const PLAN_PRICE_IDS: Record<string, string> = {
  growth: process.env.STRIPE_PRICE_GROWTH ?? process.env.STRIPE_GROWTH_PRICE_ID ?? '',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? process.env.STRIPE_ENTERPRISE_PRICE_ID ?? ''
};

/** Plan display names and features */
export const PLANS = {
  trial: {
    name: 'Trial',
    price: 0,
    interval: null,
    features: ['100 conversations/month', '1 channel', '1 team member']
  },
  growth: {
    name: 'Growth',
    price: 990, // SEK per month
    interval: 'month' as const,
    features: [
      'Unlimited conversations',
      'All channels',
      '10 team members',
      'Knowledge base',
      'Procedures'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 2990, // SEK per month
    interval: 'month' as const,
    features: [
      'Everything in Growth',
      'Unlimited team members',
      'Custom integrations',
      'SLA support',
      'SOC2 compliance'
    ]
  }
} as const;
