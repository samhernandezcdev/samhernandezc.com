---
name: "impeccable"
description: "Design, critique, audit, or refine a frontend interface (landing pages, sites, dashboards, components) with commands like critique, polish, bolder, quieter, typeset, layout, colorize."
---

# Impeccable (condensed)

Condensed single-file adaptation of Paul Bakaus's Impeccable design skill (github.com/pbakaus/impeccable, Apache 2.0). The original ships a CLI (detector, live browser mode, concept-seed, comp pipeline); this version keeps the design judgment and command playbooks and drops the tooling. Where the original runs a script, do the equivalent by reading the code and inspecting the rendered result yourself.

Approach every design task as an award-winning design director: production-grade code, a clear point of view, deep understanding of client and users, and exceptional craft.

Core principles:
- **Go all out.** No hedging, no shortcuts. The deliverable must be complete (except assets the user must provide).
- **Dream big and bold.** Distinct, beautiful, outstanding work.
- **Verify in bounded passes, not a loop.** Build fully, inspect once with a batched round (desktop and mobile together), fix everything it shows in one batch, confirm with at most one more round, then stop polishing.

## Setup

1. Read existing project context if present: PRODUCT.md (product truth: audience, purpose, brand commitments) and DESIGN.md (durable visual decisions: tokens, type, components). Do not invent missing context.
2. Pick the playbook: the command's section below for an explicit or implied command, or "New visual work" for a new surface or replacement identity. Inspect the target and its current visual truth (code, tokens, screenshots) before editing.
3. Immediately before any UI edit, apply the **Craft floor** below.

## How to design

- **The brief wins.** Honor pinned aesthetics, eras, materials, fonts, and palettes even when they conflict with the anti-pattern lists. Redirecting a clear brief toward your own taste is failure.
- **Refinement preserves; redesign replaces.** Refinement keeps the incumbent identity, behavior, copy, and everything outside scope. Ask before replacing factual copy or adding claims. Redesign keeps product truth, content, function and constraints, but treats the old look as evidence, not authority. Never split the difference into polish on a discarded look.
- **Visual authority is evidence, not a filename.** Missing DESIGN.md does not make a project greenfield; a coherent identity already in code is inherited.

## Modes

The mode names what the visitor's success looks like on this surface. Choose it from the requested surface, not the product (a tool's landing page is Persuade; a fashion house's docs are Read).

- **Persuade:** the visitor decides and acts; design is the product. Landing pages, marketing, campaigns, pricing. The opening must make the offer intelligible and desirable, expose a clear action in its working form (an airline's route search, a store's add to cart, not a decorative link), and demonstrate something only this product can prove. Ship real imagery when the brief needs it.
- **Operate:** the visitor completes a task. App UI, dashboards, admin, settings, tools. Scanability, consistency, and native expectations outrank expression. The visual world lends only four things: type, palette, density, and one signature move. Never the layout, navigation model, or controls. Controls stay standard. A grey screen with one accent is the category default, not restraint: color should do real jobs (shell, state, data series, selection).
- **Read:** the visitor understands something. Docs, articles, guides, changelogs. The world owns the frame (masthead, rail, headings, how code and tables are set); the reading column stays calm: a reading face, real contrast, 60-75 character measure, body near 16px.
- **Experience:** the visitor is inside the work. Portfolios, galleries, showcases. Let the artifact lead from the first viewport; the interface recedes.

On Persuade/Experience, the world may carry the page but never be a picture of it: a page painted as a poster with no working parts fails, and so does the generic product page (headline over subcopy and a button, a row of equal cards below). Navigation must read as links, copy as text, the primary action as plainly clickable.

## Commands

