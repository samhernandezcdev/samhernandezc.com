# Review rubric

Score each area Pass / Concern / Fail per route, then list findings by severity.

## 1. First impression and credibility
- Within ~10 s on desktop: name, role, thesis and where the strongest work is are clear.
- Reads as "interesting → technically thoughtful", not "template" or "wow".
- No AI-template tells (gradient text, glows, pinging badges, stat rows, badge walls, stock/3D imagery).
- Claims on screen look evidence-backed; nothing looks like a placeholder or fake metric.

## 2. Hierarchy
- One obvious `h1`, one primary action per view.
- Reading order matches importance; size/weight carry hierarchy before color.
- Home stays focused: no section that belongs on a deeper page.

## 3. Typography
- Measure ≤ ~75ch for prose; comfortable leading.
- Mono only for metadata/code.
- No all-caps labels, no single-word headline accents, sentence case.
- Numbers tabular where compared.

## 4. Spacing and composition
- Consistent rhythm from tokens; no cramped or orphaned blocks.
- Hairlines used as structure; alignment on a clear grid.
- BKODE banner is the only deliberately different band.

## 5. Color and contrast (both themes)
- Body and muted text visibly readable (target 4.5:1); focus ring visible (3:1).
- Light and dark feel like the same design, not two different sites.
- Status never color-only.

## 6. Mobile ergonomics
- No horizontal page scroll; touch targets look ≥ 44 px.
- Layout designed for mobile (order, density), not just stacked desktop.
- Code, tables and diagrams usable at 390 px.

## 7. Components
- WorkRow anatomy correct (status/source, title, problem, role, verified outcome if any, stack, link) — no decisions on Home.
- Header, footer build line, palette trigger present and aligned.

## 8. Motion and states (interactive check when possible)
- Hover/focus states exist and are visible; no gratuitous animation.
- Reduced motion respected.

## Output template
```
Route: /   (desktop·light | desktop·dark | mobile·light | mobile·dark)
Blocker: …
Major: …
Minor: …
```
