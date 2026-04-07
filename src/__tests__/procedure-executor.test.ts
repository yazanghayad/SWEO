import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Appwrite
vi.mock('@/lib/appwrite/server', () => {
  const mockDatabases = {
    listDocuments: vi.fn().mockResolvedValue({ documents: [], total: 0 }),
    getDocument: vi.fn().mockResolvedValue({}),
    createDocument: vi.fn().mockResolvedValue({ $id: 'new-doc' }),
    updateDocument: vi.fn().mockResolvedValue({}),
    deleteDocument: vi.fn().mockResolvedValue({})
  };
  return {
    createAdminClient: vi.fn(() => ({
      databases: mockDatabases,
      client: {},
      account: {},
      users: {},
      teams: {}
    }))
  };
});

vi.mock('@/lib/audit/logger', () => ({
  logAuditEventAsync: vi.fn()
}));

vi.mock('@/lib/security/url-validator', () => ({
  validateExternalUrl: vi.fn().mockResolvedValue(undefined)
}));

import {
  executeProcedure,
  findMatchingProcedure,
  type ProcedureContext
} from '@/lib/ai/procedure-executor';
import type { Procedure, ProcedureStep } from '@/types/appwrite';
import { createAdminClient } from '@/lib/appwrite/server';

// Helper to build a minimal Procedure shape
function mockProcedure(
  overrides: Partial<Procedure> & { steps: ProcedureStep[] }
): Procedure {
  return {
    $id: overrides.$id ?? 'proc-1',
    $collectionId: 'procedures',
    $databaseId: 'test-db',
    $createdAt: '2025-01-01T00:00:00.000Z',
    $updatedAt: '2025-01-01T00:00:00.000Z',
    $permissions: [],
    tenantId: 'tenant-1',
    name: overrides.name ?? 'Test Procedure',
    description: overrides.description ?? '',
    trigger: overrides.trigger ?? JSON.stringify({ type: 'keyword', condition: 'test' }),
    steps: overrides.steps as unknown as ProcedureStep[],
    enabled: overrides.enabled ?? true,
    version: 1
  } as unknown as Procedure;
}

const baseContext: ProcedureContext = {
  tenantId: 'tenant-1',
  conversationId: 'conv-1',
  userId: 'user-1',
  variables: {},
  dryRun: false
};

describe('Procedure Executor - executeProcedure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes a single message step', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'message',
          config: { template: 'Hello, {{name}}!' }
        }
      ]
    });

    const result = await executeProcedure(procedure, {
      ...baseContext,
      variables: { name: 'Alice' }
    });

    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(1);
    expect(result.finalMessage).toBe('Hello, Alice!');
  });

  it('executes a sequence of steps via nextStep', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'message',
          config: { template: 'Step 1' },
          nextStep: 'step2'
        },
        {
          id: 'step2',
          type: 'message',
          config: { template: 'Step 2' }
        }
      ]
    });

    const result = await executeProcedure(procedure, baseContext);

    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(2);
    expect(result.finalMessage).toBe('Step 2');
  });

  it('handles conditional branching – true path', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'conditional',
          config: {
            condition: '{{amount}} > 100',
            trueStep: 'big',
            falseStep: 'small'
          }
        },
        {
          id: 'big',
          type: 'message',
          config: { template: 'Big order!' }
        },
        {
          id: 'small',
          type: 'message',
          config: { template: 'Small order.' }
        }
      ]
    });

    const result = await executeProcedure(procedure, {
      ...baseContext,
      variables: { amount: 200 }
    });

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('Big order!');
  });

  it('handles conditional branching – false path', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'conditional',
          config: {
            condition: '{{amount}} > 100',
            trueStep: 'big',
            falseStep: 'small'
          }
        },
        {
          id: 'big',
          type: 'message',
          config: { template: 'Big order!' }
        },
        {
          id: 'small',
          type: 'message',
          config: { template: 'Small order.' }
        }
      ]
    });

    const result = await executeProcedure(procedure, {
      ...baseContext,
      variables: { amount: 50 }
    });

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('Small order.');
  });

  it('skips API calls in dryRun mode', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'api_call',
          config: {
            dataConnector: 'shopify',
            endpoint: 'orders.get'
          },
          nextStep: 'step2'
        },
        {
          id: 'step2',
          type: 'message',
          config: { template: 'Done!' }
        }
      ]
    });

    const result = await executeProcedure(procedure, {
      ...baseContext,
      dryRun: true
    });

    expect(result.success).toBe(true);
    expect(result.steps[0].output._dryRun).toBe(true);
    expect(result.finalMessage).toBe('Done!');
  });

  it('auto-approves approval steps in dryRun mode', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'approval',
          config: {
            message: 'Refund > $100 requires approval',
            approvers: ['manager@test.com']
          }
        }
      ]
    });

    const result = await executeProcedure(procedure, {
      ...baseContext,
      dryRun: true
    });

    expect(result.success).toBe(true);
    expect(result.steps[0].output._dryRun).toBe(true);
  });

  it('fails gracefully with empty steps', async () => {
    const procedure = mockProcedure({ steps: [] });

    const result = await executeProcedure(procedure, baseContext);

    expect(result.success).toBe(false);
    expect(result.error).toContain('no steps');
  });

  it('fails when API call has missing connector config', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'api_call',
          config: {} // missing dataConnector and endpoint
        }
      ]
    });

    const result = await executeProcedure(procedure, baseContext);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing dataConnector');
  });

  it('handles nested variable interpolation', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'message',
          config: {
            template:
              'Hi {{user.name}}, your order #{{order.id}} totalling ${{order.total}} is confirmed.'
          }
        }
      ]
    });

    const result = await executeProcedure(procedure, {
      ...baseContext,
      variables: {
        user: { name: 'Alice' },
        order: { id: '12345', total: '99.99' }
      }
    });

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe(
      'Hi Alice, your order #12345 totalling $99.99 is confirmed.'
    );
  });

  it('keeps placeholder for missing variables', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'message',
          config: { template: 'Hello {{missing.key}}!' }
        }
      ]
    });

    const result = await executeProcedure(procedure, baseContext);

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('Hello {{missing.key}}!');
  });

  it('handles unknown step types gracefully', async () => {
    const procedure = mockProcedure({
      steps: [
        {
          id: 'step1',
          type: 'unknown_type' as ProcedureStep['type'],
          config: {}
        }
      ]
    });

    const result = await executeProcedure(procedure, baseContext);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown step type');
  });
});

