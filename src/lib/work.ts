import { z } from "astro/zod";

// Rules for the `work` collection. Kept free of `astro:content` imports so the
// schema and the collection-level checks can be tested with plain Node
// (see scripts/validate-content-model.ts). Policy: the status taxonomy of the
// engineering-case-study project skill.

export const lifecycleStatuses = [
  "research",
  "designing",
  "building",
  "production",
  "archived",
] as const;

export type LifecycleStatus = (typeof lifecycleStatuses)[number];

const nonEmpty = z.string().trim().min(1);
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");

/** Latency, throughput, benchmark/test results, retrieval or eval scores, cost. Allowed at any status. */
export const technicalMeasurementSchema = z
  .object({
    label: nonEmpty,
    value: nonEmpty,
    unit: nonEmpty.optional(),
    method: nonEmpty,
    environment: nonEmpty.optional(),
    verified: z.boolean(),
  })
  .strict();

/** Business impact, adoption, users, customer outcomes, revenue, production reliability. */
export const productionOutcomeSchema = z
  .object({
    label: nonEmpty,
    value: nonEmpty,
    source: nonEmpty,
    verified: z.boolean(),
  })
  .strict();

export const evidenceSchema = z
  .object({
    repo: z.url().optional(),
    readme: z.boolean().optional(),
    architectureDoc: nonEmpty.optional(),
    verticalSlice: nonEmpty.optional(),
  })
  .strict();

export const workSchema = z
  .object({
    // Identity
    title: nonEmpty,
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use kebab-case"),
    summary: nonEmpty,
    status: z.enum(lifecycleStatuses),
    source: z.enum(["open", "private"]),
    visibility: z.enum(["public", "draft"]).default("draft"),
    featured: z.boolean().default(false),
    order: z.number().int().default(100),
    wasProduction: z.boolean().optional(),

    // Role / context
    role: nonEmpty.optional(),
    /** Case-study header: the engineering areas the work centers on. */
    focus: nonEmpty.optional(),
    timeline: z.object({ start: yearMonth, end: yearMonth.optional() }).strict().optional(),
    stack: z.array(nonEmpty).default([]),
    org: nonEmpty.optional(),
    links: z.object({ github: z.url().optional(), demo: z.url().optional() }).strict().optional(),
    /** Case-study header image: `asset` names a light/dark pair rendered into
     * src/assets/work/<asset>-{light,dark}.png (scripts/hero-artifact.mjs).
     * Abstract illustration only: never a screenshot or product detail. */
    visual: z
      .object({ asset: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), alt: nonEmpty })
      .strict()
      .optional(),

    // Narrative (all optional: missing information is omitted, never padded)
    problem: nonEmpty.optional(),
    context: nonEmpty.optional(),
    constraints: z.array(nonEmpty).optional(),
    responsibility: nonEmpty.optional(),
    decisions: z
      .array(
        z
          .object({
            title: nonEmpty,
            problem: nonEmpty.optional(),
            choice: nonEmpty.optional(),
            why: nonEmpty,
            tradeoff: nonEmpty.optional(),
          })
          .strict(),
      )
      .optional(),
    results: z.array(nonEmpty).optional(),

    // Evidence and measurements
    evidence: evidenceSchema.optional(),
    technicalMeasurements: z.array(technicalMeasurementSchema).default([]),
    productionOutcomes: z.array(productionOutcomeSchema).default([]),

    // Spanish shell (Home / Work index only; case studies stay English-only)
    es: z
      .object({
        title: nonEmpty.optional(),
        summary: nonEmpty,
        problem: nonEmpty.optional(),
        role: nonEmpty.optional(),
        result: nonEmpty.optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const isPublic = data.visibility === "public";

    if (isPublic && (data.status === "research" || data.status === "designing")) {
      ctx.addIssue({
        code: "custom",
        path: ["visibility"],
        message: `A "${data.status}" project cannot be public; keep it as a draft.`,
      });
    }

    if (isPublic && data.status === "building") {
      const evidence = data.evidence;
      const missing = [
        !evidence?.repo && "evidence.repo",
        evidence?.readme !== true && "evidence.readme (true)",
        !evidence?.architectureDoc && "evidence.architectureDoc",
        !evidence?.verticalSlice && "evidence.verticalSlice",
      ].filter(Boolean);
      if (missing.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["evidence"],
          message: `A public "building" project needs the evidence bar. Missing: ${missing.join(", ")}.`,
        });
      }
    }

    if (data.wasProduction && data.status !== "archived") {
      ctx.addIssue({
        code: "custom",
        path: ["wasProduction"],
        message: "wasProduction only applies to archived projects.",
      });
    }

    const productionEligible =
      data.status === "production" || (data.status === "archived" && data.wasProduction === true);
    if (data.productionOutcomes.length > 0 && !productionEligible) {
      ctx.addIssue({
        code: "custom",
        path: ["productionOutcomes"],
        message:
          'productionOutcomes require status "production" (or "archived" with wasProduction: true).',
      });
    }

    if (data.featured && !isPublic) {
      ctx.addIssue({
        code: "custom",
        path: ["featured"],
        message: "Draft projects cannot be featured.",
      });
    }
  });

export type WorkData = z.infer<typeof workSchema>;

/** Collection-level rule: at most one public project may be `building` at a time. */
export function assertSinglePublicBuilding(entries: ReadonlyArray<{ id: string; data: WorkData }>) {
  const flagships = entries.filter(
    ({ data }) => data.visibility === "public" && data.status === "building",
  );
  if (flagships.length > 1) {
    throw new Error(
      `At most one public "building" project is allowed; found ${flagships.length}: ${flagships
        .map(({ id }) => id)
        .join(", ")}.`,
    );
  }
}

/** Drafts never reach production indexes, sitemap, RSS, command palette or featured work. */
export function isPublished(data: Pick<WorkData, "visibility">): boolean {
  return data.visibility === "public";
}

/** Unverified measurements and outcomes never render publicly. */
export function verifiedOnly<T extends { verified: boolean }>(items: ReadonlyArray<T>): T[] {
  return items.filter((item) => item.verified);
}
