import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// ── Simulation Engine tests ──────────────────────────────────────────────

vi.mock('@/lib/ai/retrieval', () => ({
  vectorSearch: vi.fn(),
  // Identity: test scores are already in 0-1 calibrated range
  normalizeScore: (score: number) => score
}));

vi.mock('@/lib/ai/llm', () => ({
  generateCompletion: vi.fn()
}));

vi.mock('@/lib/ai/policy-engine', () => ({
  loadTenantPolicies: vi.fn().mockResolvedValue([]),
  validatePolicies: vi.fn().mockReturnValue({ passed: true, violations: [] }),
  redactPII: vi.fn((text: string) => text)
}));

vi.mock('@/lib/ai/procedure-executor', () => ({
  findMatchingProcedure: vi.fn().mockResolvedValue(null),
  executeProcedure: vi.fn()
}));

import { runSimulation, type SimulationInput } from '@/lib/ai/simulation-engine';
import { vectorSearch } from '@/lib/ai/retrieval';
import { generateCompletion } from '@/lib/ai/llm';
import { validatePolicies, redactPII } from '@/lib/ai/policy-engine';
import { findMatchingProcedure, executeProcedure } from '@/lib/ai/procedure-executor';

function setupRagSuccess() {
  (vectorSearch as Mock).mockResolvedValue([
    {
      id: 'chunk-1',
      score: 0.92,
      text: 'Answer from knowledge base.',
      metadata: { text: 'Answer from knowledge base.', sourceId: 'src-1' }
    }
  ]);

  (generateCompletion as Mock).mockResolvedValue({
    content: 'Here is your answer based on our knowledge base.',
    model: 'gpt-4o',
    usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    finishReason: 'stop'
  });
}

describe('Simulation Engine - runSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupRagSuccess();
    (validatePolicies as Mock).mockReturnValue({ passed: true, violations: [] });
    (redactPII as Mock).mockImplementation((t: string) => t);
    (findMatchingProcedure as Mock).mockResolvedValue(null);
  });

  it('runs a single-turn simulation successfully', async () => {
    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['How do I reset my password?']
    };

    const result = await runSimulation(input);

    expect(result.success).toBe(true);
    expect(result.turns).toHaveLength(1);
    expect(result.turns[0].assistantResponse).toContain('answer');
    expect(result.turns[0].confidence).toBeGreaterThan(0.7);
    expect(result.turns[0].escalated).toBe(false);
    expect(result.turns[0].policyBlocked).toBe(false);
  });

  it('runs a multi-turn simulation', async () => {
    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['Hello', 'How do I reset?', 'Thanks']
    };

    const result = await runSimulation(input);

    expect(result.success).toBe(true);
    expect(result.turns).toHaveLength(3);
    expect(result.metrics.totalTurns).toBe(3);
  });

  it('computes correct metrics', async () => {
    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['Question 1', 'Question 2']
    };

    const result = await runSimulation(input);

    expect(result.metrics.avgConfidence).toBeGreaterThan(0);
    expect(result.metrics.resolutionRate).toBeGreaterThanOrEqual(0);
    expect(result.metrics.escalationRate).toBeGreaterThanOrEqual(0);
    expect(result.metrics.totalTurns).toBe(2);
  });

  it('escalates when retrieval returns no results', async () => {
    (vectorSearch as Mock).mockResolvedValue([]);

    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['Something totally unknown']
    };

    const result = await runSimulation(input);

    expect(result.turns[0].escalated).toBe(true);
    expect(result.turns[0].confidence).toBe(0);
    expect(result.metrics.escalationRate).toBe(1);
  });

  it('escalates when confidence is below threshold', async () => {
    (vectorSearch as Mock).mockResolvedValue([
      {
        id: 'chunk-1',
        score: 0.3,
        text: 'Low relevance.',
        metadata: { text: 'Low relevance.', sourceId: 'src-1' }
      }
    ]);

    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['Obscure question']
    };

    const result = await runSimulation(input);

    expect(result.turns[0].escalated).toBe(true);
    expect(result.turns[0].confidence).toBeLessThan(0.7);
  });

  it('blocks when pre-policy check fails', async () => {
    (validatePolicies as Mock).mockImplementation(
      (_content: string, _policies: unknown[], phase: string) => {
        if (phase === 'pre') {
          return {
            passed: false,
            violations: [
              { policyId: 'p1', policyName: 'Topic', policyType: 'topic_filter', message: 'Blocked: competitors' }
            ]
          };
        }
        return { passed: true, violations: [] };
      }
    );

    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['Tell me about competitors']
    };

    const result = await runSimulation(input);

    expect(result.turns[0].policyBlocked).toBe(true);
    expect(result.turns[0].policyViolations).toContain('Blocked: competitors');
    expect(vectorSearch).not.toHaveBeenCalled();
  });

  it('escalates when post-policy check fails', async () => {
    (validatePolicies as Mock).mockImplementation(
      (_content: string, _policies: unknown[], phase: string) => {
        if (phase === 'post') {
          return {
            passed: false,
            violations: [
              { policyId: 'p2', policyName: 'Tone', policyType: 'tone', message: 'Uncertain tone' }
            ]
          };
        }
        return { passed: true, violations: [] };
      }
    );

    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['Question']
    };

    const result = await runSimulation(input);

    expect(result.turns[0].escalated).toBe(true);
    expect(result.turns[0].policyBlocked).toBe(true);
    expect(result.turns[0].assistantResponse).toBeNull();
  });

  it('triggers procedure when testProcedures is enabled', async () => {
    (findMatchingProcedure as Mock).mockResolvedValue({
      $id: 'proc-1',
      name: 'Refund Procedure',
      steps: []
    });
    (executeProcedure as Mock).mockResolvedValue({
      success: true,
      finalMessage: 'Your refund has been processed.',
      steps: [{ id: 'step-1' }]
    });

    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['I want a refund'],
      testProcedures: true
    };

    const result = await runSimulation(input);

    expect(result.turns[0].procedureTriggered).toBe('Refund Procedure');
    expect(result.turns[0].assistantResponse).toContain('refund');
    expect(result.turns[0].confidence).toBe(1.0);
    expect(result.metrics.proceduresUsed).toContain('Refund Procedure');
  });

  it('does not check procedures when testProcedures is false', async () => {
    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['I want a refund'],
      testProcedures: false
    };

    await runSimulation(input);

    expect(findMatchingProcedure).not.toHaveBeenCalled();
  });

  it('applies PII redaction before vector search', async () => {
    (redactPII as Mock).mockReturnValue('How do I [REDACTED]?');

    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: ['How do I reset john@email.com?']
    };

    await runSimulation(input);

    expect(vectorSearch).toHaveBeenCalledWith(
      'tenant-1',
      'How do I [REDACTED]?',
      expect.any(Number)
    );
  });

  it('handles empty messages input', async () => {
    const input: SimulationInput = {
      tenantId: 'tenant-1',
      messages: []
    };

    const result = await runSimulation(input);

    expect(result.success).toBe(true);
    expect(result.turns).toHaveLength(0);
    expect(result.metrics.totalTurns).toBe(0);
    expect(result.metrics.avgConfidence).toBe(0);
  });
});