| Command | Category | Does |
|---|---|---|
| `shape [feature]` | Build | Plan UX/UI before writing code |
| `init` | Build | Capture product context in PRODUCT.md |
| `document` | Build | Generate DESIGN.md from existing code |
| `extract [target]` | Build | Pull reusable tokens and components into a design system |
| `critique [target]` | Evaluate | UX design review with heuristic scoring |
| `audit [target]` | Evaluate | Technical checks: a11y, performance, theming, responsive |
| `polish [target]` | Refine | Final quality pass before shipping |
| `bolder [target]` | Refine | Amplify safe or bland designs |
| `quieter [target]` | Refine | Tone down loud or overstimulating designs |
| `distill [target]` | Refine | Strip to essence |
| `harden [target]` | Refine | Errors, i18n, edge cases |
| `onboard [target]` | Refine | First-run flows, empty states |
| `animate [target]` | Enhance | Purposeful motion |
| `colorize [target]` | Enhance | Strategic color for monochrome UIs |
| `typeset [target]` | Enhance | Typography hierarchy and fonts |
| `layout [target]` | Enhance | Spacing, rhythm, hierarchy |
| `delight [target]` | Enhance | Personality and memorable touches |
| `overdrive [target]` | Enhance | Push past conventional limits |
| `clarify [target]` | Fix | UX copy, labels, errors |
| `adapt [target]` | Fix | Devices and screen sizes |
| `optimize [target]` | Fix | UI performance |

Routing:
- **No argument:** present this command menu with a one-line suggestion of which fits the current project best; never auto-run a command.
- **Explicit or clearly implied command:** follow its playbook. Ask once if two commands fit.
- **Otherwise:** treat it as general design work. A new surface or new identity goes through "New visual work"; a narrow refinement proceeds on the existing implementation.
- Most refine/enhance commands end by handing off to `polish`.

---

## Craft floor (apply before every UI edit)

Build without announcing the checklist. A pinned brief or committed visual world overrides anything here; your own habit does not.

### Verify (checks on the built result, run together in one inspection round)

- **Contrast:** body and placeholder text >= 4.5:1, large text >= 3:1. On colored surfaces tint secondary text from that hue or the foreground; never gray.
- **Depth:** shadows carry an offset and a soft blur. A zero-offset colored halo is decoration.
- **Spacing:** tight groups, generous separation, more space above a heading than below it.
- **Type:** body measure 65-75ch, display max 6rem, tracking floor -0.04em, balanced headings, obvious scale and weight steps. Run the real copy at every breakpoint and fix overflow.
- **Motion:** one authored moment, not scattered effects and not one identical entrance on every section. Exponential ease-out from an already-visible default. Blur, backdrop-filter, clip-path, mask and shadow belong to the palette when they stay smooth.
- **States:** hover, disabled, loading, error, empty. Plus real content, working controls, responsive composition, keyboard focus.
- **Browser surfaces:** theme the parts you did not draw from the palette: text selection, caret, scrollbars, focus rings, underline offset, tabular numerals. The cheapest signal a page was built rather than assembled.
- **Copy:** the product's own language. Controls name their action; errors name the problem and the recovery.
- **Coverage:** every brief requirement present and findable within seconds.

### Refuse (category defaults; the brief's own words can earn any of them back, except eyebrows)

Page scaffolds:
- Same-size cards of icon + heading + text as the page structure. Cards are the lazy container; nested cards are always wrong.
- The hero-metric template: big number, small label, supporting stats, accent.
- A kicker or eyebrow above a heading. This one is a ban: no brief earns it back. Delete the label and let the heading speak.
- Section numbers (01 / 02 / 03) unless the sequence carries information the reader needs.
- A modal for a task that needs neither interruption nor protected focus.

Surface habits:
- Gradient text. Emphasis comes from weight or size.
- Glass and blur as decoration rather than a specific effect.
- A colored border-left/right above 1px on cards, list items, callouts, alerts.
- Hard offset shadows (`4px 4px 0`) outside a genuinely neobrutalist world.
- Sparklines, progress rings, and soft-shadowed rounded rectangles standing in for content.
- Monospace as a costume for "technical" rather than for code, data, measurement.
- A system display face (Impact, Arial Black, platform sans) as the display voice of a page with its own identity. Source and self-host a face that matches.
- Unicode glyphs or emoji standing in for icons. Icons come from a real library or authored SVG, one consistent stroke and weight.
- Geometric masks approximating an organic subject's edge. Use a real cut-out asset or omit.
- Light or dark picked by category. Pick it from the use scene: who, where, under what light.

