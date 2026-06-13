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
  args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});

const loginCtx = await browser.newContext();
const loginPage = await loginCtx.newPage();
await loginPage.request.post(`${BASE}/api/admin/login`, {
  data: { email: 'adminone@example.com', password: 'Admin1234' },
  headers: { 'Content-Type': 'application/json' },
});
const cookies = await loginCtx.cookies();
await loginCtx.close();

for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  // Invalid token page
  {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/record/this-token-does-not-exist`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/record-invalid-${vpName}.png`, fullPage: true });
    await ctx.close();
    console.log(`OK: record-invalid (${vpName})`);
  }

  // Completed recipient page
  {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/record/temp-design-review-token`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/record-completed-${vpName}.png`, fullPage: true });
    await ctx.close();
    console.log(`OK: record-completed (${vpName})`);
  }

  // Admin with recordings section + create link modal
  {
    const ctx = await browser.newContext({ viewport });
    await ctx.addCookies(cookies);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/admin-with-recordings-${vpName}.png`, fullPage: true });

    // Open create link modal
    await page.click('text=Create link');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/admin-create-modal-${vpName}.png`, fullPage: true });
    await ctx.close();
    console.log(`OK: admin-with-recordings + modal (${vpName})`);
  }
}

await browser.close();
console.log('DONE');
