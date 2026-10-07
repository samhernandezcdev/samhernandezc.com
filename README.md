# samhernandezc.bkode.lat

Personal engineering portfolio of Samuel Hernández. Static site built with Astro.

## Stack

- Astro 7 (static output, no SSR adapter), MDX and Content Collections
- Tailwind CSS 4 (CSS-first design system in `src/styles/system.css`)
- TypeScript (strict)
- No client framework; about 2–3 KB (gzipped) of inline JavaScript per page

## Requirements

- Node.js >= 22.12.0
- npm

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run check` | Type-check `.astro` and `.ts` files (`astro check`) |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run test:content` | Content-model schema tests (`node --test`) |
| `npm run test:e2e` | Playwright tests against the build: interaction, axe accessibility, metadata (`tests/e2e/`) |
| `npm run test:budget` | Fails if any built page ships more than 6 KB gzipped first-party JS |

First run of the e2e suite: `npx playwright install chromium`.

## Release validation

Run in this order (the same sequence as CI, `.github/workflows/ci.yml`):

```sh
npm ci
npm run check
npm run build
npm run test:content
npm run test:e2e
npm run test:budget
```

Automated checks do not replace a manual pass before release: keyboard focus order, the search dialog (Ctrl/⌘ K), theme switch and preference menu semantics, the case-study sticky rail and scroll-spy, Architecture Trace, reduced motion, and 390/320 px layouts in light and dark.

Known build output: Vite prints `MODULE_LEVEL_DIRECTIVE` warnings for MDX content entries (`"use astro:head-inject"`). The directive is a marker inside Astro's own generated content-asset modules; Astro detects head propagation independently (`__astroPropagation`), and the built pages keep their component styles. Upstream, no production effect; not suppressed.

## Structure

```
src/
  pages/        routes (`/` EN, `/es` ES, `/work`, `/work/[slug]`, `/notes`, `/about`, 404, rss.xml, robots.txt)
  layouts/      BaseLayout (head, SEO meta, hreflang, theme)
  components/   site shell, home sections, work/case-study components
  content/      work, notes and experience collections (MDX/YAML)
  i18n/         typed EN/ES UI strings
  lib/          site origin, content access, work schema rules, structured data
  styles/       design system (tokens, primitives, prose, code, diagrams)
public/         static files served as-is (favicon, CV PDFs, og-default.png)
scripts/        content-model tests, JS budget check, dev-only tools (screenshots, share image)
tests/e2e/      committed Playwright product tests
```

Resume PDFs in `public/` must keep the exact filenames `Samuel-Hernandez-CV-EN.pdf` and `Samuel-Hernandez-CV-ES.pdf`; the site links them directly.

## Deployment

The production origin is `https://samhernandezc.bkode.lat`, defined once as `SITE_ORIGIN` in `src/lib/site.ts` and used for `site` in `astro.config.mjs`. Canonical URLs, hreflang, Open Graph, JSON-LD, RSS, the sitemap (`/sitemap-index.xml`) and `robots.txt` all derive from it.

Hosting is configured outside this repository (there is no host configuration here). Required at the host:

- **`/en` → `/` as an HTTP 301.** The build only emits a fallback page at `/en/` (meta refresh, `noindex`, canonical `/`), which is not a real redirect.
- Serve `dist/404.html` for unknown paths with status 404.

The share image `public/og-default.png` is rendered by `node scripts/og-image.mjs` and committed; re-run it only if the name, role or domain changes.
