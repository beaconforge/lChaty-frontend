const fetch = require('node-fetch');

async function testE2eAdminUser() {
  const backendBase = 'https://chat-backend.lchaty.com';
  
  console.log('Testing e2e_admin user...');
  
  try {
    const loginRes = await fetch(`${backendBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'e2e_admin', password: 'AdminE2ePass123!' })
    });
    
    console.log('e2e_admin login status:', loginRes.status);
    const loginText = await loginRes.text();
    console.log('e2e_admin login response:', loginText);
    
    if (loginRes.status === 200) {
      console.log('✅ e2e_admin user exists and works');
    } else {
      console.log('❌ e2e_admin user failed:', loginRes.status);
    }
  } catch (error) {
    console.error('Error testing e2e_admin:', error.message);
  }
}

testE2eAdminUser();