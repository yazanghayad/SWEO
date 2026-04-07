/**
 * POST /api/knowledge/import
 *
 * Import knowledge base from a JSON manifest file.
 * Session-authenticated (dashboard).
 *
 * Accepts: application/json body with the manifest.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import { importKnowledgeBaseAction } from '@/features/knowledge/actions/export-import';
import type { Tenant } from '@/types/appwrite';
import { knowledgeImportManifestSchema, formatZodError } from '@/lib/api-schemas';

export async function POST(request: NextRequest) {
  // Authenticate via session
  let tenant: Tenant;
  try {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    if (result.documents.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    tenant = result.documents[0];
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  // Parse manifest from body
  let rawManifest: unknown;
  try {
    rawManifest = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = knowledgeImportManifestSchema.safeParse(rawManifest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { success, data: result, error } = await importKnowledgeBaseAction(
    tenant.$id,
    parsed.data as unknown as Parameters<typeof importKnowledgeBaseAction>[1]
  );

  if (!success) {
    return NextResponse.json(
      { error: error ?? 'Import failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, result });
}
