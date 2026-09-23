// Builds both CV PDFs with Playwright's Chromium.
// Usage (from repo root): node cv/build.mjs
// If `playwright` isn't resolvable locally, run with NODE_PATH=$(npm root -g).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'assets', 'pdf');
const jobs = [
  ['cv.html', 'Lucas_Silva_CV.pdf', { preferCSSPageSize: true }],
  ['cv-ats.html', 'Lucas_Silva_CV_ATS.pdf', { preferCSSPageSize: true }],
];

const browser = await chromium.launch();
for (const [src, pdf, opts] of jobs) {
  const page = await browser.newPage();
  await page.goto('file://' + path.join(here, src));
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(out, pdf), format: 'A4', printBackground: true, ...opts });
  console.log('built', pdf);
  await page.close();
}
await browser.close();
