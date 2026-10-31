// Single data model of the offshore-container lifting-set demo. It is pure (no
// DOM) so the SVG builder (`hoist-figure.mjs`), the page (as JSON, through
// `MODEL_DATA`) and the tests read the same components, layout and rules.
//
// Everything here is ILLUSTRATIVE and SYNTHETIC: shapes follow the topology of
// real lifting-set components (padeye, shackle, thimble, ferrule, master link,
// crane hook) but no dimension, rating, brand, certificate or standard is
// claimed. Units are drawing units, not millimetres, and the drawing is not to
// scale. The demo validates a configuration against illustrative rules; it is
// not an engineering simulation and not a tool for real lifting decisions.

import { ANGLE_LIMIT_DEG, validateWith } from "./hoist-rules.ts";
import type { KindId, ModelData, Report, State, VariantId } from "./hoist-rules.ts";

export interface Kind {
  id: KindId;
  /** Short label printed next to the numbered callout. */
  short: string;
  es: string;
  en: string;
  /** What the part is. */
  what: string;
  /** What it does in the set. */
  role: string;
}

/** Listed from the crane down to the container, i.e. along the load path. */
export const KINDS: Kind[] = [
  { id: "hook", short: "Hook", es: "Gancho de grúa", en: "Crane hook", what: "Forged hook with a shank and a throat that takes the master link.", role: "Connects the whole set to the crane and carries the full load." },
  { id: "hook-latch", short: "Latch", es: "Pestillo de seguridad", en: "Hook latch", what: "Spring-loaded gate that closes the hook throat.", role: "Keeps the master link inside the hook when the sling goes slack. It does not carry load." },
  { id: "master-link", short: "Master link", es: "Argolla maestra", en: "Master link", what: "Large forged link, open at no point and without a pin.", role: "Gathers the intermediate links and hangs from the hook." },
  { id: "sub-link", short: "Link", es: "Eslabón intermedio", en: "Intermediate link", what: "Smaller forged link hung from the master link.", role: "Takes two sling legs each, so four legs reach one master link without crowding its bar." },
  { id: "thimble", short: "Thimble", es: "Guardacabos", en: "Thimble", what: "Teardrop-shaped grooved insert placed inside a rope eye.", role: "Gives the rope a controlled bend radius at the bearing point so the eye does not kink or crush." },
  { id: "ferrule", short: "Ferrule", es: "Casquillo prensado", en: "Pressed ferrule", what: "Oval sleeve pressed around the rope end and the standing part.", role: "Locks the rope loop around the thimble to form the eye." },
  { id: "rope", short: "Wire rope", es: "Cable de acero", en: "Wire rope leg", what: "Stranded steel wire rope; the lay of the strands is visible along the leg.", role: "Carries tension between the lower eye at the shackle and the upper eye at the intermediate link." },
  { id: "shackle", short: "Shackle", es: "Grillete", en: "Bow shackle", what: "Rounded forged body whose two lugs are joined by a pin.", role: "Links the padeye to the lower rope eye." },
  { id: "shackle-pin", short: "Shackle pin", es: "Pasador del grillete", en: "Shackle pin", what: "Bolt-type pin with head, nut and a split pin.", role: "Passes through the padeye hole and both lugs; the nut and split pin stop it from backing out." },
  { id: "padeye", short: "Padeye", es: "Oreja de izaje", en: "Padeye", what: "Welded plate with a reinforced hole, one on each top corner.", role: "The anchor point where the lifting set meets the container." },
  { id: "corner-post", short: "Corner post", es: "Poste de esquina", en: "Corner post", what: "Vertical steel post at a corner of the frame.", role: "Carries the lift from the padeye down into the container frame." },
  { id: "container-frame", short: "Frame", es: "Estructura del contenedor", en: "Container frame", what: "Steel frame and corrugated panels of a generic offshore container.", role: "Holds the cargo and distributes the lift between its four top corners." },
];

export const kindOf = (id: KindId) => KINDS.find((kind) => kind.id === id)!;

export interface Component {
  id: string;
  kind: KindId;
  /** Instance label, e.g. "Padeye 2". */
  name: string;
  es: string;
  /** Leg number 1-4 when the part belongs to one leg. */
  leg?: number;
  /** Which end of the leg an eye termination belongs to. */
  end?: "lower" | "upper";
  /** Directly connected components. Symmetric, built from `link`. */
  connectsTo: string[];
  removable: boolean;
}

