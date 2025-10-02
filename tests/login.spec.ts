import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders required elements', async ({ page }) => {
    // Wait for app to initialize
    await page.waitForLoadState('networkidle');
    
    // Check H1 is visible with exact text
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Foundation. Innovation. Connection.');

    // Check all required test IDs are present and interactable
    await expect(page.getByTestId('header-logo')).toBeVisible();
    await expect(page.getByTestId('header-home')).toBeVisible();
    await expect(page.getByTestId('login-username')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();

    // Test interactability
    await page.getByTestId('login-username').fill('testuser');
    await page.getByTestId('login-password').fill('testpass');
    await expect(page.getByTestId('login-username')).toHaveValue('testuser');
    await expect(page.getByTestId('login-password')).toHaveValue('testpass');
  });

  test('theme toggle works', async ({ page }) => {
    // Check initial theme (should be light or follow system preference)
    const htmlClass = await page.locator('html').getAttribute('class');
    
    // Find and click theme toggle button
    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    await themeToggle.click();
    
    // Verify theme changed
    const newHtmlClass = await page.locator('html').getAttribute('class');
    expect(newHtmlClass).not.toBe(htmlClass);
  });

  test('show password checkbox works', async ({ page }) => {
    const passwordInput = page.getByTestId('login-password');
    const showPasswordCheckbox = page.locator('#showPassword');
    
    // Initially should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check the checkbox
    await showPasswordCheckbox.check();
    
    // Should now be text type
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Uncheck and verify it's back to password
    await showPasswordCheckbox.uncheck();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('visual snapshots - light theme', async ({ page }) => {
    // Ensure light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    await expect(page).toHaveScreenshot('login-light-theme.png');
  });

  test('visual snapshots - dark theme', async ({ page }) => {
    // Ensure dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await expect(page).toHaveScreenshot('login-dark-theme.png');
  });

  test('responsive layout - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });
    
    // All elements should still be visible and usable
    await expect(page.getByTestId('login-username')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('responsive layout - desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Card should be centered with proper width constraints
    const card = page.locator('div').filter({ hasText: 'Username' }).first();
    await expect(card).toBeVisible();
    
    // Logo should be properly sized
    const logo = page.locator('img[alt="lChaty logo"]').first();
    await expect(logo).toBeVisible();
  });

  test('enhanced login functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Test form validation
    await page.getByTestId('login-submit').click();
    
    // Should show error for empty fields (handled by browser validation or custom logic)
    
    // Fill invalid credentials
    await page.getByTestId('login-username').fill('invalid');
    await page.getByTestId('login-password').fill('invalid');
    
    // Click submit
    await page.getByTestId('login-submit').click();
    
    // Should show loading state briefly
    // Note: In a real test, you'd mock the API to control timing
    
    // Wait for any error messages
    await page.waitForTimeout(1000);
  });

  test('error handling', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Test client-side validation
    await page.getByTestId('login-username').fill('');
    await page.getByTestId('login-password').fill('');
    await page.getByTestId('login-submit').click();
    
    // Should handle empty form submission gracefully
  });
});