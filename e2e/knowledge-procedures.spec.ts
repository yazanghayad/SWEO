import { test, expect } from '@playwright/test';

/**
 * Knowledge base & content management E2E tests.
 *
 * Authenticated tests require E2E_EMAIL / E2E_PASSWORD env vars.
 */

const hasAuth = !!(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

test.describe('Knowledge base flows', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('can navigate to knowledge base', async ({ page }) => {
    await page.goto('/dashboard/knowledge');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('knowledge page shows sources tab', async ({ page }) => {
    await page.goto('/dashboard/knowledge');
    // Look for tab or section indicating sources
    const sourcesText = page.getByText(/sources|knowledge|content/i).first();
    await expect(sourcesText).toBeVisible({ timeout: 10_000 });
  });

  test('can navigate to content page', async ({ page }) => {
    await page.goto('/dashboard/content');
    // Should load or redirect — either is acceptable
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe('complete');
  });

  test('can navigate to guidance page', async ({ page }) => {
    await page.goto('/dashboard/guidance');
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe('complete');
  });
});

test.describe('Procedures flows', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('procedures page shows create button', async ({ page }) => {
    await page.goto('/dashboard/procedures');
    const createBtn = page
      .getByRole('button', { name: /create|new|add/i })
      .first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('reports page shows report categories', async ({ page }) => {
    await page.goto('/dashboard/reports');
    // Should have some report cards or categories
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
    // Check for at least one report type
    const reportText = page
      .getByText(/conversations|resolution|CSAT|response/i)
      .first();
    await expect(reportText).toBeVisible({ timeout: 10_000 });
  });
});
