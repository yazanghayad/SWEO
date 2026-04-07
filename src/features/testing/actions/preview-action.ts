'use server';

/**
 * Preview chat server action – wraps the simulation engine for the
 * interactive preview panel used on Content & Guidance pages.
 *
 * Follows the ActionResult<T> pattern.
 */

import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import { runSimulation, type SimulationResult } from '@/lib/ai/simulation-engine';
import { logAuditEventAsync } from '@/lib/audit/logger';
import { logger } from '@/lib/logger';
import type { Tenant } from '@/types/appwrite';
import type { ActionResult } from './helpers';
import { toErrorMessage } from './helpers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PreviewInput {
  tenantId: string;
  messages: string[];
}

export type PreviewResult = SimulationResult;

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

/**
 * Run a preview simulation (multi-turn). Validates session ownership
 * and delegates to the simulation engine in preview mode.
 */
export async function previewChatAction(
  input: PreviewInput
): Promise<ActionResult<PreviewResult>> {
  // Authenticate
  let userId: string;
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    userId = user.$id;
  } catch {
    return { success: false, error: 'Authentication required' };
  }

  // Validate input
  if (!input.tenantId || !input.messages || input.messages.length === 0) {
    return { success: false, error: 'tenantId and messages[] are required' };
  }
  if (input.messages.length > 20) {
    return { success: false, error: 'Maximum 20 messages per simulation' };
  }

  // Verify tenant ownership
  try {
    const { databases } = createAdminClient();
    const tenants = await databases.listDocuments<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('userId', userId), Query.limit(1)]
    );

    if (
      tenants.documents.length === 0 ||
      tenants.documents[0].$id !== input.tenantId
    ) {
      return { success: false, error: 'Forbidden – you do not own this tenant' };
    }
  } catch (err) {
    logger.error('Preview tenant ownership check failed', { err, userId });
    return { success: false, error: 'Failed to verify tenant ownership' };
  }

  // Run simulation in preview mode
  try {
    const result = await runSimulation({
      tenantId: input.tenantId,
      messages: input.messages,
      preview: true,
    });

    logAuditEventAsync(input.tenantId, 'simulation.preview', {
      totalTurns: result.metrics.totalTurns,
      avgConfidence: result.metrics.avgConfidence,
    });

    return { success: true, data: result };
  } catch (err) {
    logger.error('Preview simulation failed', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}
