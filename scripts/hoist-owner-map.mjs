// Owner-map check for the lifting-set figure (dev tool, not part of the site or
// the test suite). For every view and leg variant it compares two maps of "which
// component owns this pixel":
//   expected: a ray cast per pixel against the 3D shapes the drawing was built
//             from (src/lib/hoist-figure.mjs `probeShapes`), nearest surface wins;
//   rendered: the real SVG painted with one flat colour per data-component.
// A mismatch means the painter's order or the 2D drawing disagrees with the 3D
// model. Pixels within EDGE px of a boundary in the expected map are skipped
// (outlines, polygonal approximations). It also writes 4× crops of the critical
// joints for review. It is NOT the Anatomy audit (shapes are not recorded with
// A.recorder), and its shapes are simplified: tubes are capsule chains, discs
// solid cylinders, slabs boxes, prisms convex.
//
// Usage: node scripts/hoist-owner-map.mjs [--edge 2] [--out .claude/review/hoist-owner]
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import * as k from "../src/lib/anatomy/iso-kit.mjs";
import * as G from "../src/lib/anatomy/lathe.mjs";
import { HEIGHT, VIEWS, WIDTH, buildFigure, calloutRepsOf, probeShapes } from "../src/lib/hoist-figure.mjs";
import { COMPONENTS } from "../src/lib/hoist-model.ts";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const EDGE = Number(arg("edge", 2));
const OUT = arg("out", ".claude/review/hoist-owner");
mkdirSync(OUT, { recursive: true });

const { add3, sub3, mul3, dot3, cross3, len3 } = G;
const ids = COMPONENTS.map((component) => component.id);
const colourOf = (i) => [40 + 5 * i, 250 - 5 * i, 128];
const keyOf = (r, g, b) => (r << 16) | (g << 8) | b;
const ownerOfColour = new Map(ids.map((_, i) => [keyOf(...colourOf(i)), i]));

// ---------------------------------------------------------------------------
// Ray casting against the probe shapes. Rays run along the view direction V
// (towards the viewer); the visible surface is the largest t.

function rayOf(P, sx, sy) {
  const { sinA, cosA, sinE, k: scale } = k.cameraOf(P);
  const u = (sx - P.origin[0]) / scale;
  const w = (sy - P.origin[1]) / (scale * sinE);
  return { o: [u * sinA + w * cosA, -u * cosA + w * sinA, 0], d: G.viewOf(P) };
}

/** Clip [lo, hi] by a <= qa + t*da <= b. */
function slab(range, q, d, a, b) {
  if (Math.abs(d) < 1e-12) return q >= a && q <= b ? range : null;
  let t0 = (a - q) / d;
  let t1 = (b - q) / d;
  if (t0 > t1) [t0, t1] = [t1, t0];
  const lo = Math.max(range[0], t0);
  const hi = Math.min(range[1], t1);
  return lo <= hi ? [lo, hi] : null;
}

const local = (F, p) => {
  const q = sub3(p, F.o);
  return [dot3(q, F.a), dot3(q, F.u), dot3(q, F.v)];
};
const localDir = (F, d) => [dot3(d, F.a), dot3(d, F.u), dot3(d, F.v)];

