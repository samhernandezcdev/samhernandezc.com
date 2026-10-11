# Narrative structure

## Case study (`src/content/work/<slug>.mdx`)
Each section answers one question. If the answer is unknown, write `TODO(sam): …` in the source and omit the section from rendering.

| Section | Question it answers | Good content | Avoid |
|---|---|---|---|
| **Problem** | What was broken, slow, risky or missing — and for whom? | The workflow before; the cost of the status quo in concrete terms | "The client needed a modern solution" |
| **Constraints** | What limited the solution space? | Regulations/standards, data quality, team size, legacy systems, deadlines, deployment environment | Generic "scalability" without a reason |
| **Responsibility** | What exactly did Samuel own vs. others? | "Designed the domain model and API; built the calculation engine; frontend shared with X" | Implying sole ownership of team work |
| **System** | What was built, at what boundaries? | Components, data flow, storage, integration points; a `SystemDiagram` when it clarifies | Listing every library |
| **Decisions** | Which non-obvious choices were made and why? | Decision → reason → alternative considered | Decisions that weren't actually made consciously |
| **Trade-offs** | What was given up? | Costs accepted, risks left open | Pretending there were none |
| **Verified result** | What changed, measurably or observably? | Verified measurements/outcomes with method/source; or qualitative technical results ("deterministic calculations reproducible from inputs") | Unverified numbers, adoption claims for non-production work |

Optional deeper sections (body MDX): Architecture, What I'd change, Lessons.

## Home WorkRow summary
Only: status/source, title, one-sentence problem, one-line role, verified outcome if one exists, short stack, link. No decisions or trade-offs on Home.

## Experience entry (`src/content/experience.yaml`)
- **Problem** — the situation when Samuel arrived.
- **Owned** — scope of responsibility.
- **Built** — the systems, in concrete nouns.
- **Changed** — what was different afterwards (verified, or qualitative and honest).
2–4 lines per role. Employer names are allowed here.

## Prompts to ask Samuel when facts are missing
- What did people do before this system existed?
- Which rule, standard or constraint made this hard?
- Which part did you design yourself, and which did you inherit or share?
- What did you choose *not* to do, and why?
- Is there any number you can verify, and how was it measured?
