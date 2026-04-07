import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────

const mockListDocuments = vi.fn();

vi.mock('@/lib/appwrite/server', () => ({
  createAdminClient: vi.fn(() => ({
    databases: { listDocuments: mockListDocuments }
  }))
}));

vi.mock('@/lib/cors', () => ({
  corsHeaders: () => ({ 'Access-Control-Allow-Origin': '*' }),
  handlePreflight: vi.fn()
}));

vi.mock('@/lib/security/timing-safe-compare', () => ({
  safeCompare: vi.fn((a: string, b: string) => a === b)
}));

// ── Helpers ──────────────────────────────────────────────────────────────

function makeRequest(
  url: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), { headers });
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('GET /api/widget/config — query-param key rejection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects request with API key only in query param (no header)', async () => {
    const { GET } = await import('@/app/api/widget/config/route');
    const req = makeRequest('/api/widget/config?key=test-api-key');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Missing key parameter');
    // Server must never look up the tenant
    expect(mockListDocuments).not.toHaveBeenCalled();
  });

  it('accepts request with API key in x-tenant-api-key header', async () => {
    mockListDocuments.mockResolvedValueOnce({
      documents: [
        {
          $id: 'tenant-1',
          apiKey: 'valid-key',
          config: JSON.stringify({
            widgetBrandColor: '#000',
            widgetWelcomeMessage: 'Hi',
            widgetPosition: 'bottom-right'
          })
        }
      ]
    });
    // Guidance rules query
    mockListDocuments.mockResolvedValueOnce({ documents: [] });

    const { GET } = await import('@/app/api/widget/config/route');
    const req = makeRequest('/api/widget/config', {
      'x-tenant-api-key': 'valid-key'
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockListDocuments).toHaveBeenCalled();
  });
});

describe('GET /api/widget/outbound — query-param key rejection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects request with API key only in query param (no header)', async () => {
    const { GET } = await import('@/app/api/widget/outbound/route');
    const req = makeRequest('/api/widget/outbound?key=test-api-key');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Missing key parameter');
    expect(mockListDocuments).not.toHaveBeenCalled();
  });

  it('accepts request with API key in x-tenant-api-key header', async () => {
    mockListDocuments.mockResolvedValueOnce({
      documents: [
        {
          $id: 'tenant-1',
          apiKey: 'valid-key',
          config: '{}'
        }
      ]
    });
    // Outbound messages query
    mockListDocuments.mockResolvedValueOnce({ documents: [] });

    const { GET } = await import('@/app/api/widget/outbound/route');
    const req = makeRequest('/api/widget/outbound', {
      'x-tenant-api-key': 'valid-key'
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockListDocuments).toHaveBeenCalled();
  });
});
