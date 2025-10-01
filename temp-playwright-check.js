const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const urls = ['https://local.lchaty.com:5173','https://local.admin.lchaty.com:5173'];
  for (const u of urls) {
    try {
      const res = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 20000 });
      console.log('URL', u, 'status', res && res.status());
      const html = await page.content();
      const hasLoginText = /login|sign in|sign-in/i.test(html);
      const hasUserInput = await page.$('input[name="username"], input[type="email"], input[name="email"], input[name="user"]');
      const hasPassInput = await page.$('input[type="password"], input[name="pass"]');
      console.log('  hasLoginText', hasLoginText, 'hasUserInput', !!hasUserInput, 'hasPassInput', !!hasPassInput);
    } catch (e) {
      console.log('  error loading', u, e.message);
    }
  }
  await browser.close();
})();
