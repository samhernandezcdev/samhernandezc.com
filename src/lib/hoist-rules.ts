// Illustrative, deterministic rules of the lifting-set demo, written against
// plain data (`ModelData`) so the page script can ship only this logic and read
// the data as JSON. The data comes from `hoist-model.ts`.
// The limit below is made up for the demo. It is not a rated or standard value.

export type VariantId = "a" | "b";
export type Severity = "error" | "warning" | "info";
export type KindId =
  | "container-frame"
  | "corner-post"
  | "padeye"
  | "shackle"
  | "shackle-pin"
  | "thimble"
  | "ferrule"
  | "rope"
  | "sub-link"
  | "master-link"
  | "hook"
  | "hook-latch";

export interface Issue {
  ruleId: string;
  severity: Severity;
  ids: string[];
  message: string;
}

export interface State {
  variant: VariantId;
  removed: readonly string[];
}

export interface Report {
  valid: boolean;
  angleDeg: number;
  issues: Issue[];
}

export interface ModelData {
  components: { id: string; kind: KindId; name: string; es: string; removable: boolean; connectsTo: string[] }[];
  /** Components the load passes through, per leg, from the hook to the container. */
  chains: Record<string, string[]>;
  /** Leg angle from the vertical per variant, in degrees. */
  angles: Record<VariantId, number>;
  /** [rule id, severity, text with {name}] per component kind. */
  missing: Record<KindId, [string, Severity, string]>;
  scenarios: { id: string; label: string; variant: VariantId; removed: string[] }[];
}

/** Illustrative demo limit on the leg angle from the vertical. */
export const ANGLE_LIMIT_DEG = 60;

export function validateWith(data: ModelData, state: State): Report {
  const removed = new Set(state.removed);
  const angleDeg = data.angles[state.variant];
  const issues: Issue[] = [];

  for (const component of data.components) {
    if (!removed.has(component.id)) continue;
    const [ruleId, severity, text] = data.missing[component.kind];
    issues.push({ ruleId, severity, ids: [component.id], message: text.replace("{name}", component.name) });
  }

  const legs = Object.keys(data.chains);
  const broken = legs.filter((leg) => data.chains[leg].some((id) => removed.has(id)));
  if (broken.length > 0) {
    const ids = broken.flatMap((leg) => data.chains[leg].filter((id) => removed.has(id)));
    issues.push({
      ruleId: "PATH-01",
      severity: "error",
      ids: ids.filter((id, at) => ids.indexOf(id) === at),
      message: `Load path from the hook to the container is interrupted on leg ${broken.join(", ")}.`,
    });
  }

  if (angleDeg > ANGLE_LIMIT_DEG) {
    issues.push({
      ruleId: "GEO-01",
      severity: "error",
      ids: [],
      message: `Leg angle ${angleDeg}° from the vertical exceeds the illustrative demo limit of ${ANGLE_LIMIT_DEG}°. Real limits come from the set's own documentation.`,
    });
  }

  issues.push({
    ruleId: "LOAD-00",
    severity: "info",
    ids: [],
    message: "Four-leg load sharing is statically indeterminate. Tension per leg is not calculated or validated in this demo.",
  });

  const rank: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
  issues.sort((a, b) => rank[a.severity] - rank[b.severity] || a.ruleId.localeCompare(b.ruleId) || (a.ids[0] ?? "").localeCompare(b.ids[0] ?? ""));
  return { valid: !issues.some((issue) => issue.severity === "error"), angleDeg, issues };
}
