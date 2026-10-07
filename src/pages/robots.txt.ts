import type { APIRoute } from "astro";

import { siteUrl } from "@/lib/site";

// Generated from the configured site so the sitemap URL always matches the origin.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap-index.xml", siteUrl(site)).href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
