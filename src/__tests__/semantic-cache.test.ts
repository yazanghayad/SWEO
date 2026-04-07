import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Redis before importing semantic-cache
vi.mock('@/lib/cache/redis', () => {
  const store = new Map<string, { value: unknown; ttl?: number }>();
  const mockRedis = {
    get: vi.fn(async (key: string) => store.get(key)?.value ?? null),
    set: vi.fn(async (key: string, value: unknown, opts?: { ex?: number }) => {
      store.set(key, { value, ttl: opts?.ex });
      return 'OK';
    }),
    del: vi.fn(async (...keys: string[]) => {
      let deleted = 0;
      for (const key of keys) {
        if (store.delete(key)) deleted++;
      }
      return deleted;
    }),
    scan: vi.fn(async (_cursor: number, opts?: { match?: string; count?: number }) => {
      const pattern = opts?.match?.replace('*', '') ?? '';
      const matchingKeys = Array.from(store.keys()).filter((k) =>
        k.startsWith(pattern)
      );
      return [0, matchingKeys]; // cursor=0 means done
    })
  };

  return {
    getRedis: vi.fn(() => mockRedis),
    isRedisConfigured: vi.fn(() => true),
    __mockStore: store,
    __mockRedis: mockRedis
  };
});

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

import {
  getCachedResponse,
  setCachedResponse,
  invalidateTenantCache
} from '@/lib/cache/semantic-cache';

// Access mock internals
const getMockStore = async () => {
  const mod = await import('@/lib/cache/redis');
  return (mod as unknown as { __mockStore: Map<string, unknown> }).__mockStore;
};

const getMockRedis = async () => {
  const mod = await import('@/lib/cache/redis');
  return (mod as unknown as { __mockRedis: Record<string, Mock> }).__mockRedis;
};

describe('Semantic Cache', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const store = await getMockStore();
    store.clear();
  });

  describe('getCachedResponse', () => {
    it('returns null on cache miss', async () => {
      const result = await getCachedResponse('tenant-1', 'unknown query');
      expect(result).toBeNull();
    });

    it('returns cached response after set', async () => {
      const response = {
        content: 'Cached answer.',
        confidence: 0.95,
        citations: [{ sourceId: 'src-1' }]
      };

      await setCachedResponse('tenant-1', 'how do I reset password', response);
      const result = await getCachedResponse(
        'tenant-1',
        'how do I reset password'
      );

      expect(result).not.toBeNull();
      expect(result!.content).toBe('Cached answer.');
      expect(result!.confidence).toBe(0.95);
      expect(result!.cachedAt).toBeDefined();
    });

    it('normalises query (case insensitive, whitespace collapsed)', async () => {
      const response = {
        content: 'Answer.',
        confidence: 0.9,
        citations: []
      };

      await setCachedResponse('tenant-1', 'Hello World', response);

      // Same query, different case and spacing
      const result = await getCachedResponse('tenant-1', '  hello   world  ');
      expect(result).not.toBeNull();
      expect(result!.content).toBe('Answer.');
    });

    it('isolates tenants – different tenantId misses', async () => {
      const response = {
        content: 'Tenant 1 answer.',
        confidence: 0.9,
        citations: []
      };

      await setCachedResponse('tenant-1', 'query', response);
      const result = await getCachedResponse('tenant-2', 'query');
      expect(result).toBeNull();
    });

    it('returns null gracefully when Redis is unavailable', async () => {
      const redis = await getMockRedis();
      redis.get.mockRejectedValueOnce(new Error('connection refused'));

      const result = await getCachedResponse('tenant-1', 'query');
      expect(result).toBeNull();
    });
  });

  describe('setCachedResponse', () => {
    it('stores response with cachedAt timestamp', async () => {
      const before = new Date().toISOString();

      await setCachedResponse('tenant-1', 'query', {
        content: 'Answer',
        confidence: 0.9,
        citations: []
      });

      const result = await getCachedResponse('tenant-1', 'query');
      expect(result!.cachedAt).toBeDefined();
      expect(new Date(result!.cachedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime()
      );
    });

    it('calls redis.set with TTL', async () => {
      const redis = await getMockRedis();

      await setCachedResponse(
        'tenant-1',
        'query',
        { content: 'x', confidence: 0.5, citations: [] },
        600
      );

      expect(redis.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ content: 'x' }),
        { ex: 600 }
      );
    });

    it('silently fails when Redis is unavailable', async () => {
      const redis = await getMockRedis();
      redis.set.mockRejectedValueOnce(new Error('connection refused'));

      // Should not throw
      await setCachedResponse('tenant-1', 'query', {
        content: 'x',
        confidence: 0.5,
        citations: []
      });
    });
  });

  describe('invalidateTenantCache', () => {
    it('deletes all keys for a tenant', async () => {
      await setCachedResponse('tenant-1', 'q1', {
        content: 'a1',
        confidence: 0.9,
        citations: []
      });
      await setCachedResponse('tenant-1', 'q2', {
        content: 'a2',
        confidence: 0.8,
        citations: []
      });

      const deleted = await invalidateTenantCache('tenant-1');
      expect(deleted).toBeGreaterThanOrEqual(2);
    });

    it('does not delete keys from other tenants', async () => {
      await setCachedResponse('tenant-1', 'q1', {
        content: 'a1',
        confidence: 0.9,
        citations: []
      });
      await setCachedResponse('tenant-2', 'q2', {
        content: 'a2',
        confidence: 0.8,
        citations: []
      });

      await invalidateTenantCache('tenant-1');

      const result = await getCachedResponse('tenant-2', 'q2');
      expect(result).not.toBeNull();
    });

    it('returns 0 when no keys exist', async () => {
      const deleted = await invalidateTenantCache('tenant-nonexistent');
      expect(deleted).toBe(0);
    });

    it('returns 0 when Redis is unavailable', async () => {
      const { getRedis } = await import('@/lib/cache/redis');
      (getRedis as Mock).mockReturnValueOnce(null);

      const deleted = await invalidateTenantCache('tenant-1');
      expect(deleted).toBe(0);
    });
  });
});
