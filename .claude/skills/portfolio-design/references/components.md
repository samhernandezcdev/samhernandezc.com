# Primitives and component anatomy

Visual anatomy only. What text and claims may appear is governed by `engineering-case-study`. Everything is static `.astro` plus CSS unless `astro-architecture` approves client JS.

## Implemented primitives (CSS, `src/styles/system/`)
| Class | File | Use |
|---|---|---|
| `.page` | primitives.css | Page container: 1120px content plus fluid gutters |
| `.measure` | primitives.css | Limits to the prose measure |
| `.section + .section` | primitives.css | Section rhythm (`--spacing-section`) |
| `.link` | primitives.css | Inline link: text-colored label, accent underline, accent on hover |
| `.link-quiet` | primitives.css | Nav and secondary links: muted until hover or `aria-current="page"` |
| `.button` | primitives.css | Hairline button with `--target-min` height. `data-variant="primary"` gives a monochrome fill. `aria-pressed="true"` / `aria-current="true"` marks the selected state (see "Selected vs focus"). |
| `.icon-button` | primitives.css | Square target, borderless until hover. Always needs an `aria-label`. |
| `.meta` / `.label` | primitives.css | Mono metadata value / sans label |
| `.status[data-status]` | primitives.css | Lifecycle chip (below) |
| `.source` | primitives.css | Plain mono `open source` / `private`, with no box |
| `.spec` | primitives.css | `<dl>` spec sheet: label/value rows with hairlines. Collapses to stacked rows under 480px. |
| `.row-link` (+ `.row-title`) | primitives.css | A whole-row link with a hairline top and a surface fill on hover; the title is underlined on hover |
| `.planned` | primitives.css | Dashed border. It only ever means **planned / not built**. |
| `.visually-hidden` | primitives.css | Screen-reader-only text |
| `.prose` | prose.css | Long-form writing with native elements only |
| `pre.astro-code` | code.css | Shiki blocks: surface, hairline, scroll inside the block, visible focus |
| `.table-region` + `DataTable.astro` | prose.css / components/system | Contained, focusable, labelled scroll region for true tabular data |
| `.diagram*` | diagram.css | SystemDiagram visual language (below) |
| `ThemeScript.astro` | components/system | Inline `<head>` script that applies a saved theme before paint |
| `ThemeSwitch.astro` | components/system | Isolated System / Light / Dark control for testing. Hidden without JS. |

## Selected vs focus
- **Focus** (keyboard): always the outer 2px accent ring with a 2px offset. Nothing else uses an outer ring.
- **Selected** (persistent): surface fill, weight 600, `border-strong` sides and a 2px text-colored bottom edge. No accent, no ring.
- Both can appear together: the ring wraps the selected control.

## Status chip
- The lowercase mono word is the signal. A 0.625em square marker is a secondary cue: **production** filled in text color, **building** filled in accent, **archived** hollow and muted.
- No partial-fill geometry. This is not traffic-light UI.
- `research` and `designing` have no public style because those projects are always drafts.
- Source is a separate, unboxed `.source` element, never merged into the chip.

## Prose (`.prose`)
- Headings, paragraphs, links, lists, blockquote, inline and block code, tables, figures with captions, `hr` and `kbd`. Spacing between blocks comes from `--flow`.
- **Tables:**
  - *True tabular data* (comparisons, measurements) keeps its columns (cells at least 8rem wide) and scrolls horizontally inside `.table-region`, which has `role="region"`, `tabindex="0"`, an `aria-label` and a visible focus ring. MDX tables get it by rendering content with `components={{ table: DataTable }}`.
  - *Metadata or specification* content (role, timeline, stack, links) is never a table. Use `.spec`, which collapses to key/value pairs under 480px.
  - The page itself never scrolls horizontally.
- Blockquotes are muted with a 2px rule, not italic.
- No custom callout component. Use a blockquote or plain text.

## Code
- Custom Shiki pair `portfolio-light` / `portfolio-dark` (`src/styles/system/syntax-themes.mjs`) with `defaultColor: false`; `light-dark()` picks the colors. Six low-chroma roles (keyword green, function slate, string ochre, constant rose-clay, type olive, comment gray), each at least 4.5:1 on `surface`. Operators and punctuation stay text-colored. Never swap in a stock high-saturation theme.
- `<pre>` gets `tabindex="0"` from Shiki and shows the focus ring.
- No window chrome, traffic-light dots, file tabs or line-number gutters. It is documentation, not an IDE.

