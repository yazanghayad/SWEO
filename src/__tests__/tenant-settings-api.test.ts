import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────

const mockAccountGet = vi.fn().mockResolvedValue({
  $id: 'user-1',
  name: 'Test User',
  email: 'test@example.com'
});
const mockListDocuments = vi.fn();
const mockUpdateDocument = vi.fn();

vi.mock('@/lib/appwrite/server', () => ({
  createSessionClient: vi.fn(() =>
    Promise.resolve({
      account: { get: mockAccountGet },
      databases: { listDocuments: mockListDocuments }
    })
  ),
  createAdminClient: vi.fn(() => ({
    databases: {
      listDocuments: mockListDocuments,
      updateDocument: mockUpdateDocument,
      getDocument: vi.fn()
    },
    client: {}
  }))
}));

vi.mock('@/lib/audit/logger', () => ({
  logAuditEventAsync: vi.fn()
}));

vi.mock('@/lib/tenant/subdomain', () => ({
  validateSubdomain: vi.fn().mockReturnValue(null),
  normalizeSubdomain: vi.fn((s: string) => s.toLowerCase()),
  isSubdomainAvailable: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/lib/encryption', () => ({
  encrypt: vi.fn((s: string) => `encrypted:${s}`)
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

vi.mock('@/lib/rate-limit/middleware', () => ({
  applyIpRateLimit: vi.fn().mockResolvedValue(null),
  applyRateLimits: vi.fn().mockResolvedValue(undefined)
}));

// ── Helpers ──────────────────────────────────────────────────────────────

const mockTenant = {
  $id: 'tenant-1',
  name: 'Test Company',
  plan: 'pro',
  userId: 'user-1',
  config: JSON.stringify({ model: 'gpt-4o', aiEnabled: true }),
  apiKey: 'abc123',
  subdomain: 'testco'
};

function makeRequest(
  method: string,
  body?: Record<string, unknown>
): NextRequest {
  return new NextRequest('http://localhost:3000/api/tenant/settings', {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('GET /api/tenant/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListDocuments.mockResolvedValue({
      documents: [mockTenant],
      total: 1
    });
  });

  it('returns tenant config', async () => {
    const { GET } = await import('@/app/api/tenant/settings/route');
    const res = await GET(makeRequest('GET'));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Test Company');
    expect(data.config).toBeDefined();
    expect(data.config.model).toBe('gpt-4o');
  });

  it('returns 401 for unauthenticated user', async () => {
    const { createSessionClient } = await import('@/lib/appwrite/server');
    vi.mocked(createSessionClient).mockRejectedValueOnce(
      new Error('No session')
    );

    const { GET } = await import('@/app/api/tenant/settings/route');
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/tenant/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListDocuments.mockResolvedValue({
      documents: [mockTenant],
      total: 1
    });
    mockUpdateDocument.mockResolvedValue({ ...mockTenant });
  });

  it('updates config fields', async () => {
    const { PATCH } = await import('@/app/api/tenant/settings/route');
    const res = await PATCH(
      makeRequest('PATCH', {
        aiEnabled: false,
        confidenceThreshold: 0.8
      })
    );

    expect(res.status).toBe(200);
    expect(mockUpdateDocument).toHaveBeenCalled();
  });

  it('updates tenant name', async () => {
    const { PATCH } = await import('@/app/api/tenant/settings/route');
    const res = await PATCH(
      makeRequest('PATCH', {
        name: 'New Company Name'
      })
    );

    expect(res.status).toBe(200);
    expect(mockUpdateDocument).toHaveBeenCalled();
  });

  it('returns 401 for unauthenticated user', async () => {
    const { createSessionClient } = await import('@/lib/appwrite/server');
    vi.mocked(createSessionClient).mockRejectedValueOnce(
      new Error('No session')
    );

    const { PATCH } = await import('@/app/api/tenant/settings/route');
    const res = await PATCH(
      makeRequest('PATCH', { aiEnabled: true })
    );
    expect(res.status).toBe(401);
  });
});
