// Tests of the lifting-set demo: the single model, the illustrative rules, the
// 3D layout, the isometric projection and the drawing built from the model.
// Run with `npm run test:content` (node --test, native type stripping).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ANGLE_LIMIT_DEG,
  CALLOUT_REP,
  COMPONENTS,
  CORNER,
  DIM,
  KINDS,
  LEGS,
  MODEL_DATA,
  SCENARIOS,
  SUB_OF_LEG,
  TOUR,
  VARIANTS,
  componentOf,
  idsOfKind,
  layoutOf,
  loadChain,
  validate,
} from "../src/lib/hoist-model.ts";
import { validateWith } from "../src/lib/hoist-rules.ts";
// The drawing is plain ESM so it runs in Astro frontmatter and here.
import { HEIGHT, VIEWS, WIDTH, azimuthOf, buildFigure, calloutRepsOf, mirrorOf, projectionFor, projectPoint } from "../src/lib/hoist-figure.mjs";
import { cameraOf } from "../src/lib/anatomy/iso-kit.mjs";
import { viewOf } from "../src/lib/anatomy/lathe.mjs";

type Vec = [number, number, number];

/** Every file the viewer can fetch: four views, two leg variants, with callouts and marks. */
const FIGURES = VIEWS.flatMap((view) => (["a", "b"] as const).map((variant) => ({ view, variant, svg: buildFigure(variant, { view }).svg })));

const near = (a: number, b: number, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance, `${a} is not within ${tolerance} of ${b}`);

test("components: unique ids, both languages, valid kinds, no dangling links", () => {
  const ids = COMPONENTS.map((component) => component.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 42);
  const kinds = new Set(KINDS.map((kind) => kind.id));
  for (const component of COMPONENTS) {
    assert.ok(kinds.has(component.kind), component.id);
    assert.ok(component.name.length > 0 && component.es.length > 0, component.id);
    assert.ok(!component.connectsTo.includes(component.id), `${component.id} links to itself`);
    for (const other of component.connectsTo) assert.ok(componentOf(other)?.connectsTo.includes(component.id), `${component.id} -> ${other} is not symmetric`);
  }
  for (const kind of KINDS) {
    assert.ok(kind.en && kind.es && kind.what && kind.role, kind.id);
    assert.ok(idsOfKind(kind.id).length > 0, `${kind.id} has no instance`);
  }
});

test("configuration: four legs, no spreader beam", () => {
  assert.equal(LEGS.length, 4);
  assert.equal(idsOfKind("padeye").length, 4);
  assert.equal(idsOfKind("shackle").length, 4);
  assert.equal(idsOfKind("rope").length, 4);
  assert.equal(idsOfKind("sub-link").length, 2);
  assert.equal(idsOfKind("master-link").length, 1);
  assert.equal(idsOfKind("hook").length, 1);
  for (const component of COMPONENTS) assert.doesNotMatch(`${component.id} ${component.kind} ${component.name}`, /spreader|beam/i);
});

test("load path: each leg is a chain of directly connected parts from the hook to the container", () => {
  for (const leg of LEGS) {
    const chain = loadChain(leg);
    assert.equal(chain[0], "hook");
    for (let at = 0; at < chain.length - 1; at++) assert.ok(componentOf(chain[at])?.connectsTo.includes(chain[at + 1]), `${chain[at]} -> ${chain[at + 1]}`);
    assert.ok(componentOf(chain[chain.length - 1])?.connectsTo.includes("container-frame"));
  }
});

test("rules: the complete set has no error and always carries the load-sharing note", () => {
  const report = validate({ variant: "a", removed: [] });
  assert.equal(report.valid, true);
  assert.deepEqual(report.issues.map((issue) => issue.ruleId), ["LOAD-00"]);
  assert.match(report.issues[0].message, /not calculated or validated/);
  // No tension is produced anywhere: the report has no such field.
  assert.deepEqual(Object.keys(report).sort(), ["angleDeg", "issues", "valid"]);
});

