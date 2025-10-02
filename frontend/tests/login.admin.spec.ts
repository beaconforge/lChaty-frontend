import { test, expect } from '@playwright/test';
import { getAdminCreds, requireCredsOrSkip, getLandingExpectations } from './utils/env';
import { attachNetworkLogging, waitForMe200 } from './utils/net';
import { SELECTORS } from './utils/selectors';

test.describe.configure({ mode: 'serial' });

test('admin: successful login routes to admin dashboard', async ({ page }) => {
  const creds = getAdminCreds();
  requireCredsOrSkip(creds, 'admin', test);

  await attachNetworkLogging(page);
  await page.goto('/');
  await page.getByLabel(SELECTORS.username.byLabel).fill(creds.user!);
  await page.getByLabel(SELECTORS.password.byLabel).fill(creds.pass!);
  await page.getByRole('button', { name: /sign in/i }).click();

  expect(await waitForMe200(page)).toBeTruthy();

  const exp = getLandingExpectations('admin');
  if (exp.selector) {
    await expect(page.locator(exp.selector)).toBeVisible();
  } else {
    await expect(page).toHaveURL(/\/admin/i);
  }
});