// Dev-only asset generator for the homepage Hero artifact. Never imported by src/.
//
// Renders an abstract engineering object (modules on a drafting plate, routed
// conduits with node joints, two constraint gates, a store, and an external
// block across a boundary gap) with three.js in headless Chromium, then:
//   - writes a still poster per theme:   src/assets/hero/artifact-{light,dark}.png
//   - encodes a seamless loop per theme: public/media/hero-artifact-{light,dark}.webm
// The loop is deterministic: every frame is rendered at an exact timestamp and
// encoded with WebCodecs (VP9), so frame N wraps to frame 0 without a seam.
// Colors are the site's design tokens (src/styles/system/tokens.css). The page
// composites the media with a blend mode, so the render background disappears
// exactly whatever the codec does: light renders sit on pure white and are
// multiplied onto the paper; dark renders sit on pure black and are screened
// onto the graphite. Each material color is pre-inverted for that blend, so the
// composite lands on the intended token color.
//
// Usage: node scripts/hero-artifact.mjs            (posters + loops)
//        node scripts/hero-artifact.mjs --posters  (posters only)
// Requires the dev dependencies `three` and `webm-muxer` and Playwright's Chromium.
import { mkdir, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = process.cwd();
const postersOnly = process.argv.includes("--posters");
const POSTER = { width: 1440, height: 1080 };
const VIDEO = { width: 960, height: 720, fps: 30, seconds: 8, bitrate: 180_000 };

// Token values (OKLCH) for each theme. Keep in sync with tokens.css.
const THEMES = {
  light: {
    bg: [0.972, 0.004, 95],
    plate: [0.945, 0.005, 95],
    module: [0.993, 0.003, 95],
    edge: [0.6, 0.009, 85],
    conduit: [0.47, 0.01, 80],
    joint: [0.24, 0.008, 80],
    ring: [0.78, 0.008, 90],
    packet: [0.47, 0.075, 170],
    shadow: 0.1,
  },
  dark: {
    bg: [0.205, 0.006, 75],
    plate: [0.245, 0.006, 75],
    module: [0.33, 0.007, 75],
    edge: [0.52, 0.008, 75],
    conduit: [0.66, 0.01, 85],
    joint: [0.93, 0.008, 85],
    ring: [0.42, 0.008, 75],
    packet: [0.78, 0.08, 170],
    shadow: 0.35,
  },
};

function oklchToHex([L, C, h]) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const srgb = lin.map((c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  });
  return "#" + srgb.map((v) => v.toString(16).padStart(2, "0")).join("");
}

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const rgbToHex = (rgb) => "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("");

// multiply: page * c = target  →  c = target / page
// screen:   1 - (1 - page)(1 - c) = target  →  c = 1 - (1 - target) / (1 - page)
function preBlend(name, targetHex, pageHex) {
  const t = hexToRgb(targetHex), b = hexToRgb(pageHex);
  return rgbToHex(t.map((tc, i) => (name === "light" ? tc / b[i] : 1 - (1 - tc) / (1 - b[i]))));
}

const palettes = Object.fromEntries(
  Object.entries(THEMES).map(([name, t]) => {
    const page = oklchToHex(t.bg);
    const out = { bg: name === "light" ? "#ffffff" : "#000000", shadow: t.shadow };
    for (const [k, v] of Object.entries(t)) {
      if (Array.isArray(v) && k !== "bg") out[k] = preBlend(name, oklchToHex(v), page);
    }
    return [name, out];
  }),
);

const threeUrl = pathToFileURL(path.join(root, "node_modules/three/build/three.module.js")).href;
const muxerUrl = pathToFileURL(path.join(root, "node_modules/webm-muxer/build/webm-muxer.mjs")).href;

