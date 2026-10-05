# Content model

Implemented in Phase 1. Defined in `src/content.config.ts` with the Content Layer API (`glob()` / `file()` loaders + zod). Check the official docs for the exact loader API of the installed Astro version.

## Collections
### `work` — `src/content/work/*.mdx`
- Identity/status: `title`, `slug`, `summary`, `status` (`research|designing|building|production|archived`), `source` (`open|private`), `visibility` (`public|draft`), `featured`, `order`, `wasProduction?`.
- Role/stack: `role`, `timeline {start, end?}`, `stack[]`, `org?` (omitted when anonymized), `links {github?, demo?}`.
- Narrative (optional): `problem`, `context`, `constraints[]`, `responsibility`, `decisions[] {title, why, tradeoff?}`, `results[]`.
- Evidence: `evidence? {repo, readme, architectureDoc?, verticalSlice?}`.
- Measurements: `technicalMeasurements[]`, `productionOutcomes[]` — exact shapes and rules in `.claude/skills/engineering-case-study/references/honesty-rules.md`.
- `diagram?` (SystemDiagram data), `es? {title, summary}`.
- Zod `superRefine` + collection-level check enforce the lifecycle rules in `engineering-case-study/references/status-taxonomy.md`.

### `notes` — `src/content/notes/*.mdx`
`title`, `description`, `pubDate`, `updated?`, `tags[]`, `draft`. Reading time computed at build. Notes are hidden from Home/nav until at least one is published.

### `experience` — `src/content/experience.yaml`
`role`, `org`, `period`, `problem`, `owned`, `built`, `changed`, `es?`.

## Draft handling
A single helper (e.g. `src/lib/work.ts`) loads collections and filters `visibility: 'draft'` / `draft: true` out of production builds (`import.meta.env.PROD`). Every page, the sitemap, RSS and the command palette use that helper — never `getCollection` directly.

## i18n
- English is canonical at `/`. Spanish shells: `/es`, `/es/work`, `/es/about`.
- Case studies and notes are English-only; links to them from ES pages carry an "EN" label and `hreflang="en"`.
- hreflang alternates only between pages that exist in both languages, plus `x-default` → EN.
- UI strings in `src/i18n/ui.ts` as `{ en, es }`, with `satisfies` enforcing key parity.
- `/en` → `/` via `redirects` in `astro.config.mjs`; host-level 301s are configured outside the repo.

## Canonical domain
`site: 'https://samhernandezc.com'`. BKODE is a separate brand at `https://bkode.lat`.
