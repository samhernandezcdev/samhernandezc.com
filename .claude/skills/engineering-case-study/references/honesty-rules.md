# Honesty rules

## Never fabricate
Metrics, clients, users, traffic, production usage, AI experience, project maturity, responsibilities, technical decisions. If it cannot be verified, it does not ship. Unknowns become `TODO(sam): …`.

## Measurement split

```ts
technicalMeasurements[] {
  label: string;          // "p95 retrieval latency"
  value: string;          // "182"
  unit?: string;          // "ms"
  method: string;         // how it was measured: dataset, tool, run count
  environment?: string;   // "local, 10k docs" / "staging"
  verified: boolean;
}

productionOutcomes[] {
  label: string;          // "quote preparation time"
  value: string;
  source: string;         // logs, stakeholder report, analytics
  verified: boolean;
}
```

| | technicalMeasurements | productionOutcomes |
|---|---|---|
| Examples | latency, throughput, recall@k/MRR, eval scores, cost per request, test pass rates, benchmark results | business impact, adoption, user counts, customer outcomes, revenue, production reliability/uptime |
| Allowed statuses | any, when verified | `production`, or `archived` with `wasProduction: true` |
| Required provenance | `method` (+ `environment` when relevant) | `source` |

- `verified: false` entries never render in production builds; dev shows them as "— pending verification" so gaps stay visible.
- Benchmarks of non-production systems are legitimate evidence — do not suppress them; label environment honestly.
- Non-production projects must not imply adoption ("used by teams", "trusted by") or production reliability.

## Evidence requirements
- Every technical decision in a public case study is confirmed by Samuel.
- Links (repo, demo, docs) must resolve and point to the real artifact.
- A public `building` project needs the evidence bar in `status-taxonomy.md`.

## Confidentiality — industrial engineering case study
The employer's production system is presented anonymized ("a production engineering system for an industrial company"). Before publishing, confirm the case study contains **none** of:
- [ ] company name or identifying company-specific product details
- [ ] the production URL or any internal hostname
- [ ] calculation formulas, coefficients or proprietary business/pricing rules
- [ ] database schema, table/column names or ER diagrams of the real system
- [ ] screenshots of the real UI or any private data
- [ ] customer, supplier, price, stock or other confidential data

Allowed: the engineering problem, constraints at a general level, Samuel's responsibilities, system boundaries, architecture shape (generic diagram), decisions and trade-offs, operational impact that is verified and non-confidential.

**Employer identity is a separate concern.** Naming the employer in the CV, the Experience section and `Person.worksFor` is allowed — employment history is already public. Just don't connect the anonymized case study to company-specific details.

A future public CPQ project built from scratch must use synthetic domain data and no employer IP.
