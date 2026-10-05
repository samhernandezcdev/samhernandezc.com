# Typography

## Families
- **Geist Variable** (`@fontsource-variable/geist`) — UI, headings and body. Already installed.
- **Geist Mono Variable** (`@fontsource-variable/geist-mono`, added in Phase 2) — replaces the current `Consolas` fallback stack.
- Load latin subset only; preload the primary Geist woff2; `font-display: swap` with metric-compatible fallbacks to avoid layout shift.

## Roles
| Use | Family | Notes |
|---|---|---|
| Display / h1 | Geist | Tight leading, slight negative tracking; weight carries emphasis, never color or gradient |
| Headings h2–h4 | Geist | Sentence case |
| Body / prose | Geist | ~17–18 px, line-height ~1.6, measure ≤ 68ch (hard max 75ch) |
| Metadata (status chips, dates, stack lines, build line, diagram labels, table meta) | Geist Mono | Small size, lowercase values (`production`, `building`) |
| Code | Geist Mono | Shiki dual light/dark themes |

## Rules
- Mono is for metadata and code only — never for headlines or paragraphs.
- Sentence case everywhere. No all-caps labels or eyebrows.
- Do not accent a single word in a headline (italic, color or weight change).
- Use tabular numbers (`font-variant-numeric: tabular-nums`) for measurements and dates.
- Prose links are underlined; `text-wrap: pretty` for paragraphs, `balance` for headings.
- Hierarchy through size and weight before color.