export const LEGS = [1, 2, 3, 4] as const;
/** Corner of each leg: sign of x and y on the container plan. */
export const CORNER: Record<number, [number, number]> = { 1: [-1, -1], 2: [-1, 1], 3: [1, -1], 4: [1, 1] };
/** Intermediate link (1 at -x, 2 at +x) that takes each leg. */
export const SUB_OF_LEG: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 2 };

const registry: Component[] = [];
const index = new Map<string, Component>();
const add = (kind: KindId, id: string, name: string, es: string, extra: Partial<Component> = {}) => {
  const component: Component = { id, kind, name, es, connectsTo: [], removable: kind !== "container-frame", ...extra };
  registry.push(component);
  index.set(id, component);
};
const link = (a: string, b: string) => {
  index.get(a)!.connectsTo.push(b);
  index.get(b)!.connectsTo.push(a);
};

add("hook", "hook", "Crane hook", "Gancho de grúa");
add("hook-latch", "hook-latch", "Hook latch", "Pestillo de seguridad");
add("master-link", "master-link", "Master link", "Argolla maestra");
for (const k of [1, 2]) add("sub-link", `sub-link-${k}`, `Intermediate link ${k}`, `Eslabón intermedio ${k}`);
for (const i of LEGS) {
  add("thimble", `thimble-up-${i}`, `Upper thimble ${i}`, `Guardacabos superior ${i}`, { leg: i, end: "upper" });
  add("ferrule", `ferrule-up-${i}`, `Upper ferrule ${i}`, `Casquillo superior ${i}`, { leg: i, end: "upper" });
  add("rope", `rope-${i}`, `Wire rope leg ${i}`, `Cable de acero ${i}`, { leg: i });
  add("ferrule", `ferrule-lo-${i}`, `Lower ferrule ${i}`, `Casquillo inferior ${i}`, { leg: i, end: "lower" });
  add("thimble", `thimble-lo-${i}`, `Lower thimble ${i}`, `Guardacabos inferior ${i}`, { leg: i, end: "lower" });
  add("shackle", `shackle-${i}`, `Bow shackle ${i}`, `Grillete ${i}`, { leg: i });
  add("shackle-pin", `shackle-pin-${i}`, `Shackle pin ${i}`, `Pasador del grillete ${i}`, { leg: i });
  add("padeye", `padeye-${i}`, `Padeye ${i}`, `Oreja de izaje ${i}`, { leg: i });
  add("corner-post", `corner-post-${i}`, `Corner post ${i}`, `Poste de esquina ${i}`, { leg: i });
}
add("container-frame", "container-frame", "Container frame", "Estructura del contenedor");

link("hook", "hook-latch");
link("hook", "master-link");
for (const i of LEGS) {
  link("master-link", `sub-link-${SUB_OF_LEG[i]}`);
  link(`sub-link-${SUB_OF_LEG[i]}`, `thimble-up-${i}`);
  link(`thimble-up-${i}`, `ferrule-up-${i}`);
  link(`ferrule-up-${i}`, `rope-${i}`);
  link(`rope-${i}`, `ferrule-lo-${i}`);
  link(`ferrule-lo-${i}`, `thimble-lo-${i}`);
  link(`thimble-lo-${i}`, `shackle-${i}`);
  link(`shackle-${i}`, `shackle-pin-${i}`);
  link(`shackle-pin-${i}`, `padeye-${i}`);
  link(`padeye-${i}`, `corner-post-${i}`);
  link(`corner-post-${i}`, "container-frame");
}
// The master link bar is shared by both intermediate links; the links are listed once.
for (const id of ["sub-link-1", "sub-link-2"]) index.get(id)!.connectsTo = [...new Set(index.get(id)!.connectsTo)];
index.get("master-link")!.connectsTo = [...new Set(index.get("master-link")!.connectsTo)];

export const COMPONENTS: readonly Component[] = registry;
export const componentOf = (id: string) => index.get(id);
export const idsOfKind = (kind: KindId) => registry.filter((component) => component.kind === kind).map((component) => component.id);

