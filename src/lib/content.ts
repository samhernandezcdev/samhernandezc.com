import { getCollection, type CollectionEntry } from "astro:content";

import { isPublished } from "@/lib/work";

// The only place pages read collections. Drafts never leave this module, so
// indexes, the homepage, sitemap, RSS and the palette share one rule.

export async function getPublishedWork(): Promise<CollectionEntry<"work">[]> {
  const entries = await getCollection("work", ({ data }) => isPublished(data));
  return entries.sort((a, b) => a.data.order - b.data.order);
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
