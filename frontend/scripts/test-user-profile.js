#!/usr/bin/env node
(async () => {
  const user = process.env.E2E_USER || 'lesterTester';
  const pass = process.env.E2E_PASS || 'HardPass1234';
  const base = process.env.BACKEND_BASE || 'https://chat-backend.lchaty.com';
  const wrap = (k, v) => console.log(`---- ${k} ----\n${v}\n`);

  // Login to get session cookie
  wrap('Step 1', `Login -> POST ${base}/api/auth/login`);
  let sessionCookie;
  try {
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    });
    const loginBody = await loginRes.text().catch(() => '');
    sessionCookie = loginRes.headers.get('set-cookie');
    wrap('Login Response', JSON.stringify({ status: loginRes.status, ok: loginRes.ok, sessionCookie, body: loginBody }, null, 2));
  } catch (e) {
    wrap('Login Error', String(e));
    return;
  }

  if (!sessionCookie) {
    wrap('Error', 'No session cookie received from login');
    return;
  }

  // Get user profile with session
  wrap('Step 2', `Get Profile -> GET ${base}/api/me`);
  try {
    const meRes = await fetch(`${base}/api/me`, {
      method: 'GET',
      headers: { 
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      },
    });
    const meBody = await meRes.text().catch(() => '');
    wrap('/api/me Response', JSON.stringify({ status: meRes.status, ok: meRes.ok, body: meBody }, null, 2));
    
    if (meRes.ok && meBody) {
      try {
        const userData = JSON.parse(meBody);
        wrap('User Admin Status', `is_admin: ${userData.is_admin || false}`);
        wrap('Full User Data', JSON.stringify(userData, null, 2));
      } catch (e) {
        wrap('Parse Error', 'Could not parse /api/me response as JSON');
      }
    }
  } catch (e) {
    wrap('/api/me Error', String(e));
  }
})();