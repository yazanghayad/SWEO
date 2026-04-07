/**
 * Audit event logger – writes append-only audit events to Appwrite.
 *
 * Usage:
 *   import { logAuditEvent } from '@/lib/audit/logger';
 *   await logAuditEvent(tenantId, 'message.sent', { conversationId, role });
 *
 * PII policy: email addresses are stored masked (e.g. "j***@example.com")
 * to preserve traceability without logging full PII. Use `maskEmail()`
 * before passing email values into payloads.
 */

import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID } from 'node-appwrite';
import type { AuditEvent } from '@/types/appwrite';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// PII helpers
// ---------------------------------------------------------------------------

/**
 * Mask an email address for audit logs.
 *
 * "john.doe@example.com" → "j***@example.com"
 * Preserves the domain so operators can still identify the mail provider,
 * and the first character for rough identification.
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email) return '[no-email]';
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '***';
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex); // includes @
  return local[0] + '***' + domain;
}

// ---------------------------------------------------------------------------
// Well-known event types
// ---------------------------------------------------------------------------

export type AuditEventType =
  | 'message.sent'
  | 'message.received'
  | 'conversation.created'
  | 'conversation.resolved'
  | 'conversation.escalated'
  | 'policy.violated'
  | 'knowledge.created'
  | 'knowledge.deleted'
  | 'knowledge.processed'
  | 'knowledge.rollback'
  | 'knowledge.exported'
  | 'knowledge.imported'
  | 'procedure.triggered'
  | 'procedure.completed'
  | 'procedure.failed'
  | 'connector.called'
  | 'connector.error'
  | 'handover.triggered'
  | 'handover.completed'
  | 'suggestion.created'
  | 'suggestion.approved'
  | 'suggestion.dismissed'
  | 'simulation.run'
  | 'rate_limit.exceeded'
  | 'apikey.rotated'
  | 'tenant.config_updated'
  | 'cache.hit'
  | 'cache.miss'
  | 'team.created'
  | 'team.member_invited'
  | 'team.member_removed'
  | 'team.role_updated'
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.signup'
  | 'auth.signup_failed'
  | 'auth.rate_limited';

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

/**
 * Write an immutable audit event. Fires and forgets by default –
 * failures are logged to stderr but never throw.
 */
export async function logAuditEvent(
  tenantId: string,
  eventType: AuditEventType | string,
  payload: Record<string, unknown> = {},
  userId: string | null = null
): Promise<AuditEvent | null> {
  try {
    const { databases } = createAdminClient();

    const doc = await databases.createDocument<AuditEvent>(
      APPWRITE_DATABASE,
      COLLECTION.AUDIT_EVENTS,
      ID.unique(),
      {
        tenantId,
        eventType,
        userId,
        payload: JSON.stringify(payload) as unknown as Record<string, unknown>
      }
    );

    return doc;
  } catch (err) {
    logger.error(`[audit] Failed to log event "${eventType}"`, { err });
    return null;
  }
}

/**
 * Fire-and-forget variant – returns void and never blocks the caller.
 */
export function logAuditEventAsync(
  tenantId: string,
  eventType: AuditEventType | string,
  payload: Record<string, unknown> = {},
  userId: string | null = null
): void {
  logAuditEvent(tenantId, eventType, payload, userId).catch(() => {
    // Already logged inside logAuditEvent
  });
}
