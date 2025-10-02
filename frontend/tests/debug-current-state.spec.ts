import { test, expect } from '@playwright/test';

test('check for console errors and login state', async ({ page }) => {
  const frontendBase = 'https://local.lchaty.com:5173';
  
  // Listen for console messages
  const consoleMessages: Array<{type: string, text: string, location: any}> = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // Navigate to the login page
  await page.goto(frontendBase);
  
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');
  
  console.log('Page loaded, checking initial state...');
  
  // Check for any console errors
  const errors = consoleMessages.filter(msg => msg.type === 'error');
  if (errors.length > 0) {
    console.log('❌ Console errors found:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.text}`);
    });
  } else {
    console.log('✅ No console errors found');
  }
  
  // Check the page title and content
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check what's visible on the page
  const pageText = await page.locator('body').textContent();
  console.log('Page content preview:', pageText?.substring(0, 200) + '...');
  
  // Check for login form elements
  const usernameInput = await page.locator('input[type="text"], input[type="email"]').count();
  const passwordInput = await page.locator('input[type="password"]').count();
  const submitButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').count();
  
  console.log('Login form elements found:');
  console.log(`  Username inputs: ${usernameInput}`);
  console.log(`  Password inputs: ${passwordInput}`);
  console.log(`  Submit buttons: ${submitButton}`);
  
  // Check current authentication state
  try {
    const authCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        return {
          status: response.status,
          ok: response.ok,
          text: await response.text()
        };
      } catch (error) {
        return { error: String(error) };
      }
    });
    
    console.log('Authentication check:', {
      status: authCheck.status,
      isAuthenticated: authCheck.status === 200 && !authCheck.text?.includes('<!doctype')
    });
  } catch (error) {
    console.log('Auth check failed:', error instanceof Error ? error.message : String(error));
  }
  
  // Take a screenshot of the current state
  await page.screenshot({ path: 'current-login-state.png', fullPage: true });
  console.log('Screenshot saved as current-login-state.png');
});