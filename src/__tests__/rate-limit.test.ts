/**
 * Tests for rate-limit fail-closed behaviour.
 *
 * Verifies that when Redis is unavailable the limiter BLOCKS requests in
 * production and ALLOWS them in development.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks – must be declared before imports
// ---------------------------------------------------------------------------

vi.mock('@/lib/cache/redis', () => ({
  getRedis: vi.fn(() => null),
  isRedisConfigured: vi.fn(() => false)
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

// Import after mock declarations
import {
  checkIpRateLimit,
  checkTenantRateLimit,
  checkDashboardRateLimit
} from '@/lib/rate-limit/index';
import { getRedis, isRedisConfigured } from '@/lib/cache/redis';
import type { Tenant } from '@/types/appwrite';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fakeTenant = {
  $id: 'tenant-1',
  plan: 'growth'
} as Tenant;

function setNodeEnv(env: string) {
  vi.stubEnv('NODE_ENV', env);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('rate-limit fail-closed behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // -----------------------------------------------------------------------
  // Scenario 1: Redis NOT configured
  // -----------------------------------------------------------------------

  describe('when Redis is not configured', () => {
    beforeEach(() => {
      vi.mocked(isRedisConfigured).mockReturnValue(false);
      vi.mocked(getRedis).mockReturnValue(null);
    });

    it('blocks IP requests in production', async () => {
      setNodeEnv('production');
      const result = await checkIpRateLimit('1.2.3.4');
      expect(result.success).toBe(false);
    });

    it('blocks tenant requests in production', async () => {
      setNodeEnv('production');
      const result = await checkTenantRateLimit(fakeTenant);
      expect(result.success).toBe(false);
    });

    it('blocks dashboard requests in production', async () => {
      setNodeEnv('production');
      const result = await checkDashboardRateLimit('session-abc');
      expect(result.success).toBe(false);
    });

    it('allows IP requests in development', async () => {
      setNodeEnv('development');
      const result = await checkIpRateLimit('1.2.3.4');
      expect(result.success).toBe(true);
    });

    it('allows tenant requests in development', async () => {
      setNodeEnv('development');
      const result = await checkTenantRateLimit(fakeTenant);
      expect(result.success).toBe(true);
    });

    it('allows dashboard requests in development', async () => {
      setNodeEnv('development');
      const result = await checkDashboardRateLimit('session-abc');
      expect(result.success).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 2: Redis configured but limiter.limit() throws
  // -----------------------------------------------------------------------

  describe('when Redis is configured but throws at runtime', () => {
    beforeEach(() => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);

      // Return a fake Redis so limiter is created, but .limit() rejects
      const fakeRedis = {} as ReturnType<typeof getRedis>;
      vi.mocked(getRedis).mockReturnValue(fakeRedis);
    });

    it('blocks IP requests in production when limiter throws', async () => {
      setNodeEnv('production');
      // The Ratelimit constructor will get a broken redis; .limit() will throw
      const result = await checkIpRateLimit('1.2.3.4');
      // Either Redis creation fails (null limiter → failClosed) or
      // .limit() throws (→ failClosedOnError). Both must block.
      expect(result.success).toBe(false);
    });

    it('blocks tenant requests in production when limiter throws', async () => {
      setNodeEnv('production');
      const result = await checkTenantRateLimit(fakeTenant);
      expect(result.success).toBe(false);
    });
  });
});
