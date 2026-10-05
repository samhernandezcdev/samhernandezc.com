# Client JS budget

## Budget
- **≤ 6 KB gzipped first-party JS per page.** Zero framework runtime.
- Theme script: tiny inline `<head>` script (sets `data-theme` before paint) — counted.
- Command palette: loaded on idle or on first open, not on initial render path.
- Enforced in CI by a size-check script over `dist/_astro/*.js` (Phase 8).

Baseline before the redesign (for comparison): React client runtime ~183 KB + Header island ~43 KB + ClientRouter ~15 KB (raw).

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
