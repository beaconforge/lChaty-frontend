import { test, expect } from '@playwright/test';

test('check user app initialization with debugging', async ({ page }) => {
  const frontendBase = 'https://local.lchaty.com:5173';
  
  // Capture console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // Navigate to the main page
  console.log('Navigating to:', frontendBase);
  await page.goto(frontendBase);
  
  // Wait for initialization
  await page.waitForTimeout(5000);
  
  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());
  
  // Print all console logs
  console.log('\n=== BROWSER CONSOLE LOGS ===');
  consoleLogs.forEach((log, index) => {
    console.log(`${index + 1}. ${log}`);
  });
  
  // Check if login page loaded
  const loginElements = await page.locator('input[type="password"]').count();
  console.log('Login elements found:', loginElements);
  
  // Check for any visible errors
  const errorElements = await page.locator('.error, [class*="error"]').allTextContents();
  if (errorElements.length > 0) {
    console.log('Visible errors:', errorElements);
  }
  
  await page.screenshot({ path: 'user-app-debug.png', fullPage: true });
  console.log('Screenshot saved as user-app-debug.png');
});