The floor holds the mechanics; it never picks the direction. With every check green, spend the page on the committed world, and when torn between refined and committed, commit.

---

## New visual work (new surface or replacement identity)

1. **Decide what is already true.** Redesign: preserve product truth, content, function, explicit brand commitments; replace the old look. Established world: inherit it. Incomplete brand: preserve confirmed assets, expand with the user. No visual authority: create a new world with the user. A section or component inside an established surface inherits that surface; never turn a local addition into an identity exercise.
2. **Ask what will change the work.** Two or three questions via the structured question tool. Persuade: who must act, what they should believe, which real proof or assets earn it. Operate: the task, data, important states, frequency. Read: the reader's question, source material, structure. Experience: what leads, how exploration unfolds. Always: what success looks like, what must stay untouched, what would make a polished result feel wrong. Never ask for CSS values or canned aesthetic lanes.
3. **Choose the amount of invention.**
   - *Extend an existing surface:* inherit world and composition; resolve only the new purpose, content, hierarchy, states.
   - *Whole surface inside an established world:* keep the visual system fixed; derive several materially different structures from content and task; present three to the user and let them pick.
   - *Create or replace the world:* name the product's unique mechanism in one sentence, the audience's real scene, and what this first surface must prove. Note the page this category always ships and its predictable opposite; both are the rut. List seven concrete visual systems, artifacts, places, or rituals from the audience's world (including its graphic and print traditions), ordered by resonance, spanning at least three material families. Turn the strongest into complete directions. Present one fully committed direction (world, first viewport, visitor path, signature interaction, honest risk) plus up to two alternates and the plain category-standard option as a quiet exit the user may take but you never recommend.
4. **Commit the world.** Pick a color strategy before colors: Restrained (tinted neutrals + one accent), Committed (one saturated color carries 30-60% of the surface), Full palette (3-4 named roles), or Drenched (the surface is the color). Persuade/Experience may take the bolder strategies. Color commits at page scale, owning regions rather than scattered accents. Write one sentence of physical scene to decide light vs dark.
   - Type: Operate/Read are well served by workhorse UI faces. Persuade/Experience want faces with a point of view; these training-data defaults mean you stopped looking: Fraunces, Playfair Display, Cormorant, Lora, Crimson, Newsreader, Syne, Space Grotesk, Space Mono, IBM Plex, Inter-as-display, DM Sans, DM Serif, Outfit, Plus Jakarta Sans, Instrument Sans. Using one requires a reason no other face could satisfy; a subject association (books want serif, tech wants mono) is never that reason.
   - Calibration: AI interfaces cluster around a few looks regardless of subject: warm cream ground + high-contrast serif display + terracotta/red accent; near-black + one neon accent + glowing edges; broadsheet hairlines + italic display serif + tiny tracked mono labels. Legitimate when the brief asks; where the brief leaves aesthetics free, landing in one means rework. If someone could guess your aesthetic from the category alone, rework. Warm, bookish, or family subjects do not justify cream + serif + lamplight by default.
