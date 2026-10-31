// The article's lifting-set figure as a cacheable image, one file per theme:
// view 0, no callouts, no marks for removed parts. An <img> cannot see the
// page's CSS, so each file embeds the colour tokens (src/styles/system/tokens.css)
// and their Anatomy mapping (hoist-figure.css) with its colour scheme fixed.
import type { APIRoute, GetStaticPaths } from "astro";
import mapping from "@/components/work/hoist-figure.css?raw";
import kit from "@/lib/anatomy/figure.css?raw";
import { buildFigure } from "@/lib/hoist-figure.mjs";
import tokens from "@/styles/system/tokens.css?raw";

export const getStaticPaths = (() => [{ params: { theme: "light" } }, { params: { theme: "dark" } }]) satisfies GetStaticPaths;

/** Custom-property declarations whose name starts with `--${prefix}`. */
const declarations = (css: string, prefix: string) =>
  [...css.matchAll(new RegExp(`(--${prefix}[\\w-]*):\\s*([^;]+);`, "g"))].map(([, name, value]) => `${name}:${value}`).join(";");

export const GET: APIRoute = ({ params }) => {
  const { svg } = buildFigure("a", { callouts: false, ghosts: false });
  const style = `:root{color-scheme:${params.theme};${declarations(tokens, "color-")};${declarations(mapping, "anatomy-")};background:var(--color-surface-raised)}${kit}.iso-halo{filter:none;opacity:.1}`;
  return new Response(svg.replace(/<svg([^>]*)>/, `<svg xmlns="http://www.w3.org/2000/svg"$1><style><![CDATA[${style}]]></style>`), {
    headers: { "Content-Type": "image/svg+xml" },
  });
};
