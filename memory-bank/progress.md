# Progress

## What works (Slice 0)
- Vite React TS + R3F + KaTeX SPA; `npm run dev` / `npm run build` succeed
- Algebra I Lesson 1 package EN/ES/PL with 5 KPs, 12 items, mastery 3/4
- Content schema + validate/generate pipeline scripts
- 3D training range: move, terminal, Zone Beta gate, blueprint place, touch stick
- Lesson overlay: I/We/You phases, KaTeX, speech STT/TTS + text fallback
- Progress: IndexedDB + localStorage, jurisdiction standards view, locale switcher
- Docs: handoff, decisions, ADRs, CONTEXT, memory-bank, README title options

## Acceptance checklist
- [x] Lesson 1 structured EN/ES/PL + KaTeX + explicit sequence + mastery + feedback
- [x] KPs defined, prereq-linked, standards-tagged (union approach)
- [x] Jurisdiction selector shows standards coverage stub from KP tags
- [x] Adaptive/spaced/mastery stubbed (IRT 1PL priors, SR fields, mastery gate)
- [x] Content pipeline docs + validate/generate working example
- [x] Gauntlet reports under `docs/gauntlet/` (PASS_WITH_GAPS)
- [x] Fortnite-lite shell serving learning goals
- [x] `npm run build` green

## Known gaps vs full handoff
- Mouse-look / pointer-lock polish limited (Q/C yaw)
- IRT adaptive item selection not live (priors stored only)
- Standards codes are union stubs — need curriculum specialist pass for exact state codes
- Bundle ~1.4MB JS (Three) — code-split later for mobile
- No gh-pages deploy workflow yet

## Next steps
1. Wire GitHub Pages / itch upload from `dist/`
2. Lesson 2 via pipeline stages
3. Harden speech voice mapping per locale
4. Expand Algebra I KP graph beyond Lesson 1 slice
5. Account sync against ProgressBlob schema
