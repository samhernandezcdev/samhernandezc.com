// Visual layer: Hero artifact media, Architecture Trace routes, the BKODE
// construction drawing and note covers. Same conventions as interaction.spec:
// soft checks against the production build.
import { test } from "@playwright/test";
import { CASE, NOTE, check } from "./helpers.mjs";

test.describe.configure({ mode: "parallel" });

const heroState = (p) =>
  p.evaluate(() => {
    const f = document.querySelector("[data-artifact]");
    const v = f.querySelector("video");
    const t = f.querySelector("[data-artifact-toggle]");
    const shown = [...f.querySelectorAll("img")].filter((i) => getComputedStyle(i).display !== "none");
    return {
      src: v.getAttribute("src"),
      paused: v.paused,
      playing: f.hasAttribute("data-playing"),
      toggle: !t.hidden,
      pressed: t.getAttribute("aria-pressed"),
      label: t.getAttribute("aria-label"),
      stills: shown.map((i) => (/artifact-dark/.test(i.currentSrc || i.src) ? "dark" : "light")),
      alt: [...f.querySelectorAll("img")].every((i) => i.alt === ""),
      hiddenVideo: v.getAttribute("aria-hidden") === "true",
    };
  });

test("hero artifact: media gating, theme, pause control", async ({ browser, baseURL: base }) => {
  for (const scheme of ["light", "dark"]) {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
    const p = await c.newPage();
    const media = [];
    p.on("request", (r) => /hero-artifact|artifact-(light|dark)\./.test(r.url()) && media.push(r.url()));
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    await p.waitForFunction(() => document.querySelector("[data-artifact]").hasAttribute("data-playing"), null, { timeout: 10_000 }).catch(() => {});
    const s = await heroState(p);
    check(`hero ${scheme}: one still for the theme, decorative`, s.stills.join() === scheme && s.alt && s.hiddenVideo, JSON.stringify(s));
    check(`hero ${scheme}: loop for the theme is playing`, s.src === `/media/hero-artifact-${scheme}.webm` && s.playing && !s.paused, JSON.stringify(s));
    check(`hero ${scheme}: other theme's media never requested`, !media.some((u) => u.includes(scheme === "light" ? "dark" : "light")), media.join(" "));

    // Pause control: keyboard operable, state exposed, persisted.
    check(`hero ${scheme}: pause control visible`, s.toggle && s.pressed === "false" && /Pause/.test(s.label), JSON.stringify(s));
    await p.focus("[data-artifact-toggle]");
    await p.keyboard.press("Enter");
    const paused = await heroState(p);
    check(`hero ${scheme}: Enter pauses the loop`, paused.paused && paused.pressed === "true" && /Play/.test(paused.label), JSON.stringify(paused));
    await p.reload({ waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const persisted = await heroState(p);
    check(`hero ${scheme}: pause is remembered`, persisted.paused && persisted.pressed === "true", JSON.stringify(persisted));
    await p.click("[data-artifact-toggle]");
    await p.waitForTimeout(400);
    check(`hero ${scheme}: Play resumes`, !(await heroState(p)).paused);
    await c.close();
  }

  // Manual theme switch swaps the loop source.
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
    const p = await c.newPage();
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    await p.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
      document.dispatchEvent(new CustomEvent("themechange", { detail: "dark" }));
    });
    await p.waitForTimeout(300);
    const s = await heroState(p);
    check("hero: theme switch swaps still and loop", s.stills.join() === "dark" && s.src === "/media/hero-artifact-dark.webm", JSON.stringify(s));
    await c.close();
  }

  // Reduced motion, narrow screens and Save-Data keep the still only.
  for (const [name, opts, init] of [
    ["reduced motion", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
    ["mobile 390", { viewport: { width: 390, height: 844 } }],
    ["Save-Data", { viewport: { width: 1440, height: 900 } }, () => Object.defineProperty(navigator, "connection", { value: { saveData: true } })],
  ]) {
    const c = await browser.newContext(opts);
    const p = await c.newPage();
    if (init) await p.addInitScript(init);
    const videos = [];
    p.on("request", (r) => r.url().endsWith(".webm") && videos.push(r.url()));
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const s = await heroState(p);
    check(`hero ${name}: still only, no loop, no control`, !s.src && !s.toggle && videos.length === 0 && s.stills.length === 1, JSON.stringify({ ...s, videos }));
    await c.close();
  }

  // No JS: the still is the complete artifact.
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const p = await c.newPage();
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    const s = await p.evaluate(() => ({
      stills: [...document.querySelectorAll("[data-artifact] img")].filter((i) => getComputedStyle(i).display !== "none").length,
      toggleHidden: document.querySelector("[data-artifact-toggle]").hidden,
    }));
    check("hero no-JS: one still, control hidden", s.stills === 1 && s.toggleHidden, JSON.stringify(s));
    await c.close();
  }
});

