// Product interaction tests (committed). Runs against the production build
// served by `astro preview` (see playwright.config.mjs): npm run build && npm run test:e2e
// Each check is a soft assertion so one run reports every failing behavior.
import { test } from "@playwright/test";
import { CASE, NOTE, check } from "./helpers.mjs";

test.describe.configure({ mode: "parallel" });

test("search dialog", async ({ browser, baseURL: base }) => {
  const desktop = (extra = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...extra });
  {
    const ctx = await desktop();
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}/work`, { waitUntil: "networkidle" });
    const isOpen = () => page.evaluate(() => document.querySelector("[data-palette]").open);
    const state = () => page.evaluate(() => {
      const input = document.querySelector("[data-palette-filter]");
      const shown = [...document.querySelectorAll("#palette-list li:not([hidden]) [data-palette-item]")];
      const sel = shown.find((a) => a.getAttribute("aria-selected") === "true");
      return {
        shown: shown.map((a) => a.querySelector(".palette-label").textContent.trim().replace(/\s+EN$/, "")),
        types: shown.map((a) => a.querySelector(".palette-type").textContent.trim()),
        selected: sel?.querySelector(".palette-label").textContent.trim() ?? null,
        active: input.getAttribute("aria-activedescendant") === sel?.id,
        empty: !document.querySelector("[data-palette-empty]").hidden,
        focusInInput: document.activeElement === input,
      };
    });

    check("trigger visible with JS", await page.isVisible("[data-palette-open]"));
    check("trigger shows Search + shortcut", await page.evaluate(() => /Search/.test(document.querySelector("[data-palette-open]").textContent) && getComputedStyle(document.querySelector("[data-palette-kbd]")).display !== "none"));
    await page.focus("[data-palette-open]");
    await page.keyboard.press("Control+k");
    check("Ctrl+K opens", await isOpen());
    let s = await state();
    check("initial: focus in input, first result selected", s.focusInInput && s.selected === "Home" && s.active, JSON.stringify(s.selected));
    check("initial: pages, work, note, actions listed", ["page", "work", "note", "action"].every((t) => s.types.includes(t)), s.types.join());
    await page.keyboard.press("Escape");
    check("Escape closes", !(await isOpen()));
    check("focus returns to trigger", await page.evaluate(() => document.activeElement?.matches("[data-palette-open]")));
    await page.keyboard.press("Meta+k");
    check("Meta+K opens", await isOpen());
    await page.mouse.click(10, 880);
    check("backdrop click closes", !(await isOpen()));

    await page.click("[data-palette-open]");
    check("trigger click opens", await isOpen());
    await page.keyboard.type("rules");
    s = await state();
    check("filter: content result (note)", s.shown[0] === "Deterministic rules on top of changing data" && s.selected === s.shown[0], s.shown.join(" | "));
    await page.fill("[data-palette-filter]", "");
    await page.keyboard.type("lifting");
    s = await state();
    check("filter: work result by title", s.shown.length === 1 && s.types[0] === "work", s.shown.join(" | "));
    await page.fill("[data-palette-filter]", "");
    await page.keyboard.type("fastapi");
    s = await state();
    check("filter: matches metadata (stack)", s.shown.includes("Industrial lifting-equipment configuration platform"), s.shown.join(" | "));
    await page.fill("[data-palette-filter]", "");
    await page.keyboard.type("zzqx");
    s = await state();
    check("no results message", s.empty && s.shown.length === 0 && s.selected === null, JSON.stringify(s));
    check("no results text", (await page.textContent("[data-palette-empty]")).trim() === "No matching commands");
    await page.fill("[data-palette-filter]", "");
    await page.keyboard.type("a");
    const first = (await state()).shown;
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    s = await state();
    check("ArrowDown moves selection, focus stays in input", s.selected === first[2] && s.focusInInput && s.active, `${s.selected}`);
    await page.keyboard.press("ArrowUp");
    check("ArrowUp moves back", (await state()).selected === first[1]);
    for (let i = 0; i < 30; i++) await page.keyboard.press("ArrowDown");
    check("selection clamps at last result", (await state()).selected === first.at(-1));
    await page.fill("[data-palette-filter]", "");
    await page.keyboard.type("about");
    await Promise.all([page.waitForURL("**/about"), page.keyboard.press("Enter")]);
    await page.waitForLoadState("networkidle");
    check("Enter opens selected page", page.url().endsWith("/about"), page.url());

    // Mouse selection of a content result
    await page.keyboard.press("Control+k");
    await page.keyboard.type("deterministic");
    await Promise.all([page.waitForURL(`**${NOTE}`), page.click("#palette-list li:not([hidden]) [data-palette-item]")]);
    check("click opens content result", page.url().endsWith(NOTE), page.url());
    await page.waitForLoadState("networkidle");

    // External result: Enter on GitHub opens it in a new tab (profiles open in new tabs site-wide)
    await ctx.route("https://github.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>gh</title>" }));
    await page.keyboard.press("Control+k");
    await page.keyboard.type("github");
    const ghSel = (await state()).selected;
    const [ghTab] = await Promise.all([ctx.waitForEvent("page"), page.keyboard.press("Enter")]);
    await ghTab.waitForLoadState();
    check("Enter opens external result in a new tab", ghSel === "GitHub" && ghTab.url().startsWith("https://github.com/") && page.url().endsWith(NOTE), `${ghTab.url()} | stays on ${page.url()}`);
    await ghTab.close();
    await ctx.unroute("https://github.com/**");

    // Theme row in search
    await page.goto(`${base}/work`, { waitUntil: "networkidle" });
    await page.keyboard.press("Control+k");
    await page.click('[data-palette] [data-theme-value="dark"]');
    await page.waitForTimeout(300);
    check("search theme row: Dark", await page.evaluate(() => document.documentElement.dataset.theme === "dark" && localStorage.getItem("theme") === "dark"));
    check("search -> header sync", await page.evaluate(() => document.querySelector("[data-theme-switch]").getAttribute("aria-checked") === "true" && /Dark|Oscuro/.test(document.querySelector("[data-theme-note]").textContent)));
    await page.click('[data-palette] [data-theme-value="system"]');
    await page.waitForTimeout(300);
    check("search theme row: System resets", await page.evaluate(() => !document.documentElement.dataset.theme && localStorage.getItem("theme") === null));
    await page.keyboard.press("Escape");

    // Language action + Spanish search
    await page.keyboard.press("Control+k");
    await page.keyboard.type("español");
    await Promise.all([page.waitForURL("**/es/work"), page.keyboard.press("Enter")]);
    await page.waitForLoadState("networkidle");
    check("language action (accent-insensitive)", page.url().endsWith("/es/work"), page.url());
    await page.keyboard.press("Control+k");
    s = await state();
    check("search localized on ES", s.types.includes("página") && s.types.includes("proyecto") && s.selected === "Inicio", s.types.join());
    await page.keyboard.type("zzqx");
    check("ES no results text", (await page.textContent("[data-palette-empty]")).trim() === "No hay resultados");
    await page.fill("[data-palette-filter]", "");
    await page.keyboard.type("sobre");
    check("ES filter", (await state()).selected === "Sobre mí");
    await page.keyboard.press("Escape");
    check("no page errors", errors.length === 0, errors.join(" | "));
    await ctx.close();
  }
});

test("theme switch", async ({ browser, baseURL: base }) => {
  const desktop = (extra = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...extra });
  for (const scheme of ["light", "dark"]) {
    const ctx = await desktop({ colorScheme: scheme });
    const p = await ctx.newPage();
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    const th = () => p.evaluate(() => ({
      attr: document.documentElement.dataset.theme ?? null,
      stored: localStorage.getItem("theme"),
      checked: document.querySelector("[data-theme-switch]").getAttribute("aria-checked"),
      note: document.querySelector("[data-theme-note]").textContent,
      menu: document.querySelectorAll("[data-theme-menu], [data-theme-option]").length,
      bg: getComputedStyle(document.documentElement).backgroundColor,
    }));
    const t0 = await th();
    check(`[${scheme} OS] one control: no preference menu; System default shows the rendered theme`, t0.menu === 0 && t0.attr === null && t0.checked === String(scheme === "dark") && /System/.test(t0.note), JSON.stringify(t0));
    await p.click("[data-theme-switch]");
    await p.waitForTimeout(300);
    const t1 = await th();
    const flipped = scheme === "dark" ? "light" : "dark";
    check(`[${scheme} OS] switch flips immediately to ${flipped} and stores it`, t1.attr === flipped && t1.stored === flipped && t1.checked === String(flipped === "dark") && t1.bg !== t0.bg && !/System/.test(t1.note), JSON.stringify(t1));
    await p.focus("[data-theme-switch]");
    await p.keyboard.press("Space");
    await p.waitForTimeout(300);
    check(`[${scheme} OS] switch works from keyboard`, (await th()).attr === scheme);
    await p.reload({ waitUntil: "networkidle" });
    check(`[${scheme} OS] explicit choice persists`, (await th()).attr === scheme && (await th()).stored === scheme);
    // System stays reachable without a header menu: the search Theme row.
    await p.keyboard.press("Control+k");
    await p.click('[data-palette] [data-theme-value="system"]');
    await p.waitForTimeout(300);
    const t2 = await th();
    check(`[${scheme} OS] search Theme row returns to System`, t2.attr === null && t2.stored === null && /System/.test(t2.note) && t2.checked === String(scheme === "dark"), JSON.stringify(t2));
    await p.keyboard.press("Escape");
    await ctx.close();
  }
  {
    const ctx = await desktop({ reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    const d = await p.evaluate(() => ({
      thumb: getComputedStyle(document.querySelector(".theme-thumb")).transitionDuration,
      icon: getComputedStyle(document.querySelector(".theme-thumb .theme-icon")).transitionDuration,
      track: getComputedStyle(document.querySelector(".theme-track")).transitionDuration,
    }));
    check("reduced motion: switch thumb, glyphs and track do not animate", Object.values(d).every((v) => v.split(",").every((x) => parseFloat(x) === 0)), JSON.stringify(d));
    await ctx.close();
    const c2 = await desktop();
    const p2 = await c2.newPage();
    await p2.goto(`${base}/`, { waitUntil: "networkidle" });
    const d2 = await p2.evaluate(() => {
      const icons = [...document.querySelectorAll(".theme-thumb .theme-icon")].map((i) => getComputedStyle(i));
      return {
        thumb: getComputedStyle(document.querySelector(".theme-thumb")).transitionDuration,
        hidden: icons.filter((c) => c.opacity === "0").map((c) => c.transform),
        prop: icons[0].transitionProperty,
      };
    });
    check("thumb slides on the section duration (220ms)", parseFloat(d2.thumb) * 1000 === 220, d2.thumb);
    check("outgoing glyph shrinks and fades (opacity + scale, no rotation)", d2.hidden.length === 1 && /matrix\(0\.5, 0, 0, 0\.5/.test(d2.hidden[0]) && /opacity/.test(d2.prop) && /transform/.test(d2.prop), JSON.stringify(d2));
    await c2.close();
  }
});

test("language menu", async ({ browser, baseURL: base }) => {
  const desktop = (extra = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...extra });
  {
    const ctx = await desktop();
    const p = await ctx.newPage();
    const opts = () => p.evaluate(() => [...document.querySelectorAll("[data-lang-menu] .util-option")].map((o) => `${o.textContent.replace("✓", "").trim()}|${o.getAttribute("href")}|${o.getAttribute("aria-current")}`));
    await p.goto(`${base}/work`, { waitUntil: "networkidle" });
    await p.click("[data-lang-menu] summary");
    check("EN page: English current, Español -> /es/work", (await opts()).join() === "English|null|true,Español|/es/work|null", (await opts()).join());
    await Promise.all([p.waitForURL("**/es/work"), p.click('[data-lang-menu] a[hreflang="es"]')]);
    await p.click("[data-lang-menu] summary");
    check("ES page: Español current, English -> /work", (await opts()).join() === "English|/work|null,Español|null|true", (await opts()).join());
    await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
    await p.click("[data-lang-menu] summary");
    check("English-only page: Spanish home fallback, labelled", (await opts())[1] === "Español (página de inicio)|/es|null", (await opts()).join());
    await p.keyboard.press("Escape");
    check("Escape closes menu, focus to summary", await p.evaluate(() => !document.querySelector(".util-menu[open]") && document.activeElement?.matches("[data-lang-menu] summary")));
    await p.click("[data-lang-menu] summary");
    const flags = await p.evaluate(() => ({
      summary: document.querySelector("[data-lang-menu] summary .flag")?.getAttribute("aria-hidden"),
      options: [...document.querySelectorAll("[data-lang-menu] .util-option")].map((o) => ({ flag: o.querySelector(".flag")?.getAttribute("aria-hidden"), text: o.textContent.replace("✓", "").trim() })),
    }));
    check("language menu: decorative flag beside each name (never the only cue)", flags.summary === "true" && flags.options.length === 2 && flags.options.every((o) => o.flag === "true" && o.text.length > 0), JSON.stringify(flags));
    await p.mouse.click(700, 600);
    check("outside click closes", await p.evaluate(() => !document.querySelector(".util-menu[open]")));
    await ctx.close();
  }
});

test("sticky header, anchors and scroll-spy", async ({ browser, baseURL: base }) => {
  const desktop = (extra = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...extra });
  for (const [w, h] of [[1440, 900], [390, 844], [320, 568]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1000 });
    const p = await ctx.newPage();
    await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
    const h0 = await p.evaluate(() => document.querySelector(".site-header").getBoundingClientRect().height);
    await p.mouse.wheel(0, 3000);
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => { const b = document.querySelector(".site-header").getBoundingClientRect(); return { top: b.top, h: b.height, y: scrollY }; });
    check(`${w}: header sticky after scroll, same height`, r.top === 0 && r.y > 1000 && Math.abs(r.h - h0) < 0.5, JSON.stringify({ ...r, h0 }));
    const anchors = await p.evaluate(() => [...document.querySelectorAll(".article-prose > h2")].map((h) => h.id));
    let worst = null;
    for (const id of anchors) {
      await p.goto(`${base}${CASE}#${id}`);
      await p.waitForTimeout(80);
      const a = await p.evaluate((id) => {
        const hd = document.querySelector(".site-header").getBoundingClientRect().bottom;
        const t = document.getElementById(id).getBoundingClientRect();
        const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
        return { id, gap: Math.round(t.top - hd), visible: t.top >= hd, atBottom };
      }, id);
      if (!a.visible || (!a.atBottom && (a.gap < 8 || a.gap > 40))) worst = a;
    }
    check(`${w}: every case-study anchor lands below the header`, worst === null, JSON.stringify(worst));
    await p.goto(`${base}${NOTE}#a-short-checklist`);
    await p.waitForTimeout(80);
    check(`${w}: note anchor below header`, await p.evaluate(() => document.getElementById("a-short-checklist").getBoundingClientRect().top >= document.querySelector(".site-header").getBoundingClientRect().bottom));
    if (w < 1000) {
      const m = await p.evaluate(() => ({
        railSticky: getComputedStyle(document.querySelector(".article-rail") ?? document.body).position,
        disclosure: getComputedStyle(document.querySelector(".article-toc-disclosure")).display,
        open: document.querySelector(".article-toc-disclosure").open,
      }));
      check(`${w}: no sticky rail, TOC is collapsed <details>`, m.railSticky !== "sticky" && m.disclosure !== "none" && !m.open, JSON.stringify(m));
    }
    await ctx.close();
  }
  {
    const ctx = await desktop();
    const p = await ctx.newPage();
    await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
    const current = () => p.evaluate(() => document.querySelector('[data-toc-rail] a[aria-current="location"]')?.hash.slice(1) ?? null);
    check("scroll-spy: nothing current at top", (await current()) === null);
    const rail = await p.evaluate(() => { const r = document.querySelector(".article-rail"); return { pos: getComputedStyle(r).position, top: getComputedStyle(r).top }; });
    check("rail sticky at shared offset", rail.pos === "sticky" && rail.top === "89px", JSON.stringify(rail));
    for (const id of ["problem", "architecture", "engineering-decisions", "outcomes"]) {
      await p.evaluate((id) => { const el = document.getElementById(id); scrollTo(0, el.getBoundingClientRect().top + scrollY - 89 - 40); }, id);
      await p.waitForTimeout(150);
      const before = await current();
      await p.evaluate(() => scrollBy(0, 60));
      await p.waitForTimeout(150);
      check(`scroll-spy: ${id} becomes current as it passes the header`, (await current()) === id && before !== id, `${before} -> ${await current()}`);
    }
    await p.click('[data-toc-rail] a[href="#what-i-would-change-today"]');
    await p.waitForTimeout(200);
    check("scroll-spy: TOC click marks last section", (await current()) === "what-i-would-change-today");
    const railVisible = await p.evaluate(() => { const a = document.querySelector('[data-toc-rail] a[aria-current="location"]').getBoundingClientRect(); const r = document.querySelector(".article-rail").getBoundingClientRect(); return a.top >= r.top && a.bottom <= r.bottom + 1; });
    check("scroll-spy: current entry visible inside rail", railVisible);
    check("trace live region untouched by scroll-spy", await p.evaluate(() => document.querySelector("[data-trace-output]").getAttribute("aria-live") === "polite"));
    await ctx.close();
  }
});

