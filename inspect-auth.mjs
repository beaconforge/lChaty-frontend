import { chromium } from 'playwright';
(async ()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR', err.message));

  page.on('request', req => {
    if (req.url().includes('/api/')) console.log('REQ ->', req.method(), req.url());
  });
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log('RES <-', res.status(), res.url());
      try { const t = await res.text(); console.log('  body snippet:', t.slice(0,200).replace(/\n/g,' ')); } catch(e){}
    }
  });

  const urls = ['https://local.lchaty.com:5173/','https://local.admin.lchaty.com:5173/'];
  for (const u of urls) {
    console.log('Visiting', u);
    try {
      await page.goto(u, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      const hasLoginForm = await page.$('#loginForm') !== null;
      const hasLoginButton = await page.$('#loginButton') !== null;
      console.log('hasLoginForm', hasLoginForm, 'hasLoginButton', hasLoginButton);
    } catch (e) {
      console.log('Error loading', u, e.message);
    }
  }
  await browser.close();
})();
