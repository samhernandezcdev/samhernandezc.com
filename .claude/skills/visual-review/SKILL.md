---
name: visual-review
description: Render-and-critique procedure for this portfolio — build the site, capture every route at desktop and mobile in light and dark, then critique the screenshots against the project rubric BEFORE editing anything. Use this skill after every major UI phase, after any substantial layout/style/component change, before declaring visual work done, and whenever the user asks to "review", "check how it looks", "QA the design" or "compare light and dark".
---

# Visual review

Critique first. Edit only after the critique has been presented and the user agrees (or the user explicitly asked for fixes).

## Procedure
1. **Build:** `npm run build` (stop and report if it fails).
2. **Capture:** `node scripts/screenshot.mjs`
   - Serves `dist/` via Astro's preview server, discovers all built routes, captures each at the viewports in `references/viewports.md` in light and dark, with reduced motion, full page.
   - Output: `.claude/review/<timestamp>/<route>.<viewport>.<scheme>.png` (gitignored).
   - Limit routes with `--routes /,/work` when reviewing a single area.
3. **Inspect:** Read the screenshots (Read tool renders images). Look at desktop and mobile, light and dark for each route. Use the `claude-in-chrome` skill for interactive checks (focus order, hover, palette) when the browser extension is connected.
4. **Critique:** write findings against `references/rubric.md`, grouped by severity:
   - **Blocker** — broken layout, unreadable contrast, content hidden, credibility problems (fake-looking claims, template aesthetics).
   - **Major** — hierarchy, spacing rhythm, typography, mobile ergonomics, theme inconsistencies.
   - **Minor** — polish.
   Each finding: route · viewport · scheme · what is wrong · why it matters · proposed fix (referencing `portfolio-design` tokens/rules).
5. **Stop.** Present the critique. Do not edit files in the same step.

## Notes
- The design rules being judged live in the `portfolio-design` skill; claims and copy are judged with `engineering-case-study`.
- Until Phase 2 adds a light theme, light captures of the legacy site serve only as a baseline.
- Never commit screenshots.
