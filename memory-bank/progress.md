# Progress

## What works (Slice 0 + overnight wave)
- Vite React TS + R3F + KaTeX SPA; `npm run build` green
- Algebra I Lesson 1 package EN/ES/PL with 5 KPs, 12 items, mastery 3/4
- Content schema + validate/generate pipeline scripts
- 3D training range: move, **pointer-lock mouse-look**, terminal, Zone Beta gate, blueprint place, touch stick
- Lesson overlay: I/We/You phases, KaTeX, speech STT/TTS + text fallback
- Progress: IndexedDB + localStorage; **KP/standards UI updates on answers/mastery**; jurisdiction view; locale switcher
- Adaptive stub: live θ update + Rasch info ordering on independent items; spaced `nextReviewAt`
- Deploy: GH Pages workflow on `main` → `dist/`
- Docs: handoff, decisions, ADRs (incl. 004 standards), CONTEXT, memory-bank, gauntlet reports

## Acceptance checklist
- [x] Lesson 1 structured EN/ES/PL + KaTeX + explicit sequence + mastery + feedback
- [x] KPs defined, prereq-linked, standards-tagged (union / best-effort — ADR-004)
- [x] Jurisdiction selector shows standards coverage from KP tags (live after play)
- [x] Adaptive/spaced/mastery stubbed **and lightly live** (θ + item order + SR schedule)
- [x] Content pipeline docs + validate/generate working example
- [x] Gauntlet reports under `docs/gauntlet/`
- [x] Fortnite-lite shell serving learning goals (pointer-lock + visual pass)
- [x] `npm run build` green
- [x] GH Pages workflow present (repo currently rejects Pages enable — plan/visibility; use itch/`dist` zip)

## Known gaps vs full handoff
- Visuals improved (terminal beacon, gate unlock FX, place feedback, lighting) but still procedural-only, short of AAA Fortnite bar
- Standards codes not curriculum-specialist audited
- Bundle ~1.4MB JS (Three) — code-split later
- No Lesson 2 yet; speech voice mapping per locale thin
- Live GH Pages blocked until repo supports Pages; itch.io path documented

## Commits this overnight resume
- `a4b4bb8` — progress wiring, pointer-lock, visuals, adaptive stub, Pages workflow, ADR-004
- `be9859a` — build-mode place without lock; Pages CI gated for private repo
- `212c0ef` — freeze you_do adaptive order (critic largest-gap fix) + critic report

## Next steps
1. Make repo public (or Pro) + set `ENABLE_GH_PAGES=true`, or upload `dist/` to itch
2. Lesson 2 via pipeline stages
3. Harden speech voice mapping per locale
4. Expand Algebra I KP graph beyond Lesson 1 slice
5. Account sync against ProgressBlob schema
