/**
 * Cron endpoint for content gap detection (AI Flywheel).
 *
 * Designed to be called by a cron scheduler (e.g. Vercel Cron, GitHub Actions).
 * Iterates over all active tenants and runs the gap detector.
 *
 * Authorization: Bearer token matching CRON_SECRET env variable.
 *
 * POST /api/cron/detect-gaps
 * Headers: Authorization: Bearer <CRON_SECRET>
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import { detectContentGaps } from '@/lib/analytics/gap-detector';
import { safeCompare } from '@/lib/security/timing-safe-compare';
import { logger } from '@/lib/logger';
import type { Tenant } from '@/types/appwrite';

export async function POST(req: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ?? '';

  if (!safeCompare(token, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Run gap detection for all active tenants ──────────────────────────
  const { databases } = createAdminClient();

  let tenants: Tenant[] = [];
  try {
    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.limit(500)]
    );
    tenants = result.documents;
  } catch (err) {
    logger.error('Failed to list tenants for gap detection', { err });
    return NextResponse.json(
      { error: 'Failed to list tenants' },
      { status: 500 }
    );
  }

  const results: Array<{
    tenantId: string;
    suggestions: number;
    error?: string;
  }> = [];

  // Process tenants in parallel batches of 5 to avoid overwhelming services
  const BATCH_SIZE = 5;
  for (let i = 0; i < tenants.length; i += BATCH_SIZE) {
    const batch = tenants.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (tenant) => {
        try {
          const suggestions = await detectContentGaps(tenant.$id);
          return {
            tenantId: tenant.$id,
            suggestions: suggestions.length
          };
        } catch (err) {
          logger.error('Gap detection failed for tenant', { tenantId: tenant.$id, err });
          return {
            tenantId: tenant.$id,
            suggestions: 0,
            error: 'Processing failed'
          };
        }
      })
    );
    for (const r of batchResults) {
      results.push(
        r.status === 'fulfilled'
          ? r.value
          : { tenantId: 'unknown', suggestions: 0, error: 'Processing failed' }
      );
    }
  }

  const totalSuggestions = results.reduce((sum, r) => sum + r.suggestions, 0);
  const failures = results.filter((r) => r.error).length;

  return NextResponse.json({
    success: true,
    tenantsProcessed: tenants.length,
    totalSuggestions,
    failures,
    results
  });
}
