---
name: portfolio-design
description: Visual design system and rules for Samuel Hernández's engineering portfolio (samhernandezc.com). Use this skill whenever creating or changing anything visual in this repo — layouts, pages, Astro components, Tailwind classes, design tokens (src/styles/system), typography, spacing, color, light/dark themes, responsive behavior, hover/focus states, motion, the command palette's look, or the BKODE banner — even if the request only says "make it look better", "fix the hero" or "style this section".
---

# Portfolio design

**Precedence: `portfolio-design` > `frontend-design` plugin > generic Claude design defaults.**
`frontend-design` supplies general craft; it never redefines this site's approved identity. When they disagree, this skill wins.

## Identity in one line
An engineer's notebook typeset like good technical documentation: editorial, technical, distinctive, restrained. Credibility first, "interesting" second, never "wow" at the expense of either.

## Scope
This skill owns **how the site looks and behaves**: visual hierarchy, composition, typography, spacing, tokens, surfaces, responsive behavior, interaction design and visual anti-patterns.
It does **not** own copy, claims or project status — use `engineering-case-study` for those.

## Workflow
1. Identify the page's reading order: what must be understood first, second, third. One primary action per view.
2. Build from the design system in `src/styles/system/` (entry `src/styles/system.css`; preview at `/dev/design-system` in `npm run dev`). The legacy `global.css` is not extended. No arbitrary values (`text-[13px]`, `py-[72px]`, raw hex/oklch in components). If a token is missing, add it to the token layer and to `references/tokens.md`.
3. Compose with hairlines and whitespace before reaching for surfaces; reach for color last.
4. Design mobile as its own layout, not desktop stacked. Check 390 px width early.
5. Add interaction states (hover, focus-visible, active) and verify `prefers-reduced-motion`.
6. After a major UI change, run the `visual-review` skill before declaring it done.

## Non-negotiables
- No gradients, glows, glassmorphism, `backdrop-filter`, neon, or green-on-black terminal styling.
- No cyberpunk, neural-network backgrounds, 3D objects, stock photos, or AI-template hero patterns (big stat + gradient accent, pinging "available" badge).
- No decorative numbering (`01/02/03`) unless the content is a real sequence.
- No all-caps labels/eyebrows; no single-word accent in a headline.
- No badge walls; stacks are short mono lines.
- Mono type only for metadata and code.
- Status is never color-only; always paired with text.
- Focus is always visible; touch targets ≥ 44 px on mobile.

## References (read when needed)
- `references/visual-principles.md` — the aesthetic, anti-patterns, hierarchy and composition rules.
- `references/tokens.md` — color (light/dark), type scale, spacing, radii, durations; token naming.
- `references/typography.md` — font roles, measure, leading, when mono is allowed.
- `references/components.md` — anatomy and do/don't for WorkRow, status chip, BKODE banner, diagram figure, command palette, header.
