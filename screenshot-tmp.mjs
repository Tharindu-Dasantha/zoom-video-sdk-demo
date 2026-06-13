import { chromium } from 'playwright-core';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const OUT = '/tmp/shots';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const browser = await chromium.launch({
  args: [
    '--no-sandbox',
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
  ],
});

// Login to admin first to get a session cookie
const loginCtx = await browser.newContext();
const loginPage = await loginCtx.newPage();
const loginRes = await loginPage.request.post(`${BASE}/api/admin/login`, {
  data: { email: 'adminone@example.com', password: 'Admin1234' },
  headers: { 'Content-Type': 'application/json' },
});
console.log('login status:', loginRes.status());
const cookies = await loginCtx.cookies();
await loginCtx.close();

const PAGES = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'meeting-new', path: '/meeting/new' },
  { name: 'admin', path: '/admin', auth: true },
  { name: 'record-device-check', path: '/record/cmqb6c9vm0001obujbclpppof' },
  { name: 'meeting-prejoin', path: '/meeting/playground-test?name=Tester' },
];

for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  for (const p of PAGES) {
    const ctx = await browser.newContext({
      viewport,
      permissions: ['camera', 'microphone'],
    });
    if (p.auth) {
      await ctx.addCookies(cookies);
    }
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}/${p.name}-${vpName}.png`, fullPage: true });
      console.log(`OK: ${p.name} (${vpName})`);
    } catch (e) {
      console.log(`FAIL: ${p.name} (${vpName}):`, e.message);
      await page.screenshot({ path: `${OUT}/${p.name}-${vpName}-error.png`, fullPage: true }).catch(() => {});
    }
    await ctx.close();
  }
}

await browser.close();
console.log('DONE');
