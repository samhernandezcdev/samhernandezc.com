// Legibility of the lifting-set demo: the article card fits a screen without
// scrolling, and in the viewer, in every view, the callouts stay clear of each
// other with text never under 11px; on phones the viewer fills the screen, has
// no horizontal overflow and 44px controls, and the panel is a bottom sheet.
import { test } from "@playwright/test";
import { CASE, check } from "./helpers.mjs";

const VIEWER = "dialog[data-hv]";
const FIGURE = `${VIEWER} [data-hv-figure]`;

async function openViewer(p, base) {
  await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
  await p.click("[data-hoist-open]");
  await p.waitForSelector(`${FIGURE} svg [data-component]`);
}

/** Effective size and boxes of the visible callouts of the current view. */
const CALLOUTS = () => {
  const svg = document.querySelector("[data-hv-figure] svg");
  const scale = svg.getScreenCTM().a;
  const figure = document.querySelector("[data-hv-figure]").getBoundingClientRect();
  const visible = (node) => getComputedStyle(node).display !== "none" && node.getBoundingClientRect().width > 0;
  const texts = [...svg.querySelectorAll(".callout text")].filter(visible);
  const boxes = [...svg.querySelectorAll(".callout")].map((g) =>
    [...g.querySelectorAll(":scope > circle, :scope > .callout-name")].filter(visible).map((node) => {
      const r = node.getBoundingClientRect();
      return { n: g.dataset.n, left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    }),
  );
  return {
    count: boxes.filter((list) => list.length).length,
    smallest: Math.min(...texts.map((t) => parseFloat(getComputedStyle(t).fontSize) * scale)),
    boxes: boxes.flat(),
    figure: { left: figure.left, top: figure.top, right: figure.right, bottom: figure.bottom },
  };
};

const overlaps = (boxes) => {
  const out = [];
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const [a, b] = [boxes[i], boxes[j]];
      if (a.n === b.n) continue;
      if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) out.push(`${a.n}/${b.n}`);
    }
  return out;
};

for (const [width, height] of [
  [1280, 720],
  [390, 844],
]) {
  test(`hoist card: fits the screen under the header at ${width}x${height}`, async ({ browser, baseURL: base }) => {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const p = await ctx.newPage();
    await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.querySelector("[data-hoist]").scrollIntoView({ block: "start" }));
    const m = await p.evaluate(() => {
      const card = document.querySelector("[data-hoist]").getBoundingClientRect();
      const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      return { top: card.top, bottom: card.bottom, header, inner: innerHeight, scroll: document.documentElement.scrollWidth, iw: innerWidth };
    });
    check(`card is below the header and ends inside the screen at ${width}x${height}`, m.top >= m.header - 1 && m.bottom <= m.inner, JSON.stringify(m));
    check(`no horizontal overflow at ${width}`, m.scroll === m.iw, JSON.stringify(m));
    await ctx.close();
  });
}

for (const [width, height] of [
  [1280, 720],
  [1440, 900],
  [1024, 768],
]) {
  test(`hoist viewer: every view keeps its callouts apart and readable at ${width}x${height}`, async ({ browser, baseURL: base }) => {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const p = await ctx.newPage();
    await openViewer(p, base);
    for (const variant of ["a", "b"]) {
      if (variant === "b") {
        await p.click('[data-variant-button="b"]');
        await p.waitForFunction(() => document.querySelector("[data-hv-figure] [data-variant]").dataset.variant === "b");
      }
      for (let view = 1; view <= 4; view++) {
        const m = await p.evaluate(CALLOUTS);
        const tag = `view ${view}${variant} at ${width}x${height}`;
        check(`${tag}: twelve callouts`, m.count === 12, String(m.count));
        check(`${tag}: callout text at least 11px`, m.smallest >= 11, m.smallest.toFixed(2));
        check(`${tag}: no callout touches another`, overlaps(m.boxes).length === 0, overlaps(m.boxes).join(" "));
        const out = m.boxes.filter((b) => b.left < m.figure.left - 0.5 || b.right > m.figure.right + 0.5 || b.top < m.figure.top - 0.5 || b.bottom > m.figure.bottom + 0.5);
        check(`${tag}: callouts inside the drawing area`, out.length === 0, JSON.stringify(out.map((b) => b.n)));
        await p.click("[data-hv-rotate]");
        await p.waitForFunction((v) => document.querySelector("[data-hv-view-n]").textContent === String((v % 4) + 1), view);
      }
    }
    await ctx.close();
  });
}

