// Every URL the lifting-set demo asks for exists in dist/, is same-origin (no
// production domain), is served with the right Content-Type and, for the SVGs,
// is well-formed XML. A host that serves .svg with another type, or a file with
// a duplicated attribute, shows a broken image or "This view could not be loaded".
import { test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { CASE, check } from "./helpers.mjs";

const DIST = "dist";
const fileOf = (url) => `${DIST}${url.replace(/\/$/, "")}${/\.\w+$/.test(url) ? "" : "/index.html"}`;

/** Names of the attributes of every tag, to catch what an XML parser rejects. */
const duplicateAttributes = (markup) => {
  const out = [];
  for (const [, tag, body] of markup.replace(/<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->/g, "").matchAll(/<([\w:-]+)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*\/?>/g)) {
    const names = [...body.matchAll(/\s([\w:-]+)(?==")/g)].map((m) => m[1]);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    if (dupes.length) out.push(`${tag}:${dupes.join(",")}`);
  }
  return out;
};

const urls = () => {
  const page = readFileSync(fileOf(CASE), "utf8");
  const found = [
    ...[...page.matchAll(/<img[^>]*class="hoist-img[^"]*"[^>]*src="([^"]+)"/g)].map((m) => m[1]),
    ...[...page.matchAll(/data-viewer-src="([^"]+)"/g)].map((m) => m[1]),
  ];
  const viewer = readFileSync(fileOf(found.find((u) => u.endsWith("viewer.html"))), "utf8");
  const data = JSON.parse(viewer.match(/<script type="application\/json" data-hv-data>([\s\S]*?)<\/script>/)[1]);
  for (let view = 0; view < data.views; view++) for (const variant of ["a", "b"]) found.push(`${data.base}${view}-${variant}.svg`);
  return [...new Set(found)];
};

test("hoist demo: every requested URL exists in dist, is same-origin and has the right type", async ({ request }) => {
  const list = urls();
  check("the card, the viewer and eight views are requested", list.length === 2 + 1 + 8, String(list.length));
  for (const url of list) {
    check(`${url}: relative to the site root, no domain`, /^\/[^/]/.test(url) && !/bkode|samhernandezc|:\/\//.test(url), url);
    check(`${url}: exists in dist/`, existsSync(fileOf(url)), fileOf(url));
    const response = await request.get(url);
    const type = response.headers()["content-type"] ?? "";
    const want = url.endsWith(".svg") ? /^image\/svg\+xml\b/ : /^text\/html\b/;
    check(`${url}: HTTP 200`, response.status() === 200, String(response.status()));
    check(`${url}: served as ${want}`, want.test(type), type);
    if (url.endsWith(".svg")) {
      const body = await response.text();
      check(`${url}: starts with <svg and declares the SVG namespace once`, /^<svg[\s>]/.test(body) && (body.match(/xmlns="/g) ?? []).length === 1, body.slice(0, 120));
      check(`${url}: no attribute is repeated on a tag`, duplicateAttributes(body).length === 0, duplicateAttributes(body).join(" "));
    }
  }
});
