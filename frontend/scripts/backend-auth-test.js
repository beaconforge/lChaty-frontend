#!/usr/bin/env node
(async () => {
  const argv = require('minimist')(process.argv.slice(2));
  const user = argv.user || process.env.E2E_USER || 'lesterTester';
  const pass = argv.pass || process.env.E2E_PASS || 'HardPass1234';
  const base = argv.base || process.env.BACKEND_BASE || 'https://chat-backend.lchaty.com';
  const wrap = (k, v) => console.log(`---- ${k} ----\n${v}\n`);

  const doFetch = async (path, body) => {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text().catch(() => '');
      const headers = {};
      for (const [k, v] of res.headers) headers[k] = v;
      return { status: res.status, ok: res.ok, headers, body: text };
    } catch (e) {
      return { error: String(e) };
    }
  };

  wrap('Running', `signup -> POST ${base}/api/auth/signup`);
  const signup = await doFetch('/api/auth/signup', { username: user, password: pass });
  wrap('Signup Result', JSON.stringify(signup, null, 2));

  wrap('Running', `login -> POST ${base}/api/auth/login`);
  const login = await doFetch('/api/auth/login', { username: user, password: pass });
  wrap('Login Result', JSON.stringify(login, null, 2));

  if (login && login.headers) {
    wrap('Set-Cookie Header', login.headers['set-cookie'] || '(none)');
  }
})();
