// Lifting-set demo in the industrial case study: a static card in the article
// and a modal viewer loaded on demand. The card, the viewer, the drawing and the
// rule output must all read the same model (src/lib/hoist-model.ts).
import AxeBuilder from "@axe-core/playwright";
import { test } from "@playwright/test";
import { COMPONENTS, KINDS, SCENARIOS, componentOf, validate } from "../../src/lib/hoist-model.ts";
import { CASE, check } from "./helpers.mjs";

const VIEWER = "dialog[data-hv]";
const FIGURE = `${VIEWER} [data-hv-figure]`;

/** Opens the page and the viewer; resolves once the first view is drawn. */
async function openViewer(p, base) {
  await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
  await p.click("[data-hoist-open]");
  await p.waitForSelector(`${FIGURE} svg [data-component]`);
}

const STATE = () => ({
  view: document.querySelector("[data-hv-view-n]").textContent,
  select: document.querySelector("[data-hv-select]").value,
  sel: [...new Set([...document.querySelectorAll("[data-hv-figure] [data-sel]")].map((g) => g.dataset.component))],
  rel: [...new Set([...document.querySelectorAll("[data-hv-figure] [data-rel]")].map((g) => g.dataset.component))].sort(),
  heading: document.querySelector("[data-hv-detail] h3")?.textContent ?? "",
  links: [...document.querySelectorAll("[data-hv-detail] [data-jump]")].map((b) => b.dataset.jump).sort(),
  rules: [...document.querySelectorAll("[data-hv-issues] code")].map((c) => c.textContent),
  valid: document.querySelector("[data-hv-status]").dataset.valid,
  viewBox: document.querySelector("[data-hv-figure] svg")?.getAttribute("viewBox") ?? "",
});

test("hoist card: no-JS shows the figure, the values and the notices, and carries no viewer", async ({ browser, baseURL: base }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  const response = await p.goto(`${base}${CASE}`);
  const html = await response.text();
  check("no-JS: the article carries no drawing markup (the figure is an image)", !/data-component=/.test(html));
  check("no-JS: the article carries no viewer markup or model JSON", !/data-hv|data-hoist-data/.test(html));
  check("no-JS: initial HTML is under the old 450 KB", html.length < 450_000, String(html.length));
  const alt = await p.getAttribute("[data-hoist] .hoist-img-light", "alt");
  check("no-JS: figure has an accessible description", /offshore container/i.test(alt ?? ""), alt);
  check("no-JS: figure image is visible", await p.isVisible("[data-hoist] .hoist-img-light"));
  check("no-JS: explore button hidden", !(await p.isVisible("[data-hoist-open]")));
  const values = await p.locator("[data-hoist] .hoist-values").innerText();
  const report = validate({ variant: "a", removed: [] });
  const errors = report.issues.filter((i) => i.severity === "error").length;
  check("no-JS: values strip comes from the model", values.includes(`${COMPONENTS.length} components`) && values.includes(`${KINDS.length} kinds`) && values.includes(`${errors} errors`) && /45°/.test(values), values);
  const seals = await p.locator("[data-hoist] .hoist-seals").textContent();
  check("no-JS: states what the figure is and is not", /Illustrative drawing/.test(seals) && /Not certified/.test(seals) && /Synthetic values/.test(seals));
  check("no-JS: caption says load sharing is not calculated", /load sharing is not calculated/i.test(await p.locator("[data-hoist] figcaption").innerText()));
  await ctx.close();
});

test("hoist viewer: loads only on demand, one view at a time, nothing ahead", async ({ browser, baseURL: base }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const requests = [];
  p.on("request", (request) => requests.push(new URL(request.url()).pathname));
  await p.goto(`${base}${CASE}`, { waitUntil: "networkidle" });
  check("nothing of the viewer loads with the page", !requests.some((path) => /viewer\.html|\/views\/|hoist-viewer/.test(path)), requests.join(" "));
  await p.click("[data-hoist-open]");
  await p.waitForSelector(`${FIGURE} svg [data-component]`);
  await p.waitForTimeout(300);
  const views = () => requests.filter((path) => path.includes("/views/"));
  check("opening fetches view 1 only", JSON.stringify(views()) === JSON.stringify(["/work/industrial-engineering-platform/views/0-a.svg"]), views().join(" "));
  await p.click("[data-hv-rotate]");
  await p.waitForFunction(() => document.querySelector("[data-hv-view-n]").textContent === "2");
  await p.waitForTimeout(300);
  check("rotating fetches that view and no other (no preload)", views().length === 2 && views()[1].endsWith("/1-a.svg"), views().join(" "));
  await ctx.close();
});

