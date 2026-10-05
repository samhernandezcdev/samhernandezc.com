// Schema tests for the work content model. Runs with plain Node (>= 22.18 strips
// TypeScript types natively) and node:test — no test framework dependency.
// Usage: npm run test:content
import { test } from "node:test";
import assert from "node:assert/strict";

import { assertSinglePublicBuilding, workSchema, type WorkData } from "../src/lib/work.ts";

const base = {
  title: "Example",
  slug: "example",
  summary: "Example project.",
  source: "open",
} as const;

const fullEvidence = {
  repo: "https://github.com/example/example",
  readme: true,
  architectureDoc: "docs/architecture.md",
  verticalSlice: "Upload a document and get a cited answer end to end.",
};

const measurement = {
  label: "p95 latency",
  value: "180",
  unit: "ms",
  method: "k6, 1k requests, local",
  verified: true,
};

const outcome = { label: "Users", value: "40", source: "analytics", verified: true };

function errors(input: unknown): string[] {
  const result = workSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

test("1. research + public is invalid", () => {
  assert.deepEqual(errors({ ...base, status: "research", visibility: "public" }), ["visibility"]);
});

test("2. designing + public is invalid", () => {
  assert.deepEqual(errors({ ...base, status: "designing", visibility: "public" }), ["visibility"]);
});

test("3. public building without evidence is invalid", () => {
  assert.deepEqual(errors({ ...base, status: "building", visibility: "public" }), ["evidence"]);
  assert.deepEqual(
    errors({
      ...base,
      status: "building",
      visibility: "public",
      evidence: { ...fullEvidence, readme: false },
    }),
    ["evidence"],
  );
});

test("4. public building with complete evidence is valid", () => {
  assert.deepEqual(
    errors({ ...base, status: "building", visibility: "public", evidence: fullEvidence }),
    [],
  );
});

test("5. technicalMeasurement on a non-production project is valid", () => {
  assert.deepEqual(
    errors({ ...base, status: "research", visibility: "draft", technicalMeasurements: [measurement] }),
    [],
  );
});

test("5b. technicalMeasurement without method is invalid", () => {
  const { method: _method, ...withoutMethod } = measurement;
  assert.deepEqual(
    errors({ ...base, status: "building", technicalMeasurements: [withoutMethod] }),
    ["technicalMeasurements.0.method"],
  );
});

test("6. productionOutcome on a non-production project is invalid", () => {
  for (const status of ["research", "designing", "building", "archived"]) {
    assert.deepEqual(
      errors({ ...base, status, visibility: "draft", productionOutcomes: [outcome] }),
      ["productionOutcomes"],
      status,
    );
  }
});

test("7. productionOutcome on archived + wasProduction is valid", () => {
  assert.deepEqual(
    errors({ ...base, status: "archived", wasProduction: true, productionOutcomes: [outcome] }),
    [],
  );
  assert.deepEqual(errors({ ...base, status: "production", productionOutcomes: [outcome] }), []);
});

test("8. two public building entries fail collection validation", () => {
  const entry = (id: string) => ({
    id,
    data: workSchema.parse({
      ...base,
      slug: id,
      status: "building",
      visibility: "public",
      evidence: fullEvidence,
    }) as WorkData,
  });
  assert.throws(() => assertSinglePublicBuilding([entry("a"), entry("b")]), /At most one public/);
  assert.doesNotThrow(() => assertSinglePublicBuilding([entry("a")]));
});

test("drafts default and cannot be featured", () => {
  const parsed = workSchema.parse({ ...base, status: "designing" });
  assert.equal(parsed.visibility, "draft");
  assert.deepEqual(errors({ ...base, status: "designing", featured: true }), ["featured"]);
});
