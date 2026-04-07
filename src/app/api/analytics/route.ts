/**
 * Analytics API route.
 *
 * GET  /api/analytics?tenantId=xxx&days=30
 *
 * Returns aggregated metrics for a tenant: resolution rate, confidence,
 * conversations by channel, timeseries data, and top topics.
 *
 * Requires session-based authentication (dashboard user).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite/server';
import { getAnalytics } from '@/lib/analytics/analytics-engine';
import { logger } from '@/lib/logger';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/appwrite';
import { analyticsQuerySchema, formatZodError } from '@/lib/api-schemas';
import { apiOk, apiError, apiCatchError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  let account;
  try {
    const { account: sessionAccount } = await createSessionClient();
    account = await sessionAccount.get();
  } catch {
    return apiError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(req);
  if (rateLimitResult) return rateLimitResult;

  // ── Parse params ──────────────────────────────────────────────────────
  const parsed = analyticsQuerySchema.safeParse({
    tenantId: req.nextUrl.searchParams.get('tenantId'),
    days: req.nextUrl.searchParams.get('days') ?? undefined
  });
  if (!parsed.success) {
    return apiError(formatZodError(parsed.error), 400, 'VALIDATION_ERROR');
  }
  const { tenantId, days } = parsed.data;

  // ── Compute analytics ─────────────────────────────────────────────────
  try {
    // Verify the authenticated user owns the requested tenant
    const { databases } = await createSessionClient();
    const tenants = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', account.$id), Query.limit(1)]
    );
    if (
      tenants.documents.length === 0 ||
      tenants.documents[0].$id !== tenantId
    ) {
      return apiError('Forbidden – you do not own this tenant', 403, 'FORBIDDEN');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await getAnalytics(tenantId, startDate, endDate);

    return apiOk({ metrics });
  } catch (err) {
    logger.error('Analytics API error', { tenantId, err });
    return apiCatchError(err, 'Failed to compute analytics');
  }
}