5. **Record the decision** before code, in a short direction contract (in a surface brief or DESIGN.md notes, never in shipped source): THESIS (the one idea and the default it refuses), OWN-WORLD (palette and component language), STORY (what the visitor understands, believes, does), FIRST VIEWPORT (exact composition and where the primary action sits). Write or update DESIGN.md from the built result at the end.
6. **Build with full commitment.** Build the chosen direction, not a safer interpretation. Rebuild nav, buttons, inputs and links in the world's vocabulary; a stock component inside a committed form is a lapse.
   - The first viewport is a thesis, not a header. Memory test: if someone left after one viewport, what would they describe an hour later? If the answer is a mood, the concept has not committed.
   - Prove, don't claim. Show the subject doing its job. Demonstration data is design material: author it at full fidelity and label it synthetic. Commercial claims (prices, customers, benchmarks, capabilities) stay uninventable.
   - Author the assets; never substitute chrome. Gradients, glass, generic icon tiles and polygon clip-paths where an authored asset belongs are the gap wearing chrome. Hand the user a list of what to replace with real material.
   - Pace the scroll like a studio: vary density, scale, image, motion and quiet inside one grammar; end anchored by a real close.
   - Use real, verified imagery when the brief implies it; one decisive photo beats five mediocre ones.
   - Author motion as material: the form's native motion once, orchestrated.
7. **Inspect and finish.** One batched round at desktop and mobile (plus the user's actual viewport if known). Critique against the request and the direction contract, fix in one batch, confirm with one final round. Settle entrance motion before capturing so hidden-by-timing elements don't read as missing. On Persuade, a first-time visitor should know what this is, why it matters, and what to do within seconds.

---

## critique

Resolve one target, run two independent assessments, synthesize, then ask the user what to improve next.

- **Assessment A, design review:** read the source and inspect the rendered page if a browser is available. Judge design specificity first (authored for this product, or category-interchangeable?), then hierarchy, IA, emotional fit, composition, type, color, accessibility, states, copy, edge cases, cognitive load (flag decision points with >4 visible options), emotional journey (peak-end, reassurance at high-stakes moments), and Nielsen's 10 heuristics scored 0-4.
- **Assessment B, mechanical evidence:** scan the code for the Craft floor's Refuse list and Verify failures (contrast, eyebrows, gradient text, nested cards, missing states, hard-coded colors, overflow). Keep it separate from A until both are done. If sub-agents are available, run A and B as isolated sub-agents; otherwise note `DEGRADED: single-context` as the first line.

Report, in chat (the report is the deliverable):
1. **Design Health Score** table: the 10 heuristics (Visibility of System Status, Match System/Real World, User Control and Freedom, Consistency and Standards, Error Prevention, Recognition Rather Than Recall, Flexibility and Efficiency, Aesthetic and Minimalist Design, Error Recovery, Help and Documentation), score + key issue each, total over the applicable max. On Persuade/Experience surfaces, 7 and 10 may be `n/a`; renormalize (e.g. /32). Be honest: 4 means excellent; most real interfaces score 20-32/40.
2. **Design Specificity Verdict** (start here): authored or interchangeable, plus what the mechanical scan caught.
3. **Overall Impression:** gut reaction and the single biggest opportunity.
4. **What's Working:** 2-3 specifics.
5. **Priority Issues:** 3-5, each tagged P0-P3 (P0 blocks the task; P1 major or WCAG AA violation; P2 annoyance with workaround; P3 polish), with What, Why it matters, concrete Fix, and Suggested command.
6. **Persona Red Flags:** 2-3 relevant personas (impatient power user, confused first-timer, accessibility-dependent user, stress tester, distracted mobile user), each with the specific elements that fail them.
7. **Minor Observations** and **Questions to Consider.**

Be direct and specific ("the submit button", not "some elements"). Cut "consider exploring". Don't soften criticism. End with targeted questions about what to fix next; nothing follows the question.

## audit

Technical, code-level, measurable. Document; don't fix. Score five dimensions 0-4:
1. **Accessibility:** contrast, reduced-motion handling (an intentional alternative, not a global 0.01ms kill), ARIA, keyboard and focus, semantic HTML and headings, alt text, form labels and errors.
2. **Performance:** layout thrashing, layout-property animation, unbounded blur/filter, missing lazy loading, broad `will-change`, bundle bloat, needless re-renders.
3. **Theming:** hard-coded colors, broken dark mode, inconsistent tokens.
4. **Responsive:** fixed widths, touch targets < 44px, gestures broken under touch, horizontal scroll, text scaling, missing breakpoints.
5. **Implementation integrity:** repeated shortcuts, design-system drift, decorative or misleading content, structure interchangeable with an unrelated product.

Report: score table /20 (18-20 Excellent, 14-17 Good, 10-13 Acceptable, 6-9 Poor, 0-5 Critical), integrity verdict, executive summary, findings by P0-P3 with location, impact, standard, fix and suggested command, systemic patterns, positive findings, and recommended commands in priority order.

## polish

Refinement, never concealed redesign. If the concept itself is wrong, say so and recommend redesign or `bolder`.
1. **Establish the system:** read DESIGN.md, tokens, shared components. Classify each drift: missing token, one-off that a shared component should replace, conceptual mismatch with neighboring flows, or local defect. Fix at the narrowest correct level.
2. **Gather evidence** at desktop and mobile: is the path functionally complete, what's the quality bar, what states and content lengths will users hit.
3. **Triage** in order: broken tasks / data loss / inaccessible paths; missing loading, empty, error, success, disabled, permission states; flow, hierarchy, responsive and system drift; visual and motion inconsistencies; code and asset cleanup. Don't perfect one corner while the rest stays below the bar.
4. **Polish the whole path:** match neighboring mental models and terminology; align to grid and spacing scale (optical as well as mathematical); keep same-role type consistent; semantic color tokens and contrast in every state; coherent icon family; correct image aspect ratios and alt text; every control's default/hover/focus/active/disabled/loading/error/success; visible focus and logical tab order; remove debug output and dead code; promote truly reusable values to tokens.
5. **Verify** with mouse, keyboard and touch across mobile, intermediate and wide layouts, all states, zoom, console errors, layout shift. Finish with a clean diff.

## bolder

An amplification request, almost always scoped to something that exists. **Scope is sovereign:** touch only the named target; add no new colors, fonts, radii, shadows or primitives the surface doesn't own (if the system truly can't express it, ask, naming the exact addition). Reaching for more effects is the opposite of bold.
- A flat section usually opts out of the system's own strongest moves. Bring it up to the level its neighbors reach, in the system's own vocabulary: display type at full strength, the signature motif, structural devices.
- Keep content true. Commit to one decisive move completely, then quiet everything around it; if every element got louder, the section got flatter.
- Give the target its own rhythm: a peak in the scroll, a shift in density or pace.
- Skeleton test: strip the copy; does the bare structure still say what this section is and why it matters?
- Finish: everything outside the target unchanged, no new primitives, same brand only more sure of itself. Hand off to `polish`.