function primitivesOf(shapes, P) {
  const out = [];
  const box = (points) => {
    const flat = points.map((point) => k.iso(point, P));
    const xs = flat.map((p) => p[0]);
    const ys = flat.map((p) => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };
  const scale = G.scaleOf(P);
  for (const shape of shapes) {
    const owner = ids.indexOf(shape.id);
    if (shape.type === "tube") {
      const points = shape.closed ? [...shape.points, shape.points[0]] : shape.points;
      const lengths = [0];
      for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + len3(sub3(points[i], points[i - 1])));
      const total = lengths[lengths.length - 1] || 1;
      const radiusAt = typeof shape.radius === "function" ? shape.radius : () => shape.radius;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const r = radiusAt((lengths[i - 1] + lengths[i]) / 2 / total);
        const [x0, y0, x1, y1] = box([a, b]);
        const pad = r * scale;
        out.push({ owner, kind: "capsule", a, b, r, bbox: [x0 - pad, y0 - pad, x1 + pad, y1 + pad] });
      }
    } else if (shape.type === "cyl") {
      const ring = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        for (const s of [shape.s0, shape.s1]) ring.push(add3(shape.F.o, add3(mul3(shape.F.a, s), add3(mul3(shape.F.u, Math.cos(angle) * shape.r), mul3(shape.F.v, Math.sin(angle) * shape.r)))));
      }
      out.push({ owner, kind: "cyl", ...shape, bbox: box(ring) });
    } else if (shape.type === "prism") {
      const F = shape.F;
      const corners = shape.polygon.flatMap(([x, y]) => [shape.s0, shape.s1].map((s) => add3(F.o, add3(mul3(F.a, s), add3(mul3(F.u, x), mul3(F.v, y))))));
      // Half-planes of the convex polygon, oriented inwards.
      const poly = shape.polygon;
      let area = 0;
      for (let i = 0; i < poly.length; i++) {
        const [x0, y0] = poly[i];
        const [x1, y1] = poly[(i + 1) % poly.length];
        area += x0 * y1 - x1 * y0;
      }
      const sign = area >= 0 ? 1 : -1;
      const planes = poly.map(([x0, y0], i) => {
        const [x1, y1] = poly[(i + 1) % poly.length];
        return { n: [-(y1 - y0) * sign, (x1 - x0) * sign], c: [x0, y0] }; // inside: n·(p - c) >= 0
      });
      out.push({ owner, kind: "prism", F, s0: shape.s0, s1: shape.s1, planes, bbox: box(corners) });
    } else if (shape.type === "box") {
      const { x, y, w, d } = shape.plan;
      const corners = [x, x + w].flatMap((px) => [y, y + d].flatMap((py) => [shape.z, shape.z + shape.h].map((pz) => [px, py, pz])));
      out.push({ owner, kind: "box", lo: [x, y, shape.z], hi: [x + w, y + d, shape.z + shape.h], bbox: box(corners) });
    }
  }
  return out;
}

/** Largest t at which the ray meets the primitive, or -Infinity. */
function hit(prim, ray) {
  const { o, d } = ray;
  if (prim.kind === "box") {
    let range = [-1e9, 1e9];
    for (let i = 0; i < 3 && range; i++) range = slab(range, o[i], d[i], prim.lo[i], prim.hi[i]);
    return range ? range[1] : -Infinity;
  }
  if (prim.kind === "cyl" || prim.kind === "prism") {
    const q = local(prim.F, o);
    const v = localDir(prim.F, d);
    let range = slab([-1e9, 1e9], q[0], v[0], Math.min(prim.s0, prim.s1), Math.max(prim.s0, prim.s1));
    if (!range) return -Infinity;
    if (prim.kind === "cyl") {
      const A = v[1] * v[1] + v[2] * v[2];
      const B = 2 * (q[1] * v[1] + q[2] * v[2]);
      const C = q[1] * q[1] + q[2] * q[2] - prim.r * prim.r;
      if (A < 1e-12) return C <= 0 ? range[1] : -Infinity;
      const disc = B * B - 4 * A * C;
      if (disc < 0) return -Infinity;
      const root = Math.sqrt(disc);
      range = [Math.max(range[0], (-B - root) / (2 * A)), Math.min(range[1], (-B + root) / (2 * A))];
      return range[0] <= range[1] ? range[1] : -Infinity;
    }
    for (const { n, c } of prim.planes) {
      // n·(q + t v - c) >= 0
      const base = n[0] * (q[1] - c[0]) + n[1] * (q[2] - c[1]);
      const rate = n[0] * v[1] + n[1] * v[2];
      if (Math.abs(rate) < 1e-12) {
        if (base < 0) return -Infinity;
        continue;
      }
      const t = -base / rate;
      range = rate > 0 ? [Math.max(range[0], t), range[1]] : [range[0], Math.min(range[1], t)];
      if (range[0] > range[1]) return -Infinity;
    }
    return range[1];
  }
  // Capsule: closest approach between the ray line and the segment.
  const ab = sub3(prim.b, prim.a);
  const ao = sub3(o, prim.a);
  const aa = dot3(ab, ab);
  const ad = dot3(ab, d);
  const ar = dot3(ab, ao);
  const dr = dot3(d, ao);
  const den = aa - ad * ad;
  let s = den > 1e-12 ? (ar - ad * dr) / den : 0;
  s = Math.max(0, Math.min(1, s));
  const point = add3(prim.a, mul3(ab, s));
  const t = dot3(sub3(point, o), d);
  const dist = len3(sub3(add3(o, mul3(d, t)), point));
  if (dist > prim.r) return -Infinity;
  const axis = aa > 1e-12 ? mul3(ab, 1 / Math.sqrt(aa)) : [0, 0, 1];
  const sin = Math.max(0.35, len3(cross3(axis, d)));
  return t + Math.sqrt(prim.r * prim.r - dist * dist) / (s > 0 && s < 1 ? sin : 1);
}

