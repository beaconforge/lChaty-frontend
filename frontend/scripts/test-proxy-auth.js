#!/usr/bin/env node
(async () => {
  const user = process.env.E2E_USER || 'lesterTester';
  const pass = process.env.E2E_PASS || 'HardPass1234';
  const frontendBase = 'https://local.lchaty.com:5173';
  
  const wrap = (k, v) => console.log(`---- ${k} ----\n${v}\n`);

  // Test login through frontend proxy
  try {
    wrap('Testing', `Login via frontend proxy -> POST ${frontendBase}/api/auth/login`);
    
    const loginRes = await fetch(`${frontendBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
      credentials: 'include'
    });
    
    const loginBody = await loginRes.text().catch(() => '');
    const loginHeaders = {};
    for (const [k, v] of loginRes.headers) loginHeaders[k] = v;
    
    wrap('Login Response', JSON.stringify({ 
      status: loginRes.status, 
      ok: loginRes.ok, 
      headers: loginHeaders, 
      body: loginBody 
    }, null, 2));
    
    // Test /api/me with same cookie jar
    wrap('Testing', `Get user info -> GET ${frontendBase}/api/me`);
    
    const meRes = await fetch(`${frontendBase}/api/me`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const meBody = await meRes.text().catch(() => '');
    const meHeaders = {};
    for (const [k, v] of meRes.headers) meHeaders[k] = v;
    
    wrap('/api/me Response', JSON.stringify({ 
      status: meRes.status, 
      ok: meRes.ok, 
      headers: meHeaders, 
      body: meBody 
    }, null, 2));
    
    if (loginRes.ok && meRes.ok) {
      wrap('SUCCESS', 'Login and /api/me both successful - cookie domain fix works!');
    } else {
      wrap('ISSUE', `Login: ${loginRes.status}, /api/me: ${meRes.status}`);
    }
    
  } catch (e) {
    wrap('ERROR', String(e));
  }
})();