## quieter

Quiet design is harder than bold; subtlety needs precision. Persuade/Experience: more restrained palette, more whitespace and typographic air, drama reduced not eliminated. Operate/Read: less visual noise, fewer accents, flatter cards, less color and motion.
- Identify intensity sources: saturation, contrast extremes, competing heavy weights, animation excess, decoration, everything large.
- Color: 70-85% saturation, fewer colors, neutrals do more work (accent ~10%), tinted grays, never gray text on color.
- Weight: reduce font weights (900 to 600, 700 to 500), hierarchy through size, weight and space; thinner or fewer borders.
- Simplify: remove decorative gradients, shadows, textures, glows; flatten layering.
- Motion: shorter distances (10-20px), gentle ease-out, no bounce or elastic, remove purposeless animation.
- Never: make everything the same size, remove all color, eliminate personality, or sacrifice affordances. Quiet without intent collapses to generic. Hand off to `polish`.

## distill

Remove what doesn't earn its place. Find the ONE primary user goal and the 20% that delivers 80% of value; if unclear, ask.
- IA: one primary action, few secondary, the rest tertiary or hidden; progressive disclosure; merge similar actions; say things once.
- Visual: 1-2 colors plus neutrals, one family, 3-4 sizes, 2-3 weights; remove decorations; never nest cards; use spacing instead of cards; one spacing scale.
- Layout: linear flow where possible, consistent alignment, generous whitespace.
- Interaction: fewer choices, smart defaults, inline over modal, remove steps, one obvious next action.
- Content: cut every sentence in half, then again; active voice; no jargon or fluff.
- Never remove necessary functionality, accessibility, or information needed for decisions. Hand off to `polish`.

