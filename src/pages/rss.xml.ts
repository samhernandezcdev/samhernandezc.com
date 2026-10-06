import rss from "@astrojs/rss";
import type { APIContext } from "astro";

import { getPublishedNotes } from "@/lib/content";

// Engineering notes feed. Published notes only (drafts never reach it).
export async function GET(context: APIContext) {
  const notes = await getPublishedNotes();
  return rss({
    title: "Engineering notes · Samuel Hernández",
    description:
      "Notes on backend systems, correctness, reliability and applied AI engineering by Samuel Hernández.",
    site: context.site ?? "https://samhernandezc.com",
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.pubDate,
      link: `/notes/${note.id}`,
      categories: note.data.tags,
    })),
    customData: "<language>en</language>",
    // Match canonical URLs (no trailing slash).
    trailingSlash: false,
  });
}
