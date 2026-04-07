'use server';

/**
 * Test scenario CRUD server actions.
 */

import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { ID, Query } from 'node-appwrite';
import type { TestScenario, TestScenarioExpected } from '@/types/appwrite';
import { runSimulation } from '@/lib/ai/simulation-engine';
import { logAuditEventAsync } from '@/lib/audit/logger';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import {
  type ActionResult,
  TESTING_PATH,
  serialize,
  toErrorMessage
} from './helpers';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export async function listScenariosAction(
  tenantId: string
): Promise<ActionResult<TestScenario[]>> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();
    const result = await databases.listDocuments<TestScenario>(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      [
        Query.equal('tenantId', tenantId),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
    );

    const scenarios = result.documents.map(parseScenarioDoc);

    return { success: true, data: serialize(scenarios) };
  } catch (err) {
    logger.error('listScenariosAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateScenarioInput {
  name: string;
  messages: string[];
  expectedOutcome: TestScenarioExpected;
}

export async function createScenarioAction(
  tenantId: string,
  input: CreateScenarioInput
): Promise<ActionResult<{ scenarioId: string }>> {
  try {
    await (await createSessionClient()).account.get();

    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: 'Name is required' };
    }
    if (!input.messages || input.messages.length === 0) {
      return { success: false, error: 'At least one message is required' };
    }

    const { databases } = createAdminClient();

    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      ID.unique(),
      {
        tenantId,
        name: input.name.trim(),
        messages: JSON.stringify(input.messages),
        expectedOutcome: JSON.stringify(input.expectedOutcome),
        lastRun: null
      }
    );

    revalidatePath(TESTING_PATH);
    return { success: true, data: { scenarioId: doc.$id } };
  } catch (err) {
    logger.error('createScenarioAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateScenarioAction(
  scenarioId: string,
  tenantId: string,
  input: Partial<CreateScenarioInput>
): Promise<ActionResult> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();

    const existing = await databases.getDocument<TestScenario>(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      scenarioId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.messages !== undefined)
      updates.messages = JSON.stringify(input.messages);
    if (input.expectedOutcome !== undefined)
      updates.expectedOutcome = JSON.stringify(input.expectedOutcome);

    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      scenarioId,
      updates
    );

    revalidatePath(TESTING_PATH);
    return { success: true };
  } catch (err) {
    logger.error('updateScenarioAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteScenarioAction(
  scenarioId: string,
  tenantId: string
): Promise<ActionResult> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();

    const existing = await databases.getDocument<TestScenario>(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      scenarioId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      scenarioId
    );

    revalidatePath(TESTING_PATH);
    return { success: true };
  } catch (err) {
    logger.error('deleteScenarioAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Run scenario
// ---------------------------------------------------------------------------

export interface RunScenarioData {
  passed: boolean;
  actualResolution: boolean;
  actualAvgConfidence: number;
  expectedResolution: boolean;
  expectedMinConfidence: number;
  turns: number;
}

export async function runScenarioAction(
  scenarioId: string,
  tenantId: string
): Promise<ActionResult<RunScenarioData>> {
  const emptyData: RunScenarioData = {
    passed: false,
    actualResolution: false,
    actualAvgConfidence: 0,
    expectedResolution: false,
    expectedMinConfidence: 0,
    turns: 0,
  };

  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();

    const doc = await databases.getDocument<TestScenario>(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      scenarioId
    );
    if (doc.tenantId !== tenantId) {
      return { success: false, data: emptyData, error: 'Access denied' };
    }

    const scenario = parseScenarioDoc(doc);
    const messages = scenario.messages;
    const expected = scenario.expectedOutcome;

    // Run simulation
    const result = await runSimulation({
      tenantId,
      messages,
      testProcedures: true
    });

    // Handle simulation-level failure (e.g. timeout)
    if (!result.success) {
      // Still update lastRun so the UI reflects that an attempt was made
      try {
        await databases.updateDocument(
          APPWRITE_DATABASE,
          COLLECTION.TEST_SCENARIOS,
          scenarioId,
          { lastRun: new Date().toISOString() }
        );
      } catch { /* ignore */ }

      return {
        success: false,
        data: {
          ...emptyData,
          expectedResolution: expected.resolved,
          expectedMinConfidence: expected.minConfidence ?? 0,
        },
        error: result.error ?? 'Simulation failed'
      };
    }

    // Update lastRun
    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      scenarioId,
      { lastRun: new Date().toISOString() }
    );

    // Compare result vs expected
    const actualResolution = result.metrics.resolutionRate > 0.5;
    const actualAvgConfidence = result.metrics.avgConfidence;
    const expectedResolution = expected.resolved;
    const expectedMinConfidence = expected.minConfidence ?? 0;

    const passed =
      actualResolution === expectedResolution &&
      actualAvgConfidence >= expectedMinConfidence;

    logAuditEventAsync(tenantId, 'simulation.run', {
      scenarioId,
      passed,
      actualResolution,
      actualAvgConfidence,
      turns: result.metrics.totalTurns
    });

    revalidatePath(TESTING_PATH);
    return {
      success: true,
      data: {
        passed,
        actualResolution,
        actualAvgConfidence,
        expectedResolution,
        expectedMinConfidence,
        turns: result.metrics.totalTurns
      }
    };
  } catch (err) {
    logger.error('runScenarioAction error', { err });
    return { success: false, data: emptyData, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseScenarioDoc(doc: TestScenario): TestScenario {
  const plain = JSON.parse(JSON.stringify(doc));
  return {
    ...plain,
    messages:
      typeof plain.messages === 'string'
        ? JSON.parse(plain.messages)
        : plain.messages,
    expectedOutcome:
      typeof plain.expectedOutcome === 'string'
        ? JSON.parse(plain.expectedOutcome)
        : plain.expectedOutcome
  };
}

// ---------------------------------------------------------------------------
// Seed demo scenarios
// ---------------------------------------------------------------------------

const DEMO_SCENARIOS: Array<{
  name: string;
  messages: string[];
  expectedOutcome: TestScenarioExpected;
}> = [
  {
    name: 'Knowledge Base – Grundläggande fråga',
    messages: [
      'Vad är SWEO AI och hur fungerar flywheel-modellen?'
    ],
    expectedOutcome: { resolved: true, minConfidence: 0.6 }
  },
  {
    name: 'Skapa konto & Workspace',
    messages: [
      'Hur skapar jag ett konto och ett workspace?',
      'Vilka roller och behörigheter finns?'
    ],
    expectedOutcome: { resolved: true, minConfidence: 0.6 }
  },
  {
    name: 'Procedures – Returhantering',
    messages: [
      'Hur skapar jag en procedure för returhantering?'
    ],
    expectedOutcome: { resolved: true, minConfidence: 0.6 }
  },
  {
    name: 'Policies & GDPR',
    messages: [
      'Hur konfigurerar jag GDPR-policies för min AI-agent?'
    ],
    expectedOutcome: { resolved: true, minConfidence: 0.6 }
  },
  {
    name: 'Okänd fråga – bör eskalera',
    messages: [
      'Kan ni boka en flygresa åt mig till Tokyo?'
    ],
    expectedOutcome: { resolved: false, minConfidence: 0 }
  }
];

export async function seedDemoScenariosAction(
  tenantId: string
): Promise<ActionResult<{ created: number }>> {
  try {
    await (await createSessionClient()).account.get();

    const { databases } = createAdminClient();

    // Check existing scenarios to avoid duplicates
    const existing = await databases.listDocuments<TestScenario>(
      APPWRITE_DATABASE,
      COLLECTION.TEST_SCENARIOS,
      [Query.equal('tenantId', tenantId), Query.limit(100)]
    );
    const existingNames = new Set(existing.documents.map((d) => d.name));

    let created = 0;
    for (const scenario of DEMO_SCENARIOS) {
      if (existingNames.has(scenario.name)) continue;

      await databases.createDocument(
        APPWRITE_DATABASE,
        COLLECTION.TEST_SCENARIOS,
        ID.unique(),
        {
          tenantId,
          name: scenario.name,
          messages: JSON.stringify(scenario.messages),
          expectedOutcome: JSON.stringify(scenario.expectedOutcome),
          lastRun: null
        }
      );
      created++;
    }

    revalidatePath(TESTING_PATH);
    return { success: true, data: { created } };
  } catch (err) {
    logger.error('seedDemoScenariosAction error', { err });
    return { success: false, error: toErrorMessage(err) };
  }
}
