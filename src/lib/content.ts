import { getCollection, type CollectionEntry } from "astro:content";

import { isPublished } from "@/lib/work";

// The only place pages read collections. Drafts never leave this module in
// production builds, so indexes, the homepage, sitemap, RSS and the palette
// share one rule. (Dev-only exception: getCaseStudyEntries previews drafts.)

export async function getPublishedWork(): Promise<CollectionEntry<"work">[]> {
  const entries = await getCollection("work", ({ data }) => isPublished(data));
  return entries.sort((a, b) => a.data.order - b.data.order);
}

/** A work entry has a case study when its MDX body has content. */
export function hasCaseStudy(entry: CollectionEntry<"work">): boolean {
  return Boolean(entry.body?.trim());
}

export function caseStudyPath(entry: CollectionEntry<"work">): string | undefined {
  return isPublished(entry.data) && hasCaseStudy(entry) ? `/work/${entry.id}` : undefined;
}

/**
 * Entries that get a case-study route. Production builds: published only.
 * `astro dev`: drafts too, so a case study can be reviewed before promotion.
 */
export async function getCaseStudyEntries(): Promise<CollectionEntry<"work">[]> {
  const entries = await getCollection("work", (entry) =>
    import.meta.env.DEV ? true : isPublished(entry.data),
  );
  return entries.filter(hasCaseStudy);
}

export async function getFeaturedWork() {
  return (await getPublishedWork()).filter(({ data }) => data.featured);
}

export async function getPublishedNotes(): Promise<CollectionEntry<"notes">[]> {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  return notes.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Experience in reverse chronological order (most recent first). */
export async function getExperience(): Promise<CollectionEntry<"experience">[]> {
  const entries = await getCollection("experience");
  return entries.sort((a, b) => b.data.period.start.localeCompare(a.data.period.start));
}

/** Rough reading time from the raw MDX body (≈ 230 words per minute). */
export function readingMinutes(body: string | undefined): number {
  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
