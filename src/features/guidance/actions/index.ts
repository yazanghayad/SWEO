'use server';

import { Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';
import { COLLECTION } from '@/lib/appwrite/collections';
import {
  createTenantDocument,
  getTenantDocumentsAdmin,
  updateTenantDocument,
  deleteTenantDocument
} from '@/lib/appwrite/tenant-helpers';
import { getAuthenticatedTenantId } from '@/lib/appwrite/get-authenticated-tenant';
import { logger } from '@/lib/logger';
import type {
  GuidanceRule,
  CreateGuidanceRuleInput,
  UpdateGuidanceRuleInput,
  GuidanceChannel,
  GuidanceCategory
} from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────

const GUIDANCE_PATH = '/dashboard/guidance';

/**
 * Serialize Appwrite document to plain object (removes class prototype)
 */
function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * Extract a plain error message from any thrown value so the server-action
 * response is always serialisable (Appwrite SDK errors are class instances
 * that Next.js cannot serialise, causing "An unexpected response").
 */
function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}

// ── Reads ────────────────────────────────────────────────────────────────

/**
 * Get all guidance rules for a tenant
 */
export async function getGuidanceRules(
  tenantId: string,
  channel?: GuidanceChannel,
  category?: GuidanceCategory
): Promise<GuidanceRule[]> {
  // Verify the caller owns this tenant
  const authenticatedTenantId = await getAuthenticatedTenantId();
  if (authenticatedTenantId !== tenantId) {
    throw new Error('Forbidden');
  }

  const queries: string[] = [];

  if (channel) {
    queries.push(Query.equal('channel', channel));
  }
  if (category) {
    queries.push(Query.equal('category', category));
  }

  const result = await getTenantDocumentsAdmin<GuidanceRule>(
    COLLECTION.GUIDANCE_RULES,
    tenantId,
    queries,
    100
  );

  return serialize(result.documents);
}

/**
 * Get a single guidance rule by ID
 */
