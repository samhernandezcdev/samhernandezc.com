// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { SITE_ORIGIN } from "./src/lib/site.ts";
import { syntaxDark, syntaxLight } from "./src/styles/system/syntax-themes.mjs";

/**
 * Dev-only routes (design-system preview). Never registered for builds.
 * @type {import("astro").AstroIntegration}
 */
const devPages = {
  name: "dev-pages",
  hooks: {
    "astro:config:setup": ({ command, injectRoute }) => {
      if (command !== "dev") return;
      injectRoute({ pattern: "/dev/design-system", entrypoint: "./src/dev/design-system.astro" });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: SITE_ORIGIN,
  integrations: [
    mdx(),
    // Canonical, indexable pages only. Drafts never produce routes in builds
    // (src/lib/content.ts) and dev pages are injected only for `astro dev`;
    // the /en redirect stub (noindex) and the 404 are filtered here.
    sitemap({
      filter: (page) => !/\/(en|404)\/?$/.test(new URL(page).pathname),
      i18n: { defaultLocale: "en", locales: { en: "en", es: "es" } },
      // Match the canonical URLs (no trailing slash except the root).
      serialize: (item) => {
        const strip = (/** @type {string} */ url) => url.replace(/(?<=[^/])\/$/, "").replace(/^(https:\/\/[^/]+)$/, "$1/");
        item.url = strip(item.url);
        item.links = item.links?.map((link) => ({ ...link, url: strip(link.url) }));
        return item;
      },
    }),
    devPages,
  ],
  // English is canonical at /. The former English page /en now redirects there.
  redirects: { "/en": "/" },
  markdown: {
    shikiConfig: {
      // Token-derived, low-chroma themes; colors switch via light-dark() in code.css.
      themes: { light: syntaxLight, dark: syntaxDark },
      defaultColor: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});