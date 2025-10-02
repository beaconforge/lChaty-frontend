const fetch = require('node-fetch');

async function createE2eAdminUser() {
  const backendBase = 'https://chat-backend.lchaty.com';
  
  console.log('Creating e2e_admin user...');
  
  try {
    // Try to signup the e2e_admin user
    const signupRes = await fetch(`${backendBase}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'e2e_admin', password: 'AdminE2ePass123!' })
    });
    
    console.log('Signup status:', signupRes.status);
    const signupText = await signupRes.text();
    console.log('Signup response:', signupText);
    
    if (signupRes.status === 200 || signupRes.status === 409) {
      // Now test login
      const loginRes = await fetch(`${backendBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'e2e_admin', password: 'AdminE2ePass123!' })
      });
      
      console.log('Login status after signup:', loginRes.status);
      const loginText = await loginRes.text();
      console.log('Login response:', loginText);
      
      if (loginRes.status === 200) {
        console.log('✅ e2e_admin user is now available');
        
        // Check if this user has admin privileges
        const setCookie = loginRes.headers.get('set-cookie');
        if (setCookie) {
          const meRes = await fetch(`${backendBase}/api/me`, {
            headers: { 'Cookie': setCookie.split(';')[0] }
          });
          
          if (meRes.status === 200) {
            const userData = await meRes.json();
            console.log('User profile:', userData);
            const isAdmin = userData.user?.is_admin || userData.user?.username === 'admin';
            console.log('Is admin?', isAdmin);
            
            if (!isAdmin) {
              console.log('⚠️ Note: e2e_admin user exists but does not have admin privileges');
              console.log('   You may need to manually set is_admin=true in the database');
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createE2eAdminUser();