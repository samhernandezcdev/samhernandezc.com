// Lifting-set viewer: a modal <dialog> with four switchable views, zoom and pan,
// and a tabbed panel. Loaded with import() only when the reader opens it; it
// fetches its markup (viewer.html) and then each view's SVG on demand, one per
// view and leg angle, never ahead of time. The rules run on the same data-free
// module as the build (hoist-rules.ts) with the model shipped as JSON.
//
// Accessibility: native modal dialog (inert page, Esc closes, focus returns to
// the opener), Tab wraps inside it, ARIA tabs with arrow keys, one keyboard
// route to every part (the select and the lists; drawing callouts are pointer
// only), live status. Zoom and pan have buttons and keys besides drag and
// pinch; the wheel zooms only with Ctrl. Changes are instant, so reduced
// motion needs nothing more.
import { validateWith, type ModelData, type VariantId } from "@/lib/hoist-rules";

interface ViewerData {
  model: ModelData;
  kinds: Record<string, { what: string; role: string }>;
  jumps: Record<string, string>[];
  views: number;
  base: string;
  size: [number, number];
}

const ZOOM_MAX = 4;
const MIN_TEXT_PX = 11.5;
/** Below this width the drawing shows callout numbers without names. */
const COMPACT_PX = 544;
/** Below this many screen pixels per drawing unit the callouts are hidden; the Parts list names every part. */
const TINY_SCALE = 0.45;
/** Callouts are 36 drawing units apart with a 15-unit radius: rings grow at most to 34 across. */
const RING_MAX = 34 / 30;
const LABEL = { error: "Error", warning: "Warning", info: "Note" };

let viewer: Promise<(opener: HTMLElement) => void> | undefined;

/** Opens the viewer, fetching its markup the first time. Rejects if it cannot load. */
export async function openViewer(src: string, opener: HTMLElement) {
  viewer ??= create(src).catch((error) => {
    viewer = undefined;
    throw error;
  });
  (await viewer)(opener);
}

