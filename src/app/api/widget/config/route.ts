import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Tenant, TenantConfig } from '@/types/appwrite';
import type { GuidanceRule } from '@/features/guidance/types';
import { Query } from 'node-appwrite';
import { corsHeaders, handlePreflight } from '@/lib/cors';
import { findTenantByPreviousApiKey } from '@/lib/widget/previous-key-lookup';

/**
 * GET /api/widget/config
 *
 * Returns widget configuration for the given tenant so the embeddable
 * widget can dynamically load branding, welcome messages, guidance rules,
 * office hours, and security settings without hard-coding them in data-* attrs.
 *
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

    const cfg: TenantConfig =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config as unknown as TenantConfig);

    // Load guidance rules for this tenant
    let guidanceRules: Array<{
      category: string;
      name: string;
      ruleContent: string;
    }> = [];
    try {
      const rulesResult = await databases.listDocuments<GuidanceRule>(
        APPWRITE_DATABASE,
        COLLECTION.GUIDANCE_RULES,
        [
          Query.equal('tenantId', tenant.$id),
          Query.equal('enabled', true),
          Query.limit(50)
        ]
      );
      guidanceRules = rulesResult.documents.map((r) => ({
        category: r.category,
        name: r.name,
        ruleContent: r.ruleContent
      }));
    } catch {
      // Collection may not exist yet
    }

    // Build public-safe config (never expose secrets)
    const widgetConfig = {
      // Branding
      botName: cfg.botName ?? tenant.name ?? 'Support',
      welcomeMessage:
        cfg.welcomeMessage ?? 'Hi there! How can we help you today?',
      brandColor: cfg.brandColor ?? '#6366f1',
      widgetPosition: cfg.widgetPosition ?? 'right',
      poweredBy: cfg.poweredBy ?? true,

      // White-label branding
      whiteLabel: cfg.whiteLabel ?? false,
      companyName: cfg.companyName ?? '',
      logoUrl: cfg.logoUrl ?? '',
      faviconUrl: cfg.faviconUrl ?? '',
      brandColorSecondary: cfg.brandColorSecondary ?? '',
      customCss: cfg.customCss ?? '',

      // Behavior
      typingIndicators: cfg.typingIndicators ?? true,
      aiShowSources: cfg.aiShowSources ?? false,
      aiCollectFeedback: cfg.aiCollectFeedback ?? true,

      // Security — email verification
      requireEmail: cfg.security?.requireEmail ?? false,
      identityVerification: cfg.security?.identityVerification ?? false,

      // Office hours
      officeHoursEnabled: cfg.officeHoursEnabled ?? false,
      officeHoursSchedule: cfg.officeHoursSchedule ?? null,
      officeHoursAutoReply: cfg.officeHoursAutoReply ?? false,

      // Multilingual
      autoTranslate: cfg.autoTranslate ?? false,
      detectLanguage: cfg.detectLanguage ?? false,
      language: cfg.language ?? 'en',

      // Guidance (public-safe summaries)
      guidance: guidanceRules
    };

    return NextResponse.json(widgetConfig, {
      headers: {
        ...corsHeaders(request),
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load widget config' },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

/** CORS preflight */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