test("architecture trace", async ({ browser, baseURL: base }) => {
  const desktop = (extra = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...extra });
  for (const reduced of [false, true]) {
    const c = await desktop({ reducedMotion: reduced ? "reduce" : "no-preference" });
    const p = await c.newPage();
    await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.querySelector("[data-trace-figure]").scrollIntoView({ block: "center" }));
    const state = () => p.evaluate(() => {
      const fig = document.querySelector("[data-trace-figure]");
      return {
        active: fig.dataset.activeTrace ?? null,
        traced: [...fig.querySelectorAll(".diagram-node.is-traced")].length,
        pressed: [...fig.querySelectorAll("[data-trace-mode]")].map((b) => b.getAttribute("aria-pressed")).join(","),
        text: fig.querySelector("[data-trace-output]").textContent.trim().slice(0, 40),
      };
    });
    const s0 = await state();
    check(`trace default neutral (reduced=${reduced})`, s0.active === null && s0.traced === 0 && s0.pressed === "false,false,false");
    const covered = await p.evaluate(() => {
      const hb = document.querySelector(".site-header").getBoundingClientRect().bottom;
      return [...document.querySelectorAll("[data-trace-mode]")].some((b) => b.getBoundingClientRect().top < hb);
    });
    check(`trace controls not under the header (reduced=${reduced})`, !covered);
    for (const mode of ["calculation", "recommendation", "handoff"]) {
      await p.click(`[data-trace-mode="${mode}"]`);
      const s = await state();
      check(`trace ${mode} (reduced=${reduced})`, s.active === mode && s.traced > 0, s.text);
    }
    await p.click('[data-trace-mode="handoff"]');
    check(`trace toggles off (reduced=${reduced})`, (await state()).active === null);
    if (reduced) {
      const dur = await p.evaluate(() => getComputedStyle(document.querySelector(".diagram-node")).transitionDuration);
      check("reduced motion: no trace transition", dur.split(",").every((d) => parseFloat(d) === 0), dur);
    }
    await p.focus('[data-trace-mode="calculation"]');
    await p.keyboard.press("Enter");
    check(`trace keyboard Enter (reduced=${reduced})`, (await state()).active === "calculation");
    await p.keyboard.press("Tab");
    await p.keyboard.press("Space");
    check(`trace keyboard Space (reduced=${reduced})`, (await state()).active === "recommendation");
    await p.keyboard.press("Control+k");
    const palOpen = await p.evaluate(() => document.querySelector("[data-palette]").open);
    await p.keyboard.press("ArrowDown");
    await p.keyboard.press("Escape");
    check(`search over trace: opens, arrows stay in search (reduced=${reduced})`, palOpen && (await state()).active === "recommendation");
    await c.close();
  }
});

