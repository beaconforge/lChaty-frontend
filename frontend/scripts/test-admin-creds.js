#!/usr/bin/env node
(async () => {
  const adminCreds = [
    { username: 'admin', password: 'admin' },
    { username: 'administrator', password: 'admin123' },
    { username: 'root', password: 'password' },
    { username: 'e2e_admin', password: 'AdminE2ePass123!' }
  ];
  
  const base = process.env.BACKEND_BASE || 'https://chat-backend.lchaty.com';
  const wrap = (k, v) => console.log(`---- ${k} ----\n${v}\n`);

  for (const cred of adminCreds) {
    wrap('Testing Admin Credentials', `${cred.username} / ${cred.password}`);
    
    try {
      // Try login
      const loginRes = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred),
      });
      
      const loginBody = await loginRes.text().catch(() => '');
      
      if (loginRes.ok) {
        // Get session cookie and check profile
        const sessionCookie = loginRes.headers.get('set-cookie');
        if (sessionCookie) {
          const meRes = await fetch(`${base}/api/me`, {
            method: 'GET',
            headers: { 
              'Cookie': sessionCookie,
              'Content-Type': 'application/json'
            },
          });
          const meBody = await meRes.text().catch(() => '');
          
          if (meRes.ok) {
            try {
              const userData = JSON.parse(meBody);
              const isAdmin = userData.user?.is_admin || userData.is_admin;
              wrap('SUCCESS', `${cred.username} - Admin: ${isAdmin}\n${JSON.stringify(userData, null, 2)}`);
              if (isAdmin) {
                wrap('FOUND ADMIN', `Use these credentials: ${cred.username} / ${cred.password}`);
              }
            } catch (e) {
              wrap('Parse Error', meBody);
            }
          }
        }
      } else {
        wrap('Login Failed', `${loginRes.status}: ${loginBody}`);
      }
    } catch (e) {
      wrap('Error', String(e));
    }
    
    console.log(''); // spacing
  }
})();