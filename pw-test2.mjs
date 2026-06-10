import { chromium } from 'playwright-core';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
console.log('launched');
await browser.close();
console.log('OK');
