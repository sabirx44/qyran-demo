// Full-page review screenshots at desktop, tablet and phone sizes using the installed Edge.
// Usage: node scripts/shoot.mjs <url> <name>   (adds ?qa so every section is shown at rest)
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const [url, name = 'page'] = process.argv.slice(2);
const sizes = [
  { w: 1440, h: 900, dpr: 1 },
  { w: 768, h: 1024, dpr: 1 },
  { w: 390, h: 844, dpr: 2, mobile: true },
];
mkdirSync('.shots', { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
for (const s of sizes) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: s.dpr, isMobile: !!s.mobile, hasTouch: !!s.mobile });
  const u = new URL(url);
  u.searchParams.set('qa', '1');
  await page.goto(u.href, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 800));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.screenshot({ path: `.shots/${name}-${s.w}.png`, fullPage: true });
  console.log(`${name}-${s.w}.png  horizontal overflow: ${overflow}px`);
  await page.close();
}
await browser.close();