test("rules: removing any load-path part is an error that names the rule and the part", () => {
  for (const component of COMPONENTS) {
    if (!component.removable || component.kind === "hook-latch") continue;
    const report = validate({ variant: "a", removed: [component.id] });
    assert.equal(report.valid, false, component.id);
    const own = report.issues.find((issue) => issue.ids.length === 1 && issue.ids[0] === component.id);
    assert.ok(own && own.severity === "error", component.id);
    assert.ok(report.issues.some((issue) => issue.ruleId === "PATH-01" && issue.ids.includes(component.id)), `${component.id} breaks the load path`);
  }
});

test("rules: a missing hook latch is a warning, not an error", () => {
  const report = validate({ variant: "a", removed: ["hook-latch"] });
  assert.equal(report.valid, true);
  assert.equal(report.issues.find((item) => item.ruleId === "CMP-LATCH")?.severity, "warning");
  assert.ok(!report.issues.some((item) => item.ruleId === "PATH-01"));
});

test("rules: the leg angle comes from the layout and is checked against the demo limit", () => {
  assert.equal(validate({ variant: "a", removed: [] }).angleDeg, 45);
  assert.ok(VARIANTS.a.angleDeg <= ANGLE_LIMIT_DEG);
  const wide = validate({ variant: "b", removed: [] });
  assert.equal(wide.angleDeg, 65);
  assert.equal(wide.valid, false);
  assert.ok(wide.issues.some((issue) => issue.ruleId === "GEO-01" && issue.severity === "error"));
});

test("rules: deterministic, independent of input order, and identical through the page data", () => {
  const removed = ["ferrule-up-3", "shackle-pin-2", "hook"];
  const first = validate({ variant: "a", removed });
  assert.deepEqual(validate({ variant: "a", removed: [...removed].reverse() }), first);
  assert.deepEqual(validateWith(JSON.parse(JSON.stringify(MODEL_DATA)), { variant: "a", removed }), first);
});

test("scenarios: every scenario has the outcome its label claims", () => {
  const by = Object.fromEntries(SCENARIOS.map((scenario) => [scenario.id, validate({ variant: scenario.variant, removed: scenario.removed })]));
  assert.equal(by.complete.valid, true);
  assert.equal(by["no-pin"].valid, false);
  assert.equal(by["no-ferrule"].valid, false);
  assert.equal(by["no-latch"].valid, true);
  assert.equal(by.wide.valid, false);
  for (const scenario of SCENARIOS) for (const id of scenario.removed) assert.ok(componentOf(id), id);
});

test("layout: four padeyes on the top corners, symmetric legs, parts stacked in load order", () => {
  for (const id of ["a", "b"] as const) {
    const layout = layoutOf(id);
    for (const leg of LEGS) {
      const [sx, sy] = CORNER[leg];
      const p = layout.padeye[leg];
      assert.equal(Math.sign(p[0]), sx);
      assert.equal(Math.sign(p[1]), sy);
      near(Math.abs(p[0]), DIM.length / 2 - DIM.padeyeInsetX);
      near(Math.abs(p[1]), DIM.width / 2 - DIM.padeyeInsetY);
      assert.ok(p[2] > DIM.height, "padeye sits above the container top");
      near(p[2], layout.padeye[1][2]);
      near(layout.legAngleDeg[leg], VARIANTS[id].angleDeg, 1e-9);
      // The leg ends on the intermediate link that takes it.
      assert.equal(Math.sign(layout.subBottom[SUB_OF_LEG[leg]][0]), sx);
    }
    near(layout.subBottom[1][0], -layout.subBottom[2][0]);
    assert.ok(layout.padeye[1][2] < layout.subBottom[1][2]);
    assert.ok(layout.subBottom[1][2] < layout.subTop[1][2]);
    near(layout.subTop[1][2], layout.masterBottom[2]);
    assert.ok(layout.masterBottom[2] < layout.masterTop[2]);
    assert.ok(layout.masterTop[2] < layout.hookTop[2]);
  }
  // A wider angle puts the links lower, not higher.
  assert.ok(layoutOf("b").subBottom[1][2] < layoutOf("a").subBottom[1][2]);
});

