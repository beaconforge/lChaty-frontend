import { chromium } from 'playwright';
(async function() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR', err.message));

  const urls = ['https://local.lchaty.com:5173/','https://local.admin.lchaty.com:5173/'];
  let i = 0;
  for (const u of urls) {
    try {
      console.log('Visiting', u);
      await page.goto(u, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      const ready = await page.evaluate(() => document.readyState);
      console.log('  readyState', ready);
      const html = await page.content();
      const hasLoginText = /login|sign in|sign-in/i.test(html);
      const hasInput = await page.$('input[name="username"], input[type="email"], input[type="password"]');
      console.log('  hasLoginText', hasLoginText, 'hasInput', !!hasInput);
      const snap = `page-snap-${i}.png`;
      await page.screenshot({ path: snap, fullPage: true });
      console.log('  screenshot', snap);
    } catch (e) {
      console.log('  error loading', u, e.message);
    }
    i++;
  }
  await browser.close();
})();
