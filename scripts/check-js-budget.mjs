// First-party JavaScript budget for the production build: every HTML page in
// dist/ may ship at most 6 KB (6144 bytes) of gzipped JavaScript, counting its
// inline <script> blocks and any same-site script files it loads. JSON-LD and
// other data scripts are not JavaScript and are excluded. Exits 1 on failure.
// Chunks that no page loads up front (dynamic import(), fetched on demand) are
// listed after the table for review; they have no budget yet.
//
// Usage: npm run build && npm run test:budget
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const DIST = "dist";
const BUDGET = 6 * 1024;
const EXECUTABLE = new Set(["", "module", "text/javascript", "application/javascript"]);

if (!existsSync(DIST)) {
  console.error("dist/ not found: run `npm run build` first.");
  process.exit(1);
}

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });

const gz = (text) => gzipSync(Buffer.from(text), { level: 9 }).length;
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find(Boolean);

let failed = false;
const rows = [];
const loaded = new Set();
for (const file of htmlFiles(DIST).sort()) {
  const html = readFileSync(file, "utf8");
  let total = 0;
  for (const [, tag, body] of html.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/gi)) {
    const type = (attr(tag, "type") ?? "").toLowerCase();
    if (!EXECUTABLE.has(type)) continue;
    const src = attr(tag, "src");
    if (src) {
      if (/^(https?:)?\/\//.test(src)) continue; // not first-party output
      const asset = path.join(DIST, src.split(/[?#]/)[0]);
      loaded.add(path.resolve(asset));
      total += gz(readFileSync(asset, "utf8"));
    } else if (body.trim()) {
      total += gz(body);
    }
  }
  const route = "/" + path.relative(DIST, file).split(path.sep).join("/");
  const over = total > BUDGET;
  failed ||= over;
  rows.push(`${over ? "FAIL" : "ok  "} ${String(total).padStart(5)} B  ${route}`);
}

console.log(rows.join("\n"));
console.log(`\nBudget: ${BUDGET} B gzipped first-party JS per page.`);

const ASSETS = path.join(DIST, "_astro");
const deferred = existsSync(ASSETS)
  ? readdirSync(ASSETS)
      .filter((name) => name.endsWith(".js") && !loaded.has(path.resolve(ASSETS, name)))
      .map((name) => `info ${String(gz(readFileSync(path.join(ASSETS, name), "utf8"))).padStart(5)} B  /_astro/${name}`)
  : [];
if (deferred.length) console.log(`\nLoaded on demand (import()), reported only, no budget:\n${deferred.join("\n")}`);
if (failed) {
  console.error("JS budget exceeded.");
  process.exit(1);
}
