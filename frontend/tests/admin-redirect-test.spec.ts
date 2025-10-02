import { test, expect } from '@playwright/test';

test('test admin redirect behavior', async ({ page }) => {
  const frontendBase = 'https://local.lchaty.com:5173';
  
  console.log('=== Testing Admin Redirect Flow ===');
  
  // Navigate to the login page
  await page.goto(frontendBase);
  console.log('1. Navigated to:', page.url());
  
  // Fill login form
  const usernameField = page.locator('input[type="text"], input[type="email"]').first();
  const passwordField = page.locator('input[type="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
  
  await usernameField.fill('admin');
  await passwordField.fill('admin');
  
  console.log('2. Filled login form with admin credentials');
  
  // Listen for navigation events
  let navigationCount = 0;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      navigationCount++;
      console.log(`   Navigation ${navigationCount}: ${frame.url()}`);
    }
  });
  
  // Submit login
  await submitButton.click();
  console.log('3. Clicked login button');
  
  // Wait for potential redirects
  await page.waitForTimeout(5000);
  
  console.log('4. Final URL:', page.url());
  console.log('5. Total navigations:', navigationCount);
  
  // Check page content
  const pageTitle = await page.title();
  console.log('6. Page title:', pageTitle);
  
  const hasAdminContent = await page.locator('#admin, [data-testid="admin"], .admin').count();
  console.log('7. Admin elements found:', hasAdminContent);
  
  // Check if we're on admin.html
  if (page.url().includes('admin.html')) {
    console.log('✅ Successfully redirected to admin.html');
  } else {
    console.log('❌ Not redirected to admin.html');
  }
  
  // Check for error messages
  const errorElements = await page.locator('.error, [class*="error"]').allTextContents();
  if (errorElements.length > 0) {
    console.log('Error messages:', errorElements);
  }
  
  await page.screenshot({ path: 'admin-redirect-test.png', fullPage: true });
  console.log('Screenshot saved as admin-redirect-test.png');
});