import { test, expect } from '@playwright/test'

test.describe('Smoke - open base URLs', () => {
  test('loads the base page', async ({ page, baseURL }) => {
    if (!baseURL) throw new Error('baseURL not provided by Playwright project');
    await page.goto(baseURL);
    // basic sanity: body is present and page responded
    const hasBody = await page.locator('body').count();
    expect(hasBody).toBeGreaterThan(0);
    // optional: check title or a known asset
    const title = await page.title().catch(() => '');
    console.log('Page title:', title);
  });
});
