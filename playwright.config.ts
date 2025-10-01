import { defineConfig, devices } from '@playwright/test';

// Allow overriding the Playwright base URLs with environment variables when testing
const baseUser = process.env.PLAYWRIGHT_BASE_URL || 'https://local.lchaty.com:5173';
const baseAdmin = process.env.PLAYWRIGHT_ADMIN_BASE_URL || 'https://local.admin.lchaty.com:5173';

const isLive = process.env.E2E_MODE === 'LIVE';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: baseUser,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // If SKIP_START=1 is set we assume a dev server is already running and will not attempt to start it.
  webServer: (process.env.SKIP_START === '1' ? undefined : {
    command: 'npm run dev',
    url: baseUser,
    reuseExistingServer: true,
    timeout: 120_000,
  }) as any,
  projects: [
    { name: 'chromium-user', use: { ...devices['Desktop Chrome'], baseURL: baseUser } },
    { name: 'chromium-admin', use: { ...devices['Desktop Chrome'], baseURL: baseAdmin } },
  ],
  metadata: { mode: isLive ? 'LIVE' : 'MOCK' },
});
