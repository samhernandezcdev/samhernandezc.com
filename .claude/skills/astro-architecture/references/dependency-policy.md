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
| `@astrojs/rss` | Notes feed (when first note ships) | no | 5 |
| `@astrojs/check` + `typescript` (dev) | `astro check` | no | 0 |
| `@fontsource-variable/geist-mono` | Consistent mono font | no (font file) | 2 |
| `@playwright/test` (dev) | Screenshots for visual-review; smoke tests | no | −1 |
| `@axe-core/playwright` (dev) | Accessibility tests | no | 8 |

Built-in Shiki is used for code highlighting — no extra package.

## Rejected
| Package | Reason |
|---|---|
| `astro-expressive-code` | Ships JS/CSS; a ~20-line copy script on Shiki suffices |
| Mermaid | Very large client JS or headless build; `SystemDiagram` + hand SVG instead |
| cmdk / kbar / ninja-keys | 10–40 KB; native `<dialog>` + small TS instead |
| Pagefind | Not worth it until ~15+ notes |
| React / Vue / Preact islands | Nothing requires them |
| ESLint / Prettier | Not requested; `astro check` covers types |
| Any CMS | Content is MDX in the repo |

## Removed in Phase 3
`react`, `react-dom`, `@astrojs/react`, `@types/react*`, `radix-ui`, `shadcn`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react`, `lucide-astro`, `astro-icon`, `@iconify-json/simple-icons`. Icons are inline SVG components in `src/components/icons/` (`@lucide/astro` was not needed).

## Undecided
Analytics — privacy-friendly, cookieless; choice depends on hosting (not yet confirmed).

## Claude tooling is never a runtime dependency
`.claude/`, `scripts/screenshot.mjs` and Playwright are dev tooling. Nothing in `src/` imports them.