test("no-JS fallback", async ({ browser, baseURL: base }) => {
  const desktop = (extra = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...extra });
  {
    const nojs = await desktop({ javaScriptEnabled: false });
    const np = await nojs.newPage();
    await np.goto(`${base}${CASE}`);
    check("no-JS: header sticky", await np.evaluate(() => getComputedStyle(document.querySelector(".site-header")).position === "sticky"));
    check("no-JS: trace controls hidden", !(await np.isVisible("[data-trace-controls]")));
    check("no-JS: diagram nodes visible", (await np.locator(".system-diagram .diagram-node").count()) >= 10);
    check("no-JS: search trigger hidden", !(await np.isVisible("[data-palette-open]")));
    check("no-JS: theme controls hidden", !(await np.isVisible("[data-theme-switch]")));
    check("no-JS: nav links present", (await np.locator(".site-nav a").count()) >= 3);
    check("no-JS: no scroll-spy marks", (await np.locator('[aria-current="location"]').count()) === 0);
    await np.click('[data-toc-rail] a[href="#outcomes"]');
    await np.waitForTimeout(100);
    check("no-JS: TOC link scrolls below header", await np.evaluate(() => { const t = document.getElementById("outcomes").getBoundingClientRect().top; return location.hash === "#outcomes" && t >= document.querySelector(".site-header").getBoundingClientRect().bottom; }));
    await np.click("[data-lang-menu] summary");
    check("no-JS: language menu opens", await np.isVisible('[data-lang-menu] a[href="/es"]'));
    await nojs.close();
  }
});

