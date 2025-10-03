import { test, expect } from '@playwright/test';

test('debug admin login on admin portal', async ({ page }) => {
  const adminBase = 'https://local.admin.lchaty.com:5173';

  // Capture console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });

  // Navigate to the admin portal
  console.log('Navigating to admin portal:', adminBase);
  await page.goto(adminBase);

  // Short wait for the app bootstrap to run. The app may either show a
  // login form (when unauthenticated) or the admin UI (when authenticated or
  // when DEV_MOCK_ADMIN is enabled). We handle both paths.
  await page.waitForTimeout(1500);

  // Detect login form presence
  const passwordLocator = page.locator('input[type="password"]');
  const hasPassword = await passwordLocator.count();

  if (hasPassword) {
    // Perform interactive login (debug mode)
    const usernameField = page.locator('input[type="text"], input[type="email"]').first();
    const passwordField = passwordLocator.first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();

    await usernameField.fill('admin');
    await passwordField.fill('admin');
    console.log('Filled admin credentials, clicking submit...');
    await submitButton.click();

    // Wait for either navigation or UI change
    await page.waitForTimeout(1500);
    console.log('Current URL after login:', page.url());
  } else {
    console.log('Login form not present — likely already authenticated or mock active');

    // Assert that the admin UI root exists
    const rootExists = await page.locator('#admin-root').count();
    expect(rootExists).toBeGreaterThan(0);
  }

  // Print console logs for debugging
  console.log('\n=== BROWSER CONSOLE LOGS ===');
  consoleLogs.forEach((log, index) => {
    console.log(`${index + 1}. ${log}`);
  });

  await page.screenshot({ path: 'admin-portal-login-debug.png', fullPage: true });
  console.log('Screenshot saved as admin-portal-login-debug.png');
});