/**
 * One drawn instance per kind: the callout points at it and the legend, the
 * reference table and the guided list select it. Chosen so the callout labels
 * spread over both sides of the drawing.
 */
export const CALLOUT_REP: Record<KindId, string> = {
  hook: "hook",
  "hook-latch": "hook-latch",
  "master-link": "master-link",
  "sub-link": "sub-link-2",
  thimble: "thimble-up-3",
  ferrule: "ferrule-lo-1",
  rope: "rope-3",
  shackle: "shackle-4",
  "shackle-pin": "shackle-pin-1",
  padeye: "padeye-1",
  "corner-post": "corner-post-4",
  "container-frame": "container-frame",
};

/** Guided list: follow the connections from the crane down to the container. Not a load calculation. */
export const TOUR: { id: string; text: string }[] = [
  { id: "hook", text: "The crane hook takes the whole set; its latch closes the throat." },
  { id: "master-link", text: "The master link gathers the intermediate links. It has no pin." },
  { id: "sub-link-1", text: "Each intermediate link takes two legs, so four legs reach one master link." },
  { id: "rope-1", text: "A wire-rope leg carries tension between its two eyes." },
  { id: "shackle-1", text: "The shackle joins the lower rope eye to the padeye with a pinned bolt." },
  { id: "padeye-1", text: "The padeye is the welded anchor point on a top corner of the container." },
  { id: "container-frame", text: "The corner posts and frame spread the lift through the container." },
];

/** Components that must exist for the load to reach the container from the hook, per leg. */
export const loadChain = (leg: number): string[] => [
  "hook",
  "master-link",
  `sub-link-${SUB_OF_LEG[leg]}`,
  `thimble-up-${leg}`,
  `ferrule-up-${leg}`,
  `rope-${leg}`,
  `ferrule-lo-${leg}`,
  `thimble-lo-${leg}`,
  `shackle-${leg}`,
  `shackle-pin-${leg}`,
  `padeye-${leg}`,
  `corner-post-${leg}`,
];

// --- Layout (drawing units; not to scale, not dimensions of a real product) ---

export interface Variant {
  id: VariantId;
  label: string;
  /** Design angle of the legs from the vertical, in degrees. */
  angleDeg: number;
}

export const VARIANTS: Record<VariantId, Variant> = {
  a: { id: "a", label: "45° legs", angleDeg: 45 },
  b: { id: "b", label: "65° legs", angleDeg: 65 },
};

export const DEFAULT_VARIANT: VariantId = "a";

export const DIM = {
  length: 300,
  width: 120,
  height: 130,
  /** Padeye hole centre above the top face. */
  padeyeLift: 17,
  /** Padeye centre inset from the container's outer corner. */
  padeyeInsetX: 16,
  padeyeInsetY: 12,
  subX: 26,
  subHeight: 60,
  masterHeight: 96,
  hookRise: 66,
} as const;

export type Vec = [number, number, number];

export interface Layout {
  variant: Variant;
  /** Padeye hole centre of each leg. */
  padeye: Record<number, Vec>;
  /** Centre of the lower bar of each intermediate link (where two eyes hang). */
  subBottom: Record<number, Vec>;
  /** Centre of the upper bar of each intermediate link. */
  subTop: Record<number, Vec>;
  masterBottom: Vec;
  masterTop: Vec;
  hookBowl: Vec;
  hookTop: Vec;
  /** Angle from the vertical between the padeye hole and the upper contact, per leg. */
  legAngleDeg: Record<number, number>;
}

const deg = (radians: number) => (radians * 180) / Math.PI;

