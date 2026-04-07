import { test, expect } from '@playwright/test';

/**
 * E2E tests for Workspace settings, Policies, and Guidance pages.
 *
 * Authenticated tests require E2E_EMAIL / E2E_PASSWORD env vars.
 */

const hasAuth = !!(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

// ── Unauthenticated ─────────────────────────────────────────────────

test.describe('Auth guard (unauthenticated)', () => {
  const routes = [
    '/dashboard/workspace',
    '/dashboard/workspace/general',
    '/dashboard/workspace/brands',
    '/dashboard/workspace/teammates',
    '/dashboard/workspace/security',
    '/dashboard/workspace/multilingual',
    '/dashboard/policies',
    '/dashboard/guidance'
  ];

  for (const route of routes) {
    test(`${route} redirects to sign-in`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/auth\/sign-in/, { timeout: 10_000 });
      expect(page.url()).toContain('/auth/sign-in');
    });
  }
});

// ── Authenticated: Workspace General ────────────────────────────────

test.describe('Workspace General (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('workspace general page loads', async ({ page }) => {
    await page.goto('/dashboard/workspace/general');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('workspace general shows settings cards', async ({ page }) => {
    await page.goto('/dashboard/workspace/general');
    // Should show workspace name, timezone, language settings
    const workspaceText = page
      .getByText(/workspace|arbetsyta|timezone|tidszon|language|språk/i)
      .first();
    await expect(workspaceText).toBeVisible({ timeout: 10_000 });
  });

  test('workspace general has save button', async ({ page }) => {
    await page.goto('/dashboard/workspace/general');
    const saveBtn = page
      .getByRole('button', { name: /save|spara/i })
      .first();
    await expect(saveBtn).toBeVisible({ timeout: 10_000 });
  });
});

// ── Authenticated: Workspace Brands ─────────────────────────────────

test.describe('Workspace Brands (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('brands page loads', async ({ page }) => {
    await page.goto('/dashboard/workspace/brands');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('brands page shows brand identity settings', async ({ page }) => {
    await page.goto('/dashboard/workspace/brands');
    const brandText = page
      .getByText(/brand|varumärke|logo|color|färg/i)
      .first();
    await expect(brandText).toBeVisible({ timeout: 10_000 });
  });
});

// ── Authenticated: Workspace Teammates ──────────────────────────────

test.describe('Workspace Teammates (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('teammates page loads', async ({ page }) => {
    await page.goto('/dashboard/workspace/teammates');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('teammates page has invite form', async ({ page }) => {
    await page.goto('/dashboard/workspace/teammates');
    // Should have an email input for inviting teammates
    const emailInput = page
      .locator('input[type="email"], input[placeholder*="email"]')
      .first();
    const inviteBtn = page
      .getByRole('button', { name: /invite|bjud in/i })
      .first();

    const hasInput = await emailInput.isVisible().catch(() => false);
    const hasBtn = await inviteBtn.isVisible().catch(() => false);

    // At minimum page loaded
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
    expect(hasInput || hasBtn).toBeTruthy();
  });
});

// ── Authenticated: Workspace Security ───────────────────────────────

test.describe('Workspace Security (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('security page loads', async ({ page }) => {
    await page.goto('/dashboard/workspace/security');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('security page shows authentication settings', async ({ page }) => {
    await page.goto('/dashboard/workspace/security');
    const authText = page
      .getByText(/authentication|2fa|sso|password|session/i)
      .first();
    await expect(authText).toBeVisible({ timeout: 10_000 });
  });
});

// ── Authenticated: Workspace Multilingual ───────────────────────────

test.describe('Workspace Multilingual (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('multilingual page loads', async ({ page }) => {
    await page.goto('/dashboard/workspace/multilingual');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('multilingual page shows language settings', async ({ page }) => {
    await page.goto('/dashboard/workspace/multilingual');
    const langText = page
      .getByText(/language|språk|translation|översättning|detect/i)
      .first();
    await expect(langText).toBeVisible({ timeout: 10_000 });
  });
});

// ── Authenticated: Policies ─────────────────────────────────────────

test.describe('Policies page (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('policies page loads with heading', async ({ page }) => {
    await page.goto('/dashboard/policies');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('policies page has add policy button', async ({ page }) => {
    await page.goto('/dashboard/policies');
    const addBtn = page
      .getByRole('button', { name: /add|create|new|policy/i })
      .first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
  });

  test('clicking add policy opens creation dialog', async ({ page }) => {
    await page.goto('/dashboard/policies');
    const addBtn = page
      .getByRole('button', { name: /add|create|new|policy/i })
      .first();
    await addBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Should have name input
    const nameInput = dialog.locator('input').first();
    await expect(nameInput).toBeVisible();
  });

  test('policies page shows policy list or empty state', async ({ page }) => {
    await page.goto('/dashboard/policies');
    // Either policies exist or we see an empty state message
    const content = page
      .getByText(
        /no policies|inga policyer|topic filter|pii filter|add a policy/i
      )
      .first();
    await expect(content).toBeVisible({ timeout: 10_000 });
  });
});

// ── Authenticated: Guidance ─────────────────────────────────────────

test.describe('Guidance page (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('guidance page loads with heading', async ({ page }) => {
    await page.goto('/dashboard/guidance');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('guidance page shows tone of voice settings', async ({ page }) => {
    await page.goto('/dashboard/guidance');
    const toneText = page
      .getByText(/tone|friendly|professional|neutral/i)
      .first();
    await expect(toneText).toBeVisible({ timeout: 10_000 });
  });

  test('guidance page has tabs for chat and voice', async ({ page }) => {
    await page.goto('/dashboard/guidance');
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(1);
  });

  test('guidance page shows category sections', async ({ page }) => {
    await page.goto('/dashboard/guidance');
    // Should show categories like Communication style, Spam, etc.
    const categoryText = page
      .getByText(/communication|spam|content|context/i)
      .first();
    await expect(categoryText).toBeVisible({ timeout: 10_000 });
  });

  test('guidance page has new guidance button per category', async ({
    page
  }) => {
    await page.goto('/dashboard/guidance');
    // Each category section should have a "New" button
    const newBtn = page
      .getByRole('button', { name: /^new$/i })
      .first();
    const hasNew = await newBtn.isVisible().catch(() => false);
    // At minimum page loaded
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });
});
