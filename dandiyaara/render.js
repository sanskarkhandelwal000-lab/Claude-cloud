// Usage: node render.js <html> <out.png> <cssW> <cssH> <pixelWidth> [hash]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [, , inp, out, w, h, px, hash] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +px / +w });
  await p.goto('file://' + path.resolve(inp) + (hash ? '#' + hash : ''), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  await p.screenshot({ path: out });
  await b.close();
})();
