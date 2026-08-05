# ADR-004: Standards tagging (best-effort union)

**Status:** Accepted for Slice 0  
**Date:** 2026-08-05

## Context

Handoff requires mapping Lesson 1 KPs/items to CCSS + CA, NJ, MI, TX, NY, IL, MO, FL, WA, DC, OH, MN without per-state content forks. Exact official codes were not audited by a curriculum specialist in this overnight pass.

## Decision

1. **Union content, jurisdiction views:** One item bank; Progress UI filters `kp.standards[jurisdiction]` for reporting only.
2. **CCSS as primary anchors:** Prefer well-known codes (`6.EE.A.2`, `HSA.SSE.A.1`, `HSA.CED.A.1`, etc.) and map state codes as representative equivalents.
3. **Avoid process-only standards:** TX tags use Algebra I *content* strands (e.g. expression rewrite / evaluate) rather than A.1 process standards.
4. **Honest labeling:** Progress “evidenced” means mastery of tagged KPs in this lesson slice — not a certified state alignment audit.
5. **Future audit:** A curriculum specialist pass should replace representative codes; structure (`Partial<Record<Jurisdiction, string[]>>`) already supports that without content duplication.

## Consequences

- Jurisdiction selector is useful for demos and parent/teacher framing.
- Do not claim official state endorsement until audited.
- Pipeline validators check presence of jurisdiction keys, not semantic correctness of codes.