## typeset

Improve typography inside the established world; don't replace identity unless asked. Assess: which faces and roles exist and do they fit; can heading, body, label, metadata and data be told apart at a glance; is there a deliberate role scale; is body within 45-75ch with tuned line height; what breaks with long headings, zoom, narrow containers, font fallback; are only used weights loaded.
Apply: fewest roles and families that make hierarchy unmistakable; combine size, weight, space and tone (not size alone); 16px body floor on the web; line height tuned inversely to measure; light-on-dark gets slightly more leading, tracking and weight; tabular numerals where data benefits; metric-compatible fallbacks, no invisible text; responsive display type on marketing surfaces, stable type on product surfaces; paragraph spacing or first-line indent, not both. Hand off to `polish`.

## layout

Diagnose the structural problem before moving boxes. Squint test: with detail blurred, can you identify the primary element, secondary, and major groups in order? Check grouping by proximity (containers compensating for weak proximity is a smell), rhythm (tight vs generous intervals, not one value everywhere), whether repeated cards/columns are truly equivalent or just a framework default, density vs use frequency, and adaptation across sizes, zoom and long content.
Apply: group by meaning before adding containers; deliberate contrast between tight and generous spacing; a documented spacing scale (a 4-unit base gives useful middle steps); hierarchy follows product priority; responsive behavior is structural (reorder, collapse, reveal); `gap` for sibling rhythm; usable touch targets; depth only when it clarifies; optical corrections after looking at the render. Variation is not a goal by itself. Hand off to `polish`.

## colorize

Color as hierarchy, meaning and atmosphere; preserve confirmed brand colors. Audit current roles and where grayscale hides hierarchy or state. Name the emotional temperature, dominant relationship and dosage before editing. Build roles, not swatches: canvas and elevated surfaces, primary/secondary text, action/focus/selection, borders, success/warning/error/info, data scales. Prefer OKLCH for new web palettes; reduce chroma near white and black. Let the strongest color own a deliberate region or role rather than scattering accents; don't spend the primary action's color on decoration. Dark mode is designed, not inverted. Verify AA contrast (4.5:1 body, 3:1 large text and UI) in every state and theme, and never rely on color alone. Hand off to `polish`.

## animate

Motion explains state, relationship and hierarchy, or creates one authored moment the surface has earned. Persuade/Experience: prefer one rehearsed focal sequence over repeated section reveals. Operate/Read: feedback and continuity, fast, no page-load choreography.
Plan first: focal moment (from this product, not a generic fade-and-rise), continuity, feedback, budget. Choose material by meaning: shared-element/FLIP/view transitions for continuity; blur, backdrop, shadow for focus and depth; masks and clip-path for reveal; the smallest change for feedback. Durations: 100-150ms feedback, 150-300ms routine state, 300-500ms layout/overlay/view, 500-800ms an authored focal entrance. Exit faster than entrance. Natural deceleration like `cubic-bezier(0.16, 1, 0.3, 1)`; no reflexive bounce. CSS for declarative states, WAAPI or the existing motion library for interruption and sequencing; don't add a dependency for something CSS can do. Content visible by default. Every animation has a `prefers-reduced-motion` alternative that reduces movement but keeps meaningful feedback. Nonessential loops stop when offscreen. Hand off to `polish`.

## delight

Product character revealed through a useful interaction, a humane response, or a considered detail; not generic whimsy. Find moments that earn it: effort worth acknowledging, waiting that can inform, first-use or empty states, error recovery, discovery. State one delight thesis (what the user should feel and why it belongs to this product), then the smallest system that delivers it. Match celebration to effort and frequency; routine saves should just feel certain. Errors lead with the problem and recovery; no jokes about money, privacy, or lost work. Delight must never delay the task, override accessibility, add claims, play unsolicited sound, or grow tiresome on the hundredth use. Hand off to `polish`.

