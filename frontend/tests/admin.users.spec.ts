import { test, expect } from '@playwright/test';

test.describe('Admin Users bulk actions', () => {
  test.beforeEach(async ({}, testInfo) => {
    // ensure admin storageState exists (created by seed-admin-login.spec.ts)
    // If not present, tests should be run after seeding admin.
  });

  test('load users page and perform bulk set/revoke admin', async ({ browser }) => {
    const storage = '.auth/admin.json';
    const context = await browser.newContext({ storageState: storage, ignoreHTTPSErrors: true });
    const page = await context.newPage();

    // Navigate to admin page
    const adminBase = process.env.PLAYWRIGHT_ADMIN_BASE_URL || 'https://local.admin.lchaty.com:5173';
    await page.goto(`${adminBase}/admin.html`, { waitUntil: 'networkidle' });

    // Wait for users nav to appear and click it
    await page.waitForSelector('[data-page="users"]', { timeout: 10000 });
    await page.click('[data-page="users"]');

    // Wait for table rows to load
    await page.waitForSelector('.users-page table tbody tr', { timeout: 10000 });

    // Select first row checkbox
    const firstCheckbox = await page.$('.users-page table tbody tr input[data-row-select]');
    expect(firstCheckbox).toBeTruthy();
    await firstCheckbox!.check();

    // Click Set Admin for selected
    await page.click('button:has-text("Set Admin for selected")');
    // Confirm modal
    await page.waitForSelector('text=Set Admin', { timeout: 5000 });
    await page.click('button:has-text("Set")');

    // Wait for toast success
    await page.waitForSelector('text=Bulk set completed', { timeout: 10000 });

    // Now revoke
    await page.click('button:has-text("Revoke Admin for selected")');
    await page.waitForSelector('text=Revoke Admin', { timeout: 5000 });
    await page.click('button:has-text("Revoke")');
    await page.waitForSelector('text=Bulk revoke completed', { timeout: 10000 });

    await context.close();
  });
});
