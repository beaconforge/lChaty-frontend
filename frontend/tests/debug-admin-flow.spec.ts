import { test, expect } from '@playwright/test';

test('debug admin login flow', async ({ page }) => {
  const frontendBase = 'https://local.lchaty.com:5173';
  
  // Go to user portal
  await page.goto(frontendBase);
  
  // Check if there's a login form
  await page.waitForSelector('form, [data-testid="login-form"], input[type="text"], input[type="email"]', { timeout: 10000 });
  
  // Look for username/email input
  const usernameInput = await page.locator('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"]').first();
  await usernameInput.fill('admin');
  
  // Look for password input  
  const passwordInput = await page.locator('input[type="password"]').first();
  await passwordInput.fill('admin');
  
  // Look for login button
  const loginButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
  await loginButton.click();
  
  // Wait for navigation or response
  await page.waitForTimeout(3000);
  
  console.log('Current URL:', page.url());
  
  // Try to make /api/me call
  const meResult = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/me', { credentials: 'include' });
      const text = await response.text();
      return {
        status: response.status,
        ok: response.ok,
        text: text,
        url: response.url
      };
    } catch (error) {
      return { error: String(error) };
    }
  });
  
  console.log('/api/me result:', meResult);
  
  // Check if we were redirected to admin portal
  if (page.url().includes('admin')) {
    console.log('✅ Successfully redirected to admin portal');
  } else {
    console.log('❌ Still on user portal, URL:', page.url());
  }
});