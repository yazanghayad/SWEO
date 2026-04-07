import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Tenant, OutboundMessage } from '@/types/appwrite';
import { Query } from 'node-appwrite';
import { corsHeaders, handlePreflight } from '@/lib/cors';
import { findTenantByPreviousApiKey } from '@/lib/widget/previous-key-lookup';

const WIDGET_CHANNELS = [
  'chat', 'banner', 'tooltip', 'product-tour',
  'checklist', 'post', 'survey', 'news'
];

/**
 * GET /api/widget/outbound
 *
 * Returns active outbound messages for widget-compatible channels.
 * Auth: x-tenant-api-key header.
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-tenant-api-key') ?? '';
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing key parameter' },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  try {
    const { databases } = createAdminClient();

    // Tenant lookup (same as /api/widget/config)
    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('apiKey', apiKey), Query.limit(1)]
    );

    let tenant: Tenant | null = result.documents[0] ?? null;

    // Grace-period check for rotated keys using indexed field
    if (!tenant) {
      tenant = await findTenantByPreviousApiKey(apiKey);
    }

    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401, headers: corsHeaders(request) }
      );
    }

    // Fetch active outbound messages for this tenant
    const docs = await databases.listDocuments<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      [
        Query.equal('tenantId', tenant.$id),
        Query.equal('status', 'active'),
        Query.limit(50),
        Query.orderDesc('$createdAt')
      ]
    );

    // Filter to widget-compatible channels and shape the response
    const messages = docs.documents
      .filter((doc) => WIDGET_CHANNELS.includes(doc.channel))
      .map((doc) => ({
        id: doc.$id,
        channel: doc.channel,
        title: doc.title,
        content: JSON.parse(doc.content || '{}'),
        audience: JSON.parse(doc.audience || '{"type":"all","rules":[]}')
      }));

    return NextResponse.json(
      { messages },
      {
        headers: {
          ...corsHeaders(request),
          'Cache-Control': 'public, max-age=60, s-maxage=60'
        }
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to load outbound messages' },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

/** CORS preflight */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
