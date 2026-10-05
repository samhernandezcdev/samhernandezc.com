---
name: engineering-case-study
description: Rules for every claim the portfolio makes — project case studies, Work rows, experience entries, About copy, CV-derived text, project status and metrics. Use this skill whenever writing or editing anything in src/content/work, src/content/experience.yaml, About or Home copy, project summaries, measurements, or a project's status/visibility — and whenever deciding whether a project can be published — even if the request just says "write up this project" or "improve the copy".
---

# Engineering case study

The site must let visitors conclude "this engineer builds serious systems" from evidence — never from adjectives.

## Scope
This skill owns **what the site claims**: project and experience narrative, evidence requirements, measurements, confidentiality, lifecycle/status, and banned inflated language.
It does **not** own visual presentation — use `portfolio-design` for that.

## Required flow
- **Case study:** problem → constraints → responsibility → system → decisions → trade-offs → verified result.
- **Experience entry:** problem → what I owned → what I built → what changed.
- Omit a section when there is no real information for it. Never pad.

## Hard rules
1. **Never invent** metrics, users, clients, traffic, production usage, AI experience, maturity, responsibilities or technical decisions.
2. **Unknown → `TODO(sam): <question>`** comment in the source. Never guess, never "plausible" filler.
3. **Every technical decision** in a case study must be confirmed by Samuel before `visibility: public`.
4. **Measurements** (see `references/honesty-rules.md`):
   - `technicalMeasurements` (latency, throughput, retrieval/eval scores, cost, tests, benchmarks) — allowed at any status when verified, with a `method`.
   - `productionOutcomes` (business impact, adoption, users, customer outcomes, revenue, production reliability) — only for `production`, or `archived` with `wasProduction: true`.
   - `verified: false` never renders in production builds.
5. **Lifecycle** (see `references/status-taxonomy.md`): future projects are `draft` by default; `research`/`designing` are never public; public `building` needs the evidence bar; at most one public `building` project.
6. **Confidentiality:** the industrial engineering case study is anonymized — run the checklist in `references/honesty-rules.md`. Naming the employer in Experience/CV is allowed.
7. **Voice:** plain verbs, concrete nouns, no banned phrases (`references/voice.md`). Do not keep rejected taglines or alternative copy anywhere for reuse.

## Pre-publish checklist
- [ ] Flow followed; empty sections omitted
- [ ] No `TODO(sam)` left in a `public` entry
- [ ] Every number has `verified: true` and a method/source
- [ ] No production outcome on a non-production project
- [ ] Status/visibility valid per taxonomy; evidence fields real
- [ ] Confidentiality checklist passed (industrial system)
- [ ] Voice check passed; no banned phrases
- [ ] Spanish summary exists only where the page has an ES version (Home, Work index, About)

## References
- `references/narrative-structure.md` — what each section must contain, with prompts.
- `references/voice.md` — voice rules, banned phrases, before/after rewrites.
- `references/honesty-rules.md` — measurement split, evidence requirements, confidentiality checklist.
- `references/status-taxonomy.md` — statuses, source flag, visibility, evidence bar, promotion rules.
