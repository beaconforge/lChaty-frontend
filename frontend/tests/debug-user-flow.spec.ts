import { test, expect } from '@playwright/test';
import fs from 'fs';
import { getUserCreds, requireCredsOrSkip } from './utils/env';

test('debug regular user login', async ({ request, browser }, testInfo) => {
  const creds = getUserCreds();
  requireCredsOrSkip(creds, 'user', test);

  const backendBase = process.env.BACKEND_BASE || 'https://chat-backend.lchaty.com';
  const frontendBase = process.env.FRONTEND_BASE || 'https://local.lchaty.com:5173';

  // Test with existing storageState
  const context = await browser.newContext({ storageState: '.auth/user.json' });
  const page = await context.newPage();
  try {
    await page.goto(frontendBase, { waitUntil: 'domcontentloaded' });
    
    // Wait and check cookies
    await page.waitForTimeout(2000);
    console.log('Current URL after navigation:', page.url());
    
    const cookies = await page.evaluate(() => {
      return document.cookie;
    });
    console.log('Browser cookies:', cookies);
    
    const me = await page.evaluate(async () => {
      console.log('Making /api/me request...');
      try {
        const r = await fetch('/api/me', { credentials: 'include' });
        const t = await r.text().catch(() => '');
        console.log('Response status:', r.status, 'Response preview:', t.substring(0, 100));
        return { status: r.status, ok: r.ok, text: t };
      } catch (e) {
        console.log('Fetch error:', e);
        return { error: String(e) };
      }
    });
    
    console.log('User /api/me result:', { status: me.status, textPreview: me.text?.substring(0, 100) });
    
    if (me.text && me.text.startsWith('<!doctype')) {
      console.log('❌ User also received HTML instead of JSON');
    } else {
      console.log('✅ User received JSON response');
      if (me.text) {
        const userData = JSON.parse(me.text);
        console.log('User data:', userData);
      }
    }
  } finally {
    await context.close();
  }
});