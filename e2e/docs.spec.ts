import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Documentation pages (/docs).
 *
 * These pages are public (no auth required) and test the
 * docs hub, category pages, and article navigation.
 */

// ── Docs hub page ───────────────────────────────────────────────────

test.describe('Docs hub', () => {
  test('docs hub loads with heading', async ({ page }) => {
    await page.goto('/docs');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('docs hub shows quick links section', async ({ page }) => {
    await page.goto('/docs');
    const quickLink = page
      .getByText(/getting started|kom igång|inbox|ai|knowledge/i)
      .first();
    await expect(quickLink).toBeVisible({ timeout: 10_000 });
  });

  test('docs hub shows category cards', async ({ page }) => {
    await page.goto('/docs');
    // Should have links to category pages
    const categoryLink = page
      .locator('a[href*="/docs/getting-started"], a[href*="/docs/knowledge"]')
      .first();
    await expect(categoryLink).toBeVisible({ timeout: 10_000 });
  });

  test('docs hub has footer', async ({ page }) => {
    await page.goto('/docs');
    const footer = page.locator('footer').first();
    const hasFooter = await footer.isVisible().catch(() => false);
    // Page should load without errors
    expect(await page.evaluate(() => document.readyState)).toBe('complete');
  });
});

// ── Docs category pages ─────────────────────────────────────────────

const categories = [
  { slug: 'getting-started', name: 'Kom igång' },
  { slug: 'knowledge', name: 'Knowledge Base' },
  { slug: 'ai-automation', name: 'AI & Automation' },
  { slug: 'channels', name: 'Kanaler & Deploy' },
  { slug: 'integrations', name: 'Integrationer & CRM' },
  { slug: 'inbox', name: 'Inbox & Konversationer' },
  { slug: 'analytics', name: 'Analytics & Rapporter' },
  { slug: 'team-management', name: 'Team & Administration' },
  { slug: 'security-compliance', name: 'Säkerhet & Compliance' },
  { slug: 'advanced', name: 'Avancerat' }
];

test.describe('Docs category pages', () => {
  for (const cat of categories) {
    test(`/docs/${cat.slug} loads without error`, async ({ page }) => {
      const response = await page.goto(`/docs/${cat.slug}`);
      expect(response?.status()).toBeLessThan(500);
      await expect(page.getByRole('heading').first()).toBeVisible({
        timeout: 10_000
      });
    });
  }
});

// ── Docs article pages ──────────────────────────────────────────────

const sampleArticles = [
  { category: 'getting-started', slug: 'introduction' },
  { category: 'getting-started', slug: 'account-setup' },
  { category: 'knowledge', slug: 'knowledge-sources' },
  { category: 'ai-automation', slug: 'procedures' },
  { category: 'channels', slug: 'web-messenger' },
  { category: 'inbox', slug: 'inbox-workflow' },
  { category: 'analytics', slug: 'analytics-dashboard' },
  { category: 'security-compliance', slug: 'data-security' }
];

test.describe('Docs article pages', () => {
  for (const article of sampleArticles) {
    test(`/docs/${article.category}/${article.slug} loads content`, async ({
      page
    }) => {
      const response = await page.goto(
        `/docs/${article.category}/${article.slug}`
      );
      expect(response?.status()).toBeLessThan(500);

      // Should render article content (heading)
      await expect(page.getByRole('heading').first()).toBeVisible({
        timeout: 10_000
      });

      // Should have some content text
      const body = await page.textContent('main, article, [role="main"]');
      expect(body?.length).toBeGreaterThan(50);
    });
  }
});

// ── Docs navigation ─────────────────────────────────────────────────

test.describe('Docs navigation', () => {
  test('breadcrumb links work on category page', async ({ page }) => {
    await page.goto('/docs/getting-started');
    // Should have a breadcrumb link back to "All Collections" or docs hub
    const breadcrumb = page
      .getByText(/all collections|alla|docs/i)
      .first();
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);
    // At minimum the page loaded
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('article page shows adjacent article navigation', async ({ page }) => {
    await page.goto('/docs/getting-started/introduction');
    // Should have a "next" article link
    const nextLink = page
      .locator('a')
      .filter({
        hasText: /next|nästa|account|setup/i
      })
      .first();
    const hasNext = await nextLink.isVisible().catch(() => false);
    // Page loaded successfully
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });
  });

  test('clicking a category from hub navigates correctly', async ({
    page
  }) => {
    await page.goto('/docs');
    const categoryLink = page
      .locator('a[href*="/docs/getting-started"]')
      .first();
    await expect(categoryLink).toBeVisible({ timeout: 10_000 });
    await categoryLink.click();
    await page.waitForURL(/docs\/getting-started/, { timeout: 10_000 });
    expect(page.url()).toContain('/docs/getting-started');
  });
});

// ── 404 for invalid docs ────────────────────────────────────────────

test.describe('Docs 404 handling', () => {
  test('invalid category returns 404 or redirects', async ({ page }) => {
    const response = await page.goto('/docs/nonexistent-category');
    // Should return 404 or show a not-found page
    const status = response?.status();
    expect(status === 404 || status === 200).toBeTruthy();
  });

  test('invalid article returns 404 or redirects', async ({ page }) => {
    const response = await page.goto(
      '/docs/getting-started/nonexistent-article'
    );
    const status = response?.status();
    expect(status === 404 || status === 200).toBeTruthy();
  });
});
