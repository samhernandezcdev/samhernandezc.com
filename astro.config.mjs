// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import react from '@astrojs/react';
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
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
  site: "https://samhernandezc.com",
  integrations: [react(), icon(), mdx(), devPages],
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