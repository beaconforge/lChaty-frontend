#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

(async () => {
  // Read .env.local file
  const envPath = path.join(__dirname, '../.env.local');
  let envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        envVars[key] = value;
      }
    }
  }

  console.log('=== ENV VARS FOUND ===');
  console.log(`E2E_USER: ${envVars.E2E_USER}`);
  console.log(`E2E_PASS: ${envVars.E2E_PASS}`);
  console.log(`E2E_ADMIN_USER: ${envVars.E2E_ADMIN_USER}`);
  console.log(`E2E_ADMIN_PASS: ${envVars.E2E_ADMIN_PASS}`);
  console.log('');

  const testCreds = [
    {
      name: 'E2E Regular User (from .env.local)',
      username: envVars.E2E_USER,
      password: envVars.E2E_PASS,
      expectedAdmin: false
    },
    {
      name: 'E2E Admin User (from .env.local)',
      username: envVars.E2E_ADMIN_USER,
      password: envVars.E2E_ADMIN_PASS,
      expectedAdmin: true
    },
    // Test the known working users too
    {
      name: 'Known Regular User (lesterTester)',
      username: 'lesterTester',
      password: 'HardPass1234',
      expectedAdmin: false
    },
    {
      name: 'Known Admin User (admin)',
      username: 'admin',
      password: 'admin',
      expectedAdmin: true
    }
  ];

  const base = 'https://chat-backend.lchaty.com';
  const wrap = (k, v) => console.log(`---- ${k} ----\n${v}\n`);

  for (const cred of testCreds) {
    if (!cred.username || !cred.password) {
      wrap('SKIPPING', `${cred.name} - missing credentials`);
      continue;
    }

    wrap('TESTING', `${cred.name}\nUsername: ${cred.username}\nPassword: ${cred.password}\nExpected Admin: ${cred.expectedAdmin}`);
    
    try {
      // Login
      const loginRes = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cred.username, password: cred.password }),
      });
      
      if (loginRes.ok) {
        // Get user profile
        const sessionCookie = loginRes.headers.get('set-cookie');
        if (sessionCookie) {
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
            
            const status = isAdmin === cred.expectedAdmin ? '✅ CORRECT' : '❌ WRONG';
            
            wrap('RESULT', `${status}\nActual Admin: ${isAdmin}\nUser: ${JSON.stringify(user, null, 2)}`);
          } else {
            wrap('ERROR', `/api/me failed: ${meRes.status}`);
          }
        } else {
          wrap('ERROR', 'No session cookie received');
        }
      } else {
        const errorBody = await loginRes.text();
        wrap('LOGIN FAILED', `${loginRes.status}: ${errorBody}`);
      }
    } catch (e) {
      wrap('ERROR', String(e));
    }
    
    console.log('='.repeat(80));
  }
})();