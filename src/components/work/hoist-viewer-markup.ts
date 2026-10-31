// Markup of the lifting-set viewer, rendered at build time into a static HTML
// fragment (pages/work/industrial-engineering-platform/viewer.html.ts). The
// article does not carry it: the viewer chunk fetches it when the reader opens
// the viewer. The data the script needs travels inside it as JSON. Every text
// comes from the model; nothing here is a dimension, rating, brand or standard.
import { HEIGHT, VIEWS, WIDTH, mirrorOf, projectionFor } from "@/lib/hoist-figure.mjs";
import { CALLOUT_REP, COMPONENTS, DEFAULT_VARIANT, KINDS, MODEL_DATA, SCENARIOS, TOUR, VARIANTS, validate } from "@/lib/hoist-model";

export const VIEWS_PATH = "/work/industrial-engineering-platform/views/";

const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const icon = (paths: string) =>
  `<svg class="hv-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
// Path data copied from Lucide (ISC): x, rotate-cw, plus, minus, scan.
const ICONS = {
  close: icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  rotate: icon('<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>'),
  plus: icon('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  minus: icon('<path d="M5 12h14"/>'),
  reset: icon('<circle cx="12" cy="12" r="9"/><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/>'),
  enter: icon('<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>'),
  exit: icon('<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>'),
};

export const SEVERITY_LABEL = { error: "Error", warning: "Warning", info: "Note" } as const;

/** Everything the viewer script reads: the rules data, the kind texts and, per view, where each part's mirror is. */
export function viewerData() {
  const mirrored = [...new Set([...Object.values(CALLOUT_REP), ...TOUR.map((step) => step.id)])];
  return {
    model: MODEL_DATA,
    kinds: Object.fromEntries(KINDS.map((kind) => [kind.id, { what: kind.what, role: kind.role }])),
    jumps: VIEWS.map((view) => {
      const mirror = mirrorOf(projectionFor(view));
      return Object.fromEntries(mirrored.map((id) => [id, mirror(id)]));
    }),
    views: VIEWS.length,
    base: VIEWS_PATH,
    size: [WIDTH, HEIGHT],
  };
}

export function viewerMarkup() {
  const report = validate({ variant: DEFAULT_VARIANT, removed: [] });
  const tabs = [
    ["part", "Part"],
    ["rules", "Rules"],
    ["parts", "Parts"],
    ["tour", "Tour"],
    ["ref", "Reference"],
  ];
  const jump = (id: string, label: string, extra = "") => `<button type="button" class="hv-jump"${extra} data-jump="${id}" data-base="${id}">${label}</button>`;
  const groups = KINDS.map((kind) => {
    const options = COMPONENTS.filter((component) => component.kind === kind.id)
      .map((component) => `<option value="${component.id}">${esc(component.name)}</option>`)
      .join("");
    return `<optgroup label="${esc(`${kind.en} · ${kind.es}`)}">${options}</optgroup>`;
  }).join("");
  const issues = report.issues
    .map((issue) => `<li data-severity="${issue.severity}"><span class="hv-sev">${SEVERITY_LABEL[issue.severity]}</span> <code>${issue.ruleId}</code> <span>${esc(issue.message)}</span></li>`)
    .join("");

  const panels: Record<string, string> = {
    part: `
      <label class="hv-select"><span>Component</span><select data-hv-select><option value="">None selected</option>${groups}</select></label>
      <div class="hv-row"><button type="button" class="button" data-hv-remove disabled>Remove from the set</button><button type="button" class="button" data-hv-reset>Reset</button></div>
      <div class="hv-detail" data-hv-detail aria-live="polite"><p class="hv-muted">Choose a part in the drawing, in the Parts list or in the component list to see what it is, where it connects and what it does.</p></div>`,
    rules: `
      <ul class="hv-issues" data-hv-issues>${issues}</ul>
      <p class="hv-muted">The rules are illustrative and deterministic: the same set always gives the same result. They check that the load path is complete and that the leg angle stays inside a made-up demo limit. They do not size, rate or certify anything.</p>`,
    parts: `
      <p class="hv-muted">Same numbers as in the drawing.</p>
      <ol class="hv-legend">${KINDS.map((kind, index) => `<li>${jump(CALLOUT_REP[kind.id], `<span class="hv-n">${index + 1}</span><span>${esc(kind.en)} <span lang="es">· ${esc(kind.es)}</span></span>`)}</li>`).join("")}</ol>`,
    tour: `
      <p class="hv-muted">How the parts connect, from the crane down to the container. It is not a load calculation.</p>
      <ol class="hv-tour">${TOUR.map((step) => `<li>${jump(step.id, esc(COMPONENTS.find((component) => component.id === step.id)!.name))}<span>${esc(step.text)}</span></li>`).join("")}</ol>`,
    ref: `
      <table class="hv-ref"><thead><tr><th scope="col">Component</th><th scope="col">What it is</th><th scope="col">Function in the set</th></tr></thead><tbody>${KINDS.map(
        (kind) => `<tr><th scope="row">${jump(CALLOUT_REP[kind.id], `${esc(kind.en)} <span lang="es">· ${esc(kind.es)}</span>`)}</th><td>${esc(kind.what)}</td><td>${esc(kind.role)}</td></tr>`,
      ).join("")}</tbody></table>`,
  };

  return `<dialog class="hv" data-hv aria-labelledby="hv-title" aria-describedby="hv-seals">
  <div class="hv-head">
    <div>
      <h2 id="hv-title">Lifting set configuration</h2>
      <p id="hv-seals" class="hv-seals">Illustrative drawing · Synthetic values · Not certified</p>
    </div>
    <div class="hv-head-tools">
    <button type="button" class="hv-tool" data-hv-fullscreen aria-pressed="false" aria-label="Full screen" hidden><span class="hv-fs-enter">${ICONS.enter}</span><span class="hv-fs-exit">${ICONS.exit}</span></button>
    <button type="button" class="hv-tool" data-hv-close aria-label="Close the configuration">${ICONS.close}</button>
    </div>
  </div>
  <div class="hv-main">
    <section class="hv-stage" aria-label="Drawing">
      <div class="hv-tools" role="toolbar" aria-label="Drawing controls">
        <button type="button" class="hv-tool hv-tool-wide" data-hv-rotate aria-label="Rotate view, view 1 of ${VIEWS.length}">${ICONS.rotate}<span aria-hidden="true">Switch view <span data-hv-view-n>1</span>/${VIEWS.length}</span></button>
        <span class="hv-tools-gap"></span>
        <button type="button" class="hv-tool" data-hv-zoom="out" aria-label="Zoom out" disabled>${ICONS.minus}</button>
        <output class="hv-zoom-level" data-hv-zoom-level aria-label="Zoom">100%</output>
        <button type="button" class="hv-tool" data-hv-zoom="in" aria-label="Zoom in">${ICONS.plus}</button>
        <button type="button" class="hv-tool" data-hv-zoom="reset" aria-label="Reset zoom and position">${ICONS.reset}</button>
      </div>
      <div class="hv-figure hoist-figure" data-hv-figure tabindex="0" role="group" aria-roledescription="drawing" aria-label="Drawing of the lifting set. Arrow keys move it, plus and minus zoom, [ and ] switch the view." aria-busy="true">
        <p class="hv-muted hv-loading">Loading the drawing…</p>
      </div>
      <p class="hv-hint">Drag to move · pinch or Ctrl + scroll to zoom · keys: arrows, + −, [ ]</p>
      <p class="hv-load" data-hv-load role="status"></p>
    </section>
    <section class="hv-panel" data-hv-panel aria-label="Configuration and details">
      <button type="button" class="hv-sheet" data-hv-sheet aria-expanded="false" aria-controls="hv-panel-body"><span data-hv-sheet-label>Show details</span><span class="hv-sheet-part" data-hv-sheet-part></span></button>
      <p class="hv-status" data-hv-status data-valid="${report.valid}" aria-live="polite">${report.valid ? "No rule failed for this set." : "The demo rules found problems."}</p>
      <div class="hv-panel-body" id="hv-panel-body">
      <div class="hv-config">
        <div class="hv-row" role="group" aria-label="Demo scenario">${SCENARIOS.map((scenario) => `<button type="button" class="button" aria-pressed="${scenario.id === "complete"}" data-scenario="${scenario.id}">${esc(scenario.label)}</button>`).join("")}</div>
        <div class="hv-row" role="group" aria-label="Leg angle from the vertical">${Object.values(VARIANTS)
          .map((variant) => `<button type="button" class="button" aria-pressed="${variant.id === DEFAULT_VARIANT}" data-variant-button="${variant.id}">${esc(variant.label)}</button>`)
          .join("")}</div>
      </div>
      <div class="hv-tabs" role="tablist" aria-label="Details">${tabs
        .map(([id, label], index) => `<button type="button" role="tab" id="hv-tab-${id}" aria-controls="hv-${id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${label}</button>`)
        .join("")}</div>
      ${tabs.map(([id], index) => `<div class="hv-tabpanel" role="tabpanel" id="hv-${id}" aria-labelledby="hv-tab-${id}" tabindex="0"${index === 0 ? "" : " hidden"}>${panels[id]}</div>`).join("\n      ")}
      </div>
    </section>
  </div>
  <script type="application/json" data-hv-data>${JSON.stringify(viewerData()).replace(/</g, "\\u003c")}</script>
</dialog>`;
}