function expectedMap(P, prims) {
  const CELL = 16;
  const cols = Math.ceil(WIDTH / CELL);
  const rows = Math.ceil(HEIGHT / CELL);
  const buckets = Array.from({ length: cols * rows }, () => []);
  prims.forEach((prim, index) => {
    const [x0, y0, x1, y1] = prim.bbox;
    for (let cy = Math.max(0, Math.floor(y0 / CELL)); cy <= Math.min(rows - 1, Math.floor(y1 / CELL)); cy++)
      for (let cx = Math.max(0, Math.floor(x0 / CELL)); cx <= Math.min(cols - 1, Math.floor(x1 / CELL)); cx++) buckets[cy * cols + cx].push(index);
  });
  const map = new Int16Array(WIDTH * HEIGHT).fill(-1);
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      const ray = rayOf(P, x + 0.5, y + 0.5);
      let best = -Infinity;
      let owner = -1;
      for (const index of buckets[Math.floor(y / CELL) * cols + Math.floor(x / CELL)]) {
        const t = hit(prims[index], ray);
        if (t > best) {
          best = t;
          owner = prims[index].owner;
        }
      }
      map[y * WIDTH + x] = owner;
    }
  return map;
}

// ---------------------------------------------------------------------------
// Rendered map: the real SVG, one flat colour per component, no anti-aliasing.

const flatCss = [
  "*{shape-rendering:crispEdges}",
  ".callouts,[data-ghost],.iso-halo,text{display:none}",
  ...ids.map((id, i) => {
    const c = `rgb(${colourOf(i).join(",")})`;
    return `[data-component="${id}"] :is(path,circle,rect,polygon){fill:${c};stroke:${c}}[data-component="${id}"] .iso-line,[data-component="${id}"] .tb-ring{fill:none;stroke:${c}}`;
  }),
].join("");

async function renderedMap(page, svg) {
  const markup = svg.replace(/<svg([^>]*)>/, `<svg$1><style>${flatCss}</style>`).replace(/<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"');
  const data = await page.evaluate(
    async ({ markup, width, height }) => {
      const img = new Image(width, height);
      img.src = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { colorSpace: "srgb" });
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);
      return Array.from(ctx.getImageData(0, 0, width, height).data);
    },
    { markup, width: WIDTH, height: HEIGHT },
  );
  const map = new Int16Array(WIDTH * HEIGHT).fill(-1);
  let unknown = 0;
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    if (data[i * 4 + 3] < 128) continue;
    const owner = ownerOfColour.get(keyOf(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]));
    if (owner === undefined) {
      unknown++;
      map[i] = -2;
    } else map[i] = owner;
  }
  return { map, unknown };
}

// ---------------------------------------------------------------------------

function compare(expected, rendered) {
  const pairs = new Map();
  let compared = 0;
  let wrong = 0;
  const mask = new Uint8Array(WIDTH * HEIGHT);
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x;
      const e = expected[i];
      const r = rendered[i];
      if (r === -2) continue;
      if (e < 0 && r < 0) continue;
      let edge = false;
      for (let dy = -EDGE; dy <= EDGE && !edge; dy++)
        for (let dx = -EDGE; dx <= EDGE && !edge; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < WIDTH && yy < HEIGHT && expected[yy * WIDTH + xx] !== e) edge = true;
        }
      if (edge) continue;
      compared++;
      if (e !== r) {
        wrong++;
        mask[i] = 1;
        const key = `${e < 0 ? "(background)" : ids[e]} → ${r < 0 ? "(background)" : ids[r]}`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
      }
    }
  return { compared, wrong, pairs: [...pairs].sort((a, b) => b[1] - a[1]), mask };
}

async function savePng(page, file, width, height, rgba) {
  const url = await page.evaluate(
    ({ width, height, rgba }) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);
      return canvas.toDataURL("image/png");
    },
    { width, height, rgba: Array.from(rgba) },
  );
  writeFileSync(file, Buffer.from(url.split(",")[1], "base64"));
}

