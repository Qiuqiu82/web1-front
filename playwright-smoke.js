const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const origin = process.env.ORIGIN || 'http://localhost:8083';
  const report = {
    origin,
    startedAt: new Date().toISOString(),
    pages: [],
    pageErrors: [],
    consoleErrors: []
  };

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('pageerror', (err) => {
    report.pageErrors.push(String(err && err.message || err));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text());
    }
  });

  const targets = [
    '/#/index/home',
    '/#/index/coscart',
    '/#/index/cosorder',
    '/#/index/cosorder-admin',
    '/#/login',
    '/#/register?role=yonghu&pageFlag=register'
  ];

  for (const route of targets) {
    const url = origin + route;
    const item = { route, url, ok: false, status: null, title: '', bodyTextLen: 0, hasVueRoot: false, screenshot: '' };
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      item.status = res ? res.status() : null;
      await page.waitForTimeout(700);
      item.title = await page.title();
      item.bodyTextLen = await page.evaluate(() => (document.body && document.body.innerText ? document.body.innerText.trim().length : 0));
      item.hasVueRoot = await page.$('#app') !== null;

      const shotName = `smoke-${route.replace(/[^a-zA-Z0-9]+/g, '_')}.png`;
      const shotPath = path.join(process.cwd(), 'playwright-smoke', shotName);
      fs.mkdirSync(path.dirname(shotPath), { recursive: true });
      await page.screenshot({ path: shotPath, fullPage: true });
      item.screenshot = shotPath;

      item.ok = item.status !== null && item.status < 500 && item.hasVueRoot && item.bodyTextLen > 0;
    } catch (e) {
      item.error = String(e && e.message || e);
      item.ok = false;
    }
    report.pages.push(item);
  }

  await browser.close();

  report.finishedAt = new Date().toISOString();
  const outPath = path.join(process.cwd(), 'playwright-smoke', 'report.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  const failed = report.pages.filter(p => !p.ok);
  if (failed.length > 0) {
    console.log(JSON.stringify({ ok: false, failedRoutes: failed.map(f => f.route), report: outPath }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, report: outPath }, null, 2));
})();
