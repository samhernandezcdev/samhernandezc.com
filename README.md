# samhernandezc.com

Personal engineering portfolio of Samuel Hernández. Static site built with Astro.

## Stack

- Astro 7 (static output, no SSR adapter), MDX and Content Collections
- Tailwind CSS 4 (CSS-first design system in `src/styles/system.css`)
- TypeScript (strict)
- No client framework; a few hundred bytes of inline JavaScript

## Requirements

- Node.js >= 22.12.0
- npm

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run check` | Type-check `.astro` and `.ts` files (`astro check`) |
| `npm run test:content` | Content-model schema tests (`node --test`) |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |

## Structure

```
src/
  pages/        routes (`/` EN, `/es` ES, `/work`, `/work/[slug]`)
  layouts/      BaseLayout (head, SEO meta, hreflang, theme)
  components/   site shell, home sections, work/case-study components
  content/      work, notes and experience collections (MDX/YAML)
  i18n/         typed EN/ES UI strings
  lib/          content access and work schema rules
  styles/       design system (tokens, primitives, prose, code, diagrams)
public/         static files served as-is (favicon, CV PDFs)
```

Resume PDFs in `public/` must keep the exact filenames `Samuel-Hernandez-CV-EN.pdf` and `Samuel-Hernandez-CV-ES.pdf`; the site links them directly.

## Deployment

The production site is configured as `https://samhernandezc.com` (`site` in `astro.config.mjs`). Hosting and redirects are configured outside this repository.