test("contact, copy and external links", async ({ browser, baseURL: base }) => {
  const desktop = (extra = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...extra });
  for (const route of ["/", "/es", "/about", "/es/about"]) {
    const ctx = await desktop({ permissions: ["clipboard-read", "clipboard-write"] });
    const p = await ctx.newPage();
    await p.goto(`${base}${route}`, { waitUntil: "networkidle" });
    const copyState = () => p.evaluate(() => {
      const b = document.querySelector("[data-copy]");
      return {
        state: b.dataset.state,
        visible: [...b.querySelectorAll(".copy-label")].filter((l) => getComputedStyle(l).visibility === "visible").map((l) => l.textContent.trim()),
        width: Math.round(b.getBoundingClientRect().width),
        status: document.querySelector("[data-copy-status]").textContent,
      };
    });
    const s0 = await copyState();
    await p.click("[data-copy]");
    await p.waitForTimeout(150);
    const s1 = await copyState();
    const clip = await p.evaluate(() => navigator.clipboard.readText());
    const es = route.startsWith("/es");
    check(`${route}: copy writes the address`, clip === "sam.hernandezc103@gmail.com", clip);
    const checkIcon = await p.evaluate(() => !!document.querySelector('[data-copy] .copy-label[data-for="copied"] svg.copy-check'));
    check(`${route}: copied state shows a check icon + text, live message, same width`, s1.state === "copied" && s1.visible.length === 1 && s1.visible[0] === (es ? "Copiado" : "Copied") && checkIcon && s1.status === (es ? "Correo copiado" : "Email address copied") && s1.width === s0.width, JSON.stringify({ s0, s1, checkIcon }));
    await p.waitForTimeout(1900);
    const s2 = await copyState();
    check(`${route}: copied state returns to idle (~1.8s)`, s2.state === "idle" && s2.visible[0] === (es ? "Copiar correo" : "Copy address"), JSON.stringify(s2));
    const mail = await p.evaluate(() => [...document.querySelectorAll("#contact a[href^='mailto:']")].map((a) => `${a.textContent.trim()}|${a.getAttribute("href")}|${a.target || "-"}`));
    check(`${route}: mailto action`, mail.length === 1 && mail[0] === `${es ? "Escribir un correo" : "Write an email"}|mailto:sam.hernandezc103@gmail.com|-`, mail.join());
    const ext = await p.evaluate(() => [...document.querySelectorAll("#contact a[target]")].map((a) => ({ href: a.getAttribute("href"), target: a.target, rel: a.rel, note: a.querySelector(".visually-hidden")?.textContent.trim() ?? "", arrow: !!a.querySelector(".external-arrow") })));
    const hrefs = ext.map((e) => e.href).join();
    check(`${route}: profiles + CVs open in new tab, noopener noreferrer, named`, ext.length === 4 && ext.every((e) => e.target === "_blank" && /noopener/.test(e.rel) && /noreferrer/.test(e.rel) && /tab|pestaña/.test(e.note) && e.arrow) && /linkedin/.test(hrefs) && /github/.test(hrefs) && /CV-EN/.test(hrefs) && /CV-ES/.test(hrefs), JSON.stringify(ext));
    await ctx.close();
  }
  {
    // Failed copy: never claims "Copied"; selects the address instead.
    const ctx = await desktop();
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) }, configurable: true });
    });
    const p = await ctx.newPage();
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    await p.click("[data-copy]");
    await p.waitForTimeout(150);
    const f = await p.evaluate(() => ({
      state: document.querySelector("[data-copy]").dataset.state,
      visible: [...document.querySelectorAll("[data-copy] .copy-label")].filter((l) => getComputedStyle(l).visibility === "visible").map((l) => l.textContent.trim()),
      status: document.querySelector("[data-copy-status]").textContent,
      selection: String(getSelection()),
    }));
    check("failed copy: no false 'Copied', address selected, explained", f.state === "failed" && f.visible.join() === "Selected" && /Could not copy/.test(f.status) && f.selection === "sam.hernandezc103@gmail.com", JSON.stringify(f));
    await ctx.close();
    // No clipboard API at all: same fallback
    const c2 = await desktop();
    await c2.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }));
    const p2 = await c2.newPage();
    await p2.goto(`${base}/`, { waitUntil: "networkidle" });
    await p2.click("[data-copy]");
    await p2.waitForTimeout(150);
    check("no Clipboard API: button still useful (selects)", await p2.evaluate(() => document.querySelector("[data-copy]").dataset.state === "failed" && String(getSelection()) === "sam.hernandezc103@gmail.com"));
    await c2.close();
    // No JS: copy button hidden, address and mailto present
    const nj = await desktop({ javaScriptEnabled: false });
    const np = await nj.newPage();
    await np.goto(`${base}/`);
    check("no-JS: copy hidden, address + mailto present", !(await np.isVisible("[data-copy]")) && (await np.isVisible("[data-copy-source]")) && (await np.locator('#contact a[href^="mailto:"]').count()) === 1);
    await nj.close();
  }
  {
    // External links site-wide + BKODE + arrow nudge
    const ctx = await desktop();
    const p = await ctx.newPage();
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    const all = await p.evaluate(() => {
      const ext = /github\.com|linkedin\.com|bkode\.lat|\.pdf$/;
      return [...document.querySelectorAll("a[href]")].filter((a) => ext.test(a.getAttribute("href"))).map((a) => ({ href: a.getAttribute("href"), target: a.target, rel: a.rel, where: a.closest("header,footer,aside,section,dialog")?.className.split(" ")[0] ?? "?", name: (a.getAttribute("aria-label") ?? a.textContent).trim() }));
    });
    const bad = all.filter((a) => a.target !== "_blank" || !/noopener/.test(a.rel) || !/noreferrer/.test(a.rel) || !/(new tab|pestaña)/.test(a.name));
    check("home: every GitHub/LinkedIn/CV/BKODE link opens a new tab with noopener noreferrer and says so", all.length >= 10 && bad.length === 0, `${all.length} links; bad: ${JSON.stringify(bad)}`);
    const bk = await p.evaluate(() => { const a = document.querySelector(".bkode-link"); const logos = [...document.querySelectorAll(".bkode img")].map((i) => ({ alt: i.alt, src: i.getAttribute("src"), w: i.getAttribute("width"), h: i.getAttribute("height"), shown: getComputedStyle(i).display !== "none" })); return { n: document.querySelectorAll(".bkode a").length, href: a.getAttribute("href"), target: a.target, rel: a.rel, text: a.textContent.trim(), logos }; });
    check("BKODE: one destination, new tab, official logo with alt text", bk.n === 1 && bk.href === "https://bkode.lat" && bk.target === "_blank" && /noopener noreferrer/.test(bk.rel) && /^Visit BKODE/.test(bk.text) && bk.logos.length === 2 && bk.logos.every((l) => l.alt === "BKODE" && l.w === "500" && l.h === "358") && bk.logos.filter((l) => l.shown).map((l) => l.src).join() === "/bkode-logo-stacked-navy-1x.png", JSON.stringify(bk));
    await p.locator(".bkode").scrollIntoViewIfNeeded();
    const before = await p.evaluate(() => getComputedStyle(document.querySelector(".bkode-geo-arm")).strokeDashoffset);
    await p.hover(".bkode-link");
    await p.waitForTimeout(600);
    const hov = await p.evaluate(() => ({ arm: getComputedStyle(document.querySelector(".bkode-geo-arm")).strokeDashoffset, arrow: getComputedStyle(document.querySelector(".bkode-link .external-arrow")).transform }));
    check("BKODE hover: the K's arms draw in BKODE blue, ↗ nudges 2px", parseFloat(before) === 1 && parseFloat(hov.arm) === 0 && hov.arrow === "matrix(1, 0, 0, 1, 2, -2)", JSON.stringify({ before, ...hov }));
    await p.mouse.move(5, 5);
    await p.focus(".contact-link");
    await p.keyboard.press("Shift+Tab");
    await p.keyboard.press("Tab");
    await p.waitForTimeout(250);
    const foc = await p.evaluate(() => getComputedStyle(document.activeElement.querySelector(".external-arrow")).transform);
    check("keyboard focus nudges ↗ too", foc === "matrix(1, 0, 0, 1, 2, -2)", foc);
    const dur = await p.evaluate(() => getComputedStyle(document.querySelector(".external-arrow")).transitionDuration);
    check("↗ transition uses --motion-fast (120ms)", dur === "0.12s", dur);
    await ctx.close();
    const rm = await desktop({ reducedMotion: "reduce" });
    const rp = await rm.newPage();
    await rp.goto(`${base}/`, { waitUntil: "networkidle" });
    await rp.locator(".bkode").scrollIntoViewIfNeeded();
    await rp.hover(".bkode-link");
    const r = await rp.evaluate(() => ({ arrow: getComputedStyle(document.querySelector(".bkode-link .external-arrow")).transform, copy: getComputedStyle(document.querySelector('.copy-label[data-for="idle"]')).transitionDuration }));
    check("reduced motion: no ↗ translation, instant copy feedback", r.arrow === "none" && r.copy.split(",").every((d) => parseFloat(d) === 0), JSON.stringify(r));
    await rm.close();
  }
});

