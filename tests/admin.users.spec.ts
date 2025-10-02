import { test, expect, request } from '@playwright/test';
import fs from 'fs';

test.describe('Admin Users bulk actions', () => {
  test('load users page and perform bulk set/revoke admin', async ({ browser }) => {
    const storage = '.auth/admin.json';
    if (!fs.existsSync(storage)) {
      // try to seed admin by logging in via backend using creds
      const adminUser = process.env.TEST_ADMIN_USER || process.env.ADMIN_USER;
      const adminPass = process.env.TEST_ADMIN_PASS || process.env.ADMIN_PASS;
      if (!adminUser || !adminPass) {
        test.skip(true, 'No admin storage state and no credentials to seed.');
        return;
      }
      const backendBase = process.env.BACKEND_BASE || 'https://chat-backend.lchaty.com';
      const req = await request.newContext({ baseURL: backendBase });
      const r = await req.post('/api/auth/login', { data: { username: adminUser, password: adminPass } });
      if (!r.ok()) {
        test.fail(true, `Failed to login admin for test: ${r.status()}`);
        return;
      }
      const setCookieHeader = r.headers()['set-cookie'] as any;
      const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
      const firstPair = cookieStr.split(';')[0].trim();
      const eq = firstPair.indexOf('=');
      const name = firstPair.substring(0, eq);
      const value = firstPair.substring(eq + 1);
  const attrs = cookieStr.split(';').slice(1).map((s: string) => s.trim());
      const attrMap: Record<string, string|boolean> = {};
      for (const a of attrs) {
        const [k, ...rest] = a.split('=');
        const v = rest.length > 0 ? rest.join('=') : undefined;
        if (v === undefined) attrMap[k.toLowerCase()] = true; else attrMap[k.toLowerCase()] = v;
      }
      const domain = String(attrMap['domain'] || '.lchaty.com');
      const path = String(attrMap['path'] || '/');
      const maxAge = attrMap['max-age'] ? Number(attrMap['max-age']) : undefined;
      const expires = maxAge ? Math.floor(Date.now() / 1000) + maxAge : -1;
      const httpOnly = !!attrMap['httponly'] || !!attrMap['httpOnly'];
      const secure = !!attrMap['secure'];
      const sameSite = (String(attrMap['samesite'] || 'None')) as 'Strict' | 'Lax' | 'None';
      const storageState = { cookies: [{ name, value, domain, path, expires, httpOnly, secure, sameSite }], origins: [] };
      fs.mkdirSync('.auth', { recursive: true });
      fs.writeFileSync(storage, JSON.stringify(storageState, null, 2));
    }
    const context = await browser.newContext({ storageState: storage, ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const adminBase = process.env.PLAYWRIGHT_ADMIN_BASE_URL || 'https://local.admin.lchaty.com:5173';
    await page.goto(`${adminBase}/admin.html`, { waitUntil: 'networkidle' });

    await page.waitForSelector('[data-page="users"]', { timeout: 10000 });
    await page.click('[data-page="users"]');

    await page.waitForSelector('.users-page table tbody tr', { timeout: 10000 });
    const firstCheckbox = await page.$('.users-page table tbody tr input[data-row-select]');
    expect(firstCheckbox).toBeTruthy();
    await firstCheckbox!.check();

    await page.click('button:has-text("Set Admin for selected")');
    await page.waitForSelector('text=Set Admin', { timeout: 5000 });
    await page.click('button:has-text("Set")');
    await page.waitForSelector('text=Bulk set completed', { timeout: 10000 });

    await page.click('button:has-text("Revoke Admin for selected")');
    await page.waitForSelector('text=Revoke Admin', { timeout: 5000 });
    await page.click('button:has-text("Revoke")');
    await page.waitForSelector('text=Bulk revoke completed', { timeout: 10000 });

    await context.close();
  });
});
