const fetch = require('node-fetch');

async function checkAdminStatus() {
  const backendBase = 'https://chat-backend.lchaty.com';
  
  // Test both admin users
  const users = [
    { username: 'admin', password: 'admin' },
    { username: 'e2e_admin', password: 'AdminE2ePass123!' }
  ];
  
  for (const user of users) {
    console.log(`\n=== Checking ${user.username} ===`);
    
    try {
      // Login
      const loginRes = await fetch(`${backendBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      if (loginRes.status !== 200) {
        console.log(`❌ Login failed: ${loginRes.status}`);
        continue;
      }
      
      // Get user profile
      const setCookie = loginRes.headers.get('set-cookie');
      const meRes = await fetch(`${backendBase}/api/me`, {
        headers: { 'Cookie': setCookie.split(';')[0] }
      });
      
      if (meRes.status === 200) {
        const userData = await meRes.json();
        console.log('Full user data:', JSON.stringify(userData, null, 2));
        
        const userObj = userData.user || userData;
        console.log('User ID:', userObj.id);
        console.log('Username:', userObj.username);
        console.log('is_admin field:', userObj.is_admin);
        console.log('profile_data:', userObj.profile_data);
        
        // Check all possible admin detection methods
        const adminChecks = {
          'is_admin === true': userObj.is_admin === true,
          'is_admin === 1': userObj.is_admin === 1,
          'is_admin truthy': !!userObj.is_admin,
          'username === admin': userObj.username === 'admin',
          'username includes admin': userObj.username?.toLowerCase().includes('admin')
        };
        
        console.log('Admin detection results:');
        for (const [method, result] of Object.entries(adminChecks)) {
          console.log(`  ${method}: ${result ? '✅' : '❌'}`);
        }
        
      } else {
        console.log(`❌ /api/me failed: ${meRes.status}`);
      }
      
    } catch (error) {
      console.error(`Error testing ${user.username}:`, error.message);
    }
  }
}

checkAdminStatus();