test("projection: isometric axes give the expected screen vectors", () => {
  const P = projectionFor();
  const { sinA, cosA, sinE, cosE, k } = cameraOf(P);
  near(P.azimuth, 45);
  const origin = projectPoint([0, 0, 0], P);
  const step = (v: Vec) => {
    const p = projectPoint(v, P);
    return [p[0] - origin[0], p[1] - origin[1]];
  };
  const [xx, xy] = step([1, 0, 0]);
  const [yx, yy] = step([0, 1, 0]);
  const [zx, zy] = step([0, 0, 1]);
  near(xx, sinA * k);
  near(xy, cosA * sinE * k);
  near(yx, -cosA * k);
  near(yy, sinA * sinE * k);
  near(zx, 0);
  near(zy, -cosE * k);
  // The model's own points go through the same linear map.
  const layout = layoutOf("a");
  const a = projectPoint(layout.hookTop, P);
  const b = projectPoint(layout.padeye[1], P);
  const mid = projectPoint(layout.hookTop.map((v, i) => (v + layout.padeye[1][i]) / 2) as Vec, P);
  near(mid[0], (a[0] + b[0]) / 2);
  near(mid[1], (a[1] + b[1]) / 2);
});

test("projection: 3D to 2D is not reversible; a known plane is needed", () => {
  const P = projectionFor();
  const V = viewOf(P) as Vec;
  const p: Vec = [40, -25, 90];
  // Moving along the line of sight changes the 3D point but not its image.
  const q = p.map((v, i) => v + 55 * V[i]) as Vec;
  assert.notDeepEqual(p, q);
  const a = projectPoint(p, P);
  const b = projectPoint(q, P);
  near(a[0], b[0]);
  near(a[1], b[1]);
  // With the height known, the floor position follows from the screen point.
  const { sinA, cosA, sinE, cosE, k } = cameraOf(P);
  const recover = (screen: number[], z: number) => {
    const u = (screen[0] - P.origin[0]) / k; // x sinA - y cosA
    const w = ((screen[1] - P.origin[1]) / k + z * cosE) / sinE; // x cosA + y sinA
    return [u * sinA + w * cosA, -u * cosA + w * sinA];
  };
  const [x, y] = recover(a, p[2]);
  near(x, p[0]);
  near(y, p[1]);
});

test("views: four cameras 90° apart, one scale, each view the mirror of view 0", () => {
  const scale = projectionFor(0).scale;
  for (const view of VIEWS) {
    const P = projectionFor(view);
    near(P.azimuth, azimuthOf(view));
    near(P.azimuth, 45 + 90 * view);
    near(P.scale, scale, 1e-9);
    // The mirror maps every part to another part of the same kind; view 0 maps to itself.
    const mirror = mirrorOf(P);
    for (const component of COMPONENTS) {
      const twin = componentOf(mirror(component.id));
      assert.ok(twin, `${view}: ${component.id} has no mirror`);
      assert.equal(twin.kind, component.kind);
      if (view === 0) assert.equal(twin.id, component.id);
    }
    // The mirrored instance faces the viewer the way view 0's does: same depth.
    const V = viewOf(P) as Vec;
    const V0 = viewOf(projectionFor(0)) as Vec;
    for (const leg of LEGS) {
      const twin = Number(mirror(`padeye-${leg}`).split("-")[1]);
      const depth = (P_: Vec, l: number) => layoutOf("a").padeye[l].reduce((sum, v, i) => sum + v * P_[i], 0);
      near(depth(V, twin), depth(V0, leg), 1e-6);
    }
  }
});

test("projection: every key point of both variants lands inside the drawing, in every view", () => {
  for (const view of VIEWS) {
    const P = projectionFor(view);
    for (const id of ["a", "b"] as const) {
      const layout = layoutOf(id);
      const points = [layout.hookTop, layout.masterTop, layout.subBottom[1], layout.subBottom[2], ...LEGS.map((leg) => layout.padeye[leg])];
      for (const point of points) {
        const [x, y] = projectPoint(point, P);
        assert.ok(x > 0 && x < WIDTH && y > 0 && y < HEIGHT, `view ${view} ${id} ${point}`);
      }
    }
  }
});

