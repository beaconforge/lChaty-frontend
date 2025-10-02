const fetch = require('node-fetch');

async function testBothLogins() {
  const backendBase = 'https://chat-backend.lchaty.com';
  
  console.log('=== REGULAR USER LOGIN ===');
  try {
    const userLogin = await fetch(`${backendBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'lesterTester', password: 'HardPass1234' })
    });
    
    const userCookie = userLogin.headers.get('set-cookie');
    console.log('User Set-Cookie:', userCookie);
    console.log('User Response:', await userLogin.text());
  } catch (error) {
    console.error('User login error:', error);
  }
  
  console.log('\n=== ADMIN LOGIN ===');
  try {
    const adminLogin = await fetch(`${backendBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    const adminCookie = adminLogin.headers.get('set-cookie');
    console.log('Admin Set-Cookie:', adminCookie);
    console.log('Admin Response:', await adminLogin.text());
  } catch (error) {
    console.error('Admin login error:', error);
  }
}

testBothLogins();