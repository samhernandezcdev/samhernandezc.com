---
name: astro-architecture
description: Architecture rules for this Astro portfolio — static-first rendering, minimal hydration, progressive enhancement, Content Collections, dependency policy and the client-side JavaScript budget. Use this skill whenever adding or changing pages, routes, layouts, components, scripts, client directives, integrations, npm packages, astro.config.mjs, content collections or i18n routing — and before adding any interactivity or dependency, even small ones like "add a toggle" or "install a package".
---

# Astro architecture

The site itself is evidence of engineering judgment: fast, accessible, content-driven, minimal client JS, deliberate dependencies.

## Principles (in priority order)
1. **Astro-first.** Use `.astro` components. Framework islands (React/Vue/Preact) are not used; adding one requires explicit user approval.
2. **Static-first.** Everything is prerendered at build time. No SSR adapter, no server islands unless the user approves a concrete need.
3. **Progressive enhancement.** Every feature works as HTML/CSS first; JS only enhances. With JS off, all content and navigation remain reachable.
4. **Content Collections for content.** Projects, notes and experience live in `src/content/` with zod schemas in `src/content.config.ts`. UI strings live in `src/i18n/ui.ts`. No content hardcoded in components.
5. **Minimal dependencies.** Prefer platform features and Astro built-ins (Shiki, `astro:assets`, native view transitions, `<dialog>`, `popover`).
6. **Explicit justification for client-side JS** — see the gate below.

## Client-JS gate
Before writing any `<script>`, `client:*` directive or browser-only code, write this justification (in the PR/commit message or the component's frontmatter comment):
- **What breaks without it?** (if "nothing important", don't ship it)
- **Size** (gzipped estimate) and whether it loads eagerly, on idle, or on interaction
- **No-JS fallback** (what the user gets instead)
Then check it fits `references/js-budget.md`.

## Dependency gate
Before `npm install`, fill the table row in `references/dependency-policy.md`: package, purpose, benefit, runtime impact, ships client JS?, alternative without the dependency. Check compatibility with the installed Astro version first.

## Version-sensitive APIs
Do not rely on memory for Astro APIs. Check the current official docs listed in `references/official-docs.md` (fetch the page) before using content-layer loaders, MDX config, view transitions, image APIs, i18n routing or upgrade steps.

## Repo constraints
- Verify with `npm run build` (and `npm run check` once it exists) before calling work done.
- No `tailwind.config.js`; Tailwind v4 is configured CSS-first in `src/styles/global.css`.
- Nothing under `docs/` (unrelated, off-limits). Nothing in `src/` may import from `.claude/`, `scripts/` or Playwright.

## References
- `references/principles.md` — rendering model, islands policy, progressive enhancement patterns.
- `references/content-model.md` — collections, schema intent, i18n routing.
- `references/dependency-policy.md` — approved/rejected dependencies and criteria.
- `references/js-budget.md` — budget, allowed scripts, justification template.
- `references/official-docs.md` — links to the official Astro docs to consult.
