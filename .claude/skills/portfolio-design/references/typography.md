# Typography

## Families (implemented)
- **Geist Variable** (`@fontsource-variable/geist`): UI, headings and body.
- **Geist Mono Variable** (`@fontsource-variable/geist-mono`): metadata and code.
- Both are loaded in `src/styles/system.css`. Fontsource's `unicode-range` means only the subsets a page actually uses get downloaded.

## Roles
| Use | Family | Rule |
|---|---|---|
| Display / h1 | Geist 600 | Tight leading (1.08–1.12), −0.02em tracking. Hierarchy comes from size and weight, never color or gradient. |
| h2–h3 | Geist 600 | Sentence case, `text-wrap: balance` |
| Body / prose | Geist | `text-body` (17–18px), line-height 1.6, measure ≤ 68ch (hard max 75ch) |
| Labels | Geist, `text-small`, muted | Spec-table labels, captions. Labels are **sans, not mono**. |
| Metadata values | Geist Mono, `text-meta`, muted | Dates, status, stack lines, build info, diagram kinds |
| Code | Geist Mono | Shiki `portfolio-light` / `portfolio-dark` (token-derived), ligatures off |

## Rules
- Mono is only for metadata **values** and code. Never use it for headlines, paragraphs, buttons or field labels.
- Sentence case everywhere. No all-caps labels or eyebrows, and no letter-spaced small caps.
- Do not accent one word in a headline with italic, color or weight.
- Use tabular numbers for measurements, dates and tables (`.meta` and `.prose table` already set this).
- Stack lines are lowercase and comma-separated (`python, fastapi, postgresql`). Do not chain items with middle dots (`A · B · C`), which is a template tell. One deliberate exception: a single separator in a dev/meta line.
- Do not append `→` to link or button text. The link's wording says where it goes.
- Paragraphs use `text-wrap: pretty`; headings use `balance`.
- Prose links are underlined with an accent-colored line and a text-colored label, so the accent stays a thin signal.
