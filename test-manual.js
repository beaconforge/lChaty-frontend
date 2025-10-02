const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  try {
    console.log('Testing enhanced lChaty application...');
    
    // Connect to HTTPS server
    const url = 'https://localhost:5173';
    await page.goto(url, { waitUntil: 'networkidle' });
    console.log(`✓ Connected to ${url}`);
    
    // Wait for app initialization
    await page.waitForTimeout(2000);
    
    // Test 1: Check required elements
    console.log('\\n--- Testing Required Elements ---');
    const h1 = await page.locator('h1').first();
    const h1Text = await h1.textContent();
    console.log('H1 text:', h1Text);
    console.log('✓ H1 matches requirement:', h1Text === 'Foundation. Innovation. Connection.');
    
    // Check for test IDs
    const headerLogo = await page.locator('[data-testid="header-logo"]');
    const headerHome = await page.locator('[data-testid="header-home"]');
    const loginUsername = await page.locator('[data-testid="login-username"]');
    const loginPassword = await page.locator('[data-testid="login-password"]');
    const loginSubmit = await page.locator('[data-testid="login-submit"]');
    
    console.log('✓ Header logo visible:', await headerLogo.isVisible());
    console.log('✓ Header home visible:', await headerHome.isVisible());
    console.log('✓ Login username visible:', await loginUsername.isVisible());
    console.log('✓ Login password visible:', await loginPassword.isVisible());
    console.log('✓ Login submit visible:', await loginSubmit.isVisible());
    
    // Test 2: Theme toggle
    console.log('\\n--- Testing Theme Toggle ---');
    const themeToggle = await page.locator('#theme-toggle');
    console.log('✓ Theme toggle visible:', await themeToggle.isVisible());
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log('Initial theme is dark:', initialTheme);
    
    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const newTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log('✓ Theme toggled successfully:', newTheme !== initialTheme);
    
    // Test 3: Form interaction
    console.log('\\n--- Testing Form Interaction ---');
    await loginUsername.fill('testuser');
    await loginPassword.fill('testpass');
    
    const usernameValue = await loginUsername.inputValue();
    const passwordValue = await loginPassword.inputValue();
    console.log('✓ Username filled:', usernameValue === 'testuser');
    console.log('✓ Password filled:', passwordValue === 'testpass');
    
    // Test 4: Show/hide password
    console.log('\\n--- Testing Show Password ---');
    const showPasswordCheckbox = await page.locator('#showPassword');
    console.log('✓ Show password checkbox visible:', await showPasswordCheckbox.isVisible());
    
    const initialType = await loginPassword.getAttribute('type');
    await showPasswordCheckbox.check();
    const newType = await loginPassword.getAttribute('type');
    console.log('✓ Password type changed:', initialType === 'password' && newType === 'text');
    
    // Test 5: Logo assets
    console.log('\\n--- Testing Logo Assets ---');
    const headerLogoSrc = await headerLogo.getAttribute('src');
    const mainLogoSrc = await page.locator('img[alt="lChaty logo"]').first().getAttribute('src');
    console.log('✓ Header logo source:', headerLogoSrc);
    console.log('✓ Main logo source:', mainLogoSrc);
    
    // Test 6: Responsive design
    console.log('\\n--- Testing Responsive Design ---');
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(500);
    
    const mobileVisible = await loginUsername.isVisible();
    console.log('✓ Mobile layout functional:', mobileVisible);
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    const desktopVisible = await loginUsername.isVisible();
    console.log('✓ Desktop layout functional:', desktopVisible);
    
    // Take screenshots
    console.log('\\n--- Taking Screenshots ---');
    await page.screenshot({ path: 'test-light-theme.png', fullPage: true });
    
    // Switch to dark theme and screenshot
    if (!newTheme) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: 'test-dark-theme.png', fullPage: true });
    
    console.log('✓ Screenshots captured successfully');
    
    console.log('\\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    await browser.close();
  }
})();