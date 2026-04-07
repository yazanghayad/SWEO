import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import {
  runSimulation,
  type SimulationInput
} from '@/lib/ai/simulation-engine';
import { logAuditEventAsync } from '@/lib/audit/logger';
import { logger } from '@/lib/logger';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/appwrite';
import { simulateBodySchema, formatZodError } from '@/lib/api-schemas';

/**
 * POST /api/simulate
 *
 * Run a simulated conversation for testing. Requires authentication
 * via session cookie (admin dashboard only).
 *
 * Body:
 *   {
 *     tenantId: string,
 *     messages: string[],
 *     testProcedures?: boolean
 *   }
 */
export async function POST(request: NextRequest) {
  // Verify session
  let userId: string;
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    userId = user.$id;
  } catch {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  let body: SimulationInput;
  try {
    const rawBody = await request.json();
    const parsed = simulateBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    body = parsed.data as SimulationInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Verify the authenticated user owns the requested tenant
  // Use admin client for DB reads (session client may lack collection permissions)
  try {
    const { databases } = createAdminClient();
    const tenants = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', userId), Query.limit(1)]
    );
    if (
      tenants.documents.length === 0 ||
      tenants.documents[0].$id !== body.tenantId
    ) {
      return NextResponse.json(
        { error: 'Forbidden – you do not own this tenant' },
        { status: 403 }
      );
    }
  } catch (err) {
    logger.error('Tenant ownership check failed', { err, userId });
    return NextResponse.json(
      { error: 'Failed to verify tenant ownership' },
      { status: 500 }
    );
  }

  try {
    const result = await runSimulation(body);

    logAuditEventAsync(body.tenantId, 'simulation.run', {
      totalTurns: result.metrics.totalTurns,
      resolutionRate: result.metrics.resolutionRate,
      avgConfidence: result.metrics.avgConfidence
    });

    return NextResponse.json(result);
  } catch (err) {
    logger.error('Simulation failed', { err });
    return NextResponse.json(
      {
        error: 'Simulation failed'
      },
      { status: 500 }
    );
  }
}