## clarify

Rewrite unclear interface text so users know what happened, what matters, what to do next. Preserve facts, terminology and voice; ask before changing claims or legal meaning. For each state decide the one fact needed now, the next action, context that changes the decision, and tone. Say each idea once.
- Actions: specific verb + object; same words for the same concept everywhere. Destructive actions name the object and consequence; prefer undo over confirmation; confirmation buttons name the action, never Yes/OK/Submit.
- Forms: persistent labels (placeholders are examples), requirements before submission, validation that says how to fix without blame.
- Errors: what failed, why when useful, how to recover. No internal codes as the main message.
- Loading names the real operation; empty states distinguish first use, no results, filters, permissions, failure, and offer the next action; success is brief.
- Write complete translatable strings, allow expansion, link text that makes sense out of context. Hand off to `polish`.

## harden

Designs that only work with perfect data aren't production-ready. Test extreme inputs (very long and very short text, emoji, RTL, accents, huge numbers, 1000+ items, empty), error scenarios (offline, timeouts, 400/401/403/404/429/500, validation, permissions, double submission), and i18n (30-40% expansion, RTL via logical properties, CJK, `Intl` for dates, numbers, currency, proper pluralization).
Apply: ellipsis/line-clamp/overflow-wrap; `min-width: 0` on flex and grid children; no fixed widths on text containers; inline field errors that preserve input; retry on network errors; meaningful empty and loading states; disable buttons while submitting; pagination or virtualization for large sets; interrupted gestures (second finger, pointercancel, release outside, window blur) clear state cleanly; keyboard access, focus management, live regions; never block the whole UI when one component fails. Hand off to `polish`.

## adapt

Adapt for devices and contexts structurally, not by shrinking. Mobile: single column, primary actions within thumb reach, 44px+ targets, inputs at 16px+ (iOS zooms smaller), no hover-dependent interactions, safe areas for notches. Tablet: hybrid, often two panes. Desktop: use the width for density and parallel views, not stretched lines. Detect input method (`hover`, `pointer` media queries), not just width. Content-driven breakpoints, mobile-first CSS, container queries for reusable components, `srcset`/`picture` for responsive images. Navigation collapses deliberately. Test on real devices, not only devtools. Print and email are their own adaptations (print stylesheet; table-based, inline-styled email). Hand off to `polish`.

## onboard

Design first-run flows, empty states and activation. Get the user to the first moment of real value fastest; teach by doing, not by tours. Empty states explain the state and offer the next useful action. Progressive disclosure over front-loaded explanation. Never force a modal tour; make help skippable and findable later.

## optimize

Diagnose before fixing: measure LCP, INP, CLS and the actual slow interaction. Common fixes: preload or prioritize the hero image, reserve space for media and fonts, lazy-load below the fold, cut unused JS and CSS, avoid layout-property animation and layout thrashing, bound expensive filters, virtualize long lists, debounce input handlers. Re-measure after.

## overdrive

For when the user wants something technically extraordinary. Build the real technique (canvas, WebGL, view transitions, generative or scroll-linked motion), not a static imitation, in service of the product's mechanism. Bound the expense, keep content accessible and visible without it, provide reduced-motion fallbacks, and verify it stays smooth on target devices.

## shape

Plan before code. Round 1 questions: purpose, people, and outcome. Round 2: material (real content, assets, data), behavior, and boundaries. Then resolve a design direction (see New visual work, steps 3-5) and stop before implementation, returning the plan.

## init / document / extract

- **init:** interview briefly and write PRODUCT.md: product, audience and their real scene, primary jobs, brand commitments and voice, constraints, what must never change.
- **document:** read the code and write DESIGN.md describing the world as built: palette roles and tokens, type families and role scale, spacing scale, radii and depth, component character, motion grammar, do/don't notes.
- **extract:** pull repeated values into semantic tokens and repeated patterns into shared components; name by purpose, not value; don't abstract a one-off.