export function layoutOf(id: VariantId): Layout {
  const variant = VARIANTS[id];
  const padeyeZ = DIM.height + DIM.padeyeLift;
  const padeye: Record<number, Vec> = {};
  for (const i of LEGS) {
    const [sx, sy] = CORNER[i];
    padeye[i] = [sx * (DIM.length / 2 - DIM.padeyeInsetX), sy * (DIM.width / 2 - DIM.padeyeInsetY), padeyeZ];
  }
  // The rise of the intermediate links follows from the requested leg angle.
  const run = Math.hypot(Math.abs(padeye[1][0]) - DIM.subX, Math.abs(padeye[1][1]));
  const rise = run / Math.tan((variant.angleDeg * Math.PI) / 180);
  const subZ = padeyeZ + rise;
  const subBottom: Record<number, Vec> = { 1: [-DIM.subX, 0, subZ], 2: [DIM.subX, 0, subZ] };
  const subTop: Record<number, Vec> = { 1: [-DIM.subX, 0, subZ + DIM.subHeight], 2: [DIM.subX, 0, subZ + DIM.subHeight] };
  const masterBottom: Vec = [0, 0, subZ + DIM.subHeight];
  const masterTop: Vec = [0, 0, masterBottom[2] + DIM.masterHeight];
  const legAngleDeg: Record<number, number> = {};
  for (const i of LEGS) {
    const target = subBottom[SUB_OF_LEG[i]];
    const dx = target[0] - padeye[i][0];
    const dy = target[1] - padeye[i][1];
    legAngleDeg[i] = deg(Math.atan2(Math.hypot(dx, dy), target[2] - padeye[i][2]));
  }
  return { variant, padeye, subBottom, subTop, masterBottom, masterTop, hookBowl: masterTop, hookTop: [0, 0, masterTop[2] + DIM.hookRise], legAngleDeg };
}

// Validation rules live in `hoist-rules.ts`, a data-free module, so the page
// script can ship the logic alone and read this model as JSON.
export { ANGLE_LIMIT_DEG };
export type { Issue, KindId, ModelData, Report, Severity, State, VariantId } from "./hoist-rules.ts";

/** Illustrative messages for a missing component, by kind: [rule id, severity, text with {name}]. */
const MISSING: ModelData["missing"] = {
  "container-frame": ["CMP-FRAME", "error", "{name} is missing: there is nothing to lift."],
  "corner-post": ["CMP-POST", "error", "{name} is missing: the padeye has no structure behind it."],
  padeye: ["CMP-PADEYE", "error", "{name} is missing: the shackle has no anchor point."],
  shackle: ["CMP-SHACKLE", "error", "{name} is missing: the rope eye is not connected to the padeye."],
  "shackle-pin": ["CMP-PIN", "error", "{name} is missing: the shackle is not retained on the padeye."],
  thimble: ["CMP-THIMBLE", "error", "{name} is missing: the rope eye bends on a tight radius and can kink."],
  ferrule: ["CMP-FERRULE", "error", "{name} is missing: the rope end is not secured and the eye is open."],
  rope: ["CMP-ROPE", "error", "{name} is missing: the leg does not carry tension."],
  "sub-link": ["CMP-SUBLINK", "error", "{name} is missing: two legs have nothing to hang from."],
  "master-link": ["CMP-MASTER", "error", "{name} is missing: the hook has nothing to lift."],
  hook: ["CMP-HOOK", "error", "{name} is missing: the set has no connection to the crane."],
  "hook-latch": ["CMP-LATCH", "warning", "{name} is missing: the hook throat is open and the master link can slip out."],
};

/** Reproducible demo scenarios. */
export const SCENARIOS: { id: string; label: string; variant: VariantId; removed: string[] }[] = [
  { id: "complete", label: "Complete set", variant: "a", removed: [] },
  { id: "no-pin", label: "Shackle pin missing", variant: "a", removed: ["shackle-pin-2"] },
  { id: "no-ferrule", label: "Ferrule missing", variant: "a", removed: ["ferrule-up-3"] },
  { id: "no-latch", label: "Hook latch missing", variant: "a", removed: ["hook-latch"] },
  { id: "wide", label: "Legs too wide", variant: "b", removed: [] },
];

/** Everything the rules need, as plain data: built here once, shipped to the page as JSON. */
export const MODEL_DATA: ModelData = {
  components: COMPONENTS.map((component) => ({ id: component.id, kind: component.kind, name: component.name, es: component.es, removable: component.removable, connectsTo: component.connectsTo })),
  chains: Object.fromEntries(LEGS.map((leg) => [leg, loadChain(leg)])),
  angles: Object.fromEntries(Object.keys(VARIANTS).map((id) => [id, Math.round(layoutOf(id as VariantId).legAngleDeg[1] * 10) / 10])) as Record<VariantId, number>,
  missing: MISSING,
  scenarios: SCENARIOS,
};

export const validate = (state: State): Report => validateWith(MODEL_DATA, state);
