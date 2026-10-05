# Visual principles

## The aesthetic
The site should read like the personal notebook of an engineer, typeset with the care of good technical documentation or a datasheet. Inspirations are conceptual — developer tools, technical docs, system diagrams, Unix tooling, observability UIs — never literal imitations (no fake VS Code, no fake terminal).

Order of reactions we design for:
1. "Interesting."
2. "This is technically thoughtful."
3. "I want to inspect this person's projects."

Never trade credibility for a two-second "wow".

## Attributes
- **Editorial** — strong typographic hierarchy, generous measure control, prose that is pleasant to read.
- **Technical** — mono metadata rows, hairline tables, captioned diagram figures, precise alignment.
- **Distinctive** — specific choices for this subject (engineering systems, data, reliability), not defaults that fit any portfolio.
- **Restrained** — one accent color, few surfaces, motion only when it explains something.
- **Non-generic** — if a choice would look at home on any template portfolio, reconsider it.

## Hierarchy
- Each page has one clear `h1` and one primary action.
- Recruiter layer (10–15 s): name, role, thesis, where the strongest work is — all above the fold on desktop and within ~1.5 screens on mobile.
- Engineering-manager layer: Work rows with role and verified outcome.
- Staff-engineer layer: case studies, diagrams, decisions, notes — one click deeper, never crammed onto Home.
- Use size and weight for hierarchy before color.

## Composition
- Editorial single column, container ~1120 px, prose column ~68ch.
- Structure comes from 1 px hairlines and whitespace; surfaces are secondary.
- Case studies: desktop = sticky metadata/TOC rail + prose; mobile = rail becomes a `<details>` at the top.
- Home sections are separated by rhythm (token spacing) and hairlines, not by alternating colored bands. The only deliberately different band is the BKODE banner.

## Surfaces and borders
- Three levels: background, surface, raised surface. No translucency or blur.
- Hairline borders (1 px) are the primary structural device.
- Small radii (4–6 px).
- Dashed border = "not built / planned" — use nowhere else.

## Color
- Near-neutral warm paper (light, deliberately not cream) and graphite (dark, deliberately not near-black).
- One accent, drafting green (the color of engineering computation pads), limited to link underlines, focus rings and the `building` marker. Primary buttons are monochrome. Rationale and budget: `tokens.md`.
- Status is carried by a word and a marker shape (filled / half / hollow square); only `building` uses the accent. No traffic-light colors.
- Contrast: body and muted text ≥ 4.5:1 in both themes; focus ring ≥ 3:1.

## Motion
- 120 ms for hover feedback, 200 ms for UI transitions.
- Native cross-document view transitions; optional name-morph on case-study titles.
- No scroll-triggered staggered reveals; at most one subtle page-level fade.
- Under `prefers-reduced-motion: reduce`, all non-essential motion and view transitions are off.

## Anti-patterns (reject on sight)
- Gradient text, gradient buttons, radial glows, glow shadows, glassmorphism, `backdrop-filter`.
- Neon palettes, green monospace on black, matrix/cyberpunk effects.
- Neural-network or particle backgrounds, floating 3D objects, stock imagery.
- "Hello, I'm Sam 👋" heroes, pinging "available" dots, big-number-plus-gradient stat rows.
- Decorative `01 / 02 / 03` numbering on non-sequential content.
- All-caps eyebrows/labels; accenting one word in a headline.
- Badge walls of technologies; icons inside every card.
- Gamified status widgets (e.g. "coffee: degraded").
- Terminal cosplay. The command palette is a navigation tool, not a fake shell.
- Generated-design defaults (from the frontend-design calibration list): cream background with a terracotta/clay accent; tinted near-black with one acid accent; identical rounded cards with soft grey shadows; `A · B · C` metadata chains; `→` appended to link text; mono for small *labels* (mono is for values only).

## Responsive behavior
- Mobile is designed, not derived: reconsider order, density and what collapses.
- Touch targets ≥ 44 px; spacing between adjacent targets.
- Code blocks scroll horizontally inside their container (focusable), never the page.
- Tables become stacked definition lists or scroll within a labelled region.
- Diagrams reflow vertically (layered layout), labels stay real text.
- No horizontal page scroll at 320 px.

## Interaction design
- Every interactive element has hover, `:focus-visible` and active states.
- Links are recognisable without color alone (underline on prose links).
- Keyboard: logical tab order, skip link, Escape closes overlays, shortcuts ignored while typing in inputs.
- Progressive enhancement: everything reachable through normal links with JS off.
