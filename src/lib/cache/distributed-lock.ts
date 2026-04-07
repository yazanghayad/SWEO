/**
 * Redis-based distributed lock for preventing race conditions.
 *
 * Uses SET NX EX pattern for atomic lock acquisition.
 * Used by channel adapters to prevent duplicate conversation creation.
 */

import { logger } from '@/lib/logger';

/**
 * Acquire a distributed lock via Redis.
 * Returns a release function if the lock was acquired, or null if already held.
 */
export async function acquireLock(
  key: string,
  ttlSeconds = 10
): Promise<(() => Promise<void>) | null> {
  try {
    const { getRedis } = await import('@/lib/cache/redis');
    const redis = getRedis();
    if (!redis) {
      // No Redis available — proceed without locking (dev fallback)
      return async () => {};
    }

    const lockKey = `lock:${key}`;
    const result = await redis.set(lockKey, '1', { nx: true, ex: ttlSeconds });

    if (!result) {
      // Lock already held
      return null;
    }

    // Return release function
    return async () => {
      try {
        await redis.del(lockKey);
      } catch {
        // Lock will expire via TTL anyway
      }
    };
  } catch (err) {
    logger.warn('Failed to acquire distributed lock', { key, err });
    // Proceed without locking rather than blocking
    return async () => {};
  }
}

/**
 * Execute a function with a distributed lock.
 * If the lock is already held, waits briefly and retries.
 */
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  options: { ttlSeconds?: number; retries?: number; retryDelayMs?: number } = {}
): Promise<T> {
  const { ttlSeconds = 10, retries = 3, retryDelayMs = 200 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const release = await acquireLock(key, ttlSeconds);

    if (release) {
      try {
        return await fn();
      } finally {
        await release();
      }
    }

    // Wait before retry
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  // All retries exhausted — execute without lock as fallback
  logger.warn('Could not acquire lock after retries, proceeding without lock', { key });
  return fn();
}
