import { test, expect } from '@playwright/test';

test('detailed admin login debugging', async ({ page }) => {
  const frontendBase = 'https://local.lchaty.com:5173';
  
  // Listen for console messages
  const consoleMessages: Array<{type: string, text: string}> = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Navigate to the login page
  await page.goto(frontendBase);
  
  console.log('=== BEFORE LOGIN ===');
  
  // Check current authentication state
  const preAuthCheck = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/me', { credentials: 'include' });
      const text = await response.text();
      return {
        status: response.status,
        text: text,
        isJSON: text.startsWith('{')
      };
    } catch (error) {
      return { error: String(error) };
    }
  });
  
  console.log('Pre-login auth check:', preAuthCheck);
  
  // Fill and submit login form
  const usernameField = page.locator('input[type="text"], input[type="email"]').first();
  const passwordField = page.locator('input[type="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
  
  await usernameField.fill('admin');
  await passwordField.fill('admin');
  await submitButton.click();
  
  // Wait for login processing
  await page.waitForTimeout(3000);
  
  console.log('=== AFTER LOGIN ===');
  console.log('Current URL:', page.url());
  
  // Check authentication state after login
  const postAuthCheck = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/me', { credentials: 'include' });
      const text = await response.text();
      let userData = null;
      if (text.startsWith('{')) {
        try {
          userData = JSON.parse(text);
        } catch (e) {
          userData = { parseError: String(e) };
        }
      }
      return {
        status: response.status,
        text: text.substring(0, 200),
        isJSON: text.startsWith('{'),
        userData: userData
      };
    } catch (error) {
      return { error: String(error) };
    }
  });
  
  console.log('Post-login auth check:', JSON.stringify(postAuthCheck, null, 2));
  
  if (postAuthCheck.userData && postAuthCheck.userData.user) {
    const user = postAuthCheck.userData.user;
    console.log('User details:');
    console.log('  ID:', user.id);
    console.log('  Username:', user.username);
    console.log('  is_admin field:', user.is_admin);
    console.log('  Admin checks:');
    console.log('    user.is_admin:', !!user.is_admin);
    console.log('    username === admin:', user.username === 'admin');
    console.log('    includes admin:', user.username?.toLowerCase().includes('admin'));
    
    const wouldPassAdminCheck = user.is_admin || user.username === 'admin' || user.username?.toLowerCase().includes('admin');
    console.log('  Should pass admin check:', wouldPassAdminCheck);
  }
  
  // Check for any error messages on the page
  const errorElements = await page.locator('.error, .alert-error, [class*="error"]').count();
  if (errorElements > 0) {
    const errorTexts = await page.locator('.error, .alert-error, [class*="error"]').allTextContents();
    console.log('Error messages found on page:', errorTexts);
  }
  
  // Check console messages
  const errors = consoleMessages.filter(msg => msg.type === 'error');
  if (errors.length > 0) {
    console.log('Console errors:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.text}`);
    });
  }
  
  await page.screenshot({ path: 'detailed-admin-login-debug.png', fullPage: true });
  console.log('Screenshot saved as detailed-admin-login-debug.png');
});