test("native view transitions", async ({ browser, baseURL: base }) => {
  const desktop = (extra = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...extra });
  {
    const ctx = await desktop({ colorScheme: "light" });
    await ctx.addInitScript(() => { try { localStorage.setItem("theme", "dark"); } catch {} });
    const p = await ctx.newPage();
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    const head = await p.evaluate(() => {
      const first = document.head.querySelector("script");
      return { inline: !first.src, setsTheme: /dataset\.theme/.test(first.textContent), theme: document.documentElement.dataset.theme };
    });
    check("theme script runs first in <head> (no flash across navigations)", head.inline && head.setsTheme && head.theme === "dark", JSON.stringify(head));
    const t0 = Date.now();
    await Promise.all([p.waitForURL("**/work"), p.click('.site-nav a[href="/work"]')]);
    await p.waitForLoadState("domcontentloaded");
    const navMs = Date.now() - t0;
    check("navigation stays fast with the cross-fade", navMs < 1500, `${navMs}ms`);
    check("dark theme kept after navigation", await p.evaluate(() => document.documentElement.dataset.theme === "dark"));
    await p.goto(`${base}${CASE}#outcomes`, { waitUntil: "networkidle" });
    check("cross-page anchor lands below header", await p.evaluate(() => { const t = document.getElementById("outcomes").getBoundingClientRect().top; return t >= document.querySelector(".site-header").getBoundingClientRect().bottom; }));
    await p.goBack({ waitUntil: "networkidle" });
    const back = p.url();
    await p.goForward({ waitUntil: "networkidle" });
    check("back/forward restore the right pages", back.endsWith("/work") && p.url().endsWith("#outcomes"), `${back} / ${p.url()}`);
    const vt = await p.evaluate(() => [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r.cssText.includes("@view-transition")); } catch { return false; } }));
    check("@view-transition rule present (navigation: auto)", vt);
    await ctx.close();
    const rm = await desktop({ reducedMotion: "reduce" });
    const rp = await rm.newPage();
    await rp.goto(`${base}/`, { waitUntil: "networkidle" });
    const off = await rp.evaluate(() => [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r.cssText.includes("prefers-reduced-motion") && r.cssText.includes("navigation: none")); } catch { return false; } }));
    check("reduced motion turns view transitions off", off);
    await rm.close();
  }
});

