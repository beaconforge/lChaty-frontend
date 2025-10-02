import { test, expect } from '@playwright/test';

test('admin login through frontend interface', async ({ page }) => {
  const frontendBase = 'https://local.lchaty.com:5173';
  
  // Navigate to the login page
  await page.goto(frontendBase);
  
  // Find and fill the login form - using more general selectors
  try {
    await page.waitForSelector('input', { timeout: 5000 });
    
    // Look for username/email field
    const usernameField = page.locator('input[type="text"], input[type="email"], input[name*="user"], input[placeholder*="user"], input[placeholder*="User"], input[placeholder*="name"]').first();
    await usernameField.fill('admin');
    
    // Look for password field
    const passwordField = page.locator('input[type="password"]').first();
    await passwordField.fill('admin');
    
    // Look for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    await submitButton.click();
    
    // Wait for either navigation or a successful login indicator
    await page.waitForTimeout(3000);
    
    console.log('After login attempt, current URL:', page.url());
    
    // Check if we were redirected to admin portal
    if (page.url().includes('admin') || page.url() !== frontendBase) {
      console.log('✅ Successfully navigated after login');
      
      // Try to verify we're authenticated by checking for user interface elements
      const appContent = await page.locator('#app, [data-testid="dashboard"], [data-testid="chat"], .dashboard, .admin').count();
      if (appContent > 0) {
        console.log('✅ Found app content, login appears successful');
      }
    } else {
      console.log('❌ Still on login page, login may have failed');
      
      // Check for error messages
      const errorMessage = await page.locator('.error, .alert-error, [data-testid="error"]').textContent().catch(() => null);
      if (errorMessage) {
        console.log('Error message:', errorMessage);
      }
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'admin-login-result.png', fullPage: true });
    console.log('Screenshot saved as admin-login-result.png');
    
  } catch (error) {
    console.error('Login test failed:', error);
    await page.screenshot({ path: 'admin-login-error.png', fullPage: true });
    throw error;
  }
});