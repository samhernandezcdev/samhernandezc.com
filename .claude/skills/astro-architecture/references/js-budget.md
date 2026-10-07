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
