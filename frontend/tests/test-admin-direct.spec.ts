import { test, expect } from '@playwright/test';

test('test admin page directly', async ({ page }) => {
  // Set a mock session cookie first
  await page.goto('https://local.lchaty.com:5173');
  
  // Add a session cookie to simulate being logged in
  await page.evaluate(() => {
    document.cookie = 'fc_session_v2=test-session-id; Path=/; Domain=.lchaty.com';
  });
  
  console.log('Set mock session cookie');
  
  // Now navigate directly to admin page
  await page.goto('https://local.lchaty.com:5173/admin.html');
  
  console.log('Navigated to admin.html');
  console.log('URL:', page.url());
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Check page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for admin content
  const adminElement = await page.locator('#admin').textContent();
  console.log('Admin element content:', adminElement);
  
  // Check for any error messages
  const errorElements = await page.locator('.error, [class*="error"]').allTextContents();
  if (errorElements.length > 0) {
    console.log('Error messages found:', errorElements);
  } else {
    console.log('No error messages found');
  }
  
  // Check console logs
  const logs: string[] = [];
  page.on('console', msg => logs.push(msg.text()));
  
  // Wait a bit more for any console messages
  await page.waitForTimeout(2000);
  
  console.log('Console messages:', logs.slice(-10)); // Last 10 messages
  
  await page.screenshot({ path: 'admin-page-direct.png', fullPage: true });
  console.log('Screenshot saved as admin-page-direct.png');
});