/** Screen box of some components, from their probe shapes. */
function boxOf(prims, names, pad = 10) {
  const set = new Set(names.map((name) => ids.indexOf(name)));
  const boxes = prims.filter((prim) => set.has(prim.owner)).map((prim) => prim.bbox);
  const x0 = Math.min(...boxes.map((b) => b[0])) - pad;
  const y0 = Math.min(...boxes.map((b) => b[1])) - pad;
  const x1 = Math.max(...boxes.map((b) => b[2])) + pad;
  const y1 = Math.max(...boxes.map((b) => b[3])) + pad;
  return { x: Math.max(0, x0), y: Math.max(0, y0), width: Math.min(WIDTH, x1) - Math.max(0, x0), height: Math.min(HEIGHT, y1) - Math.max(0, y0) };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
await page.setContent("<!doctype html><body style='margin:0'></body>");
const report = [];
const only = arg("only", ""); // e.g. --only a1
for (const variant of ["a", "b"])
  for (const view of VIEWS) {
    if (only && only !== `${variant}${view}`) continue;
    const { P, shapes } = probeShapes(variant, view);
    const prims = primitivesOf(shapes, P);
    const expected = expectedMap(P, prims);
    const { svg } = buildFigure(variant, { view, callouts: false, ghosts: false });
    const { map: rendered, unknown } = await renderedMap(page, svg);
    const result = compare(expected, rendered);
    const name = `${variant}${view}`;
    const rgba = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const base = rendered[i] >= 0 ? 235 : 255;
      const [r, g, b] = result.mask[i] ? [220, 30, 30] : [base, base, base];
      rgba.set([r, g, b, 255], i * 4);
    }
    await savePng(page, path.join(OUT, `mismatch-${name}.png`), WIDTH, HEIGHT, rgba);
    if (process.argv.includes("--maps"))
      for (const [label, map] of [["expected", expected], ["rendered", rendered]]) {
        const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
        for (let i = 0; i < WIDTH * HEIGHT; i++) pixels.set(map[i] >= 0 ? [...colourOf(map[i]).map((c, j) => (j === 2 ? (map[i] * 97) % 256 : c)), 255] : [255, 255, 255, 255], i * 4);
        await savePng(page, path.join(OUT, `${label}-${name}.png`), WIDTH, HEIGHT, pixels);
      }
    report.push({ variant, view, compared: result.compared, wrong: result.wrong, percent: (100 * result.wrong) / Math.max(1, result.compared), unknown, pairs: result.pairs.slice(0, 8) });

    // 4× crops of the joints that interlock, from the normal (themed) figure.
    const reps = calloutRepsOf(P);
    const leg = reps.shackle.split("-").pop();
    const sub = reps["sub-link"].split("-").pop();
    const crops = {
      "master-and-links": ["master-link", "sub-link-1", "sub-link-2"],
      "links-and-eyes": [`sub-link-${sub}`, `thimble-up-${leg}`, `ferrule-up-${leg}`],
      "hook-and-latch": ["hook", "hook-latch"],
      "shackle-and-padeye": [`shackle-${leg}`, `shackle-pin-${leg}`, `padeye-${leg}`],
      "lower-eye-and-ferrule": [`thimble-lo-${leg}`, `ferrule-lo-${leg}`, `shackle-${leg}`],
    };
    const full = buildFigure(variant, { view, callouts: false, ghosts: false }).svg;
    const crop = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 4 });
    const styles = `${k.ISO_CSS}`;
    await crop.setContent(`<!doctype html><html class="iso" data-theme="light"><body style="margin:0;background:#f6f5f1"><style>${styles}.iso-halo{display:none}</style><div style="width:${WIDTH}px">${full}</div></body></html>`);
    for (const [label, names] of Object.entries(crops)) {
      await crop.screenshot({ path: path.join(OUT, `crop-${name}-${label}.png`), clip: boxOf(prims, names) });
    }
    await crop.close();
    console.log(`${name}: ${report.at(-1).percent.toFixed(2)}% of ${result.compared} px (unknown colour ${unknown})`);
  }
await browser.close();

const lines = [
  `Owner map, edge tolerance ${EDGE}px. Not the Anatomy audit: shapes are simplified (capsules, cylinders, boxes, convex prisms).`,
  "",
  "| view | variant | compared px | mismatched px | % | main pairs (expected → drawn) |",
  "|---|---|---|---|---|---|",
  ...report.map((r) => `| ${r.view} | ${r.variant} | ${r.compared} | ${r.wrong} | ${r.percent.toFixed(2)} | ${r.pairs.slice(0, 4).map(([pair, n]) => `${pair} (${n})`).join("; ")} |`),
];
writeFileSync(path.join(OUT, "report.md"), lines.join("\n") + "\n");
writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(lines.join("\n"));
