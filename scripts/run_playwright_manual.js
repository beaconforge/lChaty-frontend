const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const screenshots = [];
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--ignore-certificate-errors',
      '--host-resolver-rules=MAP local.lchaty.com 127.0.0.1,MAP local.admin.lchaty.com 127.0.0.1'
    ]
  });

  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    // 1. User portal
    const userUrl = 'https://local.lchaty.com:5173/';
    console.log('Navigating to user portal:', userUrl);
    await page.goto(userUrl, { waitUntil: 'load', timeout: 30000 });
    await wait(1000);
    const userShot = path.resolve('user-portal.png');
    await page.screenshot({ path: userShot, fullPage: true });
    console.log('Saved', userShot);
    screenshots.push(userShot);

    // Try login as regular user
    try {
      await page.fill('input[data-testid="login-username"]', 'lesterTester');
      await page.fill('input[data-testid="login-password"]', 'HardPass1234');
      await page.click('button[data-testid="login-submit"]');
      await wait(3000);
      const afterUserLogin = path.resolve('user-after-login.png');
      await page.screenshot({ path: afterUserLogin, fullPage: true });
      console.log('Saved', afterUserLogin);
      screenshots.push(afterUserLogin);
    } catch (e) {
      console.warn('User login attempt failed locally:', e.message);
    }

    // 2. Admin portal
    const adminUrl = 'https://local.admin.lchaty.com:5173/admin.html';
    console.log('Navigating to admin portal:', adminUrl);
    await page.goto(adminUrl, { waitUntil: 'load', timeout: 30000 });
    await wait(1000);
    const adminShot = path.resolve('admin-portal.png');
    await page.screenshot({ path: adminShot, fullPage: true });
    console.log('Saved', adminShot);
    screenshots.push(adminShot);

    // Try admin login
    try {
      await page.fill('input[data-testid="login-username"]', 'admin');
      await page.fill('input[data-testid="login-password"]', 'admin');
      await page.click('button[data-testid="login-submit"]');
      await wait(3000);
      const afterAdminLogin = path.resolve('admin-after-login.png');
      await page.screenshot({ path: afterAdminLogin, fullPage: true });
      console.log('Saved', afterAdminLogin);
      screenshots.push(afterAdminLogin);
    } catch (e) {
      console.warn('Admin login attempt failed locally:', e.message);
    }

    // After admin login, navigate to Users and Settings pages and capture
    try {
      // Click Users nav
      await page.click('[data-page="users"]');
      await wait(1000);
      const usersShot = path.resolve('admin-users.png');
      await page.screenshot({ path: usersShot, fullPage: true });
      console.log('Saved', usersShot);
      screenshots.push(usersShot);

      // Click Settings nav
      await page.click('[data-page="settings"]');
      await wait(1000);
      const settingsShot = path.resolve('admin-settings.png');
      await page.screenshot({ path: settingsShot, fullPage: true });
      console.log('Saved', settingsShot);
      screenshots.push(settingsShot);
    } catch (e) {
      console.warn('Failed to navigate to Users/Settings:', e.message);
    }

    // 3. Admin login on user portal (should redirect)
    console.log('Navigating to user portal for admin-login-redirect test');
    await page.goto(userUrl, { waitUntil: 'load', timeout: 30000 });
    await wait(500);
    try {
      await page.fill('input[data-testid="login-username"]', 'admin');
      await page.fill('input[data-testid="login-password"]', 'admin');
      await page.click('button[data-testid="login-submit"]');
      await wait(3000);
      const adminRedirect = path.resolve('admin-redirect.png');
      await page.screenshot({ path: adminRedirect, fullPage: true });
      console.log('Saved', adminRedirect);
      screenshots.push(adminRedirect);
    } catch (e) {
      console.warn('Admin login on user portal failed:', e.message);
    }

  } catch (err) {
    console.error('Error during manual Playwright run:', err);
  } finally {
    console.log('Finished manual run. Screenshots:', screenshots);
    // keep browser open for inspection for a short while
    await wait(2000);
    await browser.close();
  }
})();