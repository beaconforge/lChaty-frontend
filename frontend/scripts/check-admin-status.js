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

        // Check all possible admin detection methods from backend response
        const adminChecks = {
          'is_admin === true': userObj.is_admin === true,
          'is_admin === 1': userObj.is_admin === 1,
          'is_admin truthy': !!userObj.is_admin,
          'username === admin': userObj.username === 'admin',
          'username includes admin': userObj.username?.toLowerCase().includes('admin')
        };

        console.log('Admin detection results (from /api/me):');
        for (const [method, result] of Object.entries(adminChecks)) {
          console.log(`  ${method}: ${result ? '✅' : '❌'}`);
        }

        // If backend did not indicate admin, check local D1 seed (if present)
        if (!adminChecks['is_admin truthy']) {
          try {
            const sqlite3 = require('sqlite3').verbose();
            const path = require('path');
            const repoRoot = path.resolve(__dirname, '..', '..');
            const dbPath = path.join(repoRoot, 'tmp', 'd1_local.sqlite');

            if (require('fs').existsSync(dbPath)) {
              const db = new sqlite3.Database(dbPath);
              await new Promise((resolve, reject) => {
                db.get('SELECT u.id, u.username, au.role FROM users u JOIN admin_users au ON au.user_id = u.id WHERE u.username = ?', [userObj.username], (err, row) => {
                  if (err) return reject(err);
                  if (row) {
                    console.log(`Local DB admin mapping found: user_id=${row.id}, role=${row.role}`);
                  } else {
                    console.log('No local DB admin mapping found for this username');
                  }
                  resolve();
                });
              });
              db.close();
            } else {
              console.log('Local D1 DB not found at', dbPath);
            }
          } catch (e) {
            console.warn('Local DB check skipped (sqlite3 not available or failed):', e.message);
          }
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