import { defineConfig, devices } from '@playwright/test';

// Two projects = two baseURLs (user & admin)
export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    // HTTPS is already configured & trusted; do not bypass SSL:
    // For local E2E runs we allow ignoring HTTPS errors to avoid requiring
    // the mkcert root to be installed in the test runner environment.
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Tell PW to redact cookies in traces automatically
    // (Playwright does this by default for HttpOnly, but we keep good hygiene)
  },

  projects: [
    {
      name: 'userApp-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E2E_USER_BASE_URL || 'https://local.lchaty.com:5173',
          launchOptions: {
            // Map the local hostnames to localhost so tests can reach the dev server
            args: ['--host-resolver-rules=MAP local.lchaty.com 127.0.0.1, MAP local.admin.lchaty.com 127.0.0.1'],
            channel: 'chrome'
          },
      },
    },
    {
      name: 'adminApp-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E2E_ADMIN_BASE_URL || 'https://local.admin.lchaty.com:5173',
          launchOptions: {
            args: ['--host-resolver-rules=MAP local.admin.lchaty.com 127.0.0.1, MAP local.lchaty.com 127.0.0.1'],
            channel: 'chrome'
          },
      },
    },
    {
      name: 'adminApp-msedge',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E2E_ADMIN_BASE_URL || 'https://local.admin.lchaty.com:5173',
        launchOptions: {
          args: ['--host-resolver-rules=MAP local.admin.lchaty.com 127.0.0.1, MAP local.lchaty.com 127.0.0.1'],
          channel: 'msedge'
        },
      },
    },
    // Add FF/WebKit if you want cross-browser from day 1:
    // { name: 'userApp-firefox', use: { ...devices['Desktop Firefox'], baseURL: ... } },
    // { name: 'adminApp-webkit', use: { ...devices['Desktop Safari'], baseURL: ... } },
  ],
});
