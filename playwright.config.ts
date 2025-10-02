import { defineConfig, devices } from '@playwright/test';

// Allow overriding the Playwright base URLs with environment variables when testing
const baseUser = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const baseAdmin = process.env.PLAYWRIGHT_ADMIN_BASE_URL || 'http://localhost:3000';

const isLive = process.env.E2E_MODE === 'LIVE';
const mapLocal = process.env.MAP_LOCAL_HOSTS === '1';
const hostResolverArg = mapLocal ? '--host-resolver-rules=MAP local.lchaty.com 127.0.0.1,MAP local.admin.lchaty.com 127.0.0.1' : undefined;

// Build args array for Chromium launch once
const commonArgs: string[] = hostResolverArg ? [hostResolverArg] : [];

const projects = [
  { name: 'chromium-user', use: { ...devices['Desktop Chrome'], baseURL: baseUser, launchOptions: { args: commonArgs as any } } },
  { name: 'chromium-admin', use: { ...devices['Desktop Chrome'], baseURL: baseAdmin, launchOptions: { args: commonArgs as any } } },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: baseUser,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  // If SKIP_START=1 is set we assume a dev server is already running and will not attempt to start it.
  webServer: (process.env.SKIP_START === '1' ? undefined : {
    command: 'npm run dev',
    url: baseUser,
    reuseExistingServer: true,
    timeout: 120_000,
  }) as any,
  projects,
  metadata: { mode: isLive ? 'LIVE' : 'MOCK' },
});
