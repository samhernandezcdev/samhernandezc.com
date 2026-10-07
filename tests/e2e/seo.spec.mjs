// Release metadata: canonical/hreflang, share image, structured data, sitemap,
// robots and the 404. Guards the confidentiality rules for JSON-LD too.
import { expect, test } from "@playwright/test";
import { CASE, NOTE, ROUTES } from "./helpers.mjs";

const SITE = "https://samhernandezc.bkode.lat";
const canonicalOf = (route) => `${SITE}${route === "/" ? "/" : route}`;

test("every public page has complete, consistent metadata", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const meta = await page.evaluate(() => {
      const attr = (sel, a = "content") => document.querySelector(sel)?.getAttribute(a) ?? null;
      return {
        title: document.title,
        description: attr('meta[name="description"]'),
        canonical: attr('link[rel="canonical"]', "href"),
        robots: attr('meta[name="robots"]'),
        ogImage: attr('meta[property="og:image"]'),
        ogWidth: attr('meta[property="og:image:width"]'),
        ogAlt: attr('meta[property="og:image:alt"]'),
        card: attr('meta[name="twitter:card"]'),
        twitterImage: attr('meta[name="twitter:image"]'),
        jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      };
    });
    expect.soft(meta.title, route).toBeTruthy();
    expect.soft(meta.description?.length ?? 0, `${route} description length`).toBeGreaterThan(50);
    expect.soft(meta.description?.length ?? 999, `${route} description length`).toBeLessThanOrEqual(175);
    expect.soft(meta.canonical, route).toBe(canonicalOf(route));
    expect.soft(meta.robots, `${route} must be indexable`).toBeNull();
    expect.soft(meta.ogImage, route).toBe(`${SITE}/og-default.png`);
    expect.soft(meta.ogWidth, route).toBe("1200");
    expect.soft(meta.ogAlt, route).toBeTruthy();
    expect.soft(meta.card, route).toBe("summary_large_image");
    expect.soft(meta.twitterImage, route).toBe(`${SITE}/og-default.png`);
    for (const block of meta.jsonLd) {
      expect.soft(() => JSON.parse(block), `${route} JSON-LD parses`).not.toThrow();
      // Confidentiality: nothing excluded from the case study leaks through structured data.
      expect.soft(block, `${route} JSON-LD`).not.toMatch(/CPQ|CI\/CD|SoftwareSourceCode|ASME|DNV|SAP|Odoo/i);
    }
  }
});

test("structured data types per page", async ({ page }) => {
  const types = async (route) => {
    await page.goto(route);
    return page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .flatMap((s) => {
          const data = JSON.parse(s.textContent);
          return data["@graph"] ?? [data];
        })
        .map((node) => node["@type"])
        .sort(),
    );
  };
  expect.soft(await types("/")).toEqual(["Person", "WebSite"]);
  expect.soft(await types("/es")).toEqual(["Person", "WebSite"]);
  expect.soft(await types("/about")).toEqual(["Person"]);
  expect.soft(await types("/es/about")).toEqual(["Person"]);
  expect.soft(await types(NOTE)).toEqual(["TechArticle"]);
  expect.soft(await types(CASE)).toEqual(["CreativeWork"]);
});

test("share image is a 1200x630 PNG", async ({ request }) => {
  const res = await request.get("/og-default.png");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
  const png = await res.body();
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
});

test("sitemap lists exactly the canonical public pages", async ({ request }) => {
  const index = await (await request.get("/sitemap-index.xml")).text();
  expect(index).toContain(`${SITE}/sitemap-0.xml`);
  const sitemap = await (await request.get("/sitemap-0.xml")).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  expect(locs).toEqual(ROUTES.map(canonicalOf).sort());
});

test("robots.txt points to the sitemap", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
});

test("unknown routes get the noindex 404 page", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Page not found");
  expect(await page.getAttribute('meta[name="robots"]', "content")).toContain("noindex");
  await expect(page.locator('main a[href="/"]')).toBeVisible();
  await expect(page.locator('main a[href="/work"]')).toBeVisible();
});

test("/en is a noindex fallback that points to /", async ({ request }) => {
  const html = await (await request.get("/en/")).text();
  expect(html).toMatch(/http-equiv="refresh" content="0;url=\/"/);
  expect(html).toContain('name="robots" content="noindex"');
  expect(html).toContain(`rel="canonical" href="${SITE}/"`);
});

test("hreflang alternates use the production origin", async ({ page }) => {
  const pairs = { "/": "/es", "/work": "/es/work", "/about": "/es/about" };
  for (const [en, es] of Object.entries(pairs)) {
    for (const route of [en, es]) {
      await page.goto(route);
      const links = await page.evaluate(() =>
        Object.fromEntries([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.hreflang, l.href])),
      );
      expect.soft(links, route).toEqual({ en: canonicalOf(en), es: canonicalOf(es), "x-default": canonicalOf(en) });
    }
  }
});

test("RSS feed uses the production origin", async ({ request }) => {
  const feed = await (await request.get("/rss.xml")).text();
  expect(feed).toContain(`<link>${SITE}</link>`);
  expect(feed).toContain(`<link>${SITE}${NOTE}</link>`);
  expect(feed).toContain(`<guid isPermaLink="true">${SITE}${NOTE}</guid>`);
});

test("no stale samhernandezc.com references in the build", async ({ request }) => {
  for (const path of [...ROUTES, "/rss.xml", "/robots.txt", "/sitemap-index.xml", "/sitemap-0.xml", "/404.html", "/en/"]) {
    const body = await (await request.get(path)).text();
    expect.soft(body, path).not.toContain("samhernandezc.com");
  }
});