test("drawing: every view and variant draws every component of the model, and nothing else", () => {
  const ids = new Set(COMPONENTS.map((component) => component.id));
  for (const { view, variant, svg } of FIGURES) {
    const drawn = new Set([...svg.matchAll(/data-component="([^"]+)"/g)].map((match) => match[1]));
    for (const id of ids) assert.ok(drawn.has(id), `${view}-${variant} does not draw ${id}`);
    for (const id of drawn) assert.ok(ids.has(id), `${view}-${variant} draws unknown component ${id}`);
  }
});

test("drawing: the article figure is clean (no callouts, no marks) and still draws every part", () => {
  const svg = buildFigure("a", { callouts: false, ghosts: false }).svg;
  assert.doesNotMatch(svg, /class="callout|data-ghost/);
  for (const component of COMPONENTS) assert.match(svg, new RegExp(`data-component="${component.id}"`));
});

test("drawing: deterministic and free of non-finite numbers in every view", () => {
  for (const { view, variant, svg } of FIGURES) {
    assert.equal(buildFigure(variant, { view }).svg, svg, `${view}-${variant} changed between two builds`);
    assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
  }
  // Views differ from each other: the camera really moves.
  assert.equal(new Set(FIGURES.map((figure) => figure.svg)).size, FIGURES.length);
});

// --- Legibility: callouts, marks for removed parts, and the copy ---

const circlesOf = (markup: string) =>
  [...markup.matchAll(/<g class="callout" data-jump="([^"]+)" data-n="(\d+)"[^>]*>[\s\S]*?<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"\/><text/g)].map((m) => ({
    id: m[1],
    n: Number(m[2]),
    cx: Number(m[3]),
    cy: Number(m[4]),
    r: Number(m[5]),
  }));

test("callouts: one per kind in every view, numbered like the legend, on that view's instance, inside the canvas and clear of each other", () => {
  for (const { view, variant, svg } of FIGURES) {
    const tag = `${view}-${variant}`;
    const reps = calloutRepsOf(projectionFor(view));
    const callouts = circlesOf(svg);
    assert.equal(callouts.length, KINDS.length, tag);
    assert.deepEqual(callouts.map((c) => c.n).sort((a, b) => a - b), KINDS.map((_, index) => index + 1));
    for (const callout of callouts) {
      const kind = KINDS[callout.n - 1];
      assert.equal(callout.id, reps[kind.id], tag);
      if (view === 0) assert.equal(callout.id, CALLOUT_REP[kind.id]);
      assert.equal(componentOf(callout.id)?.kind, kind.id);
      assert.ok(callout.cx - callout.r >= 0 && callout.cx + callout.r <= WIDTH && callout.cy - callout.r >= 0 && callout.cy + callout.r <= HEIGHT, `${tag}: callout ${callout.n} leaves the canvas`);
    }
    for (let i = 0; i < callouts.length; i++)
      for (let j = i + 1; j < callouts.length; j++) {
        const gap = Math.hypot(callouts[i].cx - callouts[j].cx, callouts[i].cy - callouts[j].cy);
        assert.ok(gap >= callouts[i].r + callouts[j].r + 2, `${tag}: callouts ${callouts[i].n} and ${callouts[j].n} touch`);
      }
    // Aria-hidden, pointer-only: nothing focusable in the drawing.
    assert.doesNotMatch(svg, /tabindex|<a |<button/);
    assert.equal((svg.match(/class="callout"[^>]*aria-hidden="true"/g) ?? []).length, KINDS.length);
  }
});

