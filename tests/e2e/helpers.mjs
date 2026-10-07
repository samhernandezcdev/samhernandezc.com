import { expect } from "@playwright/test";

export const CASE = "/work/industrial-engineering-platform";
export const NOTE = "/notes/deterministic-rules-changing-data";

/** Every public, indexable route of the production build. */
export const ROUTES = ["/", "/work", CASE, "/notes", NOTE, "/about", "/es", "/es/work", "/es/about"];

/** Soft assertion with a readable label; the test keeps running and reports all failures. */
export const check = (name, condition, detail = "") =>
  expect.soft(Boolean(condition), detail ? `${name} :: ${detail}` : name).toBe(true);
