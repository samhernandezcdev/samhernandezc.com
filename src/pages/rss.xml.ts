import rss from "@astrojs/rss";
import type { APIContext } from "astro";

import { getPublishedNotes } from "@/lib/content";
import { siteUrl } from "@/lib/site";

// Engineering notes feed. Published notes only (drafts never reach it).
export async function GET(context: APIContext) {
  const notes = await getPublishedNotes();
  return rss({
    title: "Engineering notes · Samuel Hernández",
    description:
      "Notes on backend systems, correctness, reliability and applied AI engineering by Samuel Hernández.",
    site: siteUrl(context.site),
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
