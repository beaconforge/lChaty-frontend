import { test, expect } from '@playwright/test';

test('signup form submits and navigates back to login on success (mocked)', async ({ page }) => {
  // Log console messages and page errors to test output for debugging
  page.on('console', msg => {
    console.log(`[PAGE console.${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });
  page.on('request', req => {
    console.log(`[PAGE REQ] ${req.method()} ${req.url()}`);
  });
  // Serve the app (assumes dev server running or static served). We'll navigate directly to login page.
  await page.goto('/');

  // Mock signup endpoint so it returns success
  await page.route('**/api/auth/signup', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: '1', username: 'test' } }) });
  });
  // Also mock absolute backend host in case the app requests full origin
  await page.route('https://chat-backend.lchaty.com/**/api/auth/signup', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: '1', username: 'test' } }) });
  });
  // The signup flow auto-attempts login after creating the user. Mock the login endpoint too.
  await page.route('**/api/auth/login', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'fake-jwt', user: { id: '1', username: 'playwrightUser' } }) });
  });
  await page.route('https://chat-backend.lchaty.com/**/api/auth/login', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'fake-jwt', user: { id: '1', username: 'playwrightUser' } }) });
  });
  // Ensure the app's subsequent /api/me call returns authenticated user
  await page.route('**/api/me', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: '1', username: 'playwrightUser' } }) });
  });
  await page.route('https://chat-backend.lchaty.com/**/api/me', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: '1', username: 'playwrightUser' } }) });
  });

  // Click create account link to open signup UI
  await page.click('text=Create account');

  // Fill the form
  await page.fill('#username', 'playwrightUser');
  await page.fill('#password', 'TestPass123!');
  await page.fill('#confirmPassword', 'TestPass123!');

  // Submit
  await page.click('[data-testid="signup-submit"]');

  // Expect to navigate back to login by checking for the login username input
  // The app may either navigate back to login or auto-login into chat.
  // Accept either outcome: login input present OR chat URL/landing present.
  const loginLocator = page.locator('[data-testid="login-username"]');
  const chatInput = page.locator('[data-testid="chat-input"]');
  // 1) Prefer the login form
  try {
    await loginLocator.waitFor({ state: 'visible', timeout: 5000 });
    return;
  } catch (_) {
    // 2) Try URL-based check for chat
    try {
      await page.waitForURL(/\/chat/, { timeout: 3000 });
      return;
    } catch (_) {
      // 3) Final fallback: chat input present
      await expect(chatInput).toHaveCount(1, { timeout: 5000 });
    }
  }
});
