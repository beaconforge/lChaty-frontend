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
              // Try to detect local DB admin mapping to help developers
              try {
                const sqlite3 = require('sqlite3').verbose();
                const path = require('path');
                const repoRoot = path.resolve(__dirname, '..', '..');
                const dbPath = path.join(repoRoot, 'tmp', 'd1_local.sqlite');

                if (require('fs').existsSync(dbPath)) {
                  const db = new sqlite3.Database(dbPath);
                  db.get('SELECT au.role FROM admin_users au JOIN users u ON u.id = au.user_id WHERE u.username = ?', ['e2e_admin'], (err, row) => {
                    if (err) {
                      console.warn('Local DB lookup failed:', err.message);
                    } else if (row) {
                      console.log('Local DB shows admin role for e2e_admin:', row.role);
                    } else {
                      console.log('No local DB admin mapping found for e2e_admin. You can run:');
                      console.log('  node frontend/scripts/apply-d1-seed.js');
                      console.log('then re-run this script or manually set admin mapping in DB.');
                    }
                    db.close();
                  });
                } else {
                  console.log('Local D1 DB not present at', dbPath);
                  console.log('To bootstrap a local DB with admin mappings run: node frontend/scripts/apply-d1-seed.js');
                }
              } catch (e) {
                console.warn('Local DB check skipped (sqlite3 not available):', e.message);
              }
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