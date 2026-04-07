import { defineConfig, devices } from '@playwright/test';

const packageManagerUserAgent = process.env.npm_config_user_agent ?? '';
const defaultDevCommand = packageManagerUserAgent.startsWith('bun/')
  ? 'bun run dev'
  : 'npm run dev';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ],

  /* Start the dev server automatically when running E2E tests */
  webServer: {
    command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? defaultDevCommand,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