// The scene runs in the page. Units: 1 = one grid cell on the plate.
const pageScript = `
import * as THREE from "${threeUrl}";
import { Muxer, ArrayBufferTarget } from "${muxerUrl}";

window.build = (pal, size) => {
  const canvas = document.createElement("canvas");
  canvas.width = size.width; canvas.height = size.height;
  document.body.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(size.width, size.height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(pal.bg);

  const aspect = size.width / size.height;
  const view = 6.1;
  const camera = new THREE.OrthographicCamera(-view * aspect, view * aspect, view, -view, 0.1, 100);
  camera.position.set(-14, 12.5, 14);
  camera.lookAt(-0.9, -0.2, 1.3);

  scene.add(new THREE.HemisphereLight(0xffffff, new THREE.Color(pal.plate), 1.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(-9, 14, -3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 6;
  key.shadow.bias = -0.0006;
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 });
  scene.add(key);

  const mat = (hex) => new THREE.MeshLambertMaterial({ color: new THREE.Color(hex) });
  const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(pal.edge) });
  const add = (geo, material, x, y, z, edges = true) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh);
    if (edges) {
      const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), edgeMat);
      lines.position.copy(mesh.position);
      scene.add(lines);
    }
    return mesh;
  };
  const box = (w, h, d, material, x, z, base = 0, edges = true) =>
    add(new THREE.BoxGeometry(w, h, d), material, x, base + h / 2, z, edges);

  // Shadow catcher beyond the plate: only the soft shadow shows on the page color.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: pal.shadow }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.34; ground.receiveShadow = true;
  scene.add(ground);

  // Drafting plate with an engraved one-unit grid.
  const plate = mat(pal.plate), module = mat(pal.module), ring = mat(pal.ring);
  box(10, 0.3, 8, plate, 0, 0, -0.3);
  const grid = [];
  for (let x = -4; x <= 4; x++) grid.push(x, 0.003, -4, x, 0.003, 4);
  for (let z = -3; z <= 3; z++) grid.push(-5, 0.003, z, 5, 0.003, z);
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(grid, 3));
  scene.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(pal.ring) })));

  // External pad: a separate, lower slab across a gap (the system boundary).
  box(2.2, 0.3, 2.2, plate, -6.7, 2.4, -0.3);
  box(1.4, 0.7, 1.4, module, -6.7, 2.4);

  // Input module.
  box(1.6, 0.55, 1.6, module, -3.6, -2.2);
  // Engine: the central block with a recessed top plate.
  box(2.6, 1.3, 2.6, module, 0, -0.6);
  box(1.9, 0.06, 1.9, plate, 0, -0.6, 1.3);
  // Store: a cylinder with two grooves.
  add(new THREE.CylinderGeometry(0.95, 0.95, 0.95, 64), module, 3.4, 0.475, 2.45);
  for (const y of [0.33, 0.64]) add(new THREE.CylinderGeometry(0.965, 0.965, 0.035, 64), ring, 3.4, y, 2.45, false);

  // Two constraint gates the validated route passes through (posts + beam).
  for (const gx of [1.15, 1.85]) {
    box(0.1, 0.9, 0.12, module, gx, 2.13);
    box(0.1, 0.9, 0.12, module, gx, 2.77);
    box(0.1, 0.1, 0.76, module, gx, 2.45, 0.9);
  }

  // Conduits: orthogonal square rails with node joints at the corners.
  const conduitMat = mat(pal.conduit), jointMat = mat(pal.joint);
  const H = 0.11;
  const routes = [
    [[-3.6, -1.4], [-3.6, -0.9], [-1.3, -0.9]],
    [[-6.0, 2.4], [-2.2, 2.4], [-2.2, 0.15], [-1.3, 0.15]],
    [[0.4, 0.7], [0.4, 2.45], [2.45, 2.45]],
  ];
  const lengths = routes.map((r) => r.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - r[i][0], p[1] - r[i][1]), 0));
  for (const r of routes) {
    for (let i = 1; i < r.length; i++) {
      const [x0, z0] = r[i - 1], [x1, z1] = r[i];
      const len = Math.hypot(x1 - x0, z1 - z0);
      const horizontal = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      box(horizontal ? len : 0.09, 0.09, horizontal ? 0.09 : len, conduitMat, (x0 + x1) / 2, (z0 + z1) / 2, H - 0.045, false);
    }
    // Joints only at the corners: the ends run straight into the module faces.
    for (const [x, z] of r.slice(1, -1)) add(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 32), jointMat, x, H, z, false);
  }

  // Packets: the only accent. Two per route, half a loop apart.
  const packetMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(pal.packet), emissive: new THREE.Color(pal.packet), emissiveIntensity: 0.25 });
  const packets = [];
  routes.forEach((r, ri) => {
    for (const phase of [0, 0.5]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), packetMat);
      m.castShadow = true;
      scene.add(m);
      packets.push({ m, r, len: lengths[ri], phase: phase + ri * 0.17 });
    }
  });
  const pointAt = (r, d) => {
    for (let i = 1; i < r.length; i++) {
      const [x0, z0] = r[i - 1], [x1, z1] = r[i];
      const seg = Math.hypot(x1 - x0, z1 - z0);
      if (d <= seg) return [x0 + ((x1 - x0) * d) / seg, z0 + ((z1 - z0) * d) / seg];
      d -= seg;
    }
    return r[r.length - 1];
  };
  // u in [0, 1): position along the loop. Packets ease in and out of the joints.
  window.frame = (u) => {
    for (const p of packets) {
      const f = (u + p.phase) % 1;
      const [x, z] = pointAt(p.r, f * p.len);
      const edge = Math.min(f, 1 - f) / 0.07;
      const s = Math.max(0.001, Math.min(1, edge));
      p.m.position.set(x, H + 0.13, z);
      p.m.scale.setScalar(s);
    }
    renderer.render(scene, camera);
  };
  window.png = () => canvas.toDataURL("image/png");

  window.encode = async (v) => {
    const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: "V_VP9", width: v.width, height: v.height, frameRate: v.fps } });
    const encoder = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { throw e; } });
    encoder.configure({ codec: "vp09.00.10.08", width: v.width, height: v.height, bitrate: v.bitrate, framerate: v.fps, latencyMode: "quality" });
    const total = v.fps * v.seconds;
    for (let i = 0; i < total; i++) {
      window.frame(i / total);
      const vf = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / v.fps), duration: Math.round(1e6 / v.fps) });
      encoder.encode(vf, { keyFrame: i % (v.fps * 2) === 0 });
      vf.close();
      if (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
    }
    await encoder.flush();
    muxer.finalize();
    const bytes = new Uint8Array(muxer.target.buffer);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
};
`;

