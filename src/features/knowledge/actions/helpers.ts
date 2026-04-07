/**
 * Shared helpers for knowledge server actions.
 *
 * Mirrors the pattern used in guidance actions: ActionResult<T>,
 * serialize(), toErrorMessage().
 */

// ── ActionResult type ────────────────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Path used in revalidatePath() after knowledge mutations. */
export const CONTENT_PATH = '/dashboard/content';

/**
 * Serialize an Appwrite document (class instance) to a plain object
 * so it can be returned from server actions without serialisation errors.
 */
export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * Extract a plain error message from any thrown value.
 * Appwrite SDK errors are class instances that Next.js cannot serialise,
 * so we always need to reduce them to a string.
 */
export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}
