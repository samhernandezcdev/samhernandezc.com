// The lifting-set demo on device profiles (see playwright.config.mjs): the card
// figure decodes, the button appears, the viewer opens on view 0, and nothing
// logs an error or fails a request. Also with the CPU 4x slower and a slow network.
import { test } from "@playwright/test";
import { CASE, check } from "./helpers.mjs";

/** Collects what a phone's DevTools would show. */
const watch = (page) => {
  const log = { console: [], pageerror: [], failed: [], http: [] };
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && log.console.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => log.pageerror.push(e.message));
  page.on("requestfailed", (r) => log.failed.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on("response", (r) => /\.svg|viewer\.html|hoist-viewer/.test(r.url()) && log.http.push(`${r.status()} ${r.headers()["content-type"]} ${r.url()}`));
  return log;
};

async function exercise(page, base, label, testInfo) {
  const log = watch(page);
  await page.goto(`${base}${CASE}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.querySelector("[data-hoist]").scrollIntoView());
  await page.waitForFunction(() => [...document.querySelectorAll(".hoist-img")].some((i) => i.offsetParent && i.complete), null, { timeout: 60_000 });
  const img = await page.evaluate(() => {
    const shown = [...document.querySelectorAll(".hoist-img")].find((i) => i.offsetParent);
    return { naturalWidth: shown?.naturalWidth ?? 0, failed: "figureFailed" in document.querySelector("[data-hoist]").dataset };
  });
  check(`${label}: the card figure decodes`, img.naturalWidth > 0 && !img.failed, JSON.stringify(img));
  await page.waitForSelector("[data-hoist-open]:not([hidden])", { timeout: 60_000 });
  await page.screenshot({ path: testInfo.outputPath(`${label}-card.png`) });
  await page.click("[data-hoist-open]");
  await page.waitForSelector("dialog[data-hv] [data-hv-figure] svg [data-component]", { timeout: 60_000 });
  check(`${label}: the viewer shows view 1 of 4`, /View 1 of 4/.test(await page.textContent("[data-hv-load]")));
  await page.screenshot({ path: testInfo.outputPath(`${label}-viewer.png`) });
  const detail = JSON.stringify(log);
  check(`${label}: no console error, page error or failed request`, !log.console.length && !log.pageerror.length && !log.failed.length, detail);
  check(`${label}: every SVG answered 200 as image/svg+xml`, log.http.filter((h) => h.includes(".svg")).every((h) => /^200 image\/svg\+xml/.test(h)), detail);
}

test("hoist demo on this device profile", async ({ page, baseURL: base }, testInfo) => {
  await exercise(page, base, testInfo.project.name, testInfo);
});

test("hoist demo with the CPU 4x slower and a slow network", async ({ page, browserName, baseURL: base }, testInfo) => {
  test.skip(browserName !== "chromium", "CDP throttling is Chromium-only");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 });
  await exercise(page, base, `${testInfo.project.name}-slow`, testInfo);
});
