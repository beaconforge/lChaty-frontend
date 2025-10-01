import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  timeout: 60_000,
  use: {
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium-user',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.LOCAL_BASEURL || 'https://local.lchaty.com:5173' }
    },
    {
      name: 'chromium-admin',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.ADMIN_BASEURL || 'https://local.admin.lchaty.com:5173' }
    }
  ],
  globalSetup: './tests/global-setup.ts'
})