test("hoist viewer: opens and closes by click, Enter and Esc; focus returns and stays inside", async ({ browser, baseURL: base }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await openViewer(p, base);
  check("click opens a modal dialog", await p.evaluate((s) => document.querySelector(s).open && document.querySelector(s).matches(":modal"), VIEWER));
  check("focus moves into the dialog", await p.evaluate((s) => document.querySelector(s).contains(document.activeElement), VIEWER));
  await p.keyboard.press("Escape");
  check("Esc closes", !(await p.evaluate((s) => document.querySelector(s).open, VIEWER)));
  check("focus returns to the button", await p.evaluate(() => document.activeElement?.matches("[data-hoist-open]")));
  await p.keyboard.press("Enter");
  await p.waitForFunction((s) => document.querySelector(s)?.open, VIEWER);
  check("Enter on the button opens it again", true);

  // Tab and Shift+Tab wrap inside the dialog.
  const inside = () => p.evaluate((s) => document.querySelector(s).contains(document.activeElement), VIEWER);
  let left = false;
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press("Tab");
    if (!(await inside())) left = true;
  }
  check("Tab never leaves the dialog", !left);
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press("Shift+Tab");
    if (!(await inside())) left = true;
  }
  check("Shift+Tab never leaves the dialog", !left);
  await p.click("[data-hv-close]");
  check("close button closes", !(await p.evaluate((s) => document.querySelector(s).open, VIEWER)));
  check("focus returns to the button after the close button", await p.evaluate(() => document.activeElement?.matches("[data-hoist-open]")));
  await ctx.close();
});

test("hoist viewer: rotation cycles four views, keeps the selection and comes back to the same drawing", async ({ browser, baseURL: base }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await openViewer(p, base);
  await p.selectOption("[data-hv-select]", "ferrule-up-3");
  const first = await p.evaluate(STATE);
  const markup = await p.evaluate(() => document.querySelector("[data-hv-figure] svg").outerHTML);
  const labels = [];
  for (const n of [2, 3, 4, 1]) {
    await p.click("[data-hv-rotate]");
    await p.waitForFunction((v) => document.querySelector("[data-hv-view-n]").textContent === String(v), n);
    const state = await p.evaluate(STATE);
    labels.push(await p.getAttribute("[data-hv-rotate]", "aria-label"));
    check(`view ${n}: the selection is kept`, JSON.stringify(state.sel) === '["ferrule-up-3"]' && state.select === "ferrule-up-3" && state.heading === first.heading, JSON.stringify(state));
  }
  check("rotate button names the view", JSON.stringify(labels) === JSON.stringify(["Rotate view, view 2 of 4", "Rotate view, view 3 of 4", "Rotate view, view 4 of 4", "Rotate view, view 1 of 4"]), JSON.stringify(labels));
  check("back on view 1 the drawing is the same SVG", (await p.evaluate(() => document.querySelector("[data-hv-figure] svg").outerHTML)) === markup);
  check("the rotate control never says 3D", !/3D/i.test(await p.locator("[data-hv-rotate]").innerText()));
  await ctx.close();
});

test("hoist viewer: zoom stays between 1x and 4x, resets, and works from keys, buttons and Ctrl+wheel", async ({ browser, baseURL: base }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await openViewer(p, base);
  const width = async () => Number((await p.evaluate(STATE)).viewBox.split(" ")[2]);
  check("starts at 1x with zoom out disabled", (await width()) === 680 && (await p.isDisabled('[data-hv-zoom="out"]')));
  for (let i = 0; i < 8; i++) if (!(await p.isDisabled('[data-hv-zoom="in"]'))) await p.click('[data-hv-zoom="in"]');
  check("zoom in stops at 4x", Math.abs((await width()) - 170) < 0.01 && (await p.isDisabled('[data-hv-zoom="in"]')), String(await width()));
  check("zoom level is shown", (await p.locator("[data-hv-zoom-level]").textContent()) === "400%");
  await p.click('[data-hv-zoom="reset"]');
  check("reset goes back to the whole drawing", (await p.evaluate(STATE)).viewBox === "0 0 680 720");

  await p.focus(FIGURE);
  await p.keyboard.type("+");
  check("+ zooms in", (await width()) < 680);
  const before = (await p.evaluate(STATE)).viewBox;
  await p.keyboard.press("ArrowRight");
  check("arrows move the drawing", (await p.evaluate(STATE)).viewBox !== before);
  await p.keyboard.type("-");
  await p.keyboard.type("-");
  check("- zooms out, never under 1x", (await width()) === 680);
  await p.keyboard.press("]");
  await p.waitForFunction(() => document.querySelector("[data-hv-view-n]").textContent === "2");
  await p.keyboard.press("[");
  await p.waitForFunction(() => document.querySelector("[data-hv-view-n]").textContent === "1");
  check("] and [ switch views", true);

  const box = await p.locator(FIGURE).boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.wheel(0, -300);
  check("the wheel alone does not zoom", (await width()) === 680);
  await p.keyboard.down("Control");
  await p.mouse.wheel(0, -300);
  await p.keyboard.up("Control");
  check("Ctrl + wheel zooms", (await width()) < 680, String(await width()));

  // Drag pans and does not select.
  const zoomed = (await p.evaluate(STATE)).viewBox;
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.down();
  await p.mouse.move(box.x + box.width / 2 - 80, box.y + box.height / 2 - 40, { steps: 6 });
  await p.mouse.up();
  const dragged = await p.evaluate(STATE);
  check("drag moves the drawing", dragged.viewBox !== zoomed);
  check("a drag does not select", dragged.select === "", dragged.select);
  await ctx.close();
});