export async function getGuidanceRule(
  tenantId: string,
  ruleId: string
): Promise<GuidanceRule | null> {
  // Verify the caller owns this tenant
  const authenticatedTenantId = await getAuthenticatedTenantId();
  if (authenticatedTenantId !== tenantId) {
    throw new Error('Forbidden');
  }

  try {
    const rules = await getTenantDocumentsAdmin<GuidanceRule>(
      COLLECTION.GUIDANCE_RULES,
      tenantId,
      [Query.equal('$id', ruleId)],
      1
    );
    return rules.documents[0] ? serialize(rules.documents[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Get guidance rules grouped by category for a specific channel
 */
export async function getGuidanceRulesByCategory(
  tenantId: string,
  channel: GuidanceChannel
): Promise<Record<GuidanceCategory, GuidanceRule[]>> {
  // Auth is enforced inside getGuidanceRules
  const rules = await getGuidanceRules(tenantId, channel);

  const grouped: Record<GuidanceCategory, GuidanceRule[]> = {
    communication_style: [],
    context_clarification: [],
    content_sources: [],
    spam: [],
    other: []
  };

  for (const rule of rules) {
    if (grouped[rule.category]) {
      grouped[rule.category].push(rule);
    }
  }

  return grouped;
}

/**
 * Get tenant's default tone and length preferences
 */
export async function getTenantGuidancePreferences(
  tenantId: string,
  channel: GuidanceChannel
): Promise<{ tone: string; length: string } | null> {
  // Verify the caller owns this tenant
  const authenticatedTenantId = await getAuthenticatedTenantId();
  if (authenticatedTenantId !== tenantId) {
    throw new Error('Forbidden');
  }

  try {
    const existing = await getTenantDocumentsAdmin<GuidanceRule>(
      COLLECTION.GUIDANCE_RULES,
      tenantId,
      [
        Query.equal('channel', channel),
        Query.equal('name', '__preferences__')
      ],
      1
    );

    if (existing.documents.length > 0) {
      const prefs = existing.documents[0];
      return {
        tone: prefs.tone || 'friendly',
        length: prefs.length || 'standard'
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ── Writes (return { success, error? } to stay serialisable) ─────────────

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new guidance rule
 */
export async function createGuidanceRule(
  tenantId: string,
  input: CreateGuidanceRuleInput
): Promise<ActionResult<GuidanceRule>> {
  try {
    // Verify the caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId();
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }

    const rule = await createTenantDocument<GuidanceRule>(
      COLLECTION.GUIDANCE_RULES,
      tenantId,
      {
        channel: input.channel,
        category: input.category,
        name: input.name,
        description: input.description || '',
        ruleContent: input.ruleContent,
        enabled: input.enabled ?? true,
        ...(input.tone ? { tone: input.tone } : {}),
        ...(input.length ? { length: input.length } : {})
      }
    );

    revalidatePath(GUIDANCE_PATH);
    return { success: true, data: serialize(rule) };
  } catch (err) {
    logger.error('[createGuidanceRule]', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

/**
 * Update an existing guidance rule
 */
export async function updateGuidanceRule(
  ruleId: string,
  input: UpdateGuidanceRuleInput
): Promise<ActionResult<GuidanceRule>> {
  try {
    // Derive tenant from session — prevents cross-tenant mutation
    const tenantId = await getAuthenticatedTenantId();

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.ruleContent !== undefined) updateData.ruleContent = input.ruleContent;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.tone !== undefined) updateData.tone = input.tone;
    if (input.length !== undefined) updateData.length = input.length;

    const rule = await updateTenantDocument<GuidanceRule>(
      COLLECTION.GUIDANCE_RULES,
      ruleId,
      updateData,
      tenantId
    );

    revalidatePath(GUIDANCE_PATH);
    return { success: true, data: serialize(rule) };
  } catch (err) {
    logger.error('[updateGuidanceRule]', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

/**
 * Delete a guidance rule
 */
export async function deleteGuidanceRule(
  ruleId: string
): Promise<ActionResult> {
  try {
    // Derive tenant from session — prevents cross-tenant mutation
    const tenantId = await getAuthenticatedTenantId();

    await deleteTenantDocument(COLLECTION.GUIDANCE_RULES, ruleId, tenantId);
    revalidatePath(GUIDANCE_PATH);
    return { success: true };
  } catch (err) {
    logger.error('[deleteGuidanceRule]', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

/**
 * Toggle a guidance rule's enabled status
 */
export async function toggleGuidanceRule(
  ruleId: string,
  enabled: boolean
): Promise<ActionResult<GuidanceRule>> {
  return updateGuidanceRule(ruleId, { enabled });
}

/**
 * Save tenant's default tone and length preferences
 * These are stored as special guidance rules with category 'other'
 */
export async function saveTenantGuidancePreferences(
  tenantId: string,
  channel: GuidanceChannel,
  tone: string,
  length: string
): Promise<ActionResult> {
  try {
    // Verify the caller owns this tenant
    const authenticatedTenantId = await getAuthenticatedTenantId();
    if (authenticatedTenantId !== tenantId) {
      return { success: false, error: 'Forbidden' };
    }

    // Check if preferences rule already exists
    const existing = await getTenantDocumentsAdmin<GuidanceRule>(
      COLLECTION.GUIDANCE_RULES,
      tenantId,
      [
        Query.equal('channel', channel),
        Query.equal('name', '__preferences__')
      ],
      1
    );

    if (existing.documents.length > 0) {
      // Update existing
      await updateTenantDocument(
        COLLECTION.GUIDANCE_RULES,
        existing.documents[0].$id,
        { tone, length },
        tenantId
      );
    } else {
      // Create new preferences rule
      await createTenantDocument(
        COLLECTION.GUIDANCE_RULES,
        tenantId,
        {
          channel,
          category: 'other',
          name: '__preferences__',
          description: 'Tenant tone and length preferences',
          ruleContent: JSON.stringify({ tone, length }),
          enabled: true,
          tone,
          length
        }
      );
    }

    revalidatePath(GUIDANCE_PATH);
    return { success: true };
  } catch (err) {
    logger.error('[saveTenantGuidancePreferences]', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}
