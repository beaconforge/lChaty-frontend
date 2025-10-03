import { test, expect } from '@playwright/test';
import fs from 'fs';
import { getUserCreds, requireCredsOrSkip } from './utils/env';

test('seed backend and verify session via storageState', async ({ request, browser }, testInfo) => {
  const creds = getUserCreds();
  requireCredsOrSkip(creds, 'user', test);

  const backendBase = process.env.BACKEND_BASE || 'https://chat-backend.lchaty.com';
  const frontendBase = process.env.FRONTEND_BASE || 'https://local.lchaty.com:5173';

  // Signup (ok to 409)
  try {
    const r = await request.post(`${backendBase}/api/auth/signup`, { data: { username: creds.user!, password: creds.pass! } });
    const body = await r.text();
    await testInfo.attach('signup-direct.json', { body: JSON.stringify({ status: r.status(), ok: r.ok(), body }, null, 2), contentType: 'application/json' });
  } catch (e) {
    await testInfo.attach('signup-direct-error.txt', { body: String(e), contentType: 'text/plain' });
  }

  // Login via server request to get Set-Cookie
  let setCookieHeader: string | undefined;
  try {
    const r = await request.post(`${backendBase}/api/auth/login`, { data: { username: creds.user!, password: creds.pass! } });
    const body = await r.text();
    await testInfo.attach('login-direct.json', { body: JSON.stringify({ status: r.status(), ok: r.ok(), body }, null, 2), contentType: 'application/json' });
    const headers = r.headers();
    setCookieHeader = headers['set-cookie'] as any;
    if (!setCookieHeader) {
      throw new Error('No set-cookie header returned from server login');
    }
  } catch (e) {
    await testInfo.attach('login-direct-error.txt', { body: String(e), contentType: 'text/plain' });
    throw e;
  }

  // Parse first Set-Cookie header value
  const cookieStr = Array.isArray(setCookieHeader) ? (setCookieHeader as string[])[0] : (setCookieHeader as string);
  const firstPair = cookieStr.split(';')[0].trim();
  const eq = firstPair.indexOf('=');
  const name = firstPair.substring(0, eq);
  const value = firstPair.substring(eq + 1);

  // try to parse attributes
  const attrs = cookieStr.split(';').slice(1).map(s => s.trim());
  const attrMap: Record<string, string|boolean> = {};
  for (const a of attrs) {
    const [k, ...rest] = a.split('=');
    const v = rest.length > 0 ? rest.join('=') : undefined;
    if (v === undefined) attrMap[k.toLowerCase()] = true; else attrMap[k.toLowerCase()] = v;
  }

  // Ensure the cookie domain is the shared local test domain so the
  // Playwright browser context will send the cookie to local.lchaty.com
  // and local.admin.lchaty.com. Backends often return their own hostname
  // (chat-backend.lchaty.com) which would create a host-only cookie and
  // not be sent to our local test hosts. Force a rewrite here.
  const domain = '.lchaty.com';
  const path = String(attrMap['path'] || '/');
  const maxAge = attrMap['max-age'] ? Number(attrMap['max-age']) : undefined;
  const expires = maxAge ? Math.floor(Date.now() / 1000) + maxAge : -1;
  const httpOnly = !!attrMap['httponly'] || !!attrMap['httpOnly'];
  const secure = !!attrMap['secure'];
  const sameSite = (String(attrMap['samesite'] || 'None')) as 'Strict' | 'Lax' | 'None';

  const storage = {
    cookies: [
      {
        name,
        value,
        domain,
        path,
        expires,
        httpOnly,
        secure,
        sameSite,
      }
    ],
    origins: []
  };

  try {
    fs.mkdirSync('.auth', { recursive: true });
    fs.writeFileSync('.auth/user.json', JSON.stringify(storage, null, 2));
    await testInfo.attach('storageState.json', { body: JSON.stringify(storage, null, 2), contentType: 'application/json' });
  } catch (e) {
    await testInfo.attach('storage-write-error.txt', { body: String(e), contentType: 'text/plain' });
    throw e;
  }

  // Create a context from storageState and verify /api/me in the browser context
  const context = await browser.newContext({ storageState: '.auth/user.json' });
  const page = await context.newPage();
  try {
    await page.goto(frontendBase, { waitUntil: 'domcontentloaded' });
    const me = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/me', { credentials: 'include' });
        const t = await r.text().catch(() => '');
        return { status: r.status, ok: r.ok, text: t };
      } catch (e) {
        return { error: String(e) };
      }
    });
    await testInfo.attach('me-result.json', { body: JSON.stringify(me, null, 2), contentType: 'application/json' });
    expect(me && me.status === 200).toBeTruthy();
  } finally {
    await context.close();
  }
});
