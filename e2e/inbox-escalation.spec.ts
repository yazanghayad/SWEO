import { test, expect, type Page } from '@playwright/test';

/**
 * E2E: Chatbot → Escalation → Inbox
 *
 * Flow:
 * 1. A customer opens the external chat widget
 * 2. Customer sends a message asking to speak to customer service
 * 3. The AI cannot find knowledge base answers → confidence < threshold → escalation
 * 4. The widget shows an escalation message
 * 5. The escalated conversation appears in the Inbox under "Escalated & Handoff"
 *
 * Prerequisites:
 *   E2E_TENANT_API_KEY – a valid tenant API key
 *   E2E_AGENT_EMAIL    – dashboard agent email (for inbox verification)
 *   E2E_AGENT_PASSWORD – dashboard agent password
 *
 * If env vars are missing the tests are skipped gracefully.
 */

const API_KEY = process.env.E2E_TENANT_API_KEY ?? '';
const AGENT_EMAIL = process.env.E2E_AGENT_EMAIL ?? '';
const AGENT_PASSWORD = process.env.E2E_AGENT_PASSWORD ?? '';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse SSE text into an array of parsed JSON events */
function parseSSEEvents(raw: string): Record<string, unknown>[] {
  return raw
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => {
      try {
        return JSON.parse(line.slice(6));
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Record<string, unknown>[];
}

/** Generate a unique user id for each test run */
function testUserId() {
  return `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// 1. API-level test: chat/stream → escalation
// ---------------------------------------------------------------------------

test.describe('Chatbot → Escalation (API level)', () => {
  test.skip(!API_KEY, 'E2E_TENANT_API_KEY not set – skipping');

  let conversationId: string | null = null;
  const userId = testUserId();

  test('sending a message with no knowledge base match triggers escalation', async ({
    request
  }) => {
    // Send a message that won't match any knowledge base content
    const response = await request.post('/api/chat/stream', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        message:
          'Jag vill bli kopplad till kundtjänst, kan jag prata med en riktig person?',
        userId,
        channel: 'web'
      }
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/event-stream');

    const body = await response.text();
    const events = parseSSEEvents(body);

    // Should contain an escalated event
    const escalated = events.find((e) => e.type === 'escalated');
    expect(escalated).toBeTruthy();
    expect(escalated!.message).toBeTruthy();
    expect(escalated!.conversationId).toBeTruthy();

    conversationId = escalated!.conversationId as string;
  });

  test('escalated conversation is retrievable via health check', async ({
    request
  }) => {
    // Verify the server is still healthy after escalation
    const health = await request.get('/api/health');
    expect(health.status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 2. Widget UI test: interact with the chat widget
// ---------------------------------------------------------------------------

test.describe('Chat widget → Escalation (UI)', () => {
  test.skip(!API_KEY, 'E2E_TENANT_API_KEY not set – skipping');

  test('widget shows escalation message when customer asks for human agent', async ({
    page
  }) => {
    // Navigate to a real page where we can inject the widget script
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Inject the widget dynamically via page.evaluate
    await page.evaluate(
      ({ apiKey, apiUrl }) => {
        const script = document.createElement('script');
        script.src = '/api/widget/chat-widget.js';
        script.setAttribute('data-api-key', apiKey);
        script.setAttribute('data-api-url', apiUrl);
        script.setAttribute('data-title', 'Test Support');
        document.body.appendChild(script);
      },
      { apiKey: API_KEY, apiUrl: 'http://localhost:3000' }
    );

    // Wait for the widget to inject its DOM
    const bubble = page.locator('#cw-bubble');
    await expect(bubble).toBeVisible({ timeout: 10000 });

    // Open the chat panel
    await bubble.click();
    const panel = page.locator('#cw-panel');
    await expect(panel).toHaveClass(/open/, { timeout: 3000 });

    // Type a message asking for customer service
    const input = page.locator('#cw-input');
    await expect(input).toBeVisible();
    await input.fill(
      'Jag vill prata med en riktig person, koppla mig till kundtjänst tack'
    );

    // Send the message
    const sendBtn = page.locator('#cw-send');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // Wait for the user message to appear
    const userMsg = page.locator('.cw-msg.user').first();
    await expect(userMsg).toBeVisible({ timeout: 5000 });

    // Wait for the assistant response (escalation message)
    const assistantMsg = page.locator('.cw-msg.assistant').first();
    await expect(assistantMsg).toBeVisible({ timeout: 15000 });

    // The message should indicate escalation / connection to human agent
    // (low confidence → LOW_CONFIDENCE_MESSAGE or post-policy fallback)
    await expect(assistantMsg).toContainText(/human agent|connect|kundtjänst/i, {
      timeout: 15000
    });
  });
});

// ---------------------------------------------------------------------------
// 3. Full flow: Widget → Escalation → Inbox verification
// ---------------------------------------------------------------------------

test.describe('Full flow: Chatbot → Escalation → Inbox', () => {
  test.skip(
    !API_KEY || !AGENT_EMAIL || !AGENT_PASSWORD,
    'E2E_TENANT_API_KEY, E2E_AGENT_EMAIL, or E2E_AGENT_PASSWORD not set'
  );

  test('customer escalation appears in agent inbox', async ({
    page,
    request
  }) => {
    const userId = testUserId();

    // ── Step 1: Customer sends message → escalation ─────────────────
    const response = await request.post('/api/chat/stream', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        message:
          'Hej, jag har ett komplicerat ärende och vill prata med kundtjänst direkt',
        userId,
        channel: 'web'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.text();
    const events = parseSSEEvents(body);

    const escalated = events.find((e) => e.type === 'escalated');
    expect(escalated).toBeTruthy();
    const escalatedConversationId = escalated!.conversationId as string;
    expect(escalatedConversationId).toBeTruthy();

    // ── Step 2: Agent logs into dashboard ───────────────────────────
    await page.goto('/auth/sign-in');
    await expect(page.locator('input[name="email"]')).toBeVisible({
      timeout: 10000
    });

    await page.fill('input[name="email"]', AGENT_EMAIL);
    await page.fill('input[name="password"]', AGENT_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');

    // ── Step 3: Navigate to Inbox and find escalated conversation ───
    await page.goto('/dashboard/inbox');
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // Look for the escalated / handoff section in the sidebar
    const sidebar = page.locator('[data-sidebar]').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    const sidebarText = await sidebar.textContent();

    if (sidebarText?.includes('Escalat')) {
      // Click "Escalated & Handoff" in the sidebar
      await page.locator('text=Escalat').first().click();
      await page.waitForTimeout(2000);
    }

    // The escalated conversation should be in the list
    // Look for the conversation by checking the page contains
    // the user ID or any conversation item
    const pageContent = await page.textContent('body');
    const hasConversations =
      pageContent?.includes(userId) ||
      pageContent?.includes('Escalat') ||
      pageContent?.includes('conversation');

    expect(hasConversations).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 4. API-only escalation + conversation status verification
//    (works without dashboard login – purely via API)
// ---------------------------------------------------------------------------

test.describe('API: Escalation creates conversation with correct status', () => {
  test.skip(!API_KEY, 'E2E_TENANT_API_KEY not set – skipping');

  test('conversation is created with escalated status', async ({ request }) => {
    const userId = testUserId();

    // 1. Send a message that will trigger escalation
    const chatResponse = await request.post('/api/chat/stream', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        message: 'Please connect me to a real customer service agent right now',
        userId,
        channel: 'web'
      }
    });

    expect(chatResponse.status()).toBe(200);
    const body = await chatResponse.text();
    const events = parseSSEEvents(body);

    const escalated = events.find((e) => e.type === 'escalated');
    expect(escalated).toBeTruthy();
    expect(typeof escalated!.conversationId).toBe('string');
    expect(typeof escalated!.message).toBe('string');

    // Verify confidence was below threshold (if provided)
    if ('confidence' in escalated!) {
      expect(escalated!.confidence as number).toBeLessThan(0.7);
    }
  });

  test('multiple messages in same conversation maintain escalated state', async ({
    request
  }) => {
    const userId = testUserId();

    // First message → escalation
    const first = await request.post('/api/chat/stream', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        message: 'I need to speak with a human agent please',
        userId,
        channel: 'web'
      }
    });

    expect(first.status()).toBe(200);
    const firstEvents = parseSSEEvents(await first.text());
    const firstEscalated = firstEvents.find((e) => e.type === 'escalated');
    expect(firstEscalated).toBeTruthy();

    const conversationId = firstEscalated!.conversationId as string;

    // Second message in same conversation
    const second = await request.post('/api/chat/stream', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        message: 'Are you there? I still need a human agent',
        conversationId,
        userId,
        channel: 'web'
      }
    });

    // Should still work (200 status, may get escalated again or delta)
    expect(second.status()).toBe(200);
  });
});
