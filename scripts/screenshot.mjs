// Dev-only tooling for the `visual-review` Claude skill. Never imported by src/.
// Serves the existing build (dist/) with Astro's preview server and captures
// every built route at desktop and mobile widths in light and dark color schemes.
//
// Usage: npm run build && node scripts/screenshot.mjs [--routes /,/en] [--out dir]
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { preview } from "astro";
import { chromium } from "@playwright/test";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};
const SCHEMES = ["light", "dark"];
const PORT = 4329;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function discoverRoutes(dir, base = "/") {
  const routes = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith("_")) {
      routes.push(...(await discoverRoutes(path.join(dir, entry.name), `${base}${entry.name}/`)));
    } else if (entry.name === "index.html") {
      routes.push(base === "/" ? "/" : base.replace(/\/$/, ""));
    }
  }
  return routes.sort();
}

function slug(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "__");
}

if (!existsSync("dist")) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

const routes = arg("routes")?.split(",") ?? (await discoverRoutes("dist"));
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = arg("out") ?? path.join(".claude", "review", stamp);
await mkdir(outDir, { recursive: true });

const server = await preview({ server: { port: PORT, host: "127.0.0.1" }, logLevel: "error" });
const browser = await chromium.launch();
const files = [];

try {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const colorScheme of SCHEMES) {
      const context = await browser.newContext({
        viewport,
        colorScheme,
        reducedMotion: "reduce",
        deviceScaleFactor: viewportName === "mobile" ? 2 : 1,
      });
      const page = await context.newPage();
      for (const route of routes) {
        await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle" });
        // Scroll through the page so lazy-loaded images and observers fire before capture.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 100));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForLoadState("networkidle");
        const file = path.join(outDir, `${slug(route)}.${viewportName}.${colorScheme}.png`);
        await page.screenshot({ path: file, fullPage: true });
        files.push(file);
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server.stop();
}

console.log(`Captured ${files.length} screenshots in ${outDir}`);
for (const f of files) console.log(`  ${f}`);
