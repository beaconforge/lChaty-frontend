const fetch = require('node-fetch');

async function testAdminLogin() {
  const backendBase = 'https://chat-backend.lchaty.com';
  const adminUser = 'admin';
  const adminPass = 'admin';
  
  try {
    console.log('Testing admin login...');
    
    // Test direct login
    const loginRes = await fetch(`${backendBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUser, password: adminPass })
    });
    
    console.log('Login status:', loginRes.status);
    console.log('Login headers:', Object.fromEntries(loginRes.headers));
    
    const loginText = await loginRes.text();
    console.log('Login response:', loginText);
    
    // Extract cookie
    const setCookie = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookie);
    
    if (!setCookie) {
      throw new Error('No set-cookie header!');
    }
    
    // Test /api/me with the cookie
    const meRes = await fetch(`${backendBase}/api/me`, {
      headers: { 
        'Cookie': setCookie.split(';')[0]  // Just the name=value part
      }
    });
    
    console.log('\n/api/me status:', meRes.status);
    console.log('/api/me headers:', Object.fromEntries(meRes.headers));
    
    const meText = await meRes.text();
    console.log('/api/me response:', meText);
    
    if (meRes.status === 200) {
      const userData = JSON.parse(meText);
      console.log('Parsed user data:', userData);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminLogin();