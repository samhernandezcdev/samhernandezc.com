// Build-time SVG of the offshore-container lifting set, drawn with the Anatomy
// kit (src/lib/anatomy, MIT). It runs only in Astro frontmatter and in tests;
// nothing here is bundled for the browser. Every position comes from
// `hoist-model.ts`, so the drawing, the component list and the rules share one
// source. The shapes follow the topology of real components but are
// illustrative: no dimension, rating or brand is represented.
import * as k from "./anatomy/iso-kit.mjs";
import * as G from "./anatomy/lathe.mjs";
import { tubePieces, tubeSvg } from "./anatomy/tube.mjs";
import { CALLOUT_REP, CORNER, DIM, KINDS, LEGS, SUB_OF_LEG, componentOf, layoutOf } from "./hoist-model.ts";

// Wide enough for a margin on each side that holds the callout numbers and names at a size
// that stays readable once the drawing is scaled to the page column.
export const WIDTH = 680;
export const HEIGHT = 720;

const { add3, sub3, mul3, unit3, cross3, dot3, lerp3, len3 } = G;
const Z = [0, 0, 1];
const horizontal = (v) => unit3([v[0], v[1], 0]);

/**
 * Four views around the vertical axis, each 45° off the container's axes so no
 * rope eye is ever seen edge-on. View 0 is the one in the article.
 */
export const VIEWS = [0, 1, 2, 3];
export const azimuthOf = (view) => 45 + 90 * view;

/** One camera per view, shared by every variant so switching variants never moves the container. */
export function projectionFor(view = 0) {
  const tallest = layoutOf("a").hookTop[2] > layoutOf("b").hookTop[2] ? layoutOf("a") : layoutOf("b");
  const half = [DIM.length / 2 + 14, DIM.width / 2 + 14];
  const points = [
    [-half[0], -half[1], -4],
    [half[0], half[1], -4],
    [half[0], -half[1], -4],
    [-half[0], half[1], -4],
    [0, 0, tallest.hookTop[2] + 40],
  ];
  return k.fitProjection(points, WIDTH, HEIGHT, { pad: 26, azimuth: azimuthOf(view), elevation: 28 });
}

/**
 * Which quadrant faces the viewer: [sign x, sign y] of the view direction. The
 * set is symmetric about both axes, so every view is view 0 mirrored by these
 * signs, and a part chosen for view 0 maps to its mirror image in the others.
 */
const facingOf = (P) => G.viewOf(P).slice(0, 2).map(Math.sign);

/** Maps a component id chosen for view 0 to the same part mirrored into this view. */
export function mirrorOf(P) {
  const [mx, my] = facingOf(P);
  const legOf = (leg) => LEGS.find((other) => CORNER[other][0] === CORNER[leg][0] * mx && CORNER[other][1] === CORNER[leg][1] * my);
  return (id) => {
    const match = id.match(/^(.*-)(\d)$/);
    if (!match) return id;
    const n = Number(match[2]);
    return `${match[1]}${match[1] === "sub-link-" ? (mx < 0 ? 3 - n : n) : legOf(n)}`;
  };
}

/** The instance each numbered callout points at in this view (view 0 uses the model's choice). */
export function calloutRepsOf(P) {
  const mirror = mirrorOf(P);
  return Object.fromEntries(Object.entries(CALLOUT_REP).map(([kind, id]) => [kind, mirror(id)]));
}

// Shape probe for the owner-map check (scripts/hoist-owner-map.mjs): off unless
// a probe is running, so it never changes the drawing.
let probe = null;
const note = (shape) => {
  if (probe) probe.pending.push(shape);
};
const disc = (s0, s1, r, F, P, options) => (note({ type: "cyl", F, s0, s1, r }), G.disc(s0, s1, r, F, P, options));
const ringBand = (s0, s1, rIn, rOut, F, P, options) => (note({ type: "cyl", F, s0, s1, r: rOut }), G.ringBand(s0, s1, rIn, rOut, F, P, options));
const prismOf = (F, polygon, s0, s1, P) => (note({ type: "prism", F, polygon, s0, s1 }), G.prismOf(F, polygon, s0, s1, P));
const slabOf = (plan, z, h, P, steps, bevel) => (note({ type: "box", plan, z, h }), k.slabOf(plan, z, h, P, steps, bevel));
const tubes = (points, radius, P, options = {}) => (note({ type: "tube", points, radius, closed: Boolean(options.closed) }), tubePieces(points, radius, P, options));

/** World to screen with the figure camera. Exposed for tests. */
export const projectPoint = (point, P) => k.iso(point, P);


/** Counter-clockwise stadium (rounded slot) of half width `a` and half height `b`, as [x, y] points. */
function stadium(a, b, steps = 7) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = -Math.PI / 2 + (i / steps) * Math.PI;
    points.push([a - b + Math.cos(t) * b, Math.sin(t) * b]);
  }
  for (let i = 0; i <= steps; i++) {
    const t = Math.PI / 2 + (i / steps) * Math.PI;
    points.push([-(a - b) + Math.cos(t) * b, Math.sin(t) * b]);
  }
  return points;
}

/**
 * The visible run of a ring drawn on a prism's side at height `s`. It ends where
 * the side turns away from the viewer, i.e. exactly on the prism's silhouette
 * edge, so it never stops in the middle of a face.
 */
function prismSeam(F, ring, s, P) {
  const V = G.viewOf(P);
  const at = ([x, y]) => add3(F.o, add3(mul3(F.a, s), add3(mul3(F.u, x), mul3(F.v, y))));
  const n = ring.length;
  const seen = ring.map(([x0, y0], j) => {
    const [x1, y1] = ring[(j + 1) % n];
    return dot3(unit3(add3(mul3(F.u, y1 - y0), mul3(F.v, -(x1 - x0)))), V) > 1e-6;
  });
  const first = seen.findIndex((visible, j) => visible && !seen[(j - 1 + n) % n]);
  if (first < 0) return "";
  const run = [at(ring[first])];
  for (let step = 0; step < n && seen[(first + step) % n]; step++) run.push(at(ring[(first + step + 1) % n]));
  return k.pathOf(run.map((point) => k.iso(point, P)));
}

const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);

/** Collects drawable pieces with a depth key and the component they belong to. */
function scene(P) {
  const V = G.viewOf(P);
  const items = [];
  const sums = new Map();
  const fixed = {};
  const put = (id, svg, at, bias = 0) => {
    items.push({ id, svg, key: dot3(at, V) + bias });
    if (probe) {
      probe.shapes.push(...probe.pending.map((shape) => ({ ...shape, id })));
      probe.pending = [];
    }
    const sum = sums.get(id) ?? { p: [0, 0, 0], n: 0 };
    sum.p = add3(sum.p, at);
    sum.n += 1;
    sums.set(id, sum);
  };
  put.anchor = (id, point) => {
    fixed[id] = point;
  };
  /** Where the part sits in 3D: an explicit anchor, else the mean of its pieces. */
  const anchorOf = (id) => fixed[id] ?? (sums.has(id) ? mul3(sums.get(id).p, 1 / sums.get(id).n) : null);
  const flush = (ghosts = true) => {
    const parts = items
      .sort((a, b) => a.key - b.key)
      .map((item) => `<g data-component="${item.id}">${item.svg}</g>`);
    // Marks for removed parts: hidden until the part is removed, then the only thing left of it.
    if (ghosts) for (const id of sums.keys()) if (componentOf(id)?.removable) parts.push(`<g data-component="${id}" data-ghost="">${ghost(anchorOf(id), P)}</g>`);
    return parts.join("");
  };
  return { put, flush, anchorOf };
}

/** Cross and word shown where a removed part used to be: never colour alone. */
function ghost(point, P) {
  const [x, y] = k.iso(point, P);
  const d = `M${x - 4.5} ${y - 4.5}L${x + 4.5} ${y + 4.5}M${x + 4.5} ${y - 4.5}L${x - 4.5} ${y + 4.5}`;
  return `${L(d, { tone: "lit", free: true })}<text class="ghost-text" x="${x + 8}" y="${y + 3.5}">Missing</text>`;
}

// ---------------------------------------------------------------------------
// Container (static): frame, panels, corner posts

function container(P) {
  const out = scene(P);
  const { length: Lc, width: Wc, height: H } = DIM;
  const centre = [0, 0, H / 2];
  const edge = (plan, z, h, steps = 3, bevel = 0.6) => slabOf(plan, z, h, P, steps, bevel);
  // Only the long side and the end that face this view carry their detail.
  const [mx, my] = facingOf(P);
  const sideY = my * (Wc / 2);
  const endX = mx * (Lc / 2 - 1.5);
  const rect = (a, b, c, d) => k.segment(a, b, P) + k.segment(b, c, P) + k.segment(c, d, P) + k.segment(d, a, P);

  // Bottom frame, body, top frame
  const full = { x: -Lc / 2, y: -Wc / 2, w: Lc, d: Wc, r: 1.5 };
  const body = { x: -Lc / 2 + 1.5, y: -Wc / 2 + 1.5, w: Lc - 3, d: Wc - 3, r: 1 };
  const parts = [];
  parts.push(`<path class="iso-halo" d="${k.haloOf(full, 0, 8, P)}"/>`);
  parts.push(S(edge(full, 0, 9), { tone: "mid" }));
  // Forklift pockets in the bottom frame, on both long sides
  const pocket = (x) => L(rect([x - 13, sideY, 2], [x + 13, sideY, 2], [x + 13, sideY, 7], [x - 13, sideY, 7]), { tone: "lo" });
  parts.push(pocket(-38), pocket(38));
  parts.push(S(edge(body, 9, H - 18, 3, 0.4), { tone: "mid" }));

  // Corrugation on the visible long side and end
  const longRibs = [];
  for (let x = -Lc / 2 + 16; x <= Lc / 2 - 16; x += 7) longRibs.push(k.rise([x, my * (Wc / 2 - 1.5), 0], 9, H - 9, P));
  parts.push(L(longRibs.join(""), { tone: "faint" }));
  const endRibs = [];
  for (let y = -Wc / 2 + 12; y <= Wc / 2 - 12; y += 7) endRibs.push(k.rise([endX, y, 0], 9, H - 9, P));
  if (mx > 0) {
    // Door end (+x): two leaves, four locking bars with cam handles. The far end is a plain wall.
    const door = (y0, y1) => rect([endX, y0, 14], [endX, y1, 14], [endX, y1, H - 14], [endX, y0, H - 14]);
    parts.push(L(door(-Wc / 2 + 8, -1) + door(1, Wc / 2 - 8), { tone: "lo" }));
    for (const y of [-Wc / 2 + 17, -Wc / 2 + 38, Wc / 2 - 38, Wc / 2 - 17]) {
      parts.push(S(disc(0, H - 36, 1.5, G.frameAlong([endX + 1.6, y, 18], Z), P, { steps: 12 }), { tone: "lo", crease: "none" }));
      parts.push(S(disc(0, 2.2, 3.4, G.frameAlong([endX + 1.6, y, 36], [1, 0, 0]), P, { steps: 14 }), { tone: "mid", crease: "none" }));
    }
  }
  parts.push(L(endRibs.join(""), { tone: "faint" }));

  // Data plate on the +y long side (no real text)
  if (my > 0) {
    const plate = { x: 40, y: Wc / 2 - 1.5, z: 70 };
    const at = (dx, dz) => [plate.x + dx, plate.y, plate.z + dz];
    parts.push(L(rect(at(0, 0), at(30, 0), at(30, 18), at(0, 18)), { tone: "mid" }));
    for (const dz of [5, 9, 13]) parts.push(L(k.segment(at(4, dz), at(26 - (dz === 13 ? 8 : 0), dz), P), { tone: "faint", free: true }));
    parts.push(D([at(3, 3), at(27, 15)].map((point) => k.iso(point, P)), { size: 0.45 }));
  }

  // Top frame with roof ribs
  parts.push(S(edge(full, H - 9, 9), { tone: "mid" }));
  const roof = { x: -Lc / 2 + 6, y: -Wc / 2 + 6, w: Lc - 12, d: Wc - 12, r: 1 };
  parts.push(L(k.planOutline(roof, H, P, 3), { tone: "faint" }));
  const roofRibs = [];
  for (let y = -Wc / 2 + 14; y <= Wc / 2 - 14; y += 8) roofRibs.push(k.lineOnTop([roof.x, y], [roof.x + roof.w, y], H, P));
  parts.push(L(roofRibs.join(""), { tone: "faint" }));
  out.put("container-frame", parts.join(""), centre);
  out.put.anchor("container-frame", [-mx * (Lc / 4), sideY, H * 0.4]);

  // Corner posts with top castings. A post stands proud of the walls on its two
  // outer faces only; the rest of it is inside the body. Each proud face is a
  // thin slab drawn after the body when its side faces the viewer and before
  // the body when it does not, so a back post never shows through a wall and a
  // front post never paints its inner side over one. The casting sits on the
  // top frame, above everything of the body.
  const proud = 2;
  for (const leg of LEGS) {
    const [sx, sy] = CORNER[leg];
    const cx = sx * (Lc / 2 - 6);
    const cy = sy * (Wc / 2 - 6);
    const outX = sx * (Lc / 2 + 0.5);
    const outY = sy * (Wc / 2 + 0.5);
    const endFace = { x: Math.min(outX, outX - sx * proud), y: cy - 6.5, w: proud, d: 13, r: 0.5 };
    const sideFace = { x: cx - 6.5, y: Math.min(outY, outY - sy * proud), w: 13, d: proud, r: 0.5 };
    const id = `corner-post-${leg}`;
    for (const [plan, facing] of [[endFace, sx * mx > 0], [sideFace, sy * my > 0]]) {
      out.put(id, S(edge(plan, 0, H, 3, 0.4), { tone: "mid" }), [cx, cy, H / 2], facing ? 1000 : -1000);
    }
    const casting = { x: cx - 7.5, y: cy - 7.5, w: 15, d: 15, r: 1.5 };
    const top = [S(edge(casting, H, 3, 3, 0.6), { tone: "hi" }), D([k.iso([cx - 4.5, cy - 4.5, H + 3], P), k.iso([cx + 4.5, cy + 4.5, H + 3], P)], { size: 0.45 })].join("");
    out.put(id, top, [cx, cy, H + 1.5], 1001);
    out.put.anchor(id, [outX, cy, H - 20]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Tubes: forged links and rope

/** Closed oblong loop in a plane: `a` is the unit width axis, `b` the unit height axis. */
function oblong(centre, a, b, width, height, topRound = width / 2, bottomRound = width / 2, steps = 14) {
  const points = [];
  const at = (u, v) => add3(centre, add3(mul3(a, u), mul3(b, v)));
  // bottom arc (v from -height/2), straight sides, top arc
  for (let i = 0; i <= steps; i++) {
    const t = Math.PI + (i / steps) * Math.PI; // bottom half circle
    points.push(at(Math.cos(t) * bottomRound, -height / 2 + bottomRound + Math.sin(t) * bottomRound));
  }
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI; // top half circle
    points.push(at(Math.cos(t) * topRound, height / 2 - topRound + Math.sin(t) * topRound));
  }
  return points;
}

function linkPieces(put, id, points, radius, P, options = {}) {
  // The resampler walks the points as given: repeat the first one so the closing side is drawn as tube too.
  const loop = len3(sub3(points[0], points[points.length - 1])) > 1e-6 ? [...points, points[0]] : points;
  const pieces = tubes(loop, radius, P, { closed: true, maxLength: 15, spacing: 2.2, ...options });
  for (const piece of pieces) put(id, tubeSvg(piece, { tone: "hi" }), piece.mid, options.bias ?? 0);
}

/** Open polyline tube. */
function ropePieces(put, id, points, radius, P, options = {}) {
  const pieces = tubes(points, radius, P, { maxLength: 16, spacing: 2.2, ...options });
  for (const piece of pieces) put(id, tubeSvg(piece, { tone: options.tone ?? "hi" }), piece.mid, options.bias ?? 0);
}

const ROPE_R = 3.1;
const BRAID = { pitch: 4.2, twist: 1.7, cross: false, fade: [0.1, 0.5], steps: 6, tone: "mid" };

/**
 * A ferrule-secured eye: thimble inside a rope loop, pressed oval sleeve, and
 * the short dead end of the rope. `at` is the point the eye bears on (the bar it
 * hangs from), `d` the unit direction of the rope leaving the eye, `t` the
 * tangent of that bar. The loop plane contains `d` and is as near to
 * perpendicular to `t` as the leg direction allows.
 */
function eye(put, ids, at, d, t, P) {
  const n = unit3(sub3(t, mul3(d, dot3(t, d)))); // normal of the loop plane
  const w = unit3(cross3(n, d)); // in-plane axis across the eye
  const place = (u, v) => add3(at, add3(mul3(d, u), mul3(w, v)));
  const barR = 3.4;
  const round = barR + 1.2 + 2.2; // thimble radius at the bearing end
  const tip = 21; // thimble length from the bearing end to its tip
  const tipHalf = 3.2;

  // Thimble: grooved steel ring seen as a flat teardrop band
  const ring = [];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI / 2 + (i / 14) * Math.PI;
    ring.push(place(Math.cos(a) * round, Math.sin(a) * round));
  }
  ring.push(place(tip, -tipHalf), place(tip + 3, 0), place(tip, tipHalf), ring[0]);
  for (const piece of tubes(ring, 1.9, P, { maxLength: 22, spacing: 2.4, closed: true })) put(ids.thimble, tubeSvg(piece, { tone: "hi" }), piece.mid, 0.4);

  // Rope loop hugging the thimble, converging on two parallel strands at the ferrule
  const r = round + ROPE_R + 0.2;
  const strand = ROPE_R + 0.4;
  const sleeveAt = tip + 7;
  const loop = [place(sleeveAt + 2, strand), place(sleeveAt - 3, strand), place(tip * 0.4, r)];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI / 2 + (i / 14) * Math.PI;
    loop.push(place(Math.cos(a) * r, Math.sin(a) * r));
  }
  loop.push(place(tip * 0.4, -r), place(sleeveAt - 3, -strand), place(sleeveAt + 2, -strand));
  ropePieces(put, ids.rope, loop, ROPE_R, P, { rings: { ...BRAID, pitch: 7, steps: 6 }, maxLength: 30, bias: 0.8 });

  // Pressed ferrule: oval sleeve with crimp marks, rope leaves on the far side
  const sleeveLen = 17;
  const F = G.frameOf(place(sleeveAt + 2, 0), d, w, n);
  const oval = stadium(strand + 3.2, ROPE_R + 1.5);
  const crimps = [3.5, 8.5, 13.5].map((at) => prismSeam(F, oval, at, P)).join("");
  put(ids.ferrule, S(prismOf(F, oval, 0, sleeveLen, P), { tone: "mid", crease: "lo", inner: L(crimps, { tone: "lo" }) }), place(sleeveAt + 10, 0), 1.2);

  // Dead end of the rope comes out of the sleeve's end face and stops just past it: in
  // front of the sleeve when that face turns to the viewer, behind it otherwise.
  // The standing part leaves on the axis.
  const tail = tubes([place(sleeveAt + sleeveLen + 1.5, -strand), place(sleeveAt + sleeveLen + 7, -strand)], ROPE_R, P, { maxLength: 16, spacing: 2.2 });
  for (const piece of tail) put(ids.rope, tubeSvg(piece, { tone: "hi" }), place(sleeveAt + 10, 0), dot3(d, G.viewOf(P)) > 0 ? 1.25 : 1.15);
  return { standingStart: place(sleeveAt + sleeveLen, 0) };
}

// ---------------------------------------------------------------------------
// Shackle, padeye

function padeyeAndShackle(put, leg, layout, P) {
  const C = layout.padeye[leg];
  const target = layout.subBottom[SUB_OF_LEG[leg]];
  const h = horizontal(sub3(target, C));
  const n = unit3([-h[1], h[0], 0]); // pin axis, horizontal, perpendicular to the leg's plan direction
  const F = G.frameOf(C, n, h, Z);
  const baseZ = DIM.height + 3;
  const hole = 5.0;
  const pinR = 4.1;

  // Weld pad and plate
  const pad = { x: C[0] - 13, y: C[1] - 13, w: 26, d: 26, r: 3 };
  const parts = [S(slabOf(pad, baseZ, 2, P, 3, 0.4), { tone: "mid" })];
  const lift = C[2] - baseZ;
  const R = 13;
  const outline = [[R, -lift + 2.0], [R, 0]];
  for (let i = 1; i < 12; i++) outline.push([R * Math.cos((i / 12) * Math.PI), R * Math.sin((i / 12) * Math.PI)]);
  outline.push([-R, 0], [-R, -lift + 2.0]);
  parts.push(S(prismOf(F, outline, -3.5, 3.5, P), { tone: "mid", crease: "lo" }));
  // Reinforcing rings (doublers) either side of the hole: the one facing the viewer goes on the plate
  const face = dot3(n, G.viewOf(P)) > 0 ? 1 : -1;
  const doubler = (side) => ringBand(side > 0 ? 3.5 : -5.3, side > 0 ? 5.3 : -3.5, hole, 10.5, F, P, { steps: 24 });
  parts.push(S(doubler(face), { tone: "hi", crease: "lo" }));
  // Weld beads at the foot
  const bead = (side) => L(k.segment(add3(add3(C, mul3(h, -R)), [0, 0, baseZ - C[2] + 2]).map((v, i) => (i < 2 ? v + n[i] * side * 3.7 : v)), add3(add3(C, mul3(h, R)), [0, 0, baseZ - C[2] + 2]).map((v, i) => (i < 2 ? v + n[i] * side * 3.7 : v)), P), { tone: "lo" });
  parts.push(bead(1), bead(-1));
  const lo = doubler(-face);

  // Back doubler first, then plate, then front doubler (the plate is drawn once, above)
  put(`padeye-${leg}`, S(lo, { tone: "hi", crease: "lo" }), C, -0.5);
  put(`padeye-${leg}`, parts.join(""), C, 0);
  return { C, h, n, F, pinR };
}

function shackle(put, leg, layout, P, pad) {
  const { C, h, n, pinR } = pad;
  const target = layout.subBottom[SUB_OF_LEG[leg]];
  const axis = unit3(sub3(target, C)); // the bow points along the leg
  const bowLen = 31;
  const half = 9.6; // half distance between the legs of the bow, along the pin axis
  const lugR = 7.4;
  const bar = 2.9;

  const pieceAt = (s, side) => add3(C, add3(mul3(n, side * half), mul3(axis, s)));
  const apex = add3(C, mul3(axis, bowLen));
  // Bow: from the two lug ends, up to the apex as one smooth U
  const bow = [];
  for (let i = 0; i <= 8; i++) bow.push(pieceAt((i / 8) * (bowLen - half), -1));
  for (let i = 1; i < 14; i++) {
    const a = (i / 14) * Math.PI;
    bow.push(add3(C, add3(mul3(n, -Math.cos(a) * half), mul3(axis, bowLen - half + Math.sin(a) * half))));
  }
  for (let i = 8; i >= 0; i--) bow.push(pieceAt((i / 8) * (bowLen - half), 1));

  // Pieces nearer the viewer than the plate go after it. The bow splits at the apex.
  const viewSide = dot3(n, G.viewOf(P)) > 0 ? 1 : -1; // which side of the plate faces the viewer
  const farLug = add3(C, mul3(n, -viewSide * (half)));
  const nearLug = add3(C, mul3(n, viewSide * (half)));
  const lugFrame = (centre) => G.frameOf(centre, n, h, Z);
  const lug = (centre) => S(disc(-2.6, 2.6, lugR, lugFrame(centre), P, { steps: 20 }), { tone: "hi", crease: "lo" });

  // Far lug, far pin end
  put(`shackle-${leg}`, lug(farLug), farLug, -1);
  // Pin: the far half runs from the head to the plate, the near half from the doubler's face to the nut.
  const span = (a, b) => disc(Math.min(a, b), Math.max(a, b), pinR, G.frameOf(C, n, h, Z), P, { steps: 18 });
  put(`shackle-pin-${leg}`, S(span(-viewSide * (half + 10.5), 0), { tone: "mid", crease: "none" }), add3(C, mul3(n, -viewSide * half)), -0.9);
  // Bow: an open U whose ends sit inside the lugs, depth sorted per chunk. Chunks
  // of the far leg still level with the plate are behind it whatever their own
  // depth says, so they go just before the far lug, which covers their ends.
  for (const piece of tubes(bow, bar, P, { maxLength: 15, spacing: 2.2 })) {
    const off = sub3(piece.mid, C);
    const behind = dot3(off, n) * viewSide < -2 && dot3(off, axis) < 16;
    put(`shackle-${leg}`, tubeSvg(piece, { tone: "hi" }), behind ? farLug : piece.mid, behind ? -1.05 : 0.1);
  }
  // Near pin: through the gap to the lug (under the lug), then the end that comes out of the lug
  put(`shackle-pin-${leg}`, S(span(viewSide * 5.3, viewSide * (half - 2.6)), { tone: "mid", crease: "none" }), nearLug, 0.6);
  put(`shackle-${leg}`, lug(nearLug), nearLug, 0.7);
  put(`shackle-pin-${leg}`, S(span(viewSide * (half + 2.6), viewSide * (half + 9.5)), { tone: "mid", crease: "none" }), nearLug, 0.9);
  const head = add3(C, mul3(n, -viewSide * (half + 10.5)));
  const nutAt = add3(C, mul3(n, viewSide * (half + 6.8)));
  put(`shackle-pin-${leg}`, S(disc(-3.4, 0, 6.2, G.frameOf(head, n, h, Z), P, { steps: 20 }), { tone: "hi", crease: "lo" }), head, -0.8);
  const hex = [0, 1, 2, 3, 4, 5].map((i) => [Math.cos((i / 6) * Math.PI * 2) * 6.4, Math.sin((i / 6) * Math.PI * 2) * 6.4]);
  put(`shackle-pin-${leg}`, S(prismOf(G.frameOf(nutAt, n, h, Z), hex, -3.2, 3.2, P), { tone: "hi", crease: "lo" }), nutAt, 1.0);
  // Split pin through the pin end
  const cotter = add3(C, mul3(n, viewSide * (half + 10.2)));
  put(`shackle-pin-${leg}`, L(k.segment(add3(cotter, mul3(h, -4.5)), add3(cotter, mul3(h, 4.5)), P) + k.segment(add3(cotter, add3(mul3(h, 4.5), [0, 0, 1.6])), add3(cotter, add3(mul3(h, -4.5), [0, 0, 1.6])), P), { tone: "hi" }), cotter, 1.2);
  return { apex, axis };
}

