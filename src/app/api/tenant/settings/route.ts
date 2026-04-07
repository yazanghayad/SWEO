/**
 * Tenant settings API.
 *
 * GET  /api/tenant/settings – Read current tenant config
 * PATCH /api/tenant/settings – Update tenant config (partial merge)
 *
 * Session-authenticated (dashboard use only).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import { z } from 'zod';
import type { Tenant, TenantConfig } from '@/types/appwrite';
import { logAuditEventAsync } from '@/lib/audit/logger';
import {
  validateSubdomain,
  normalizeSubdomain,
  isSubdomainAvailable
} from '@/lib/tenant/subdomain';
import { encrypt } from '@/lib/encryption';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const tenantConfigSchema = z.object({
  channels: z
    .array(z.enum(['web', 'email', 'whatsapp', 'sms', 'voice']))
    .optional(),
  model: z.string().min(1).max(100).optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
  maxHistoryMessages: z.number().int().min(1).max(50).optional(),
  customSystemPrompt: z.string().max(5000).optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  cacheTtlSeconds: z.number().int().min(0).max(86400).optional(),

  // AI Agent
  aiEnabled: z.boolean().optional(),
  aiPersonality: z.string().max(50).optional(),
  aiAutoResolve: z.boolean().optional(),
  aiHumanHandoff: z.boolean().optional(),
  aiCollectFeedback: z.boolean().optional(),
  aiShowSources: z.boolean().optional(),

  // Customization / Widget
  botName: z.string().max(100).optional(),
  welcomeMessage: z.string().max(1000).optional(),
  brandColor: z.string().max(20).optional(),
  widgetPosition: z.enum(['right', 'left']).optional(),
  poweredBy: z.boolean().optional(),
  typingIndicators: z.boolean().optional(),
  readReceipts: z.boolean().optional(),
  universalLinks: z.boolean().optional(),
  customDomain: z.string().max(255).optional(),

  // Webhooks – now stored in dedicated 'webhooks' collection

  // Office Hours
  officeHoursEnabled: z.boolean().optional(),
  officeHoursSchedule: z.record(
    z.string(),
    z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string()
    })
  ).optional(),
  officeHoursAutoReply: z.boolean().optional(),

  // Notifications
  notifications: z
    .object({
      email: z.boolean().optional(),
      desktop: z.boolean().optional(),
      mobile: z.boolean().optional(),
      sound: z.boolean().optional(),
      newConversation: z.boolean().optional(),
      newReply: z.boolean().optional(),
      mentions: z.boolean().optional(),
      assignedToMe: z.boolean().optional(),
      escalations: z.boolean().optional(),
      dailyDigest: z.boolean().optional()
    })
    .optional(),

  // Assignments
  assignments: z
    .object({
      autoAssign: z.boolean().optional(),
      roundRobin: z.boolean().optional(),
      loadBalancing: z.boolean().optional(),
      maxConversations: z.string().optional(),
      reassignOnReply: z.boolean().optional()
    })
    .optional(),

  // Automation Rules – now stored in dedicated 'automation_rules' collection

  // Inbox AI
  inboxAi: z
    .object({
      compose: z.boolean().optional(),
      summarize: z.boolean().optional(),
      autofill: z.boolean().optional(),
      tone: z.boolean().optional(),
      translate: z.boolean().optional(),
      suggestMacro: z.boolean().optional()
    })
    .optional(),

  // Macros – now stored in dedicated 'macros' collection

  // Tags – now stored in dedicated 'tags' collection

  // Multilingual
  autoTranslate: z.boolean().optional(),
  detectLanguage: z.boolean().optional(),
  languages: z
    .array(
      z.object({
        code: z.string(),
        name: z.string(),
        enabled: z.boolean(),
        isDefault: z.boolean()
      })
    )
    .optional(),

  // Outbound
  outbound: z
    .object({
      email: z.boolean().optional(),
      messenger: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
      tracking: z.boolean().optional()
    })
    .optional(),

  // Security
  security: z
    .object({
      emailAuth: z.boolean().optional(),
      googleSSO: z.boolean().optional(),
      samlSSO: z.boolean().optional(),
      enforceSSO: z.boolean().optional(),
      ipAllowlist: z.boolean().optional(),
      ipAddresses: z.string().optional(),
      sessionLength: z.string().optional(),
      securityEmail: z.string().optional(),
      aiTraining: z.boolean().optional(),
      dataRetention: z.string().optional(),
      dataGracePeriod: z.string().optional(),
      identityVerification: z.boolean().optional(),
      requireEmail: z.boolean().optional(),
      allowAttachments: z.boolean().optional(),
      maxFileSize: z.string().optional(),
      allowedFileTypes: z.array(z.string()).optional()
    })
    .optional(),

  // Team Inboxes – now stored in dedicated 'team_inboxes' collection

  // Channel configs
  smsConfig: z
    .object({
      enabled: z.boolean().optional(),
      twilioPhone: z.string().optional(),
      twilioSid: z.string().optional(),
      twilioAuthToken: z.string().optional(),
      senderName: z.string().optional(),
      autoReplyEnabled: z.boolean().optional(),
      autoReplyMessage: z.string().optional(),
      optOutMessage: z.string().optional()
    })
    .optional(),
  whatsappConfig: z
    .object({
      enabled: z.boolean().optional(),
      twilioSid: z.string().optional(),
      twilioAuthToken: z.string().optional(),
      twilioPhone: z.string().optional(),
      webhookUrl: z.string().optional()
    })
    .optional(),
  emailChannelConfig: z
    .object({
      enabled: z.boolean().optional(),
      triggerSteps: z.record(z.string(), z.unknown()).optional()
    })
    .optional()
});

/**
 * Schema for "general settings" fields that live on the tenant document
 * and/or in the config JSON (timezone, language).
 */
const generalSettingsSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  subdomain: z.string().min(3).max(63).optional(),
  timezone: z.string().max(64).optional(),
  language: z.string().max(10).optional()
});

// ---------------------------------------------------------------------------
// Helper: get tenant for session
// ---------------------------------------------------------------------------

async function getTenantFromSession(): Promise<Tenant | null> {
  try {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const result = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', user.$id), Query.limit(1)]
    );

    return result.documents[0] ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// GET – read config
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const tenant = await getTenantFromSession();
  if (!tenant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  // Parse config (stored as JSON string)
  let config: TenantConfig = {};
  try {
    config =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config as TenantConfig);
  } catch {
    config = {};
  }

  return NextResponse.json({
    tenantId: tenant.$id,
    name: tenant.name,
    plan: tenant.plan,
    config
  });
}

// ---------------------------------------------------------------------------
// PATCH – update config
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  const tenant = await getTenantFromSession();
  if (!tenant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Rate limiting ───────────────────────────────────────────────────
  const { applyIpRateLimit } = await import('@/lib/rate-limit/middleware');
  const rateLimitResult = await applyIpRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = tenantConfigSchema.safeParse(body);
  const generalParsed = generalSettingsSchema.safeParse(body);

  // At least one schema should match
  if (!parsed.success && !generalParsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid settings',
        details: [
          ...(parsed.error?.issues ?? []).map((i) => ({
            path: i.path.join('.'),
            message: i.message
          })),
          ...(generalParsed.error?.issues ?? []).map((i) => ({
            path: i.path.join('.'),
            message: i.message
          }))
        ]
      },
      { status: 400 }
    );
  }

  const { databases } = createAdminClient();

  // ── Handle general settings (name, subdomain, timezone, language) ──
  const general = generalParsed.success ? generalParsed.data : {};
  const docUpdate: Record<string, unknown> = {};

  if (general.name) {
    docUpdate.name = general.name;
  }

  if (general.subdomain) {
    const normalized = normalizeSubdomain(general.subdomain);
    const validationError = validateSubdomain(normalized);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    const available = await isSubdomainAvailable(normalized, tenant.$id);
    if (!available) {
      return NextResponse.json(
        { error: 'This subdomain is already taken. Please choose another.' },
        { status: 409 }
      );
    }
    docUpdate.subdomain = normalized;
  }

  // Merge with existing config
  let existingConfig: TenantConfig = {};
  try {
    existingConfig =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config as TenantConfig);
  } catch {
    existingConfig = {};
  }

  const configUpdate = parsed.success ? parsed.data : {};
  const updatedConfig: TenantConfig = {
    ...existingConfig,
    ...configUpdate,
    // Store timezone & language in config JSON too
    ...(general.timezone ? { timezone: general.timezone } : {}),
    ...(general.language ? { language: general.language } : {}),
    ...(general.subdomain
      ? { subdomain: normalizeSubdomain(general.subdomain) }
      : {})
  };

  // Remove empty string values (treat as "unset")
  for (const [key, value] of Object.entries(updatedConfig)) {
    if (value === '') {
      delete (updatedConfig as Record<string, unknown>)[key];
    }
  }

  // Encrypt sensitive Twilio auth tokens before storage
  const smsConf = updatedConfig.smsConfig as
    | Record<string, unknown>
    | undefined;
  if (smsConf?.twilioAuthToken && typeof smsConf.twilioAuthToken === 'string') {
    smsConf.twilioAuthToken = encrypt(smsConf.twilioAuthToken);
  }
  const waConf = updatedConfig.whatsappConfig as
    | Record<string, unknown>
    | undefined;
  if (waConf?.twilioAuthToken && typeof waConf.twilioAuthToken === 'string') {
    waConf.twilioAuthToken = encrypt(waConf.twilioAuthToken);
  }

  // Merge doc-level fields + config
  docUpdate.config = JSON.stringify(updatedConfig);

  // Save
  await databases.updateDocument(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    tenant.$id,
    docUpdate
  );

  logAuditEventAsync(tenant.$id, 'tenant.config_updated', {
    updatedFields: [...Object.keys(configUpdate), ...Object.keys(general)]
  });

  return NextResponse.json({
    config: updatedConfig,
    name: general.name ?? tenant.name,
    subdomain: (docUpdate.subdomain as string) ?? tenant.subdomain
  });
}