test("architecture trace 2.0: routes, depth, fallbacks", async ({ browser, baseURL: base }) => {
  const routes = (p) =>
    p.evaluate(() => ({
      routes: document.querySelectorAll("[data-trace-figure] .trace-route").length,
      heads: document.querySelectorAll("[data-trace-figure] .trace-route-head").length,
      lifted: [...document.querySelectorAll("[data-trace-figure] .diagram-node.is-traced")].every((n) => getComputedStyle(n).transform !== "none"),
      sw: document.documentElement.scrollWidth,
      iw: innerWidth,
    }));
  for (const [width, reduced] of [[1440, false], [1024, false], [1440, true]]) {
    const c = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
    const p = await c.newPage();
    await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.querySelector("[data-trace-figure]").scrollIntoView({ block: "center" }));
    for (const [mode, n] of [["calculation", 2], ["recommendation", 3], ["handoff", 1]]) {
      await p.click(`[data-trace-mode="${mode}"]`);
      await p.waitForTimeout(reduced ? 50 : 1200);
      const s = await routes(p);
      check(`trace ${mode} @${width}${reduced ? " reduced" : ""}: ${n} routes with heads, traced nodes lift, no overflow`, s.routes === n && s.heads === n && s.lifted && s.sw === s.iw, JSON.stringify(s));
    }
    if (reduced) {
      const d = await p.evaluate(() => getComputedStyle(document.querySelector(".trace-route")).transitionDuration);
      check("trace reduced motion: routes appear without drawing", d.split(",").every((x) => parseFloat(x) === 0), d);
    } else {
      // Routes are drawn: the dash offset animates from the full length to 0.
      await p.click('[data-trace-mode="calculation"]');
      const mid = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".trace-route")).strokeDashoffset));
      await p.waitForTimeout(1200);
      const end = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".trace-route")).strokeDashoffset));
      check(`trace @${width}: route draws once, then rests`, mid > 0 && end === 0, JSON.stringify({ mid, end }));
    }
    const active = await p.evaluate(() => document.querySelector("[data-trace-figure]").dataset.activeTrace);
    await p.click(`[data-trace-mode="${active}"]`);
    check(`trace @${width}${reduced ? " reduced" : ""}: pressing the active flow clears it and its routes`, (await routes(p)).routes === 0, active);
    // Keyboard: buttons are reachable and drive the routes.
    await p.focus('[data-trace-mode="handoff"]');
    await p.keyboard.press("Enter");
    await p.waitForTimeout(reduced ? 50 : 900);
    check(`trace @${width}: keyboard selects a flow and draws it`, (await routes(p)).routes === 1);
    await c.close();
  }
  // Mobile: emphasis and description only; no routes, no overflow.
  for (const width of [390, 320]) {
    const c = await browser.newContext({ viewport: { width, height: 844 } });
    const p = await c.newPage();
    await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
    await p.click('[data-trace-mode="recommendation"]');
    await p.waitForTimeout(400);
    const s = await routes(p);
    const traced = await p.evaluate(() => document.querySelectorAll("[data-trace-figure] .diagram-node.is-traced").length);
    check(`trace mobile ${width}: emphasis only, no routes, no overflow`, s.routes === 0 && traced > 0 && s.sw === s.iw, JSON.stringify({ ...s, traced }));
    await c.close();
  }
});

