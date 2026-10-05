# Component anatomy

Visual anatomy only. What text and claims may appear is governed by `engineering-case-study`.
All components are static `.astro` unless `astro-architecture` approves client JS.

## Header
- Wordmark (name), route nav `Work · Notes · About`, GitHub icon, ES/EN text switch, `⌘K` button.
- Mobile: native `popover`/`<dialog>` menu, ≥ 44 px targets.
- `aria-current="page"` only for the current route.
- Don't: scroll-spy, blurred translucent bar, CTA button selling services.

## WorkRow (home and /work)
Order:
1. Status + source chips (`production` · `private`)
2. Title
3. Concise problem (one sentence)
4. My role / responsibility (one line)
5. Verified outcome — only if one exists; otherwise the line is absent (no placeholder)
6. Concise stack (mono, 3–5 items)
7. `Read case study →`

Don't: images/screenshots, decisions or trade-offs (they live in the case study), badge walls, hover-zoom cards.

## Status chip
- Lowercase mono label + small dot; color from `--status-*` tokens; text always present.
- Values: `research`, `designing`, `building`, `production`, `archived`. Source is a separate chip (`open source` / `private`).
- Dashed outline only for `designing`/`research` (drafts in dev).

## Case-study header and MetaTable
- Title, one-line summary, chips; then a hairline definition table: role, timeline, stack, source, links.
- Mobile: table stacks as label/value pairs.

## Measurement display
- Value + unit in tabular mono, label in body type, method/environment as muted caption.
- Unverified entries never render in production builds (dev shows "— pending verification" with dashed outline).

## SystemDiagram figure
- `<figure>` with layered rows (`<ol>`/`<li>`), nodes as hairline boxes with real text; async edges dashed.
- `<figcaption>` explains the diagram in one sentence.
- Mobile: layers stack vertically; no horizontal scroll.

## BKODE banner
- The one deliberately different band on the site: full-bleed, inverted surface, its own type treatment.
- Content: "Need a product built?" → BKODE → "Software engineering for businesses." → link to https://bkode.lat.
- Appears once (home, before contact). No service lists elsewhere on the site.
- Don't: gradients, glows, mascots, multiple CTAs.

## Command palette
- Native modal `<dialog>`, raised surface, search input + listbox of navigation actions.
- Visible trigger button in header; `⌘K`/`Ctrl K`.
- Navigation only in v1 — no terminal mode, no fake shell styling.

## Footer
- Name, links, CV, and a mono build line: `built <date> · <short sha> · astro <version>`.
