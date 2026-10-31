# Client JS budget

## Budget
- **≤ 6 KB gzipped first-party JS per page.** Zero framework runtime.
- Theme script: tiny inline `<head>` script (sets `data-theme` before paint) — counted.
- Command palette: loaded on idle or on first open, not on initial render path.
- Enforced in CI by a size-check script over `dist/_astro/*.js` (Phase 8).

Baseline before the redesign: ~253 KB raw / ~81 KB gz (React runtime, Header and ContactForm islands, ClientRouter).
After Phase 3 (home): 512 B raw / 381 B gz per page, inline: ThemeScript + copy-email. No JS files in `dist/_astro`.
After Phase 7: theme 153 B + command palette 1,017 B on every page; + copy-email 228 B (home, about); + Architecture Trace 374 B (case study). Largest page 1,544 B gz. All inline.
After Phase 7.5: theme 155 B + command palette 891 B + header menus/theme 681 B on every page; + copy-email 228 B (home, about); + Architecture Trace 376 B (case study). Largest page 2,177 B gz (about). All inline. `scripts/theme.ts` has a single importer (the header): a second importer would split it into an external shared chunk.
After Phase 7.5 (sticky shell + search): theme 155 B + search 1,151 B + header (menus, switch) 812 B on every page; + copy-email 228 B (home, about); + scroll-spy 560 B (case study, note); + Architecture Trace 376 B (case study). Largest page: case study 3,054 B gz. All inline, no shared chunks.
After Phase 7.75 (contact polish): copy-email 228 → 424 B (success/failure states, fallback selection). Home, /es and About pages 2,542 B; case study unchanged at 3,054 B gz.
After Phase 9 (visual layer): Hero artifact gate (loads the loop after load + idle on wide screens, theme-aware, pause control) +673 B → home and /es 3,210 B gz; Architecture Trace 2.0 (route geometry, lane avoidance, draw, ResizeObserver) +928 B → case study 3,974 B gz. Notes covers and the BKODE construction drawing are build-time SVG + CSS (0 B).
After Phase 10 (polish): the header theme preference menu was removed (one switch; System via search) −128 B on every page → home and /es 3,082 B, About 2,409 B, case study 3,942 B gz. Icons, flags, badges and the case-study header image add no JS. The Hero loop itself (~250 KB VP9) is media, loaded only on wide screens without reduced motion or Save-Data.
After the lifting-set demo (case study, `HoistDemo.astro`): + about 1.9 KB gz of inline module (selection, remove/restore, rule output, scenario buttons) → case study 5,850 B gz, under the unchanged 6,144 B limit. The rules ship as logic only (`src/lib/hoist-rules.ts`); the data they read (`MODEL_DATA`, ~8 KB raw) travels as `<script type="application/json">`, which the budget script correctly does not count as JavaScript. The second leg-angle variant is a build-time SVG fetched on request (`legs-65.svg`), not JS. Importing the full model from the script would pull the component registry in (top-level calls cannot be tree-shaken): keep the script importing `hoist-rules` only.
After the lifting-set legibility pass (two columns, numbered callouts, legend, guided list, table jumps, ghost marks): case study 5,850 → 5,910 B gz (+60 B), limit unchanged at 6,144 B (234 B left). Callouts, legend, guide and table rows are `data-jump` buttons or SVG groups routed through one delegated click listener; the guide, the ghost marks and the sticky panel are HTML/CSS only. Anything more (zoom/pan buttons, a viewBox animation) would not fit the remaining margin: measure before adding.
After the lifting-set viewer (card + modal `<dialog>`): case study 5,910 → 4,964 B gz initial. The page keeps only a loader (~1.1 KB gz, including Vite's preload helper) that shows the "Explore configuration" button and, on click, runs `import("./hoist-viewer")`. The viewer chunk (`hoist-viewer.ts`: four views, viewBox zoom/pan, pinch, tabs, rules, focus wrap) is 3,661 B gz, loaded on demand only; `scripts/check-js-budget.mjs` lists such chunks after the table ("Loaded on demand") without enforcing a limit. **Proposed, not enforced:** ≤ 6,144 B gz per on-demand chunk, the same figure as the page budget; the decision to enforce it belongs to the owner. Data fetched on open is not JS: `viewer.html` (dialog markup + model JSON, 5.8 KB gz) and one SVG per requested view (`views/{0..3}-{a,b}.svg`, 81–87 KB gz each, never preloaded). The card figure is an `<img>` of a static SVG (`figure-{light,dark}.svg`, 86 KB gz, lazy), not inline: inline kept the HTML at ~102 KB gz and LCP at 1.96 s (Lighthouse mobile, median of 3) against 16.2 KB gz and 1.66 s with `<img>`.

## Allowed scripts (planned)
| Script | Purpose | Loading |
|---|---|---|
| theme (inline) | Avoid theme flash; manual toggle | inline, eager (tiny) |
| `src/scripts/site.ts` | copy-email, code-copy, console banner, theme toggle handler | module, deferred |
| `src/scripts/command-palette.ts` | `⌘K` navigation palette | idle / on demand |
| mobile menu polish | focus handling on top of native `popover` | module, deferred |

Anything else needs the justification below.

## Justification template
```
Script: <name>
What breaks without it: <…>
Size (gz): <…>   Loading: eager | idle | on interaction
No-JS fallback: <…>
Accessibility: <keyboard/screen-reader behavior>
```