for (const [width, height] of [
  [1280, 720],
  [1440, 900],
  [1920, 1080],
  [390, 844],
]) {
  test(`hoist viewer: fills the viewport, fits the drawing, locks page scroll at ${width}x${height}`, async ({ browser, baseURL: base }) => {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const p = await ctx.newPage();
    await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
    await p.evaluate(() => window.scrollTo(0, 600));
    await p.click("[data-hoist-open]");
    await p.waitForSelector(`${FIGURE} svg [data-component]`);
    const m = await p.evaluate(() => {
      const box = document.querySelector("dialog[data-hv]").getBoundingClientRect();
      const fig = document.querySelector("[data-hv-figure]");
      const svg = fig.querySelector("svg");
      const f = fig.getBoundingClientRect();
      const [, , vw, vh] = svg.getAttribute("viewBox").split(" ").map(Number);
      const fit = Math.min(f.width / vw, f.height / vh);
      const y = scrollY;
      window.scrollTo(0, 0);
      return { box: [box.left, box.top, box.width, box.height], figure: Math.max((vw * fit) / f.width, (vh * fit) / f.height), scrolled: y !== scrollY || scrollY, overflow: getComputedStyle(document.documentElement).overflow };
    });
    check(`dialog box equals the viewport at ${width}x${height}`, m.box[0] === 0 && m.box[1] === 0 && m.box[2] === width && m.box[3] === height, JSON.stringify(m));
    check(`page does not scroll while open at ${width}`, m.overflow === "hidden", JSON.stringify(m));
    check(`drawing fills at least 90% of the limiting canvas dimension at ${width}`, m.figure >= 0.9, m.figure.toFixed(3));
    await p.screenshot({ path: `${process.env.HV_SHOTS ?? "test-results"}/hv-full-${width}x${height}.png` });
    await ctx.close();
  });
}

for (const [width, height] of [
  [390, 844],
  [320, 640],
]) {
  test(`hoist viewer: full screen on a phone, no overflow, 44px controls, bottom sheet at ${width}x${height}`, async ({ browser, baseURL: base }) => {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const p = await ctx.newPage();
    await openViewer(p, base);
    const layout = () =>
      p.evaluate((s) => {
        const dialog = document.querySelector(s);
        const box = dialog.getBoundingClientRect();
        const visible = [...dialog.querySelectorAll("button, select, [role=tab]")].filter((n) => n.getBoundingClientRect().width > 0 && getComputedStyle(n).visibility !== "hidden");
        return {
          box: [box.left, box.top, box.width, box.height].map(Math.round),
          overflow: dialog.scrollWidth > dialog.clientWidth + 1 || [...dialog.querySelectorAll("*")].some((n) => !n.closest("svg, .hv-tabs") && n.getBoundingClientRect().right > innerWidth + 1),
          small: visible.filter((n) => n.getBoundingClientRect().height < 44 || (n.matches(".hv-tool") && n.getBoundingClientRect().width < 44)).map((n) => n.textContent.trim().slice(0, 20) || n.getAttribute("aria-label")),
          figure: document.querySelector("[data-hv-figure]").getBoundingClientRect().height,
        };
      }, VIEWER);
    let m = await layout();
    check(`fills the screen at ${width}`, m.box[0] === 0 && m.box[1] === 0 && m.box[2] === width && m.box[3] === height, JSON.stringify(m));
    check(`no horizontal overflow at ${width}`, !m.overflow, JSON.stringify(m));
    check(`controls are at least 44px at ${width}`, m.small.length === 0, JSON.stringify(m.small));
    check(`the drawing gets most of the screen with the sheet closed at ${width}`, m.figure >= height * 0.45, String(m.figure));
    const c = await p.evaluate(CALLOUTS);
    check(`callout numbers at least 11px at ${width}`, c.count === 0 || c.smallest >= 11, `${c.count} ${c.smallest}`);
    check(`callouts do not touch at ${width}`, overlaps(c.boxes).length === 0, overlaps(c.boxes).join(" "));

    // The sheet opens to the panel, shows the selected part, and still has no overflow.
    check(`sheet starts closed at ${width}`, (await p.getAttribute("[data-hv-sheet]", "aria-expanded")) === "false" && !(await p.isVisible("[data-hv-select]")));
    await p.click("[data-hv-sheet]");
    await p.selectOption("[data-hv-select]", "shackle-pin-2");
    check(`sheet opens the panel at ${width}`, (await p.getAttribute("[data-hv-sheet]", "aria-expanded")) === "true" && (await p.isVisible("[data-hv-detail] h3")));
    check(`sheet names the selected part at ${width}`, /Shackle pin 2/.test(await p.locator("[data-hv-sheet]").innerText()));
    m = await layout();
    check(`no horizontal overflow with the sheet open at ${width}`, !m.overflow, JSON.stringify(m));
    check(`controls in the sheet are at least 44px at ${width}`, m.small.length === 0, JSON.stringify(m.small));
    const open = await p.evaluate(CALLOUTS);
    check(`with the sheet open, visible callouts stay readable at ${width}`, open.count === 0 || open.smallest >= 11, `${open.count} ${open.smallest}`);
    await ctx.close();
  });
}
