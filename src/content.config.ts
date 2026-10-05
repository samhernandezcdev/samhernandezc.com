import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";

import { assertSinglePublicBuilding, workSchema, type WorkData } from "@/lib/work";

const workGlob = glob({ pattern: "**/*.mdx", base: "./src/content/work" });

// Wraps glob() so the cross-entry rule runs on every sync (dev, check, build).
const workLoader = {
  name: "work-loader",
  load: async (context) => {
    await workGlob.load(context);
    assertSinglePublicBuilding(
      context.store.values().map(({ id, data }) => ({ id, data: data as WorkData })),
    );
  },
} satisfies Loader;

const work = defineCollection({
  loader: workLoader,
  schema: workSchema,
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/notes" }),
  schema: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      pubDate: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string().trim().min(1)).default([]),
      draft: z.boolean().default(true),
    })
    .strict(),
});

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");
const localized = z
  .object({
    role: z.string().trim().min(1).optional(),
    problem: z.string().trim().min(1).optional(),
    owned: z.string().trim().min(1).optional(),
    built: z.array(z.string().trim().min(1)).optional(),
    changed: z.string().trim().min(1).optional(),
  })
  .strict();

const experience = defineCollection({
  loader: file("src/content/experience.yaml"),
  schema: z
    .object({
      id: z.string(),
      role: z.string().trim().min(1),
      org: z.string().trim().min(1),
      location: z.string().trim().min(1).optional(),
      period: z.object({ start: yearMonth, end: yearMonth.optional() }).strict(),
      problem: z.string().trim().min(1).optional(),
      owned: z.string().trim().min(1).optional(),
      built: z.array(z.string().trim().min(1)).default([]),
      changed: z.string().trim().min(1).optional(),
      stack: z.array(z.string().trim().min(1)).default([]),
      es: localized.optional(),
    })
    .strict(),
});

export const collections = { work, notes, experience };