test("marks: every removable component has one hidden mark with text in every view; the frame has none", () => {
  for (const { svg } of FIGURES) {
    const marks = [...svg.matchAll(/<g data-component="([^"]+)" data-ghost="">([\s\S]*?)<\/g>/g)];
    const ids = marks.map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const component of COMPONENTS) assert.equal(ids.includes(component.id), component.removable, component.id);
    for (const mark of marks) assert.match(mark[2], />Missing<\/text>/);
  }
});
test("copy: the demo never states dimensions, ratings, brands, standards or certification", () => {
  const issues = SCENARIOS.flatMap((s) => validate({ variant: s.variant, removed: s.removed }).issues.map((issue) => issue.message));
  const copy = [...KINDS.flatMap((kind) => [kind.en, kind.es, kind.short, kind.what, kind.role]), ...TOUR.map((step) => step.text), ...SCENARIOS.map((s) => s.label), ...issues].join("\n");
  assert.doesNotMatch(copy, /\b\d+(\.\d+)?\s?(mm|cm|m|kg|t|kn|tonnes?|tons?|lbs?|in)\b/i, "a dimension or capacity");
  assert.doesNotMatch(copy, /\b(WLL|SWL|MBL|DNV|ISO|ASME|OSHA|IMO|API)\b|\bEN ?\d/, "a rating or standard");
  assert.doesNotMatch(copy, /thiele|gunnebo|pewag|crosby|van beest|green pin/i, "a brand");
  assert.doesNotMatch(copy, /\b(certified|compliant|compliance|conforms?|approved)\b(?! (set|demo))/i, "a certification claim");
  assert.doesNotMatch(copy, /\b(safe(ly)? to lift|real lift(ing)? operations?)\b/i);
  for (const step of TOUR) assert.ok(componentOf(step.id), step.id);
});

test("every view file is well-formed XML: the viewer parses it as image/svg+xml", () => {
  // Bare attributes (`<g data-x>`) are fine in HTML but break an XML parse, which silently truncates the fetched view.
  for (const { view, variant, svg } of FIGURES) {
    const tag = `${view}-${variant}`;
    assert.doesNotMatch(svg.replace(/"[^"]*"/g, '""'), /<\w+[^<>]*\s[\w:-]+(?=[\s/>])/, `${tag}: bare attribute`);
    assert.doesNotMatch(svg.replace(/<[^>]*>/g, ""), /[<>]|&(?!amp;|lt;|gt;|quot;|#)/, `${tag}: unescaped text`);
    assert.equal((svg.match(/<g[\s>]/g) ?? []).length, (svg.match(/<\/g>/g) ?? []).length, `${tag}: unbalanced groups`);
    assert.equal((svg.match(/<text[\s>]/g) ?? []).length, (svg.match(/<\/text>/g) ?? []).length, tag);
  }
});

test("callouts: the hook and the latch have separate leaders that do not cross, in every view", () => {
  for (const { svg: markup } of FIGURES) {
    const leader = (id: string) => {
      const m = markup.match(new RegExp(String.raw`data-jump="${id}" data-n="\d+"[^>]*>\s*<path[^>]* d="M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)"`));
      assert.ok(m, id);
      return m.slice(1).map(Number) as [number, number, number, number];
    };
    const hook = leader("hook");
    const latch = leader("hook-latch");
    // The leaders end on different points of the drawing, at least 10 units apart.
    assert.ok(Math.hypot(hook[2] - latch[2], hook[3] - latch[3]) >= 10, "hook and latch share an anchor");
    // And they do not cross: orientation test on the two segments.
    const side = (a: number[], b: number[], c: number[]) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    const [h0, h1, l0, l1] = [[hook[0], hook[1]], [hook[2], hook[3]], [latch[0], latch[1]], [latch[2], latch[3]]];
    const crossing = side(h0, h1, l0) !== side(h0, h1, l1) && side(l0, l1, h0) !== side(l0, l1, h1);
    assert.equal(crossing, false, "the hook and latch leaders cross");
    // Both ends keep clear of each other: the leaders never run on top of one another.
    assert.ok(Math.hypot(hook[0] - latch[0], hook[1] - latch[1]) >= 20, "the callout circles are too close");
    assert.ok(Math.hypot(hook[2] - latch[2], hook[3] - latch[3]) >= 20, "the anchors are too close");
  }
});
