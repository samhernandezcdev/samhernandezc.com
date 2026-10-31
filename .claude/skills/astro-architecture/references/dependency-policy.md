# Dependency policy

## Criteria for adding anything
A dependency is added only if all hold:
1. It solves a real, current need (not "might be useful").
2. A platform feature or Astro built-in can't do it reasonably.
3. Runtime impact is known; client JS is justified via the JS gate.
4. It is actively maintained and compatible with the installed Astro version (check before installing).

Record each decision as a row below: package · purpose · benefit · runtime impact · client JS? · alternative without it · verdict.

## Approved (planned)
| Package | Purpose | Client JS? | Phase |
|---|---|---|---|
| `astro` 5 → 7 | Current Content Layer, MDX 8 compatibility (requires Node ≥ 22.12) | no | 0 |
| `@astrojs/mdx` | Components inside case studies/notes | no | 1 |
| `@astrojs/sitemap` | Sitemap with i18n alternates | no | 8 |
| `@astrojs/rss` | Notes feed (added with the first note) | no | 5 |
| `@astrojs/check` + `typescript` (dev) | `astro check` | no | 0 |
| `@fontsource-variable/geist-mono` | Consistent mono font | no (font file) | 2 |
| `@playwright/test` (dev) | Screenshots for visual-review; smoke tests | no | −1 |
| `@axe-core/playwright` (dev) | Accessibility tests | no | 8 |
| `three` (dev) | Offline render of the Hero artifact in `scripts/hero-artifact.mjs` (stills + loop frames). Alternative: hand-written WebGL (far more code for the same output). Never shipped: no import from `src/`, zero runtime | no | 9 |
| Anatomy kit (`src/lib/anatomy/`, MIT, copied with its LICENSE; not an npm package) | Build-time isometric SVG generation for `HoistDemo.astro` (solids, lathe parts, tubes). Alternative: hand-written projection and shading (far more code). Imported only from Astro frontmatter and tests, never from a client `<script>`: zero bytes shipped | no | lifting-set demo |
| `webm-muxer` (dev) | Packages the WebCodecs VP9 frames of the Hero loop into WebM in the same script (Chromium has no built-in muxer; no ffmpeg on the machine). Never shipped | no | 9 |

Built-in Shiki is used for code highlighting — no extra package.

## Rejected
| Package | Reason |
|---|---|
| `astro-expressive-code` | Ships JS/CSS; a ~20-line copy script on Shiki suffices |
| Mermaid | Very large client JS or headless build; `SystemDiagram` + hand SVG instead |
| cmdk / kbar / ninja-keys | 10–40 KB; native `<dialog>` + small TS instead |
| Pagefind | Not worth it until ~15+ notes |
| React / Vue / Preact islands | Nothing requires them |
| Framer Motion / Motion One / GSAP or any animation library | Every motion on the site (fades, 2–4px drops, the switch thumb, the ↗ nudge, rule emphasis, page cross-fades) is CSS transitions, `@starting-style` and native view transitions. Framer Motion would also need a React runtime, multiplying the site's ~3 KB of JS |
| ESLint / Prettier | Not requested; `astro check` covers types |
| Any CMS | Content is MDX in the repo |

## Icons
Lucide path data is copied into `src/components/icons/Icon.astro` (ISC license, credited in the file): no `lucide` / `@lucide/astro` package, no client JS. Add a glyph by copying its paths into the map.

## Removed in Phase 3
`react`, `react-dom`, `@astrojs/react`, `@types/react*`, `radix-ui`, `shadcn`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react`, `lucide-astro`, `astro-icon`, `@iconify-json/simple-icons`. Icons are inline SVG components in `src/components/icons/` (`@lucide/astro` was not needed).

## Undecided
Analytics — privacy-friendly, cookieless; choice depends on hosting (not yet confirmed).

## Claude tooling is never a runtime dependency
`.claude/`, `scripts/screenshot.mjs` and Playwright are dev tooling. Nothing in `src/` imports them.
