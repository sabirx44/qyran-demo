// Research shots of reference travel sites: phone frames down the page, one desktop hero, and a media inventory.
// Usage: node scripts/research.mjs name=url name=url ...
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'node:fs';
const out = process.env.OUT || 'C:/Websites/inspiration/travel';
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const hideOverlays = () => {
  const s = document.createElement('style');
  s.textContent = '#onetrust-consent-sdk,#CybotCookiebotDialog,.cookie,[id*=cookie i],[class*=cookie i],[class*=consent i],[id*=consent i],#usercentrics-root,.fc-consent-root{display:none!important}';
  document.head.appendChild(s);
  document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto';
};
const report = {};
for (const arg of process.argv.slice(2)) {
  const i = arg.indexOf('='); const name = arg.slice(0, i); const url = arg.slice(i + 1);
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 3500));
    await page.evaluate(hideOverlays).catch(() => {});
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const frames = Math.min(8, Math.ceil(H / 844));
    for (let f = 0; f < frames; f++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((f * H) / frames));
      await new Promise((r) => setTimeout(r, 1300));
      await page.screenshot({ path: `${out}/${name}-m${f}.jpg`, type: 'jpeg', quality: 55 });
    }
    const media = await page.evaluate(() => ({
      title: document.title,
      height: document.documentElement.scrollHeight,
      videos: [...document.querySelectorAll('video')].map((v) => ({ src: v.currentSrc || v.src || [...v.querySelectorAll('source')].map((s) => s.src).join(' | '), poster: v.poster, autoplay: v.autoplay, muted: v.muted, loop: v.loop, w: v.videoWidth, h: v.videoHeight })),
      iframes: [...document.querySelectorAll('iframe')].map((f) => f.src).filter((s) => /youtube|vimeo|stream|mux|wistia/.test(s)),
      images: document.images.length,
      imgSamples: [...document.images].slice(0, 6).map((i) => i.currentSrc),
    }));
    const res = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => /\.(mp4|webm|m3u8|mov)|video|stream|mux/i.test(r.name)).map((r) => ({ url: r.name.slice(0, 160), kb: Math.round(r.transferSize / 1024) })));
    report[name] = { url, ...media, videoRequests: res.slice(0, 8) };
    await page.close();
    const d = await browser.newPage();
    await d.setViewport({ width: 1440, height: 900 });
    await d.goto(url, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 3500));
    await d.evaluate(hideOverlays).catch(() => {});
    await d.screenshot({ path: `${out}/${name}-d0.jpg`, type: 'jpeg', quality: 55 });
    await d.close();
    console.log('ok', name, frames);
  } catch (e) { console.log('fail', name, e.message); report[name] = { url, error: e.message }; }
}
writeFileSync(`${out}/media-report.json`, JSON.stringify(report, null, 2));
await browser.close();