const dir = await mkdtemp(path.join(tmpdir(), "hero-artifact-"));
const html = path.join(dir, "index.html");
await writeFile(html, `<!doctype html><meta charset="utf-8"><body style="margin:0"><script type="module">${pageScript}</script>`);

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"],
});
await mkdir(path.join(root, "src/assets/hero"), { recursive: true });
await mkdir(path.join(root, "public/media"), { recursive: true });

for (const [name, pal] of Object.entries(palettes)) {
  for (const [kind, size] of [["poster", POSTER], ...(postersOnly ? [] : [["video", VIDEO]])]) {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error(e));
    await page.goto(pathToFileURL(html).href);
    await page.waitForFunction(() => typeof window.build === "function");
    await page.evaluate(([p, s]) => window.build(p, s), [pal, size]);
    if (kind === "poster") {
      // The still is the loop's first frame, so the poster-to-video swap never jumps.
      await page.evaluate(() => window.frame(0));
      const data = await page.evaluate(() => window.png());
      const file = path.join(root, `src/assets/hero/artifact-${name}.png`);
      await writeFile(file, Buffer.from(data.split(",")[1], "base64"));
      console.log("poster", path.relative(root, file));
    } else {
      const b64 = await page.evaluate((v) => window.encode(v), VIDEO);
      const file = path.join(root, `public/media/hero-artifact-${name}.webm`);
      const buf = Buffer.from(b64, "base64");
      await writeFile(file, buf);
      console.log("loop", path.relative(root, file), `${(buf.length / 1024).toFixed(0)} KB`);
    }
    await page.close();
  }
}
await browser.close();
await rm(dir, { recursive: true, force: true });
