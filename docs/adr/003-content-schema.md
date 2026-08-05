# ADR-003: Content Schema

## Status
Accepted

## Context
Need versioned, multi-locale, standards-tagged content consumable by game + adaptive stubs + pipeline.

## Decision
Versioned JSON packages under `content/`:
- `schema/content-schema.v1.json` — structural contract
- `lessons/<id>/package.json` — lesson meta + KP refs + phases + items + i18n + unlocks + standards

Fields include: knowledge points, prerequisites, items (stem, distractors, feedback), IRT 1PL priors (`b`, `discrimination` reserved), spaced-repetition defaults, standards tags (CCSS + CA/NJ/MI/TX/NY/IL/MO/FL/WA/DC/OH/MN), locale strings EN/ES/PL.

## Consequences
- Pipeline validates before ship
- Lessons are data; engine stays thin
- Union standards approach: content covers the more demanding overlapping requirement
