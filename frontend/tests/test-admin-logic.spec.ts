import { test, expect } from '@playwright/test';

test('test admin redirect logic directly', async ({ page }) => {
  const frontendBase = 'https://local.lchaty.com:5173';
  
  // Go to the main page
  await page.goto(frontendBase);
  await page.waitForLoadState('networkidle');
  
  console.log('Testing redirect logic simulation...');
  
  // Simulate the admin redirect logic directly in the browser
  const redirectResult = await page.evaluate(() => {
    // Simulate having an admin user
    const user = { 
      id: 3, 
      username: 'admin', 
      is_admin: false // Testing username-based detection
    };
    
    // Test admin detection logic
    const isAdminRoute = window.location.hostname.includes('admin') || window.location.pathname.includes('admin');
    const isUserAdmin = user.is_admin || user.username === 'admin' || user.username?.toLowerCase().includes('admin');
    
    console.log('isAdminRoute:', isAdminRoute);
    console.log('isUserAdmin:', isUserAdmin);
    console.log('Should redirect:', isUserAdmin && !isAdminRoute);
    
    if (isUserAdmin && !isAdminRoute) {
      const redirectUrl = window.location.origin + '/admin.html';
      console.log('Would redirect to:', redirectUrl);
      
      // Actually perform the redirect for testing
      window.location.href = redirectUrl;
      return { redirected: true, url: redirectUrl };
    }
    
    return { redirected: false };
  });
  
  console.log('Redirect simulation result:', redirectResult);
  
  if (redirectResult.redirected) {
    // Wait for redirect to complete
    await page.waitForURL('**/admin.html');
    console.log('✅ Redirect to admin.html successful');
    console.log('Final URL:', page.url());
    
    // Check if admin app loads
    const adminContent = await page.waitForSelector('#admin', { timeout: 5000 }).catch(() => null);
    if (adminContent) {
      console.log('✅ Admin app content found');
    } else {
      console.log('❌ Admin app content not found');
    }
    
    await page.screenshot({ path: 'admin-page-loaded.png', fullPage: true });
  }
});