# Principles

## Rendering model
- `output: 'static'` (default). Every route prerendered.
- No SSR adapter. Server islands only with an approved, concrete need.
- Data comes from Content Collections at build time; no runtime fetching for page content.

## Islands policy
- Target state: **zero framework islands**. React and its ecosystem are removed in Phase 3.
- Interactivity is written as small vanilla TS modules in `src/scripts/` and loaded via `<script>` in `.astro` components (Astro bundles and dedupes them).
- Prefer platform primitives: `<dialog>` (modals, command palette), `popover` (menus), `<details>` (disclosure), CSS `:has()`/`:target` for state, CSS scroll-driven animations for reading progress.
- If a framework island is ever proposed, it needs user approval and a written comparison with a vanilla alternative.

## Progressive enhancement patterns
| Feature | Without JS | With JS |
|---|---|---|
| Mobile menu | `popover` / `<details>` works natively | Focus management polish |
| Command palette | Every action exists as a normal link | `⌘K` dialog with filtering |
| Theme | Follows system `prefers-color-scheme` | Manual toggle persisted in `localStorage` (try/catch) |
| Copy email / code | Text is selectable | Copy button + `aria-live` announcement |
| Page transitions | Normal navigation | Native cross-document view transitions (CSS only, no `ClientRouter`) |

## Performance defaults
- Images through `astro:assets` (`<Image>`/`<Picture>`) with explicit dimensions.
- Fonts: latin subset, preload primary, `font-display: swap`.
- `build.inlineStylesheets: 'auto'`.
- No layout shift from late-loading UI.

## Accessibility defaults
Semantic landmarks, skip link, one `h1`, ordered headings, visible focus, `aria-current="page"` for route nav only, reduced-motion respected, no color-only status.
