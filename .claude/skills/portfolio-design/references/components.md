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
- Each case-study `h2` starts on a hairline with the drafting-green tick, the same section marker as the homepage. Arriving at a section through a link (`:target`) lengthens its tick, and the heading lands `--sticky-offset` below the viewport top (under the header, never behind it).
- `Decision.astro`: a 2px text-color rule, the decision as `h3`, and a key/value sheet (Problem, Choice, Why, Trade-off; the trade-off muted). The decisions are the visual center.
- `SystemDiagram.astro`: layered diagram language plus an optional `group` box (one application's modules) and an "outside the platform" boundary listing external systems with the direction of their data. Under 768px the group's modules use a two-column grid instead of one vertical stack; nothing is hidden and nothing overflows.

## Article shell (`components/article/ArticleShell.astro`)
- Shared reading layout for case studies and notes: optional `rail` slot plus "On this page" (sticky rail on desktop; collapsed native `<details>` on mobile), 68ch prose, and `h2`s marked with the hairline and tick.
- The contents list appears only for articles with 4+ sections; without rail content and contents, the layout is a single prose column.
- Desktop (64rem+): the rail sticks at `--sticky-offset`, capped at the viewport height and scrolling inside itself if taller. Two columns only (rail + 68ch prose): a third column would compress the measure or crowd 1024px. Note metadata stays in the note header.
- Active section (scroll-spy, desktop rail only): an IntersectionObserver whose top edge sits on the sticky offset marks the section whose heading has passed under the header (`aria-current="location"`): full-strength text, weight 600 and a short 2px drafting-green mark on the list's rule. No fill and no motion. At the end of the page the lowest heading in view is current; a click marks its target directly. Without JS the list is plain anchors.
- Mobile: nothing sticky; the contents list stays a collapsed `<details>` and has no active state.

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

## Header (implemented, `components/site/Header.astro`)
- Sticky (`top: 0`, `--z-header`) on a solid `bg` with one bottom hairline: no shadow, blur, translucency or scroll-driven change. Its height is fixed by `--header-height` at every width (tests assert the match), and `view-transition-name: site-header` keeps it still during page cross-fades.
- Wordmark; nav Work, Notes (only when published), About; then the utility cluster: search | language | theme | GitHub, LinkedIn. Groups are divided by short hairline separators. No container, background, glow or rounded toolbar shell.
- Utility buttons are muted text with a transparent hairline border; hover and open states turn the text full color and show the border (120ms color/border). Drafting green appears only as the focus ring and the selected check mark. No scaling, rotation or animated separators.
- Language: a native `<details>` showing the site language code (`EN ▾` / `ES ▾`) with options English / Español as plain links (`hreflang`, `lang`). The current language is marked by weight plus a check mark. On an English-only page the Spanish option reads "Español (página de inicio)" and leads to `/es`: it never implies a translation exists. The contextual `EN` markers on English-only Notes and case studies stay.
- Search trigger: from 48rem a quiet field (inset hairline outline, "Search", mono `Ctrl K` / `⌘K` text on fine pointers, no box inside the box); 10.5rem wide from 64rem. Below 48rem an icon with "Search" as its accessible name.
- Theme, two controls read as one:
  - **Switch** (`role="switch"`, name "Dark theme", `aria-checked` = rendered theme is dark): a 6px-radius track on `surface` with a square thumb carrying sun/moon. One press flips Light ↔ Dark and stores that explicit choice. The thumb slides in 160ms; the icon cross-fades. Nothing animates under reduced motion.
  - **Preference menu** (narrow chevron button): Light / System / Dark (`aria-pressed`, weight plus check mark). It is the only place that shows the stored preference.
  - Stored preference (light | system | dark) vs rendered theme (light | dark): with System stored, the switch shows the rendered theme while the menu checks System; the switch's description reads "Preference: System (follows your device)" and the menu button's name includes the preference. The switch follows OS changes live.
  - Hidden without JS; the OS theme applies. The search dialog's theme row and the header stay in sync (`themechange` / `themerequest` events; `scripts/theme.ts` is imported only by the header).
- GitHub and LinkedIn: monochrome inline SVG links, accessible names "GitHub" / "LinkedIn", conventional same-tab behavior. Concise CSS tooltips (icon-only controls) only on hover-capable fine pointers.
- 48–64rem: social icons hidden so the single row never wraps.
- Mobile (<48rem): row 1 is the wordmark plus search, language and theme (theme from 360px, as one preference-menu button showing the rendered theme's icon; the switch is desktop only); row 2 is the nav, aligned with the wordmark. Social icons are hidden (they stay in search, contact and footer). The header is 89px (touch) / 81px (fine pointer) at 320–767px in both languages; every visible control is at least 44px on touch.
- Menus close on outside click, Escape (focus returns to the summary) or when another menu opens. Panels open below the control, right-aligned, on `surface-raised` with a `border-strong` hairline and no shadow.
- Don't: a blurred translucent bar, a shadow or shrink-on-scroll, a CTA selling services, email or chat links in the header.

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

## BKODE interlude (implemented, `components/home/BkodeBanner.astro`)
- Appears once on the homepage: an editorial break between the engineering portfolio and the separate studio for client work. Full-width `surface` band framed by `border-strong` hairlines, same color scheme as the page.
- On `.axis`: the label column holds the BKODE mark (sans 700, slight tracking) and a mono `/ Client work`; the content column holds the statement as the section `h2` ("Independent software work has its own home."), one muted explanatory line, and a single destination: "Visit BKODE ↗" (link, weight 600) followed by a muted mono `bkode.lat`.
- Interaction: only the link is interactive. Hovering or focusing it fades in a 2px text-colored top rule on the band (`--motion-section`) and nudges the ↗; the link's own underline strengthens. No scale, glow or background animation.
- Mobile: the mark and `/ Client work` share one line above the statement; padding shrinks so the band never reads as an empty panel.
- Don't: inverted bands, gradients, card treatment, large buttons, a whole-band click target, or more than one link.

## Contact (implemented, `components/home/Contact.astro`; home and About)
- Section head (title + availability line), then two `.axis` blocks, no row table:
  - **Email**: label in the axis column; the address at `h2` size (selectable, breaks after "@" on narrow screens), then two buttons: "Copy address" and "Write an email" (plain `mailto:`, no ↗, no prefilled message; it opens whatever mail handler the visitor has).
  - **Profiles / CV**: below a hairline, two quiet lists side by side (stacked under 40rem): LinkedIn ↗ and GitHub ↗ with their muted mono handles; English ↗ and Español ↗ (each named in its own language) with a mono `PDF`.
- Copy feedback: the three labels ("Copy address", "✓ Copied", "Selected") share one grid cell, so the button never changes size. Success swaps to "✓ Copied" (accent check + word) with a text-colored border for ~1.8s; the incoming label fades and rises 2px (`--motion-ui`), the outgoing one leaves at once. A polite live region announces "Email address copied". If the Clipboard API is missing or refuses, the address is selected instead, the button reads "Selected" for ~4s and the live region explains how to copy by hand; it never claims "Copied". Without JS the button is hidden.

## External links (`components/system/ExternalLink.astro`)
- GitHub, LinkedIn, the CVs and BKODE open in a new tab everywhere (header icons, hero, contact, BKODE, About, footer, search): `target="_blank"`, `rel="noopener noreferrer"` (+ `me` for profiles), and a visually hidden "(opens in a new tab)" in the accessible name. The ↗ never carries that meaning alone.
- The ↗ mark appears only on prominent links (hero buttons, contact lists, BKODE). There it nudges 2px right and 2px up on hover and on keyboard focus (`--motion-fast`); the text never moves; reduced motion keeps it still. Inline prose and footer links get no mark.
- `mailto:` links are not external links: no target, no ↗.

## Search (implemented, `components/site/CommandPalette.astro`)
- Native modal `<dialog>` on `surface-raised`, hairline border, no shadow; the backdrop is a translucent `bg` wash, not blur. Entrance: opacity + 4px drop in 160ms; no scale, no blur.
- Structure: search field (icon, real input at body size, 16px minimum, `esc` hint) → hairline → results → hairline → keyboard help (`↑ ↓ navigate`, `↵ select`, `esc close` in `<kbd>`; hidden on touch-only devices). The field is the strongest element; while focused it carries a 2px accent rule along its base.
- Index: built at render time from public routes, published case studies (title, focus as the secondary line, summary/stack/status as keywords), published notes (title, reading time · tags, description as keywords) and actions (email, GitHub, LinkedIn, CV, language). Drafts never enter it. Normalized (case- and accent-insensitive) token matching: every token must match; title-prefix > title > elsewhere; ties keep index order. No library.
- Rows, not cards: a lowercase mono type column (`page`, `work`, `note`, `action`; above 30rem on the left, below it as a tag on the right), title, muted mono secondary line. Selected row: `surface` fill, a 2px text-color left edge, weight 600 and a `↵` hint. Distinct from focus (which stays in the input).
- Combobox pattern: focus stays in the input; ↑/↓ move `aria-activedescendant` (clamped), Enter opens the selected result, pointer movement moves the selection. No results: "No matching commands" / "No hay resultados". A Theme row (Light / System / Dark, `aria-pressed`) follows the results and filters with theme words.
- Without JS the trigger stays hidden; every destination is reachable through normal navigation. No terminal styling, prompt glyphs or command execution.

## Architecture Trace (implemented, `SystemDiagram` `traces`)
- Optional flow buttons above a diagram (`aria-pressed`), one sentence explaining the selected flow (`aria-live="polite"`). Pressing the active button returns to the neutral diagram.
- Tagged nodes, connectors and the external boundary get the accent border plus heavier text (never color alone); untagged parts turn muted but stay readable. No movement, zoom or drawing animation; 200ms color/border transitions, none under reduced motion.
- Controls are hidden without JS; the neutral diagram and the prose remain the complete description.

## Footer
- Name, links, CV, and a `.meta` build line (`built 2026-10-05, a1b2c3d, astro 7.3.5`).
