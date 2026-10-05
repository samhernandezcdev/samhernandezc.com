# Status taxonomy

Three independent fields on every `work` entry.

## `status` (lifecycle)
| Value | Meaning | May be public? | May claim |
|---|---|---|---|
| `research` | Exploring the problem space | **No** (draft only) | nothing |
| `designing` | Architecture/design in progress, little or no code | **No** (draft only) | nothing |
| `building` | Real code exists and a vertical slice works | Only with the evidence bar below; **max one public at a time** | verified technicalMeasurements, qualitative technical results |
| `production` | Running for real users/operations | Yes | technicalMeasurements and productionOutcomes (verified) |
| `archived` | No longer maintained | Yes | technicalMeasurements; productionOutcomes only if `wasProduction: true` |

## `source`
`open` or `private`. Orthogonal to status — a project can be `production` and `open`.

## `visibility`
`public` or `draft`. **Default for any future/speculative project is `draft`.** Drafts never render in production builds and are excluded from the sitemap, RSS and the command palette.

## Evidence bar for public `building`
All of:
- an actual repository (`evidence.repo`, resolving URL)
- a substantial README (`evidence.readme: true`) — what it is, how to run it, current scope
- documented architecture (`evidence.architectureDoc`)
- meaningful commit history (human check — not one initial dump)
- at least one working vertical slice (`evidence.verticalSlice`: one line describing what works end to end)

Never publish empty roadmap projects to signal interest.

## Enforcement
- Zod `superRefine` on the `work` collection:
  1. `productionOutcomes` non-empty ⇒ `production`, or `archived` with `wasProduction`.
  2. `public` + (`research` | `designing`) ⇒ build error.
  3. `public` + `building` ⇒ evidence fields required.
  4. `technicalMeasurements[].method` required.
- Collection-level check: more than one public `building` entry ⇒ build error.

## Current seed intent
- Industrial engineering platform — `production`, `private`, public, anonymized.
- AI Schema & ETL Validation Harness, multi-tenant FastAPI backend — status/source pending Samuel's confirmation and repo URLs.
- Public CPQ, Enterprise Knowledge Agent, Agent Reliability Platform — `draft`.
- Heavy-Lift site — `archived`, listed under "Other work", not featured.
