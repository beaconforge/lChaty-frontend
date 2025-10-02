#!/usr/bin/env node
(async () => {
  const testCases = [
    {
      name: 'Regular User on User Portal',
      creds: { username: 'lesterTester', password: 'HardPass1234' },
      expectedResult: 'Should login successfully - no redirect'
    },
    {
      name: 'Admin User on User Portal', 
      creds: { username: 'admin', password: 'admin' },
      expectedResult: 'Should redirect to admin portal'
    },
    {
      name: 'Regular User on Admin Portal',
      creds: { username: 'lesterTester', password: 'HardPass1234' },
      expectedResult: 'Should be rejected - admin access required'
    },
    {
      name: 'Admin User on Admin Portal',
      creds: { username: 'admin', password: 'admin' }, 
      expectedResult: 'Should login successfully to admin dashboard'
    }
  ];

  const base = process.env.BACKEND_BASE || 'https://chat-backend.lchaty.com';
  const wrap = (k, v) => console.log(`---- ${k} ----\n${v}\n`);

  for (const test of testCases) {
    wrap('Testing', `${test.name}\nCredentials: ${test.creds.username}\nExpected: ${test.expectedResult}`);
    
    try {
      // Login
      const loginRes = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.creds),
      });
      
      if (loginRes.ok) {
        // Get user profile
        const sessionCookie = loginRes.headers.get('set-cookie');
        const meRes = await fetch(`${base}/api/me`, {
          method: 'GET',
          headers: { 
            'Cookie': sessionCookie,
            'Content-Type': 'application/json'
          },
        });
        
        if (meRes.ok) {
          const userData = JSON.parse(await meRes.text());
          const user = userData.user || userData;
          const isAdmin = user.is_admin || user.username === 'admin' || user.username?.toLowerCase().includes('admin');
          
          wrap('User Profile', JSON.stringify({
            username: user.username,
            is_admin_field: user.is_admin,
            calculated_admin: isAdmin,
            id: user.id
          }, null, 2));
          
          // Test routing logic
          const userPortalResult = isAdmin ? 'REDIRECT_TO_ADMIN' : 'LOGIN_SUCCESS';
          const adminPortalResult = isAdmin ? 'LOGIN_SUCCESS' : 'ACCESS_DENIED';
          
          wrap('Expected Routing', `User Portal: ${userPortalResult}\nAdmin Portal: ${adminPortalResult}`);
        }
      } else {
        wrap('Login Failed', `${loginRes.status}: ${await loginRes.text()}`);
      }
    } catch (e) {
      wrap('Error', String(e));
    }
    
    console.log(''.repeat(80)); // separator
  }
})();