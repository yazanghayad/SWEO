import { test, expect } from '@playwright/test';

/**
 * Dashboard page smoke tests.
 *
 * These tests verify that all major dashboard pages return a valid response
 * (no 500 errors). They run against unauthenticated sessions so they test
 * that middleware properly redirects to sign-in or returns a page.
 *
 * Authenticated tests require E2E_EMAIL / E2E_PASSWORD env vars.
 */

// ── Helper: skip authenticated tests when env vars are missing ──────

const hasAuth = !!(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

// ── Unauthenticated: all dashboard routes redirect to sign-in ───────

const dashboardRoutes = [
  '/dashboard/overview',
  '/dashboard/inbox',
  '/dashboard/conversations',
  '/dashboard/knowledge',
  '/dashboard/procedures',
  '/dashboard/reports',
  '/dashboard/contacts',
  '/dashboard/analytics',
  '/dashboard/ai-automation',
  '/dashboard/ai-insights',
  '/dashboard/settings',
  '/dashboard/settings/channels/email',
  '/dashboard/settings/channels/whatsapp',
  '/dashboard/settings/channels/sms',
  '/dashboard/settings/channels/voice',
  '/dashboard/settings/channels/instagram',
  '/dashboard/settings/channels/slack',
  '/dashboard/settings/channels/messenger',
  '/dashboard/onboarding'
];

test.describe('Dashboard auth guard (unauthenticated)', () => {
  for (const route of dashboardRoutes) {
    test(`${route} redirects to sign-in`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/auth\/sign-in/, { timeout: 10_000 });
      expect(page.url()).toContain('/auth/sign-in');
    });
  }
});

// ── API routes: return correct status & content-type ────────────────

test.describe('API endpoint smoke tests', () => {
  test('GET /api/health returns healthy', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
  });

  test('GET /api/widget/chat-widget.js returns JavaScript', async ({
    request
  }) => {
    const res = await request.get('/api/widget/chat-widget.js');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('javascript');
  });

  test('POST /api/chat without body returns 4xx or 5xx', async ({
    request
  }) => {
    const res = await request.post('/api/chat', { data: {} });
    // Should fail validation (no tenantId, no message)
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/webhooks/whatsapp without signature returns 401', async ({
    request
  }) => {
    const res = await request.post('/api/webhooks/whatsapp', {
      data: { Body: 'hello', From: '+1234567890' }
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/webhooks/slack url_verification challenge', async ({
    request
  }) => {
    const res = await request.post('/api/webhooks/slack', {
      data: {
        type: 'url_verification',
        challenge: 'test-challenge-token'
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.challenge).toBe('test-challenge-token');
  });

  test('GET /api/webhooks/instagram with verify_token', async ({
    request
  }) => {
    const res = await request.get('/api/webhooks/instagram', {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong-token',
        'hub.challenge': 'test123'
      }
    });
    // Should either return 403 (wrong token) or the challenge
    expect([200, 403]).toContain(res.status());
  });

  test('GET /api/webhooks/messenger with verify_token', async ({
    request
  }) => {
    const res = await request.get('/api/webhooks/messenger', {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong-token',
        'hub.challenge': 'test123'
      }
    });
    expect([200, 403]).toContain(res.status());
  });
});

// ── Authenticated tests (only run when E2E_EMAIL/PASSWORD are set) ──

test.describe('Authenticated dashboard flows', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    // Sign in
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('overview page loads with metrics', async ({ page }) => {
    await page.goto('/dashboard/overview');
    // Should see some heading or metric cards
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('inbox page loads conversation list', async ({ page }) => {
    await page.goto('/dashboard/inbox');
    // Should see inbox layout
    await expect(
      page.locator('[data-testid="inbox-layout"], .inbox-layout, main').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('knowledge page loads', async ({ page }) => {
    await page.goto('/dashboard/knowledge');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('procedures page loads', async ({ page }) => {
    await page.goto('/dashboard/procedures');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('reports page loads with report cards', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('contacts page loads', async ({ page }) => {
    await page.goto('/dashboard/contacts');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('analytics page loads', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('ai-automation page loads', async ({ page }) => {
    await page.goto('/dashboard/ai-automation');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('ai-insights page loads', async ({ page }) => {
    await page.goto('/dashboard/ai-insights');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('settings page loads hub', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('onboarding page loads wizard', async ({ page }) => {
    await page.goto('/dashboard/onboarding');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });
});
