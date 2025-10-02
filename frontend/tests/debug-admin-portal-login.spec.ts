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
  
  // Wait for page load
  await page.waitForTimeout(2000);
  
  // Find login form
  const usernameField = page.locator('input[type="text"], input[type="email"]').first();
  const passwordField = page.locator('input[type="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
  
  // Fill admin credentials
  await usernameField.fill('admin');
  await passwordField.fill('admin');
  
  console.log('Filled admin credentials, clicking submit...');
  
  // Submit login
  await submitButton.click();
  
  // Wait for login processing
  await page.waitForTimeout(3000);
  
  console.log('Current URL after login:', page.url());
  
  // Print all console logs to see the debug output
  console.log('\n=== BROWSER CONSOLE LOGS ===');
  consoleLogs.forEach((log, index) => {
    console.log(`${index + 1}. ${log}`);
  });
  
  // Look for auth routing debug specifically
  const authDebugLogs = consoleLogs.filter(log => log.includes('Auth routing debug'));
  if (authDebugLogs.length > 0) {
    console.log('\n=== AUTH ROUTING DEBUG ===');
    authDebugLogs.forEach(log => console.log(log));
  }
  
  await page.screenshot({ path: 'admin-portal-login-debug.png', fullPage: true });
  console.log('Screenshot saved as admin-portal-login-debug.png');
});