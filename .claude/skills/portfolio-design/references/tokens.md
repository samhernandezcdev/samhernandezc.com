# Design tokens

**Source of truth:** `src/styles/system/tokens.css`, loaded through `src/styles/system.css`. This file explains what the tokens mean and how to use them; the actual values live only in the CSS. The legacy `src/styles/global.css` belongs to the old pages and must not be extended.

Live preview: `npm run dev`, then open `/dev/design-system`. It is dev-only and never built.

## How the tokens work
- Tokens are declared in Tailwind's `@theme static`, so utilities exist (`bg-surface`, `text-text-muted`, `border-border`, `text-meta`, `max-w-prose`, `py-section`, `px-gutter`, `rounded-sm`) and plain CSS can use `var(--…)`.
- **Tailwind's defaults are removed** for color, font, text size, radius and shadow (`--*: initial`). If a utility like `text-red-500`, `text-xl` or `shadow-md` does nothing, that is intended.
- **Theming:** every color is `light-dark(light, dark)`.
  - `:root { color-scheme: light dark }` follows the OS, and this works without JS.
  - `data-theme="light" | "dark"` on `<html>` forces a theme (set by `ThemeScript`).
  - Never write per-theme overrides in components.
- If you need a value that doesn't exist, add a token with a role-based name and document it here. Never use an arbitrary value in a component.

## Color roles
| Token | Role | Notes |
|---|---|---|
| `bg` | Page background | Light: warm near-neutral paper (deliberately not cream). Dark: graphite (deliberately not near-black). |
| `surface` | Quiet containers, code blocks, hover fill | |
| `surface-raised` | Dialogs, diagram nodes, palette | Light: brighter than bg. Dark: clearly lighter than surface. bg, surface and raised are spaced about 0.03–0.05 L apart so all three read as distinct without shadows. |
| `text` | Primary text | ≥ 14.5:1 on bg |
| `text-muted` | Secondary text, labels, metadata | ≥ 6:1 on bg and surface. There is no fainter text color on purpose. |
| `border` | Hairlines, the main structural device | Decorative: not meant to carry meaning on its own |
| `border-strong` | Control outlines, emphasis rules, diagram strokes | |
| `accent` | Drafting green: link underlines, focus ring, `building` status | ≥ 5.7:1 on bg and surface |
| `accent-hover` | Hovered link text | |
| `accent-contrast` | Text on an accent fill (rarely used) | |
| `focus` | Focus ring, aliases accent | |

**Accent rationale:** green is the color of engineering computation pads, which ties it to the subject. The alternatives were compared in the preview's accent study:
- Amber/orange on warm paper drifts toward the clay-on-cream palette that marks generated designs.
- Blue reads as generic SaaS and repeats the old site.

The green is kept dark and low in chroma so it never reads as terminal green.

**Accent budget:** use it only for link underlines, the focus ring, link hover text and the `building` marker. Never use it for backgrounds, headings, icons or decoration. Primary buttons are monochrome.

## Type scale (`text-*`)
| Step | Size | Use |
|---|---|---|
| `meta` | 13px | Mono metadata |
| `small` | 14px | Labels, captions, tables, spec rows |
| `body` | 17 → 18px fluid | Default reading size |
| `lead` | 19 → 21px | One introductory paragraph |
| `h3` | 18 → 20px | |
| `h2` | 22 → 28px | |
| `h1` | 30 → 44px | |
| `display` | 36 → 52px | At most once per page (home hero). Never larger. |

Line heights: `leading-tight` 1.12 (h1/display), `leading-heading` 1.3, `leading-body` 1.6, `leading-meta` 1.5.

## Spacing
- Tailwind's 4px steps, **using only** 1, 2, 3, 4, 6, 8, 12, 16 and 24 (4–96px).
- Semantic tokens:
  - `inline` (8px): gap between inline items
  - `component` (16px) and `component-lg` (24px): padding inside rows, blocks and controls
  - `section` (48 → 96px fluid): between page sections
  - `gutter` (16 → 32px fluid): page side padding
  - `--flow` (1.25em): rhythm between prose blocks

## Layout
- `container-page`: 70rem (1120px) content width. The `.page` primitive adds the gutters.
- `container-prose`: 68ch reading measure.
- `container-rail`: 15rem, reserved for the future case-study metadata/TOC rail. The rail sits beside the prose at `lg`; below that everything is one column.
- Breakpoints are Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Mobile-first; layouts change at `md` (two columns of metadata) and `lg` (rail + prose).
- Wide content (code, tables, figures) stays within the measure and scrolls inside its own box. The page itself never scrolls sideways.

## Shape
- `radius-sm` 4px: chips, inline code, diagram nodes.
- `radius-md` 6px: controls, code blocks, figures.
- No other radii and no shadows. Elevation comes from surface level plus a hairline, not from shadow.

## Motion and interaction
- `--duration-fast` 120ms: hover and color feedback.
- `--duration-ui` 200ms: opening, closing, expanding.
- Easing: `--ease-standard`.
- Durations drop to 0 under `prefers-reduced-motion`.
- `--target-min`: 40px on fine pointers, 44px on coarse pointers.
