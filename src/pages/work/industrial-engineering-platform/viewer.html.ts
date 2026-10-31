// Static HTML fragment of the lifting-set viewer (a <dialog> and its data),
// fetched by the viewer chunk when the reader opens it. Not a page: no layout,
// not linked, not in the sitemap.
import type { APIRoute } from "astro";
import { viewerMarkup } from "@/components/work/hoist-viewer-markup";

export const GET: APIRoute = () => new Response(viewerMarkup(), { headers: { "Content-Type": "text/html; charset=utf-8" } });
