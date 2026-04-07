import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/chat/messages/route';
import { createAdminClient } from '@/lib/appwrite/server';

function makeRequest(conversationId: string) {
  return new NextRequest(
    `http://localhost:3000/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer test-api-key'
      }
    }
  );
}

describe('/api/chat/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns explicit conversation_closed message events for widget gating', async () => {
    const adminDb = (createAdminClient as Mock)().databases;

    // Tenant lookup
    adminDb.listDocuments.mockResolvedValueOnce({
      documents: [{ $id: 'tenant-1', apiKey: 'test-api-key', config: '{}' }],
      total: 1
    });

    // Conversation lookup
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'resolved',
      assignedTo: null
    });

    // Message list
    adminDb.listDocuments.mockResolvedValueOnce({
      documents: [
        {
          $id: 'msg-close',
          role: 'system',
          content: 'This conversation has been closed.',
          confidence: null,
          metadata: JSON.stringify({
            senderType: 'system',
            eventType: 'conversation_closed'
          }),
          $createdAt: new Date().toISOString()
        }
      ],
      total: 1
    });

    const res = await GET(makeRequest('conv-1'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.conversationStatus).toBe('closed');
    expect(data.messages[0].eventType).toBe('conversation_closed');
  });
});
