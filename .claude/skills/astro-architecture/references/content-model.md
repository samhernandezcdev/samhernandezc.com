# Content model

Implemented in Phase 1. Defined in `src/content.config.ts` with the Content Layer API (`glob()` / `file()` loaders + zod). Check the official docs for the exact loader API of the installed Astro version.

## Collections
### `work` — `src/content/work/*.mdx`
- Identity/status: `title`, `slug`, `summary`, `status` (`research|designing|building|production|archived`), `source` (`open|private`), `visibility` (`public|draft`), `featured`, `order`, `wasProduction?`.
- Role/stack: `role`, `focus?` (case-study header), `timeline {start, end?}`, `stack[]`, `org?` (omitted when anonymized), `links {github?, demo?}`.
- Narrative (optional): `problem` (one sentence, used by rows), `context`, `constraints[]`, `responsibility`, `decisions[] {title, problem?, choice?, why, tradeoff?}`, `results[]` (qualitative; the first is the row's result line when no verified measurement exists).
- Case-study body: the MDX body is the case study. It imports `@/components/work/Decision.astro` and `@/components/work/SystemDiagram.astro`; an entry has a case study when its body is non-empty (`hasCaseStudy`).
- Evidence: `evidence? {repo, readme, architectureDoc?, verticalSlice?}`.
- Measurements: `technicalMeasurements[]`, `productionOutcomes[]` — exact shapes and rules in `.claude/skills/engineering-case-study/references/honesty-rules.md`.
- `diagram?` (SystemDiagram data), `es? {title?, summary, problem?, role?, result?}` for the Spanish Home and Work index rows.
- Zod `superRefine` + collection-level check enforce the lifecycle rules in `engineering-case-study/references/status-taxonomy.md`.

### `notes` — `src/content/notes/*.mdx`
`title`, `description`, `pubDate`, `updated?`, `tags[]`, `draft`. Reading time computed at build. Notes are hidden from Home/nav until at least one is published.

### `experience` — `src/content/experience.yaml`
`role`, `org`, `period`, `problem`, `owned`, `built`, `changed`, `es?`.

## Draft handling
`src/lib/content.ts` is the only module that calls `getCollection`: `getPublishedWork`, `getFeaturedWork`, `getPublishedNotes`, `getExperience`, `caseStudyPath`. Drafts never reach production output. One dev-only exception: `getCaseStudyEntries` also routes draft case studies in `astro dev` (with a visible draft notice and `noindex`) so they can be reviewed before promotion.

## Routes
- `/`, `/es`: homepage. The evidence section is "Selected work" once a featured case study is public, otherwise "Selected experience".
- `/work`, `/es/work`: Work index (ledger of published entries).
- `/work/[slug]`: case study, English-only. Linked from Spanish pages with an `EN` marker and `hreflang="en"`.
- `/notes`, `/notes/[slug]`: English-only. No `/es/notes`. Header and homepage show Notes only when `getPublishedNotes()` is non-empty; on Spanish pages the Notes link carries `EN`.
- `/rss.xml`: published notes only (`@astrojs/rss`, no trailing slash to match canonicals). Autodiscovery `<link>` only when the feed has items.
- Reading time: `readingMinutes()` in `src/lib/content.ts`, build-time, ~230 wpm over prose words (code fences, imports and tags excluded).
- Notes JSON-LD: `TechArticle` on published note pages (headline, description, dates, author Person, keywords).

## i18n
- English is canonical at `/`. Spanish shells: `/es`, `/es/work`, `/es/about`.
- Case studies and notes are English-only; links to them from ES pages carry an "EN" label and `hreflang="en"`.
- hreflang alternates only between pages that exist in both languages, plus `x-default` → EN.
- UI strings in `src/i18n/ui.ts` as `{ en, es }`, with `satisfies` enforcing key parity.
- `/en` → `/` via `redirects` in `astro.config.mjs`; host-level 301s are configured outside the repo.

## Canonical domain
`site: 'https://samhernandezc.com'`. BKODE is a separate brand at `https://bkode.lat`.
