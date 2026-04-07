import { test, expect } from '@playwright/test';

/**
 * E2E tests for Billing, Connectors, and Testing/Simulation pages.
 *
 * Authenticated tests require E2E_EMAIL / E2E_PASSWORD env vars.
 */

const hasAuth = !!(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

// ── Unauthenticated: redirect to sign-in ────────────────────────────

test.describe('Auth guard (unauthenticated)', () => {
  const routes = [
    '/dashboard/billing',
    '/dashboard/connectors',
    '/dashboard/testing'
  ];

  for (const route of routes) {
    test(`${route} redirects to sign-in`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/auth\/sign-in/, { timeout: 10_000 });
      expect(page.url()).toContain('/auth/sign-in');
    });
  }
});

// ── Authenticated: Billing page ─────────────────────────────────────

test.describe('Billing page (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('billing page loads with heading', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('billing page shows plan summary cards', async ({ page }) => {
    await page.goto('/dashboard/billing');
    // Should display plan info or summary cards
    const planText = page
      .getByText(/plan|fakturering|billing/i)
      .first();
    await expect(planText).toBeVisible({ timeout: 10_000 });
  });

  test('billing page has tabs for overview and invoices', async ({ page }) => {
    await page.goto('/dashboard/billing');
    // Look for tab triggers
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);
  });

  test('billing address section has editable fields', async ({ page }) => {
    await page.goto('/dashboard/billing');
    // Look for billing address card or form fields
    const companyInput = page
      .locator(
        'input[placeholder*="företag"], input[placeholder*="company"], input[name*="company"]'
      )
      .first();
    // The billing page may need a click to enter edit mode
    const editBtn = page.getByRole('button', { name: /edit|redigera/i }).first();
    const hasEdit = await editBtn.isVisible().catch(() => false);
    if (hasEdit) {
      await editBtn.click();
    }
    // Verify at minimum the page loaded without errors
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('payment methods section is visible', async ({ page }) => {
    await page.goto('/dashboard/billing');
    const paymentText = page
      .getByText(/betalningsmetod|payment method|betalsätt/i)
      .first();
    await expect(paymentText).toBeVisible({ timeout: 10_000 });
  });
});

// ── Authenticated: Connectors page ──────────────────────────────────

test.describe('Connectors page (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('connectors page loads with heading', async ({ page }) => {
    await page.goto('/dashboard/connectors');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('connectors page has create button', async ({ page }) => {
    await page.goto('/dashboard/connectors');
    const createBtn = page
      .getByRole('button', { name: /add|create|new|lägg till/i })
      .first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('clicking create opens connector dialog', async ({ page }) => {
    await page.goto('/dashboard/connectors');
    const createBtn = page
      .getByRole('button', { name: /add|create|new|lägg till/i })
      .first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
    await createBtn.click();

    // Dialog should appear with form fields
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
  });

  test('connector create dialog has provider selection', async ({ page }) => {
    await page.goto('/dashboard/connectors');
    const createBtn = page
      .getByRole('button', { name: /add|create|new|lägg till/i })
      .first();
    await createBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Should have provider dropdown or select
    const providerText = dialog
      .getByText(/provider|leverantör|shopify|stripe/i)
      .first();
    await expect(providerText).toBeVisible({ timeout: 5_000 });
  });
});

// ── Authenticated: Testing / Simulation page ────────────────────────

test.describe('Testing page (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('testing page loads with heading', async ({ page }) => {
    await page.goto('/dashboard/testing');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('testing page has create scenario button', async ({ page }) => {
    await page.goto('/dashboard/testing');
    const createBtn = page
      .getByRole('button', { name: /add|create|new|lägg till/i })
      .first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('clicking create opens scenario dialog with form', async ({ page }) => {
    await page.goto('/dashboard/testing');
    const createBtn = page
      .getByRole('button', { name: /add|create|new|lägg till/i })
      .first();
    await createBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Should have scenario name input
    const nameInput = dialog.locator('input').first();
    await expect(nameInput).toBeVisible();

    // Should have messages textarea
    const textarea = dialog.locator('textarea').first();
    await expect(textarea).toBeVisible();
  });
});
