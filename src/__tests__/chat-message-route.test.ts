import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/ai/orchestrator', () => ({
  orchestrate: vi.fn()
}));

vi.mock('@/lib/sanitize', () => ({
  sanitizeText: vi.fn((text: string) => text)
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

import { POST } from '@/app/api/chat/message/route';
import { orchestrate } from '@/lib/ai/orchestrator';
import { createAdminClient } from '@/lib/appwrite/server';

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-api-key'
    },
    body: JSON.stringify(body)
  });
}

function mockTenantLookup(adminDb: any) {
  adminDb.listDocuments.mockResolvedValueOnce({
    documents: [
      {
        $id: 'tenant-1',
        apiKey: 'test-api-key',
        config: JSON.stringify({})
      }
    ],
    total: 1
  });
}

describe('/api/chat/message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (orchestrate as Mock).mockResolvedValue({
      resolved: true,
      content: 'AI response',
      conversationId: 'conv-1',
      confidence: 0.92,
      citations: [],
      escalated: false
    });
  });

  it('uses orchestrator for active conversations', async () => {
    const adminDb = (createAdminClient as Mock)().databases;
    mockTenantLookup(adminDb);
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'active'
    });

    const res = await POST(
      makeRequest({
        message: 'Hello',
        conversationId: 'conv-1',
        channel: 'web'
      })
    );

    expect(res.status).toBe(200);
    expect(orchestrate).toHaveBeenCalledTimes(1);
  });

  it('does not run AI when human is handling the conversation', async () => {
    const adminDb = (createAdminClient as Mock)().databases;
    mockTenantLookup(adminDb);
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'human_active'
    });
    adminDb.createDocument.mockResolvedValueOnce({ $id: 'msg-1' });

    const res = await POST(
      makeRequest({
        message: 'Need more help',
        conversationId: 'conv-1',
        channel: 'web'
      })
    );

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(orchestrate).not.toHaveBeenCalled();
    expect(data.status).toBe('human_active');
    expect(data.resolved).toBe(false);

    const messagePayload = adminDb.createDocument.mock.calls[0][3] as Record<
      string,
      unknown
    >;
    expect(messagePayload.role).toBe('user');
    expect(messagePayload.content).toBe('Need more help');
  });

  it('rejects messages when conversation is already closed', async () => {
    const adminDb = (createAdminClient as Mock)().databases;
    mockTenantLookup(adminDb);
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'resolved'
    });

    const res = await POST(
      makeRequest({
        message: 'Hello again',
        conversationId: 'conv-1',
        channel: 'web'
      })
    );

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.status).toBe('closed');
    expect(orchestrate).not.toHaveBeenCalled();
  });
});