// ---------------------------------------------------------------------------
// Upper assembly: links, hook

function linkMaster(put, layout, P) {
  const centre = lerp3(layout.masterBottom, layout.masterTop, 0.5);
  const a = [1, 0, 0];
  const bottom = 76;
  const points = oblong(centre, a, Z, bottom, len3(sub3(layout.masterTop, layout.masterBottom)) + 11, 22, 38, 16);
  linkPieces(put, "master-link", points, 5.2, P, { bias: 0, rings: null });
}

function linkSub(put, layout, P, k_) {
  const bottom = layout.subBottom[k_];
  const top = layout.subTop[k_];
  const centre = lerp3(bottom, top, 0.5);
  const points = oblong(centre, [0, 1, 0], Z, 30, len3(sub3(top, bottom)) + 7, 15, 15, 12);
  linkPieces(put, `sub-link-${k_}`, points, 3.6, P, { bias: 0.1 });
}

const bezier = (p0, p1, p2, steps = 8) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return add3(add3(mul3(p0, (1 - t) * (1 - t)), mul3(p1, 2 * (1 - t) * t)), mul3(p2, t * t));
  });

function hook(put, layout, P) {
  const seat = layout.hookBowl; // centre of the master link's upper bar
  const top = layout.hookTop;
  // Plane yz, throat open towards +y. The bar rests on the bottom of the bowl.
  const R = 19;
  const tubeR = 7.2;
  const bar = 5.2;
  const c = add3(seat, [0, 0, R - tubeR - bar]);
  const at = (y, z) => [0, y, c[2] + z];
  const bowl = [];
  for (let i = 0; i <= 22; i++) {
    const a = -0.3 * Math.PI + (i / 22) * 1.3 * Math.PI; // tip, down through the bottom, up the back
    bowl.push(at(Math.cos(a) * R, -Math.sin(a) * R));
  }
  const back = at(-R, 0);
  const saddle = bezier(back, at(-R, R * 1.3), at(0, R * 1.75), 9);
  const neck = at(0, R * 1.75);
  const shankTop = [0, 0, top[2] - 12];
  const path = [...bowl, ...saddle.slice(1), neck, shankTop];
  const radius = (t) => (t < 0.38 ? 4.6 + t * 8.5 : t < 0.8 ? 7.8 - (t - 0.38) * 1.2 : 7.3);
  ropePieces(put, "hook", path, radius, P, { tone: "hi", maxLength: 12 });
  // Shank collar and the eye block above it
  put("hook", S(disc(0, 12, 9.4, G.frameAlong([0, 0, top[2] - 14], Z), P, { steps: 24 }), { tone: "hi", crease: "lo" }), top, 0.4);
  put("hook", S(disc(0, 7, 6, G.frameAlong([0, 0, top[2] - 2], Z), P, { steps: 20 }), { tone: "mid", crease: "lo" }), top, 0.5);
  // Safety latch: a gate pivoting on the back of the throat and closing on the tip
  const tip = bowl[0];
  const pivot = at(-R * 0.82, R * 0.62);
  put.anchor("hook", add3(top, [0, 0, -6]));
  put.anchor("hook-latch", at(-R * 0.1, R * 0.74));
  const gate = [pivot, at(-R * 0.1, R * 0.74), at(R * 0.5, R * 0.82), add3(tip, [0, -1.2, 1.4])];
  for (const piece of tubes(gate, 1.9, P, { maxLength: 8, spacing: 1.6 })) put("hook-latch", tubeSvg(piece, { tone: "lit" }), piece.mid, 1.6);
  // Pivot pin: only its end shows, standing just proud of the side of the hook that faces the viewer
  const near = Math.sign(G.viewOf(P)[0]);
  put("hook-latch", S(disc(Math.min(near * 6.8, near * 8.2), Math.max(near * 6.8, near * 8.2), 3.1, G.frameOf(pivot, [1, 0, 0], [0, 1, 0], Z), P, { steps: 14 }), { tone: "hi", crease: "none" }), pivot, 1.7);
  put("hook-latch", S(disc(-1.6, 1.6, 2.4, G.frameOf(at(R * 0.5, R * 0.62), [1, 0, 0], [0, 1, 0], Z), P, { steps: 12 }), { tone: "mid", crease: "none" }), at(R * 0.5, R * 0.8), 1.7);
}

