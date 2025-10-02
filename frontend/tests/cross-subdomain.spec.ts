import { test, expect } from '@playwright/test';
import { getUserCreds, requireCredsOrSkip } from './utils/env';
import { waitForMe200 } from './utils/net';
import { SELECTORS } from './utils/selectors';

test('cookie works across subdomains', async ({ page, browser }) => {
  const creds = getUserCreds();
  requireCredsOrSkip(creds, 'user', test);

  // Login on user app
  await page.goto('/');
  await page.getByLabel(SELECTORS.username.byLabel).fill(creds.user!);
  await page.getByLabel(SELECTORS.password.byLabel).fill(creds.pass!);
  await page.getByRole('button', { name: /sign in/i }).click();
  expect(await waitForMe200(page)).toBeTruthy();

  // Reuse same context and navigate to admin baseURL:
  const adminURL = process.env.E2E_ADMIN_BASE_URL || 'https://local.admin.lchaty.com:5173';
  const adminPage = await browser.newPage({ storageState: await page.context().storageState() } as any);
  await adminPage.goto(adminURL);
  expect(await waitForMe200(adminPage)).toBeTruthy();
  await adminPage.close();
});