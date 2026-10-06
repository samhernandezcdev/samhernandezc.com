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

## Work index (implemented, `components/work/WorkIndex.astro`)
- A ledger on `.axis`: lifecycle and source in the label column; title (h2, linked when a case study exists), problem, role, one result line (neutral `border-strong` rule, never the accent), stack, and "Read the case study". No cards, images or badges.

## Case study (implemented, `pages/work/[slug].astro`)
- Header: breadcrumb (Work / Case study), the title at `h1`, the summary at `lead`, the status chip and source, and a `border-strong` rule.
- Desktop at `lg`: a sticky rail (`container-rail`) with a stacked spec (role, focus, stack; no timeline, which would link the anonymized study to the employer) and an always-visible "On this page" `<nav>`, beside the prose.
- Mobile: spec, then "On this page" as a native `<details>` collapsed by default (no JS, no sticky or floating behavior), then prose. Both contents lists are rendered; CSS shows exactly one per breakpoint, so the hidden one leaves the accessibility tree.
- Each case-study `h2` starts on a hairline with the drafting-green tick, the same section marker as the homepage. Arriving at a section through a link (`:target`) lengthens its tick; there is no scroll-spy.
- `Decision.astro`: a 2px text-color rule, the decision as `h3`, and a key/value sheet (Problem, Choice, Why, Trade-off; the trade-off muted). The decisions are the visual center.
- `SystemDiagram.astro`: layered diagram language plus an optional `group` box (one application's modules) and an "outside the platform" boundary listing external systems with the direction of their data. Under 768px the group's modules use a two-column grid instead of one vertical stack; nothing is hidden and nothing overflows.

## Article shell (`components/article/ArticleShell.astro`)
- Shared reading layout for case studies and notes: optional `rail` slot plus "On this page" (sticky rail on desktop; collapsed native `<details>` on mobile), 68ch prose, and `h2`s marked with the hairline and tick.
- The contents list appears only for articles with 4+ sections; without rail content and contents, the layout is a single prose column.

## Notes (implemented)
- Index (`/notes`): a dated ledger on `.axis`. The `<time>` date and reading time sit in the label column; the title link (h2), description and plain-text topics sit beside it. No cards, covers, avatars or counters. The RSS link is a quiet `link-quiet`.
- Note page: breadcrumb (Engineering notes), title `h1`, description at `lead`, then a mono meta line (Published date, Updated, reading time, topics), then ArticleShell. "All notes" at the end.
- Homepage "Engineering notes": at most 3 `NoteRow`s (date, reading time, title, description; no topics). Hidden when no note is published.
- Code: the token-derived Shiki pair, no copy button or editor chrome (deferred until a note needs it).

## About (implemented, `components/about/AboutPage.astro`)
- `h1` "About", then a strong rule and `.axis` with the name in the label column, the identity statement at `h2` size and the direction line at `lead`.
- Sections (each a section head with tick): How I got here (prose on the axis), How I work (principles as axis rows: title as `h3` left, sentence right), Experience (`ExperienceList`, full history with `owned` lines), Current direction (prose), Contact (shared component).
- No portrait, quotes, skill pills, timeline graphics or cards.
- `ExperienceList` (`components/experience/`): shared by About (all roles, all items) and the homepage fallback (3 roles, 2 items). Periods use `<time datetime>`.

## Header (implemented)
- Wordmark; nav Work, Notes (only when published), About; GitHub; language switch set apart by a hairline divider.
- On Spanish pages, English-only Notes carries a muted superscript `EN` annotation (plus screen-reader text), so it doesn't read like a second language switch.
- Narrow screens: the row wraps (wordmark, then the nav); the nav list may wrap again at 320px. No menu disclosure.

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

## Command palette (implemented, `components/site/CommandPalette.astro`)
- Native modal `<dialog>` on `surface-raised`, hairline border, no shadow; the backdrop is a translucent `bg` wash, not blur.
- A filter field (16px+ on mobile), then grouped real links: Pages, Content (published case studies and notes), Actions (email, GitHub, LinkedIn, CV, language), plus a Theme row (Light / Dark / System, `aria-pressed`).
- Opens with ⌘K / Ctrl K or the header trigger (search icon + mono shortcut hint on fine pointers). Escape and backdrop click close; focus returns to the opener. Arrow Up/Down, Home/End move through visible items; Enter activates natively.
- Without JS the trigger stays hidden; every destination is reachable through normal navigation. No terminal styling, prompt glyphs or command execution.

## Architecture Trace (implemented, `SystemDiagram` `traces`)
- Optional flow buttons above a diagram (`aria-pressed`), one sentence explaining the selected flow (`aria-live="polite"`). Pressing the active button returns to the neutral diagram.
- Tagged nodes, connectors and the external boundary get the accent border plus heavier text (never color alone); untagged parts turn muted but stay readable. No movement, zoom or drawing animation; 200ms color/border transitions, none under reduced motion.
- Controls are hidden without JS; the neutral diagram and the prose remain the complete description.

## Footer
- Name, links, CV, and a `.meta` build line (`built 2026-10-05, a1b2c3d, astro 7.3.5`).