test("BKODE construction drawing", async ({ browser, baseURL: base }) => {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(`${base}/`, { waitUntil: "networkidle" });
  await p.locator(".bkode").scrollIntoViewIfNeeded();
  const arm = () => p.evaluate(() => [...document.querySelectorAll(".bkode-geo-arm")].map((a) => parseFloat(getComputedStyle(a).strokeDashoffset)));
  const geo = await p.evaluate(() => {
    const g = document.querySelector(".bkode-geo");
    return { shown: getComputedStyle(g).display !== "none", hidden: g.getAttribute("aria-hidden") === "true", blue: getComputedStyle(document.querySelector(".bkode-geo-arm")).stroke };
  });
  check("BKODE geometry: shown at 1440, decorative", geo.shown && geo.hidden, JSON.stringify(geo));
  check("BKODE geometry: arms hidden at rest", (await arm()).every((d) => d === 1), JSON.stringify(await arm()));
  await p.hover(".bkode-link");
  await p.waitForTimeout(700);
  check("BKODE hover: the K's arms draw", (await arm()).every((d) => d === 0), JSON.stringify(await arm()));
  await p.mouse.move(5, 5);
  await p.waitForTimeout(700);
  await p.focus(".bkode-link");
  await p.keyboard.press("Shift+Tab");
  await p.keyboard.press("Tab");
  await p.waitForTimeout(700);
  check("BKODE keyboard focus: the arms draw too", (await arm()).every((d) => d === 0), JSON.stringify(await arm()));
  // The BKODE blue never leaves the band.
  const leaks = await p.evaluate(() => {
    const blue = getComputedStyle(document.querySelector(".bkode-geo-arm")).stroke;
    return [...document.querySelectorAll("body *")]
      .filter((el) => !el.closest(".bkode"))
      .filter((el) => { const s = getComputedStyle(el); return [s.color, s.backgroundColor, s.borderTopColor, s.stroke, s.fill].includes(blue); })
      .map((el) => el.tagName + "." + el.className);
  });
  check("BKODE blue confined to the band", leaks.length === 0, leaks.join(", "));
  await c.close();

  const m = await browser.newContext({ viewport: { width: 1024, height: 900 } });
  const mp = await m.newPage();
  await mp.goto(`${base}/`, { waitUntil: "networkidle" });
  check("BKODE geometry hidden where the text needs the width", await mp.evaluate(() => getComputedStyle(document.querySelector(".bkode-geo")).display === "none"));
  await m.close();
});

test("note covers", async ({ browser, baseURL: base }) => {
  for (const scheme of ["light", "dark"]) {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
    const p = await c.newPage();
    await p.goto(`${base}/notes`, { waitUntil: "networkidle" });
    const index = await p.evaluate(() => {
      const svg = document.querySelector(".note-row .cover");
      return svg && { motif: svg.dataset.motif, hidden: svg.getAttribute("aria-hidden") === "true", shown: svg.getBoundingClientRect().width > 0, module: getComputedStyle(svg.querySelector(".cover-module")).fill, bg: getComputedStyle(document.body).backgroundColor };
    });
    check(`notes index ${scheme}: cover plate, decorative, themed`, index?.motif === "split" && index.hidden && index.shown && index.module !== index.bg, JSON.stringify(index));
    await p.goto(`${base}${NOTE}`, { waitUntil: "networkidle" });
    const note = await p.evaluate(() => {
      const svg = document.querySelector(".note-cover .cover");
      return svg && { motif: svg.dataset.motif, variant: svg.classList.contains("cover-band"), hidden: svg.getAttribute("aria-hidden") === "true" };
    });
    check(`note page ${scheme}: cover band`, note?.motif === "split" && note.variant && note.hidden, JSON.stringify(note));
    await c.close();
  }
  const m = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await m.newPage();
  await mp.goto(`${base}/notes`, { waitUntil: "networkidle" });
  const s = await mp.evaluate(() => ({ plate: getComputedStyle(document.querySelector(".note-row-cover")).display, sw: document.documentElement.scrollWidth, iw: innerWidth }));
  check("notes index mobile: plate hidden, no overflow", s.plate === "none" && s.sw === s.iw, JSON.stringify(s));
  await m.close();
});
