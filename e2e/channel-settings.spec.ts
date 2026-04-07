import { test, expect } from '@playwright/test';

/**
 * Channel settings pages E2E tests.
 *
 * Authenticated tests require E2E_EMAIL / E2E_PASSWORD env vars.
 */

const hasAuth = !!(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

const channelRoutes = [
  { name: 'Email', path: '/dashboard/settings/channels/email' },
  { name: 'WhatsApp', path: '/dashboard/settings/channels/whatsapp' },
  { name: 'SMS', path: '/dashboard/settings/channels/sms' },
  { name: 'Voice', path: '/dashboard/settings/channels/voice' },
  { name: 'Instagram', path: '/dashboard/settings/channels/instagram' },
  { name: 'Slack', path: '/dashboard/settings/channels/slack' },
  { name: 'Messenger', path: '/dashboard/settings/channels/messenger' }
];

test.describe('Channel settings (authenticated)', () => {
  test.skip(!hasAuth, 'Skipped: E2E_EMAIL and E2E_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  for (const channel of channelRoutes) {
    test(`${channel.name} settings page loads`, async ({ page }) => {
      await page.goto(channel.path);
      await expect(page.getByRole('heading').first()).toBeVisible({
        timeout: 10_000
      });
    });
  }

  test('settings hub shows all channels', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000
    });

    // Verify channel cards are present
    for (const channel of ['Email', 'WhatsApp', 'SMS', 'Voice']) {
      const card = page.getByText(channel, { exact: false }).first();
      await expect(card).toBeVisible({ timeout: 5_000 });
    }
  });
});

test.describe('Channel settings (unauthenticated redirect)', () => {
  for (const channel of channelRoutes) {
    test(`${channel.name} redirects when unauthenticated`, async ({
      page
    }) => {
      await page.goto(channel.path);
      await page.waitForURL(/auth\/sign-in/, { timeout: 10_000 });
      expect(page.url()).toContain('/auth/sign-in');
    });
  }
});
