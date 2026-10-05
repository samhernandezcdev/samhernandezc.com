# Design tokens

Status: **decisions recorded; concrete values are set in Phase 2** (design-system phase). Until then, the current `src/styles/global.css` is the legacy theme and should not be extended.

Tokens live in `src/styles/global.css` (Tailwind v4, CSS-first, `@theme inline`, OKLCH). There is no `tailwind.config.js` and there must not be one.

## Rules
- Components consume tokens only. No arbitrary values in class names (`text-[13px]`, `mt-[72px]`) and no raw color literals in components.
- A new need → add a token here and in `global.css` in the same change, with its meaning.
- Name by role, not by appearance (`--color-accent`, not `--orange-500`).
- Light and dark themes define the same token set; theme switches by `data-theme` on `<html>`, defaulting to the system preference.

## Color (roles)
| Token | Role |
|---|---|
| `--bg` | page background (warm-gray paper / graphite) |
| `--surface` | quiet containers, code blocks |
| `--surface-raised` | palette dialog, popovers |
| `--fg` | primary text |
| `--fg-muted` | secondary text (must still meet 4.5:1) |
| `--border` | hairlines |
| `--border-strong` | emphasized dividers, input borders |
| `--accent` | links, focus ring, `building` state |
| `--status-production` / `--status-building` / `--status-archived` | muted semantic status colors, always paired with text |

## Type scale
Fluid steps via `clamp()`: `--step--1`, `--step-0` (body, ~17–18 px), `--step-1`, `--step-2`, `--step-3`, `--step-4` (display). Line-height tokens: `--leading-tight` (headings), `--leading-body` (~1.6).

## Spacing
4 px base: `--space-1` (4) … `--space-16` (64), plus section rhythm tokens `--section-y-sm` / `--section-y-lg`. Section padding comes only from these.

## Layout
`--container` (~1120 px), `--measure` (~68ch), `--rail` (case-study side rail width).

## Radii
`--radius-sm` (4 px), `--radius-md` (6 px). Nothing larger except fully round status dots.

## Motion
`--dur-fast` (120 ms), `--dur-ui` (200 ms), `--ease-out` (a standard ease-out curve). All motion tokens collapse to 0 under reduced motion.
