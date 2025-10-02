import { defineConfig, devices } from '@playwright/test';

// Two projects = two baseURLs (user & admin)
export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    // HTTPS is already configured & trusted; do not bypass SSL:
    ignoreHTTPSErrors: false,
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
      },
    },
    {
      name: 'adminApp-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E2E_ADMIN_BASE_URL || 'https://local.admin.lchaty.com:5173',
      },
    },
    // Add FF/WebKit if you want cross-browser from day 1:
    // { name: 'userApp-firefox', use: { ...devices['Desktop Firefox'], baseURL: ... } },
    // { name: 'adminApp-webkit', use: { ...devices['Desktop Safari'], baseURL: ... } },
  ],
});