// ---------------------------------------------------------------------------

function assembly(variantId, P) {
  const layout = layoutOf(variantId);
  const out = scene(P);
  const { put } = out;

  for (const leg of LEGS) {
    const pad = padeyeAndShackle(put, leg, layout, P);
    const bow = shackle(put, leg, layout, P, pad);

    const sub = layout.subBottom[SUB_OF_LEG[leg]];
    const dirUp = unit3(sub3(sub, bow.apex));
    const lowerIds = { thimble: `thimble-lo-${leg}`, ferrule: `ferrule-lo-${leg}`, rope: `rope-${leg}` };
    const lower = eye(put, lowerIds, bow.apex, dirUp, pad.n, P);

    const dirDown = mul3(dirUp, -1);
    const upperIds = { thimble: `thimble-up-${leg}`, ferrule: `ferrule-up-${leg}`, rope: `rope-${leg}` };
    const upper = eye(put, upperIds, sub, dirDown, [0, 1, 0], P);

    // Rope: between the two ferrules
    ropePieces(put, `rope-${leg}`, [lower.standingStart, upper.standingStart], ROPE_R, P, { rings: BRAID, maxLength: 30 });
  }
  for (const k_ of [1, 2]) linkSub(put, layout, P, k_);
  linkMaster(put, layout, P);
  hook(put, layout, P);
  return out;
}