test("hoist viewer: drawing, panel and rule output follow the model", async ({ browser, baseURL: base }) => {
  for (const reduced of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (error) => errors.push(String(error)));
    p.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    await openViewer(p, base);
    const tag = `reduced=${reduced}`;

    await p.selectOption("[data-hv-select]", "ferrule-up-3");
    const marked = await p.evaluate(STATE);
    const expected = [...componentOf("ferrule-up-3").connectsTo].sort();
    check(`selection marks only the chosen part (${tag})`, JSON.stringify(marked.sel) === '["ferrule-up-3"]', JSON.stringify(marked.sel));
    check(`neighbours match the model (${tag})`, JSON.stringify(marked.rel) === JSON.stringify(expected) && JSON.stringify(marked.links) === JSON.stringify(expected), JSON.stringify(marked));
    check(`panel names the part in both languages (${tag})`, /Upper ferrule 3/.test(marked.heading) && /Casquillo superior 3/.test(marked.heading), marked.heading);
    await p.click('[data-hv-detail] [data-jump="rope-3"]');
    check(`neighbour buttons move the selection (${tag})`, (await p.inputValue("[data-hv-select]")) === "rope-3");

    // Clicking the drawing selects the part under the pointer, and the callouts select their part.
    await p.evaluate(() => document.querySelector('[data-hv-figure] [data-component="padeye-1"]:not([data-ghost]) .iso-fill').dispatchEvent(new MouseEvent("click", { bubbles: true })));
    check(`click in the drawing selects (${tag})`, (await p.inputValue("[data-hv-select]")) === "padeye-1");
    await p.evaluate(() => document.querySelector('[data-hv-figure] .callout[data-n="8"] circle').dispatchEvent(new MouseEvent("click", { bubbles: true })));
    check(`a callout selects its part (${tag})`, componentOf(await p.inputValue("[data-hv-select]"))?.kind === "shackle");

    // Removing a part changes the drawing and the rule output together.
    await p.selectOption("[data-hv-select]", "shackle-pin-2");
    await p.click("[data-hv-remove]");
    const afterRemove = await p.evaluate(() => ({
      hidden: [...document.querySelectorAll('[data-hv-figure] [data-component="shackle-pin-2"]:not([data-ghost])')].every((g) => getComputedStyle(g).display === "none"),
      mark: getComputedStyle(document.querySelector('[data-hv-figure] [data-component="shackle-pin-2"][data-ghost]')).display !== "none",
      others: [...document.querySelectorAll('[data-hv-figure] [data-component="shackle-pin-1"]:not([data-ghost])')].every((g) => getComputedStyle(g).display !== "none"),
      label: document.querySelector("[data-hv-remove]").textContent,
    }));
    const state = await p.evaluate(STATE);
    const want = validate({ variant: "a", removed: ["shackle-pin-2"] });
    check(`removed part leaves the drawing with a mark, others stay (${tag})`, afterRemove.hidden && afterRemove.mark && afterRemove.others, JSON.stringify(afterRemove));
    check(`rule output equals the model (${tag})`, JSON.stringify(state.rules) === JSON.stringify(want.issues.map((i) => i.ruleId)) && state.valid === String(want.valid), JSON.stringify(state));
    check(`remove button turns into put back (${tag})`, /Put back/.test(afterRemove.label));
    await p.click("[data-hv-remove]");
    check(`put back restores the complete set (${tag})`, (await p.getAttribute("[data-hv-status]", "data-valid")) === "true");

    // Every scenario reproduces the model result and presses its own button.
    for (const scenario of SCENARIOS) {
      await p.click(`[data-scenario="${scenario.id}"]`);
      await p.waitForFunction((v) => document.querySelector(`[data-variant-button="${v}"]`).getAttribute("aria-pressed") === "true", scenario.variant);
      const s = await p.evaluate(STATE);
      const pressed = await p.evaluate(() => [...document.querySelectorAll("[data-scenario]")].filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.scenario));
      const variant = await p.evaluate(() => document.querySelector("[data-hv-figure] [data-variant]").dataset.variant);
      const model = validate({ variant: scenario.variant, removed: scenario.removed });
      check(`scenario ${scenario.id}: rules match the model (${tag})`, JSON.stringify(s.rules) === JSON.stringify(model.issues.map((i) => i.ruleId)) && s.valid === String(model.valid), JSON.stringify(s));
      check(`scenario ${scenario.id}: its button is the one pressed (${tag})`, pressed.length === 1 && pressed[0] === scenario.id, JSON.stringify(pressed));
      check(`scenario ${scenario.id}: drawing shows its leg variant (${tag})`, variant === scenario.variant, variant);
    }

    // Reset returns to the starting state.
    await p.selectOption("[data-hv-select]", "hook");
    await p.click("[data-hv-remove]");
    await p.click("[data-hv-reset]");
    await p.waitForFunction(() => document.querySelector("[data-hv-figure] [data-variant]").dataset.variant === "a");
    const reset = await p.evaluate(() => ({ removed: document.querySelectorAll("[data-hv-figure] [data-removed]").length, selected: document.querySelector("[data-hv-select]").value, valid: document.querySelector("[data-hv-status]").dataset.valid }));
    check(`reset clears removals and selection (${tag})`, reset.removed === 0 && reset.selected === "" && reset.valid === "true", JSON.stringify(reset));

    // Tabs: ARIA pattern with arrow keys; the lists point at this view's instance.
    await p.focus("#hv-tab-part");
    await p.keyboard.press("ArrowRight");
    check(`arrow keys move between tabs (${tag})`, (await p.getAttribute("#hv-tab-rules", "aria-selected")) === "true" && (await p.isVisible("#hv-rules")) && !(await p.isVisible("#hv-part")));
    await p.click("#hv-tab-parts");
    check(`Parts lists every kind with its number (${tag})`, (await p.locator("#hv-parts [data-jump]").count()) === KINDS.length);
    const callout8 = await p.getAttribute('[data-hv-figure] .callout[data-n="8"]', "data-jump");
    const legend8 = await p.locator("#hv-parts li").nth(7).locator("[data-jump]").getAttribute("data-jump");
    check(`numbered list and callout point at the same part (${tag})`, callout8 === legend8, `${callout8} / ${legend8}`);
    await p.click("[data-hv-rotate]");
    await p.waitForFunction(() => document.querySelector("[data-hv-view-n]").textContent === "2");
    const c8 = await p.getAttribute('[data-hv-figure] .callout[data-n="8"]', "data-jump");
    const l8 = await p.locator("#hv-parts li").nth(7).locator("[data-jump]").getAttribute("data-jump");
    check(`after rotating they still agree (${tag})`, c8 === l8, `${c8} / ${l8}`);

    check(`panel and status are live regions (${tag})`, (await p.getAttribute("[data-hv-detail]", "aria-live")) === "polite" && (await p.getAttribute("[data-hv-status]", "aria-live")) === "polite");
    if (reduced) {
      const duration = await p.evaluate(() => getComputedStyle(document.querySelector("[data-hv-figure] [data-component]")).transitionDuration);
      check("reduced motion: no transition on the drawing", duration.split(",").every((d) => parseFloat(d) === 0), duration);
    }
    check(`no console or page errors (${tag})`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }
});

for (const scheme of ["light", "dark"]) {
  test(`hoist viewer: axe finds no violations with the viewer open (${scheme})`, async ({ browser, baseURL: base }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme });
    const p = await ctx.newPage();
    await openViewer(p, base);
    await p.selectOption("[data-hv-select]", "shackle-pin-2");
    for (const tab of ["part", "rules", "parts", "tour", "ref"]) {
      await p.click(`#hv-tab-${tab}`);
      const { violations } = await new AxeBuilder({ page: p }).include(VIEWER).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      check(`axe ${scheme}, tab ${tab}`, violations.length === 0, violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`).join(" | "));
    }
    await ctx.close();
  });
}