async function create(src: string) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`viewer ${response.status}`);
  const template = document.createElement("template");
  template.innerHTML = await response.text();
  const dialog = template.content.querySelector<HTMLDialogElement>("dialog[data-hv]")!;
  document.body.append(dialog);

  const $ = <T extends Element>(selector: string) => dialog.querySelector<T>(selector)!;
  const all = <T extends Element>(selector: string) => [...dialog.querySelectorAll<T>(selector)];
  const data: ViewerData = JSON.parse($("[data-hv-data]").textContent!);
  const byId = new Map(data.model.components.map((component) => [component.id, component]));
  const [W, H] = data.size;
  const figure = $<HTMLElement>("[data-hv-figure]");
  const detail = $<HTMLElement>("[data-hv-detail]");
  const status = $<HTMLElement>("[data-hv-status]");
  const issues = $<HTMLElement>("[data-hv-issues]");
  const select = $<HTMLSelectElement>("[data-hv-select]");
  const remove = $<HTMLButtonElement>("[data-hv-remove]");
  const rotate = $<HTMLButtonElement>("[data-hv-rotate]");
  const load = $<HTMLElement>("[data-hv-load]");
  const level = $<HTMLElement>("[data-hv-zoom-level]");
  const zoomIn = $<HTMLButtonElement>('[data-hv-zoom="in"]');
  const zoomOut = $<HTMLButtonElement>('[data-hv-zoom="out"]');
  const sheet = $<HTMLButtonElement>("[data-hv-sheet]");
  const sheetPart = $<HTMLElement>("[data-hv-sheet-part]");
  const hint = detail.innerHTML;
  const svgs = new Map<string, SVGSVGElement>();
  const removed = new Set<string>();
  let view = 0;
  let variant: VariantId = "a";
  let selected = "";
  let svg: SVGSVGElement | undefined;
  let zoom = 1;
  let centre = [W / 2, H / 2];
  let request = 0;
  let opener: HTMLElement | undefined;

  // --- Drawing: views, zoom, text size --------------------------------------

  /** Screen pixels per drawing unit at the current zoom. */
  const scale = () => {
    const box = figure.getBoundingClientRect();
    return Math.min(box.width / (W / zoom), box.height / (H / zoom)) || 1;
  };

  function frame() {
    const w = W / zoom;
    const h = H / zoom;
    centre = [Math.min(W - w / 2, Math.max(w / 2, centre[0])), Math.min(H - h / 2, Math.max(h / 2, centre[1]))];
    svg?.setAttribute("viewBox", `${centre[0] - w / 2} ${centre[1] - h / 2} ${w} ${h}`);
    zoomIn.disabled = zoom >= ZOOM_MAX;
    zoomOut.disabled = zoom <= 1;
    level.textContent = `${Math.round(zoom * 100)}%`;
    // Callout and ghost text never render under MIN_TEXT_PX, however small the drawing is.
    // A narrow drawing has no room beside it for the names at that size: it keeps
    // the numbers (the Parts tab names them) and grows their rings to fit.
    const s = scale();
    const number = Math.max(16, MIN_TEXT_PX / s);
    figure.toggleAttribute("data-compact", figure.clientWidth < COMPACT_PX);
    // Too small for readable numbers that do not collide (a phone with the panel open): no callouts.
    figure.toggleAttribute("data-tiny", s < TINY_SCALE);
    figure.style.setProperty("--hoist-number", `${number}px`);
    figure.style.setProperty("--hoist-ring", String(Math.min(number / 16, RING_MAX)));
    figure.style.setProperty("--hoist-label", `${Math.max(17, MIN_TEXT_PX / s)}px`);
    figure.style.setProperty("--hoist-ghost", `${Math.max(15, MIN_TEXT_PX / s)}px`);
  }

  /** Zoom to `next`, keeping the drawing point `at` where it is on screen. */
  function zoomTo(next: number, at = centre) {
    const clamped = Math.min(ZOOM_MAX, Math.max(1, next));
    centre = [at[0] + (centre[0] - at[0]) * (zoom / clamped), at[1] + (centre[1] - at[1]) * (zoom / clamped)];
    zoom = clamped;
    frame();
  }

  const pan = (dx: number, dy: number) => {
    centre = [centre[0] + dx, centre[1] + dy];
    frame();
  };

  /** Drawing coordinates of a point on screen. */
  function toDrawing(x: number, y: number) {
    const box = figure.getBoundingClientRect();
    const s = scale();
    return [centre[0] + (x - box.left - box.width / 2) / s, centre[1] + (y - box.top - box.height / 2) / s];
  }

  async function show(nextView: number, nextVariant: VariantId) {
    const ticket = ++request;
    const key = `${nextView}-${nextVariant}`;
    figure.setAttribute("aria-busy", "true");
    try {
      let next = svgs.get(key);
      if (!next) {
        const response = await fetch(`${data.base}${key}.svg`);
        if (!response.ok) throw new Error(String(response.status));
        const doc = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
        if (doc.documentElement.nodeName !== "svg") throw new Error("parse");
        next = document.importNode(doc.documentElement, true) as unknown as SVGSVGElement;
        svgs.set(key, next);
      }
      if (ticket !== request) return;
      view = nextView;
      variant = nextVariant;
      figure.replaceChildren(next);
      svg = next;
      load.textContent = `View ${view + 1} of ${data.views}.`;
      frame();
      paint();
    } catch {
      if (ticket === request) load.textContent = "This view could not be loaded. The drawing stays as it was.";
    } finally {
      if (ticket === request) figure.removeAttribute("aria-busy");
    }
  }

  // --- State to screen ---------------------------------------------------------

  function paint() {
    const target = byId.get(selected);
    const related = new Set(target?.connectsTo);
    figure.toggleAttribute("data-selection", Boolean(target));
    for (const part of svg?.querySelectorAll<SVGElement>("[data-component]") ?? []) {
      const id = part.dataset.component!;
      part.toggleAttribute("data-removed", removed.has(id));
      part.toggleAttribute("data-sel", id === selected);
      part.toggleAttribute("data-rel", related.has(id));
    }
    // Lists point at the same part as the callouts of this view.
    for (const button of all<HTMLElement>("[data-base]")) button.dataset.jump = data.jumps[view][button.dataset.base!] ?? button.dataset.base;
    rotate.ariaLabel = `Rotate view, view ${view + 1} of ${data.views}`;
    sheetPart.textContent = target ? target.name : "";
    $("[data-hv-view-n]").textContent = String(view + 1);

    const report = validateWith(data.model, { variant, removed: [...removed] });
    status.textContent = report.valid ? "No rule failed for this set." : "The demo rules found problems.";
    status.dataset.valid = String(report.valid);
    issues.innerHTML = report.issues.map((i) => `<li data-severity="${i.severity}"><span class="hv-sev">${LABEL[i.severity]}</span> <code>${i.ruleId}</code> <span>${i.message}</span></li>`).join("");

    select.value = selected;
    remove.disabled = !target?.removable;
    remove.textContent = removed.has(selected) ? "Put back in the set" : "Remove from the set";
    for (const button of all<HTMLElement>("[data-scenario]")) {
      const s = data.model.scenarios.find((item) => item.id === button.dataset.scenario)!;
      button.ariaPressed = String(s.variant === variant && s.removed.length === removed.size && s.removed.every((id) => removed.has(id)));
    }
    for (const button of all<HTMLElement>("[data-variant-button]")) button.ariaPressed = String(button.dataset.variantButton === variant);

    if (!target) {
      detail.innerHTML = hint;
      return;
    }
    const kind = data.kinds[target.kind];
    detail.innerHTML =
      `<h3>${target.name} <span lang="es">· ${target.es}</span></h3><p>${kind.role}</p>` +
      `<p><strong>Connects to</strong></p><ul class="hv-links">${target.connectsTo.map((id) => `<li><button type="button" class="hv-jump" data-jump="${id}">${byId.get(id)!.name}</button></li>`).join("")}</ul>` +
      `<p class="hv-muted">${removed.has(selected) ? "Removed from the demo set." : "In the demo set."} ${kind.what}</p>`;
  }

  const pick = (id: string) => {
    selected = id;
    paint();
  };

  // --- Tabs ----------------------------------------------------------------

  const tabs = all<HTMLButtonElement>('[role="tab"]');
  function selectTab(tab: HTMLButtonElement, focus = false) {
    for (const other of tabs) {
      const on = other === tab;
      other.ariaSelected = String(on);
      other.tabIndex = on ? 0 : -1;
      $<HTMLElement>(`#${other.getAttribute("aria-controls")}`).hidden = !on;
    }
    if (focus) tab.focus();
  }
  $("[role=tablist]").addEventListener("keydown", (event) => {
    const key = (event as KeyboardEvent).key;
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[key];
    if (next === undefined || index < 0) return;
    event.preventDefault();
    selectTab(tabs[(next + tabs.length) % tabs.length], true);
  });
  for (const tab of tabs) tab.addEventListener("click", () => selectTab(tab));

  // --- Input ---------------------------------------------------------------

  // Pointer: one finger or the mouse drags, two fingers pinch. A drag never selects.
  const pointers = new Map<number, [number, number]>();
  let travel = 0;
  let pinch: { distance: number; zoom: number } | undefined;
  const spread = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
  };
  figure.addEventListener("pointerdown", (event) => {
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    travel = 0;
    if (pointers.size === 2) pinch = { distance: spread(), zoom };
  });
  figure.addEventListener("pointermove", (event) => {
    const last = pointers.get(event.pointerId);
    if (!last) return;
    const dx = event.clientX - last[0];
    const dy = event.clientY - last[1];
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    travel += Math.abs(dx) + Math.abs(dy);
    if (travel > 4 && !figure.hasPointerCapture(event.pointerId)) figure.setPointerCapture(event.pointerId);
    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      zoomTo((pinch.zoom * spread()) / pinch.distance, toDrawing((a[0] + b[0]) / 2, (a[1] + b[1]) / 2));
    } else if (pointers.size === 1 && zoom > 1) {
      const s = scale();
      pan(-dx / s, -dy / s);
    }
  });
  const release = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = undefined;
  };
  figure.addEventListener("pointerup", release);
  figure.addEventListener("pointercancel", release);
  figure.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      zoomTo(zoom * Math.exp(-event.deltaY * 0.002), toDrawing(event.clientX, event.clientY));
    },
    { passive: false },
  );
  figure.addEventListener("keydown", (event) => {
    const step = (W / zoom) * 0.1;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => pan(-step, 0),
      ArrowRight: () => pan(step, 0),
      ArrowUp: () => pan(0, -step),
      ArrowDown: () => pan(0, step),
      "+": () => zoomTo(zoom * 1.25),
      "=": () => zoomTo(zoom * 1.25),
      "-": () => zoomTo(zoom / 1.25),
      "[": () => void show((view + data.views - 1) % data.views, variant),
      "]": () => void show((view + 1) % data.views, variant),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    move();
  });
  new ResizeObserver(() => frame()).observe(figure);

  // One route in: the drawing, the callouts and every list land on pick().
  dialog.addEventListener("click", (event) => {
    const target = event.target as Element;
    const jump = target.closest<HTMLElement>("[data-jump]");
    const inDrawing = figure.contains(target);
    if (inDrawing && travel > 4) return; // the end of a drag
    const id = jump?.dataset.jump ?? (inDrawing ? (target.closest<SVGElement>("[data-component]")?.dataset.component ?? "") : "");
    if (!jump && !id) return;
    pick(!jump && id === selected ? "" : id);
    if (inDrawing) selectTab(tabs[0]);
  });
  select.addEventListener("change", () => pick(select.value));
  remove.addEventListener("click", () => {
    if (!removed.delete(selected)) removed.add(selected);
    paint();
  });
  $("[data-hv-reset]").addEventListener("click", () => {
    removed.clear();
    selected = "";
    void show(view, "a");
  });
  for (const button of all<HTMLElement>("[data-scenario]")) {
    button.addEventListener("click", () => {
      const s = data.model.scenarios.find((item) => item.id === button.dataset.scenario)!;
      removed.clear();
      s.removed.forEach((id) => removed.add(id));
      selected = s.removed[0] ?? "";
      void show(view, s.variant);
    });
  }
  for (const button of all<HTMLElement>("[data-variant-button]")) button.addEventListener("click", () => void show(view, button.dataset.variantButton as VariantId));
  rotate.addEventListener("click", () => void show((view + 1) % data.views, variant));
  zoomIn.addEventListener("click", () => zoomTo(zoom * 1.5));
  zoomOut.addEventListener("click", () => zoomTo(zoom / 1.5));
  $('[data-hv-zoom="reset"]').addEventListener("click", () => {
    centre = [W / 2, H / 2];
    zoomTo(1);
  });

  // Phones: the panel is a bottom sheet, collapsed to the rule status until asked for.
  sheet.addEventListener("click", () => {
    const open = sheet.ariaExpanded !== "true";
    sheet.ariaExpanded = String(open);
    $("[data-hv-panel]").toggleAttribute("data-open", open);
    $("[data-hv-sheet-label]").textContent = open ? "Hide details" : "Show details";
  });

  // --- Dialog --------------------------------------------------------------

  $("[data-hv-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    opener?.focus();
  });

  // Optional browser full screen. The dialog is already viewport-sized: this only hides the browser chrome.
  // Esc leaves full screen first (the browser consumes it); a second Esc closes the dialog.
  const fullscreen = $<HTMLButtonElement>("[data-hv-fullscreen]");
  if (document.fullscreenEnabled) {
    fullscreen.hidden = false;
    fullscreen.addEventListener("click", () => void (document.fullscreenElement ? document.exitFullscreen() : dialog.requestFullscreen()).catch(() => {}));
    dialog.addEventListener("fullscreenchange", () => {
      const on = document.fullscreenElement === dialog;
      fullscreen.ariaPressed = String(on);
      fullscreen.ariaLabel = on ? "Exit full screen" : "Full screen";
    });
  }
  // Tab and Shift+Tab wrap inside the dialog instead of leaving for the browser's own UI.
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = all<HTMLElement>("button:not([disabled], [tabindex='-1']), select, [tabindex='0']").filter((node) => node.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  paint();
  return (from: HTMLElement) => {
    opener = from;
    dialog.showModal();
    if (!svg) void show(0, "a");
    else frame();
  };
}
