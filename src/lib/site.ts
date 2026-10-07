// The production origin. Single source for astro.config.mjs (`site`) and for
// every absolute URL the build emits (canonical, hreflang, Open Graph, JSON-LD,
// RSS, sitemap, robots.txt).
export const SITE_ORIGIN = "https://samhernandezc.bkode.lat";

/** Astro.site is always set from the config; the origin is a typed fallback. */
export const siteUrl = (site: URL | undefined): URL => site ?? new URL(SITE_ORIGIN);
