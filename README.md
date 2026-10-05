# samhernandezc.com

Personal engineering portfolio of Samuel Hernández. Static site built with Astro.

## Stack

- Astro 7 (static output, no SSR adapter)
- Tailwind CSS 4 (CSS-first configuration in `src/styles/global.css`)
- TypeScript (strict)
- React islands for the current header and contact form (scheduled for removal)

## Requirements

- Node.js >= 22.12.0
- npm

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run check` | Type-check `.astro`, `.ts` and `.tsx` files (`astro check`) |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |

## Structure

```
src/
  pages/        routes (`/` ES, `/en` EN)
  layouts/      BaseLayout (head, SEO meta, hreflang)
  components/   layout, sections, features, ui primitives
  i18n/         typed ES/EN content
  styles/       Tailwind theme and global CSS
  assets/       images processed by astro:assets
public/         static files served as-is (favicon, CV PDFs)
```

Resume PDFs must keep the exact filenames listed in `public/README.md`.

## Deployment

The production site is configured as `https://samhernandezc.com` (`site` in `astro.config.mjs`). Hosting and redirects are configured outside this repository.