const tidy = (markup) => markup.replace(/(\d+\.\d)\d+/g, "$1");

export const FIGURE_LABEL =
  "Isometric illustration of a generic offshore container with a four-leg lifting set: a padeye with a bolt-type bow shackle on each top corner, four wire rope legs with thimble and pressed-ferrule eyes, two intermediate links, a master link and a crane hook with a safety latch. The drawing is illustrative and not to scale.";

export const CALLOUT_R = 15;
const GAP = CALLOUT_R * 2 + 6;

/**
 * One numbered callout per kind of part, in the margin beside the drawing with
 * a leader to the part. Pointer and touch only: the legend is the keyboard and
 * screen-reader route to the same selection. Positions are computed here, from
 * the model's anchors, so the labels never collide.
 */
export function calloutsOf(anchorOf, P) {
  const { length: Lc, width: Wc, height: H } = DIM;
  const corners = [-1, 1].flatMap((sx) => [-1, 1].flatMap((sy) => [0, H].map((z) => k.iso([(sx * Lc) / 2, (sy * Wc) / 2, z], P))));
  const left = Math.max(CALLOUT_R + 4, Math.min(...corners.map((c) => c[0])) - 20);
  const right = Math.min(WIDTH - CALLOUT_R - 4, Math.max(...corners.map((c) => c[0])) + 20);
  const mid = (left + right) / 2;
  const reps = calloutRepsOf(P);
  const items = KINDS.map((kind, index) => {
    const id = reps[kind.id];
    const at = k.iso(anchorOf(id), P);
    return { id, n: index + 1, name: kind.short, at, side: at[0] < mid ? left : right, y: at[1] };
  });
  for (const x of [left, right]) {
    const column = items.filter((item) => item.side === x).sort((a, b) => a.y - b.y);
    for (let i = 1; i < column.length; i++) column[i].y = Math.max(column[i].y, column[i - 1].y + GAP);
    const over = (column.length ? column[column.length - 1].y : 0) - (HEIGHT - CALLOUT_R - 4);
    if (over > 0) column.forEach((item) => (item.y -= over));
    for (let i = column.length - 2; i >= 0; i--) column[i].y = Math.min(column[i].y, column[i + 1].y - GAP);
  }
  return items;
}

function calloutSvg(items) {
  return `<g class="callouts">${items
    .map(({ id, n, name, at, side, y }) => {
      const dx = at[0] - side;
      const dy = at[1] - y;
      const length = Math.hypot(dx, dy) || 1;
      const from = [side + (dx / length) * CALLOUT_R, y + (dy / length) * CALLOUT_R];
      const outward = side < WIDTH / 2 ? -1 : 1;
      return `<g class="callout" data-jump="${id}" data-n="${n}" aria-hidden="true">${L(`M${from[0]} ${from[1]}L${at[0]} ${at[1]}`, { tone: "mid" })}${D([at], { size: 1.2, tone: "hi" })}<circle cx="${side}" cy="${y}" r="${CALLOUT_R}"/><text x="${side}" y="${y}">${n}</text><text class="callout-name${outward < 0 ? " end" : ""}" x="${side + outward * (CALLOUT_R + 6)}" y="${y}">${name}</text></g>`;
    })
    .join("")}</g>`;
}

function variantGroup(id, base, P, { callouts = true, ghosts = true } = {}) {
  const asm = assembly(id, P);
  const anchorOf = (part) => asm.anchorOf(part) ?? base.anchorOf(part);
  return `<g data-variant="${id}">${asm.flush(ghosts)}${callouts ? calloutSvg(calloutsOf(anchorOf, P)) : ""}</g>`;
}

/**
 * One whole figure: the container and one leg variant, seen from one view. The
 * article shows view 0 without callouts or ghost marks; the viewer fetches
 * every view with both, one file per view and variant, only when asked for.
 */
export function buildFigure(variant = "a", { view = 0, callouts = true, ghosts = true } = {}) {
  const P = projectionFor(view);
  const base = container(P);
  const label = view === 0 ? FIGURE_LABEL : `${FIGURE_LABEL} View ${view + 1} of ${VIEWS.length}.`;
  const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label, body: [base.flush(ghosts), variantGroup(variant, base, P, { callouts, ghosts })] });
  return { svg: tidy(svg), P };
}

/** The 3D shapes behind one figure, by component, for the owner-map check. Never used by the site. */
export function probeShapes(variant = "a", view = 0) {
  probe = { pending: [], shapes: [] };
  try {
    const { P } = buildFigure(variant, { view, callouts: false, ghosts: false });
    return { P, shapes: probe.shapes };
  } finally {
    probe = null;
  }
}

export { ISO_CSS } from "./anatomy/iso-kit.mjs";
