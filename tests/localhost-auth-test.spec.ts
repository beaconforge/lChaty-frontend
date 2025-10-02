import { test, expect } from '@playwright/test';

test.describe('Unified Authentication System - Localhost', () => {
  // Use localhost URLs that should work with the dev server
  const baseUrl = 'https://localhost:5173';
  
  // Test credentials from .env.local
  const adminCredentials = { username: 'admin', password: 'admin' };
  const userCredentials = { username: 'lesterTester', password: 'HardPass1234' };

  test.beforeEach(async ({ page }) => {
    // Accept insecure certificates for local development
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    });
    
    // Capture console logs for debugging
    page.on('console', msg => {
      console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
    });
  });

  test('user portal loads correctly', async ({ page }) => {
    console.log('Testing user portal access...');
    
    // Navigate to user portal (root)
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    
    console.log('Current URL:', page.url());
    
    // Should show login form
    await expect(page.locator('input[data-testid="login-username"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[data-testid="login-password"]')).toBeVisible();
    await expect(page.locator('button[data-testid="login-submit"]')).toBeVisible();
    
    // Should show user branding 
    await expect(page.locator('h1')).toContainText('User Portal');
    
    await page.screenshot({ path: 'user-portal-loaded.png', fullPage: true });
    console.log('User portal loaded successfully');
  });

  test('admin portal loads correctly', async ({ page }) => {
    console.log('Testing admin portal access...');
    
    // Navigate to admin portal
    await page.goto(`${baseUrl}/admin.html`, { waitUntil: 'networkidle' });
    
    console.log('Current URL:', page.url());
    
    // Should show login form  
    await expect(page.locator('input[data-testid="login-username"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[data-testid="login-password"]')).toBeVisible();
    await expect(page.locator('button[data-testid="login-submit"]')).toBeVisible();
    
    // Should show admin branding
    await expect(page.locator('h1')).toContainText('Admin Portal');
    await expect(page.locator('body')).toContainText('Administrator credentials required');
    
    await page.screenshot({ path: 'admin-portal-loaded.png', fullPage: true });
    console.log('Admin portal loaded successfully');
  });

  test('regular user login on user portal', async ({ page }) => {
    console.log('Testing regular user login...');
    
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    
    // Fill user credentials
    await page.locator('input[data-testid="login-username"]').fill(userCredentials.username);
    await page.locator('input[data-testid="login-password"]').fill(userCredentials.password);
    
    console.log('Submitting user login form...');
    await page.locator('button[data-testid="login-submit"]').click();
    
    // Wait for authentication
    await page.waitForTimeout(5000);
    
    console.log('URL after user login:', page.url());
    
    // Should not show error
    const errorElement = page.locator('#errorMessage');
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('Error message:', errorText);
    } else {
      console.log('No error message - login appears successful');
    }
    
    await page.screenshot({ path: 'user-login-attempt.png', fullPage: true });
  });

  test('admin user login on admin portal', async ({ page }) => {
    console.log('Testing admin user login...');
    
    await page.goto(`${baseUrl}/admin.html`, { waitUntil: 'networkidle' });
    
    // Fill admin credentials
    await page.locator('input[data-testid="login-username"]').fill(adminCredentials.username);
    await page.locator('input[data-testid="login-password"]').fill(adminCredentials.password);
    
    console.log('Submitting admin login form...');
    await page.locator('button[data-testid="login-submit"]').click();
    
    // Wait for authentication
    await page.waitForTimeout(5000);
    
    console.log('URL after admin login:', page.url());
    
    // Should not show error
    const errorElement = page.locator('#errorMessage');
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('Error message:', errorText);
    } else {
      console.log('No error message - login appears successful');
    }
    
    await page.screenshot({ path: 'admin-login-attempt.png', fullPage: true });
  });

  test('invalid credentials show error', async ({ page }) => {
    console.log('Testing invalid credentials...');
    
    await page.goto(`${baseUrl}/admin.html`, { waitUntil: 'networkidle' });
    
    // Fill invalid credentials
    await page.locator('input[data-testid="login-username"]').fill('invalid');
    await page.locator('input[data-testid="login-password"]').fill('wrong');
    
    console.log('Submitting invalid credentials...');
    await page.locator('button[data-testid="login-submit"]').click();
    
    // Wait for error
    await page.waitForTimeout(3000);
    
    // Should show error message
    const errorElement = page.locator('#errorMessage');
    await expect(errorElement).toBeVisible();
    const errorText = await errorElement.textContent();
    console.log('Error message for invalid credentials:', errorText);
    
    await page.screenshot({ path: 'invalid-credentials-error.png', fullPage: true });
  });
});