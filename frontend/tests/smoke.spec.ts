import { test, expect } from '@playwright/test';
import { attachNetworkLogging } from './utils/net';

test.describe.configure({ mode: 'parallel' });

test('smoke: page renders without blocking errors', async ({ page, baseURL }) => {
  await attachNetworkLogging(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Wordmark/logo
  await expect(page.getByText(/lchaty/i).first()).toBeVisible();

  // No uncaught exceptions (basic check)
  page.on('pageerror', e => {
    // Fail on unexpected runtime errors
    expect(e.message).toBe('');
  });
});