## SystemDiagram language (`.diagram`)
- `<figure class="diagram">` › `<ol class="diagram-layers">` › `<li class="diagram-layer" data-edge="sync|async">` containing a `.diagram-label` and a `<ul class="diagram-nodes">`.
- Node `data-kind`:

| Kind | Look |
|---|---|
| `service` | Raised surface, hairline border |
| `store` | Double bottom border (a hint of a cylinder) |
| `queue` | Double left border (segmented) |
| `external` | No surface, muted text and border |

- Connectors run between layers in `text-muted`. **Sync** is a 2px solid line; **async** is a 3px dotted line. The arrowhead is 0.4rem: legible, but still quieter than the node text.
- A dashed node (`.planned`) is planned, not built. Dashed borders are never used for async.
- Every diagram has a `<figcaption>` that explains it in one sentence. Labels are real text, never images.
- Anything beyond layered layouts gets a hand-made SVG.

## Header (Phase 3)
- Wordmark (name), route nav `Work · Notes · About` built with `.link-quiet`, a GitHub `.icon-button`, the ES/EN text switch, the theme control and the `⌘K` button.
- Mobile: native `popover`/`<dialog>` menu with targets of at least 44px.
- Don't: scroll-spy, a blurred translucent bar, or a CTA selling services.

## WorkRow (home and /work)
Built on `.row-link`. Order:
1. Status chip and source
2. Title (`.row-title`)
3. One-sentence problem
4. One-line role
5. Verified outcome, only if one exists. With no outcome, the line is absent, with no placeholder.
6. Stack line (`.meta`, comma-separated)

Shown only when a featured work entry is public (otherwise the section falls back to "Selected experience", see above). The row itself is the link, so it needs no `→` and no "Read more". Don't: images, decisions or trade-offs (those live in the case study), badge walls, hover zoom.

## Case-study header
- Title, then the summary at `text-lead`, the status chip and source, then a `.spec` table (role, timeline, stack, links).
- Desktop at `lg`: a sticky rail (`container-rail`) for the spec table and TOC beside the prose. Mobile: the spec table comes first and the TOC sits in a `<details>`.

## Measurement display
- The value and unit in tabular mono, the label in body type, and the method/environment as a muted caption.
- Unverified entries never render in production. In dev they show as "— pending verification" inside a `.planned` box.

## Shared axis (`.axis`, `--container-label`)
- The homepage runs on one left axis: an 11rem label/metadata column plus content. The hero role, the facts strip's first column, experience periods, capability titles, "Other work" and the BKODE name all sit on it. New page-level rows should use `.axis` rather than inventing column widths.
- Section heads start on a hairline with a 1.5rem drafting-green tick (`.section-head`). This is the accent's one structural use.

## Hero (implemented)
- Masthead: the name at `display`, then a `border-strong` hairline, then `.axis` with the role in the label column and the thesis as the dominant statement (`h2` size, regular weight, about 34ch), then the actions. It closes with a datasheet strip of four facts (label + value; stack in mono): 4 columns on desktop, 2×2 on mobile.
- No status panel, image or decoration.

## Evidence section ("Selected work" / "Selected experience")
- With at least one published, featured work entry: "Selected work" and WorkRows.
- Otherwise: "Selected experience", the three most recent roles from the experience collection. Consecutive roles at the same organization are grouped under one organization heading (the overall period is in the label column, each role's own period beside its title, separated by a dotted rule). This is a presentation-level grouping; the data stays one entry per role.
- The hero's primary action uses the same label as the section.

## BKODE handoff (implemented)
- Appears once: a quiet full-width `surface` band with `border-strong` hairlines, in the same color scheme as the page (no inversion).
- On `.axis`: "BKODE" (h2, sans 700) in the label column; then "Software engineering for businesses." at `h2` size; then a muted line "Need a product built?" with the accent link `bkode.lat ↗`.
- Don't: inverted bands, gradients, card treatment, large buttons, mono labels, or more than one link.

## Command palette (Phase 7)
- A native modal `<dialog>` on `surface-raised` with a hairline border and no shadow. A search input plus a listbox of navigation actions.
- Visible trigger in the header; `⌘K` / `Ctrl K`. Navigation only. No terminal styling.

## Footer
- Name, links, CV, and a `.meta` build line (`built 2026-10-05, a1b2c3d, astro 7.3.5`).