describe('Procedure Executor - findMatchingProcedure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches a keyword trigger', async () => {
    const admin = (createAdminClient as Mock)();
    admin.databases.listDocuments.mockResolvedValue({
      documents: [
        {
          $id: 'proc-1',
          tenantId: 'tenant-1',
          name: 'Refund Procedure',
          trigger: JSON.stringify({ type: 'keyword', condition: 'refund,return' }),
          steps: '[]',
          enabled: true
        }
      ],
      total: 1
    });

    const result = await findMatchingProcedure(
      'tenant-1',
      'I want a refund please'
    );
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Refund Procedure');
  });

  it('matches an intent trigger', async () => {
    const admin = (createAdminClient as Mock)();
    admin.databases.listDocuments.mockResolvedValue({
      documents: [
        {
          $id: 'proc-2',
          tenantId: 'tenant-1',
          name: 'Cancel Procedure',
          trigger: JSON.stringify({
            type: 'intent',
            condition: 'cancel_subscription'
          }),
          steps: '[]',
          enabled: true
        }
      ],
      total: 1
    });

    const result = await findMatchingProcedure(
      'tenant-1',
      'I need to cancel_subscription now'
    );
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Cancel Procedure');
  });

  it('ignores manual triggers', async () => {
    const admin = (createAdminClient as Mock)();
    admin.databases.listDocuments.mockResolvedValue({
      documents: [
        {
          $id: 'proc-3',
          tenantId: 'tenant-1',
          name: 'Manual Only',
          trigger: JSON.stringify({ type: 'manual', condition: '' }),
          steps: '[]',
          enabled: true
        }
      ],
      total: 1
    });

    const result = await findMatchingProcedure('tenant-1', 'any message');
    expect(result).toBeNull();
  });

  it('returns null when no procedures match', async () => {
    const admin = (createAdminClient as Mock)();
    admin.databases.listDocuments.mockResolvedValue({
      documents: [],
      total: 0
    });

    const result = await findMatchingProcedure('tenant-1', 'hello');
    expect(result).toBeNull();
  });

  it('is case-insensitive for keyword matching', async () => {
    const admin = (createAdminClient as Mock)();
    admin.databases.listDocuments.mockResolvedValue({
      documents: [
        {
          $id: 'proc-1',
          tenantId: 'tenant-1',
          name: 'Refund',
          trigger: JSON.stringify({ type: 'keyword', condition: 'REFUND' }),
          steps: '[]',
          enabled: true
        }
      ],
      total: 1
    });

    const result = await findMatchingProcedure(
      'tenant-1',
      'I need a refund'
    );
    expect(result).not.toBeNull();
  });
});
