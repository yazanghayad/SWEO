import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

vi.mock('@/lib/appwrite/get-authenticated-tenant', () => ({
  getAuthenticatedTenantId: vi.fn(),
  getAuthenticatedTenantContext: vi.fn()
}));

import { createAdminClient } from '@/lib/appwrite/server';
import {
  getAuthenticatedTenantContext,
  getAuthenticatedTenantId
} from '@/lib/appwrite/get-authenticated-tenant';
import {
  closeConversationAction,
  saveAgentReplyAction
} from '@/features/conversation/actions/conversation-crud';

describe('conversation actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedTenantId as Mock).mockResolvedValue('tenant-1');
    (getAuthenticatedTenantContext as Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      userId: 'agent-1',
      userName: 'Agent One',
      userEmail: 'agent1@example.com'
    });
  });

  it('moves first agent reply to human_active without closing the conversation', async () => {
    const adminDb = (createAdminClient as Mock)().databases;
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'queued',
      firstResponseAt: null,
      metadata: JSON.stringify({ handoff: {} })
    });
    adminDb.createDocument.mockResolvedValueOnce({ $id: 'msg-1' });
    adminDb.updateDocument.mockResolvedValueOnce({});

    const result = await saveAgentReplyAction({
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      content: 'Hej! Hur kan jag hjälpa dig?'
    });

    expect(result.success).toBe(true);
    const updatePayload = adminDb.updateDocument.mock.calls[0][3] as Record<
      string,
      unknown
    >;
    expect(updatePayload.status).toBe('human_active');
    expect(updatePayload.resolvedAt).toBeNull();
    expect(updatePayload.firstResponseAt).toEqual(expect.any(String));
  });

  it('blocks agent replies if conversation is already closed', async () => {
    const adminDb = (createAdminClient as Mock)().databases;
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'resolved',
      firstResponseAt: null,
      metadata: '{}'
    });

    const result = await saveAgentReplyAction({
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      content: 'Late reply'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('closed');
    expect(adminDb.createDocument).not.toHaveBeenCalled();
    expect(adminDb.updateDocument).not.toHaveBeenCalled();
  });

  it('rejects reply when agent is not authenticated', async () => {
    (getAuthenticatedTenantContext as Mock).mockRejectedValueOnce(
      new Error('Unauthorized')
    );

    const result = await saveAgentReplyAction({
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      content: 'Hej!'
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('allows only assigned agent to reply', async () => {
    const adminDb = (createAdminClient as Mock)().databases;
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'human_active',
      assignedTo: 'agent-42',
      firstResponseAt: '2026-03-04T00:00:00.000Z',
      metadata: '{}'
    });

    const denied = await saveAgentReplyAction({
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      content: 'Agent one reply'
    });

    expect(denied.success).toBe(false);
    expect(denied.error).toContain('assigned to another agent');
    expect(adminDb.createDocument).not.toHaveBeenCalled();

    (getAuthenticatedTenantContext as Mock).mockResolvedValueOnce({
      tenantId: 'tenant-1',
      userId: 'agent-42',
      userName: 'Agent 42',
      userEmail: 'agent42@example.com'
    });

    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'human_active',
      assignedTo: 'agent-42',
      firstResponseAt: '2026-03-04T00:00:00.000Z',
      metadata: '{}'
    });
    adminDb.createDocument.mockResolvedValueOnce({ $id: 'msg-42' });

    const allowed = await saveAgentReplyAction({
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      content: 'Assigned agent reply'
    });

    expect(allowed.success).toBe(true);
    expect(adminDb.createDocument).toHaveBeenCalledTimes(1);
  });

  it('falls back to escalated when legacy status enum rejects human_active', async () => {
    const adminDb = (createAdminClient as Mock)().databases;
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'escalated',
      assignedTo: null,
      firstResponseAt: null,
      metadata: '{}'
    });
    adminDb.createDocument.mockResolvedValueOnce({ $id: 'msg-legacy' });
    adminDb.updateDocument
      .mockRejectedValueOnce(
        new Error(
          'Invalid document structure: Attribute "status" has invalid format. Value must be one of (active, resolved, escalated)'
        )
      )
      .mockResolvedValueOnce({});

    const result = await saveAgentReplyAction({
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      content: 'Legacy fallback reply'
    });

    expect(result.success).toBe(true);
    expect(adminDb.updateDocument).toHaveBeenCalledTimes(2);

    const firstUpdate = adminDb.updateDocument.mock.calls[0][3] as Record<
      string,
      unknown
    >;
    const secondUpdate = adminDb.updateDocument.mock.calls[1][3] as Record<
      string,
      unknown
    >;
    expect(firstUpdate.status).toBe('human_active');
    expect(secondUpdate.status).toBe('escalated');
  });

  it('emits an explicit conversation_closed event when closing', async () => {
    const adminDb = (createAdminClient as Mock)().databases;
    adminDb.getDocument.mockResolvedValueOnce({
      $id: 'conv-1',
      tenantId: 'tenant-1',
      status: 'human_active'
    });
    adminDb.createDocument.mockResolvedValueOnce({ $id: 'msg-close' });
    adminDb.updateDocument.mockResolvedValueOnce({});

    const result = await closeConversationAction('conv-1', 'tenant-1', 'agent-1');

    expect(result.success).toBe(true);

    const closeMessagePayload = adminDb.createDocument.mock.calls[0][3] as {
      metadata: string;
    };
    const metadata = JSON.parse(closeMessagePayload.metadata) as Record<
      string,
      unknown
    >;
    expect(metadata.eventType).toBe('conversation_closed');
    expect(metadata.closedBy).toBe('agent-1');

    const updatePayload = adminDb.updateDocument.mock.calls[0][3] as Record<
      string,
      unknown
    >;
    expect(updatePayload.status).toBe('resolved');
    expect(updatePayload.resolvedAt).toEqual(expect.any(String));
  });
});
