// Builds the CVs from cv/data/{en,es}.json with the shared template.
//   node cv/build.mjs            -> cv/output/*.html + *.pdf (review copies)
//   node cv/build.mjs --publish  -> also copies the PDFs to public/ under the
//                                   exact filenames the site links to
// Fails if a CV exceeds MAX_PAGES or any element overflows horizontally.
// Dev tool only: nothing in src/ imports this, like scripts/screenshot.mjs.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { render } from "./template/render.mjs";

const MAX_PAGES = 2;
const root = new URL("../", import.meta.url);
const cvDir = new URL("./", import.meta.url);
const outDir = new URL("output/", cvDir);
const publish = process.argv.includes("--publish");

const font = await readFile(
  new URL("node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2", root),
);
const css = (await readFile(new URL("template/cv.css", cvDir), "utf8")).replaceAll(
  "__GEIST__",
  `data:font/woff2;base64,${font.toString("base64")}`,
);

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
let failed = false;

try {
  for (const lang of ["en", "es"]) {
    const cv = JSON.parse(await readFile(new URL(`data/${lang}.json`, cvDir), "utf8"));
    const html = render(cv, { css });
    const htmlUrl = new URL(`cv-${lang}.html`, outDir);
    await writeFile(htmlUrl, html);

    const page = await browser.newPage();
    await page.goto(htmlUrl.href);
    const fontsOk = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].every((font) => font.status === "loaded");
    });
    if (!fontsOk) throw new Error(`${lang}: Geist failed to load; the PDF would use a fallback font`);

    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== "inline")
        .map((el) => `${el.tagName.toLowerCase()}: ${el.textContent.slice(0, 60)}`),
    );

    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
    await page.close();

    const pdfPath = new URL(cv.file, outDir);
    await writeFile(pdfPath, pdf);
    const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page\b(?!s)/g) ?? []).length;

    console.log(`${lang}: ${pages} page(s) -> ${fileURLToPath(pdfPath)}`);
    if (pages > MAX_PAGES) {
      console.error(`  ✗ exceeds ${MAX_PAGES} pages`);
      failed = true;
    }
    if (overflow.length) {
      console.error(`  ✗ horizontal overflow:\n    ${overflow.join("\n    ")}`);
      failed = true;
    }
    if (publish && !failed) {
      const target = new URL(`public/${cv.file}`, root);
      await copyFile(pdfPath, target);
      console.log(`  published -> ${fileURLToPath(target)}`);
    }
  }
} finally {
  await browser.close();
}

if (failed) process.exit(1);