test("mobile widths: overflow, targets, header, dialog", async ({ browser, baseURL: base }) => {
  const routes = ["/", "/work", CASE, "/notes", NOTE, "/about", "/es", "/es/work", "/es/about"];
  for (const [w, h] of [[390, 844], [320, 568]]) {
    const issues = [];
    for (const route of routes) {
      const c = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true });
      const p = await c.newPage();
      await p.goto(`${base}${route}`, { waitUntil: "networkidle" });
      const r = await p.evaluate(() => ({
        sw: document.documentElement.scrollWidth, vw: innerWidth,
        header: Math.round(document.querySelector(".site-header").getBoundingClientRect().height),
        small: [...document.querySelectorAll("header a, header button, header summary, .trace-button, main button, #contact a, .bkode a")].filter((e) => e.offsetParent && getComputedStyle(e).visibility !== "hidden").filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent.trim().slice(0, 20)),
      }));
      if (r.sw !== r.vw || r.small.length || r.header !== 89) issues.push(`${route} ${JSON.stringify(r)}`);
      if (route === "/es" || route === CASE) {
        await p.click("[data-palette-open]");
        const pr = await p.evaluate(() => {
          const d = document.querySelector("[data-palette]");
          const b = d.getBoundingClientRect();
          const body = d.querySelector(".palette-body");
          return { open: d.open, right: Math.round(b.right), bottom: Math.round(b.bottom), sw: document.documentElement.scrollWidth, fs: parseFloat(getComputedStyle(d.querySelector("[data-palette-filter]")).fontSize), scrolls: body.scrollHeight > body.clientHeight && getComputedStyle(body).overflowY === "auto", footer: getComputedStyle(d.querySelector(".palette-footer")).display };
        });
        check(`search mobile ${w} ${route}`, pr.open && pr.right <= w && pr.bottom <= h && pr.sw === w && pr.fs >= 16 && pr.scrolls && pr.footer === "none", JSON.stringify(pr));
        await p.keyboard.press("Escape");
        for (const sel of ["[data-lang-menu] summary"]) {
          if (!(await p.isVisible(sel))) continue;
          await p.click(sel);
          const m = await p.evaluate(() => { const b = document.querySelector(".util-menu[open] .util-panel").getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), sw: document.documentElement.scrollWidth }; });
          if (m.l < 0 || m.r > w || m.sw !== w) issues.push(`${route} menu ${sel} ${JSON.stringify(m)}`);
          await p.keyboard.press("Escape");
        }
      }
      await c.close();
    }
    check(`mobile ${w}: no overflow, targets >= 44, header 89, menus fit`, issues.length === 0, issues.join(" || "));
  }
  // Mobile: the same switch, from 360px; below that, theme stays in search.
  for (const [w, visible] of [[390, true], [360, true], [320, false]]) {
    const c = await browser.newContext({ viewport: { width: w, height: 844 }, hasTouch: true, colorScheme: "dark" });
    const p = await c.newPage();
    await p.goto(`${base}/`, { waitUntil: "networkidle" });
    const shown = await p.isVisible("[data-theme-switch]");
    check(`${w}: theme switch ${visible ? "visible" : "hidden (search keeps theme)"}`, shown === visible);
    if (visible) {
      await p.tap("[data-theme-switch]");
      await p.waitForTimeout(300);
      const s = await p.evaluate(() => ({ attr: document.documentElement.dataset.theme, h: Math.round(document.querySelector("[data-theme-switch]").getBoundingClientRect().height), sw: document.documentElement.scrollWidth }));
      check(`${w}: tap sets Light, 44px target, no overflow`, s.attr === "light" && s.h >= 44 && s.sw === w, JSON.stringify(s));
    }
    await c.close();
  }
});
