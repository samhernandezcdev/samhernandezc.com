// Dev-only tool: renders the single static share image (public/og-default.png,
// 1200×630) from an HTML template in the site's visual language: warm paper,
// Geist / Geist Mono, hairlines and the drafting-green section tick. Run it
// only when the name or role changes; the PNG is committed.
//
// Usage: node scripts/og-image.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

// Inlined as data URLs: a page built with setContent cannot load file:// fonts.
const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(path.resolve("node_modules/@fontsource-variable", pkg, "files", file)).toString("base64")}`;

// Light-theme token values from src/styles/system/tokens.css.
const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: "Geist"; src: url("${font("geist", "geist-latin-wght-normal.woff2")}") format("woff2"); font-weight: 100 900; }
  @font-face { font-family: "Geist Mono"; src: url("${font("geist-mono", "geist-mono-latin-wght-normal.woff2")}") format("woff2"); font-weight: 100 900; }
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; padding: 88px 96px 72px;
    display: flex; flex-direction: column;
    background: oklch(0.972 0.004 95); color: oklch(0.24 0.008 80);
    font-family: "Geist", sans-serif; -webkit-font-smoothing: antialiased;
  }
  .rule { position: relative; border-top: 1px solid oklch(0.885 0.006 90); }
  .rule::before { content: ""; position: absolute; top: -1px; left: 0; width: 56px; border-top: 3px solid oklch(0.47 0.075 170); }
  h1 { margin-top: 56px; font-size: 104px; font-weight: 600; letter-spacing: -0.025em; line-height: 1; }
  .axis { display: grid; grid-template-columns: 300px 1fr; gap: 40px; margin-top: 48px; padding-top: 32px; border-top: 1px solid oklch(0.78 0.008 90); }
  .role { font-size: 34px; color: oklch(0.47 0.01 80); }
  .focus { font-size: 34px; line-height: 1.3; letter-spacing: -0.01em; }
  .foot { margin-top: auto; display: flex; justify-content: space-between; font-family: "Geist Mono", monospace; font-size: 22px; color: oklch(0.47 0.01 80); }
</style></head><body>
  <div class="rule"></div>
  <h1>Samuel Hernández</h1>
  <div class="axis">
    <p class="role">Software Engineer</p>
    <p class="focus">Backend systems, data and applied AI</p>
  </div>
  <p class="foot"><span>samhernandezc.bkode.lat</span><span>Python · FastAPI · PostgreSQL · TypeScript</span></p>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "public/og-default.png", type: "png" });
  console.log("public/og-default.png written (1200×630)");
} finally {
  await browser.close();
}
