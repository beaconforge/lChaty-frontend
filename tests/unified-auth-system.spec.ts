import { test, expect } from '@playwright/test';

test.describe('Unified Authentication System', () => {
  const userBase = 'https://local.lchaty.com:5173';
  const adminBase = 'https://local.admin.lchaty.com:5173';
  
  // Test credentials from .env.local
  const adminCredentials = { username: 'admin', password: 'admin' };
  const userCredentials = { username: 'lesterTester', password: 'HardPass1234' };

  test.beforeEach(async ({ page }) => {
    // Capture console logs for debugging
    page.on('console', msg => {
      console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
    });
  });

  test('admin login on admin portal should succeed', async ({ page }) => {
    console.log('Testing admin login on admin portal...');
    
    // Navigate to admin portal
    await page.goto(adminBase);
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the admin portal (should show admin branding)
    await expect(page.locator('h1')).toContainText('Admin Portal');
    
    // Find and fill login form
    const usernameField = page.locator('input[data-testid="login-username"]');
    const passwordField = page.locator('input[data-testid="login-password"]');
    const submitButton = page.locator('button[data-testid="login-submit"]');
    
    await expect(usernameField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Fill credentials
    await usernameField.fill(adminCredentials.username);
    await passwordField.fill(adminCredentials.password);
    
    // Submit form
    console.log('Submitting admin login form...');
    await submitButton.click();
    
    // Wait for authentication and routing
    await page.waitForTimeout(3000);
    
    console.log('Current URL after admin login:', page.url());
    
    // Should stay on admin domain and show admin interface
    expect(page.url()).toContain('local.admin.lchaty.com');
    
    // Look for admin interface elements (adjust based on your admin portal)
    await expect(page.locator('body')).not.toContainText('Admin access required');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'admin-login-success.png', fullPage: true });
  });

  test('regular user login on user portal should succeed', async ({ page }) => {
    console.log('Testing regular user login on user portal...');
    
    // Navigate to user portal
    await page.goto(userBase);
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the user portal (should show user branding)
    await expect(page.locator('h1')).toContainText('User Portal');
    
    // Find and fill login form
    const usernameField = page.locator('input[data-testid="login-username"]');
    const passwordField = page.locator('input[data-testid="login-password"]');
    const submitButton = page.locator('button[data-testid="login-submit"]');
    
    await expect(usernameField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Fill credentials
    await usernameField.fill(userCredentials.username);
    await passwordField.fill(userCredentials.password);
    
    // Submit form
    console.log('Submitting user login form...');
    await submitButton.click();
    
    // Wait for authentication and routing
    await page.waitForTimeout(3000);
    
    console.log('Current URL after user login:', page.url());
    
    // Should stay on user domain and show user interface
    expect(page.url()).toContain('local.lchaty.com');
    expect(page.url()).not.toContain('admin');
    
    // Look for user interface elements
    await expect(page.locator('body')).not.toContainText('Admin access required');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'user-login-success.png', fullPage: true });
  });

  test('admin login on user portal should redirect to admin portal', async ({ page }) => {
    console.log('Testing admin login on user portal (should redirect)...');
    
    // Navigate to user portal
    await page.goto(userBase);
    await page.waitForLoadState('networkidle');
    
    // Fill admin credentials on user portal
    const usernameField = page.locator('input[data-testid="login-username"]');
    const passwordField = page.locator('input[data-testid="login-password"]');
    const submitButton = page.locator('button[data-testid="login-submit"]');
    
    await usernameField.fill(adminCredentials.username);
    await passwordField.fill(adminCredentials.password);
    
    console.log('Submitting admin login on user portal...');
    await submitButton.click();
    
    // Wait for authentication and redirect
    await page.waitForTimeout(5000);
    
    console.log('Current URL after admin login on user portal:', page.url());
    
    // Should redirect to admin portal
    expect(page.url()).toContain('local.admin.lchaty.com');
    expect(page.url()).toContain('admin.html');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'admin-redirect-success.png', fullPage: true });
  });

  test('regular user login on admin portal should redirect to user portal', async ({ page }) => {
    console.log('Testing regular user login on admin portal (should redirect)...');
    
    // Navigate to admin portal
    await page.goto(adminBase);
    await page.waitForLoadState('networkidle');
    
    // Fill user credentials on admin portal
    const usernameField = page.locator('input[data-testid="login-username"]');
    const passwordField = page.locator('input[data-testid="login-password"]');
    const submitButton = page.locator('button[data-testid="login-submit"]');
    
    await usernameField.fill(userCredentials.username);
    await passwordField.fill(userCredentials.password);
    
    console.log('Submitting user login on admin portal...');
    await submitButton.click();
    
    // Wait for authentication and redirect
    await page.waitForTimeout(5000);
    
    console.log('Current URL after user login on admin portal:', page.url());
    
    // Should redirect to user portal
    expect(page.url()).toContain('local.lchaty.com');
    expect(page.url()).not.toContain('admin');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'user-redirect-success.png', fullPage: true });
  });

  test('invalid credentials should show error', async ({ page }) => {
    console.log('Testing invalid credentials...');
    
    // Test on admin portal
    await page.goto(adminBase);
    await page.waitForLoadState('networkidle');
    
    const usernameField = page.locator('input[data-testid="login-username"]');
    const passwordField = page.locator('input[data-testid="login-password"]');
    const submitButton = page.locator('button[data-testid="login-submit"]');
    
    // Fill invalid credentials
    await usernameField.fill('invalid');
    await passwordField.fill('wrong');
    
    await submitButton.click();
    
    // Wait for error
    await page.waitForTimeout(3000);
    
    // Should show error message
    const errorElement = page.locator('#errorMessage');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).not.toHaveClass('hidden');
    
    console.log('Error message shown for invalid credentials');
    await page.screenshot({ path: 'invalid-login-error.png', fullPage: true });
  });

  test('admin portal shows admin branding', async ({ page }) => {
    console.log('Testing admin portal branding...');
    
    await page.goto(adminBase);
    await page.waitForLoadState('networkidle');
    
    // Check for admin-specific elements
    await expect(page.locator('h1')).toContainText('Admin Portal');
    await expect(page.locator('body')).toContainText('Access the administrative dashboard');
    await expect(page.locator('body')).toContainText('Administrator credentials required');
    
    await page.screenshot({ path: 'admin-portal-branding.png', fullPage: true });
  });

  test('user portal shows user branding', async ({ page }) => {
    console.log('Testing user portal branding...');
    
    await page.goto(userBase);
    await page.waitForLoadState('networkidle');
    
    // Check for user-specific elements
    await expect(page.locator('h1')).toContainText('User Portal');
    await expect(page.locator('body')).toContainText('Start chatting with AI models');
    await expect(page.locator('body')).not.toContainText('Administrator credentials required');
    
    await page.screenshot({ path: 'user-portal-branding.png', fullPage: true });
  });
});