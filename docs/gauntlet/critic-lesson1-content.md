# Gauntlet Critic — Lesson 1 Content (algebra-i-01)

Critic pass over Slice 0 content artifacts. Fresh-context review; evidence cited to file:line. Validator run reproduced locally: `npx tsx scripts/validate-content.ts` → **PASSED** (5 KPs, 12 items, 6 phases, gate 3/4, locales en/es/pl).

## Verdict: PASS_WITH_GAPS

> **Orchestrator re-verify (post-critic):** Closed seam fixes 1–5 from the list below — choices render whenever authored; `MathText` keeps prose + LaTeX; schema `id` pattern accepts `algebra-`/`lesson.`; ES/PL order-ops criteria localized; TX tags remapped off process standards; typed wrong-answer feedback differentiated; `requiredKpIds` enforced via independent-correct evidence set. Remaining for full PASS: ajv schema execution, diagnosticTag vocabulary, LaTeX compile lint.

The slice is playable end-to-end and the pedagogy skeleton is real, not decorative: canonical Groshell ordering is enforced at runtime regardless of authoring order, the mastery gate fires, unlocks wire to the world, and every MCQ distractor carries localized diagnostic feedback. But there is a live contract drift between content and runtime that silently guts the feedback loop on 5 of 12 items, the JSON Schema already contradicts its own canonical package, and one localization leak (English mnemonic in ES/PL) breaks the coverage bar's spirit. All fixable without redesign.

## Bar comparison (checklist)

### 1. Pedagogy (Groshell I/We/You + mastery gate + immediate feedback + atomic KPs)

- [x] Explicit sequence: `objectives → i_do → we_do → you_do → retrieval → complete` present in content, and runtime re-sorts phases into canonical order regardless of authored order (`src/lesson/useLessonSession.ts:10-17,58-63`). Good defensive design.
- [x] Mastery gate: `mastery.minIndependentCorrect=3 / minIndependentTotal=4`, live progress UI in `you_do` (`src/lesson/LessonOverlay.tsx:188-199`), unlocks fire on mastery.
- [x] Immediate feedback: every MCQ choice has `feedback` in all 3 locales plus `diagnosticTag`; wrong answers surface worked solution (`src/lesson/LessonOverlay.tsx:266-282`).
- [x] Atomic KPs + prereqs: 5 KPs, acyclic DAG, prereqs cross-validated (`scripts/validate-content.ts:158-164`). Math Academy-ish shape holds.
- [x] Misconceptions authored per KP; success criteria localized and surfaced in objectives phase.
- [ ] **5 items' authored choices never render.** `item.wedo.1`, `item.wedo.2`, `item.youdo.3`, `item.retr.1`, `item.retr.2` have `type: translate|evaluate` **and** a full set of tagged distractors — but the renderer only shows choices when `type === 'mcq'` (`src/lesson/LessonOverlay.tsx:207`), so those items fall through to the typed-input branch (line 223) and their distractor feedback (`order-ops`, `concat`, `ltr`, `square`…) is dead content. 42% of items lose the diagnostic-feedback loop. Items remain playable via `acceptableAnswers`.
- [ ] **Typed wrong answers get no targeted feedback.** `submitAnswer` returns `workedSolution` for both correct and incorrect — a dead conditional (`src/lesson/useLessonSession.ts:114-117`). "Immediate feedback" degrades to "see the solution" for all constructed-response items.
- [ ] **Gate ignores `requiredKpIds` at runtime.** Mastery is a pure 3/4 count (`useLessonSession.ts:91-98`). A student can miss `item.youdo.1` (kp.variable.symbol) and still master the lesson, contradicting `requiredKpIds: [all 5]`. Validator warns about coverage but semantics are advisory.
- [~] `i_do` phase contains two answerable MCQs. Groshell's I-do is pure teacher modeling; embedding checks is defensible as example–problem pairs (Sweller), but label it that way in `PIPELINE.md` so authors don't drift.
- [~] `retrieval` items re-test same-lesson KPs. Fine for Lesson 1 (no priors exist), but the pipeline must state that retrieval draws from *earlier* lessons once they exist — currently unwired despite `srDefaults` existing.
- [~] Answer checking is string-match with an `acceptableAnswers` allowlist (`useLessonSession.ts:41-56`). Brittle for symbolic equivalence (`4(w)`, `w·4`, `m×2` rejected); acceptable for Slice 0, flag for math-grading roadmap.

### 2. Math (KaTeX-ready LaTeX only, no image math)

- [x] Zero image/asset references anywhere under `content/` (grep-verified). All math is LaTeX strings.
- [x] KaTeX wired: `katex` + `react-katex` deps, `katex.min.css` imported in `src/main.tsx`, `MathText` renders `InlineMath`/`BlockMath` and supports `$…$` / `$$…$$` inline in prose (`src/lesson/MathText.tsx:57-82`).
- [x] LaTeX strings are KaTeX-safe (`\times`, `\;`); no exotic macros.
- [ ] **`MathText` drops prose when a LaTeX twin exists.** If the `latex` prop is set, the localized text is discarded entirely (`MathText.tsx:24-31`). Consequences in production right now: instruction verbs vanish — `item.wedo.2` renders just `2x + 3, x = 4`, losing "Evaluate…"; `item.retr.1` loses "Compute…"; worked solutions lose their explanatory sentence (e.g., `item.wedo.1` shows only `n + 7`, dropping "Sum means +; write n+7."). Exactly the explicit-task-clarity Groshell demands.
- [ ] Three competing math-authoring conventions are mixed: raw math in plain stems ("Evaluate 2x + 3…"), `stemLatex` twins, and `$…$` inline. `stemLatex` coverage is inconsistent (present on 5 items, absent on 7). Pick one convention and validator-enforce it.
- [ ] No validator check that LaTeX compiles (`katex.renderToString` in try/catch is ~10 lines).

### 3. Content (EN/ES/PL, standards union, IRT 1PL stub, SR fields)

- [x] EN/ES/PL: every `LocalizedString` enforced by validator; UI chrome localized (`src/i18n/ui.ts`); spot-check of ES/PL reads as genuine translation, not placeholder.
- [ ] **Untranslated English mnemonic leaks into ES/PL**: `kp.orderops.with-vars.successCriteria` — es: "…paréntesis, exponentes, **MD y AS**", pl: "…nawiasów, potęg, **MD i AS**" (`content/lessons/algebra-i-01/package.json:414-418`). "MD/AS" is the English PEMDAS decomposition; meaningless to ES/PL students. Validator can't catch this — needs a localization-fidelity rule (e.g., ASCII-abbrev lint on non-EN locales).
- [x] Standards union: CCSS + 12 jurisdictions (CA, NJ, MI, TX, NY, IL, MO, FL, WA, DC, OH, MN) on **every** KP and **every** item. Structurally excellent; jurisdiction set is schema-enumerated (`content-schema.v1.json:88-110`).
- [ ] **Standards accuracy unaudited.** TX tags `A.1A`/`A.1B`/`A.1C` are TEKS Algebra I *mathematical process standards* (apply math / problem-solving model), not the content strand for writing/evaluating expressions — likely wrong mapping. CCSS tags (6.EE.A.2, .2c, 6.EE.B.5, HSA.SSE.A.1, HSA.CED.A.1) are defensible. Needs one state-by-state accuracy pass; the structure makes that cheap.
- [x] IRT 1PL stub: `irtPriors {a, b}` on all KPs and items; `a=1` fixed and documented as reserved for 2PL (`src/content/types.ts:39-44`); `thetaStub` in `ProgressBlob` (types.ts:174). b-values plausibly ordered (-1.8 easy … +0.2). Honestly stub-level: nothing consumes `b` for adaptivity yet, and the builder notes say so.
- [x] SR fields: `srDefaults {initialIntervalDays, easeFactor, masteryThreshold}` on all KPs; runtime `KpProgressState` carries `nextReviewAt/intervalDays/easeFactor` (types.ts:133-143). Note: `masteryThreshold: 0.8` is authored but unused; all 5 KPs share identical defaults (stub-acceptable).

### Cross-cutting: schema/validator integrity

- [ ] **The canonical package fails its own JSON Schema.** Schema requires `id` matching `^lesson\.` (`content-schema.v1.json:29-31`); the package uses `"id": "algebra-i-01"`, and the hand-rolled validator permits `/^(lesson\.|algebra-)/` (`scripts/validate-content.ts:92`). Two sources of truth, already diverged, and nothing executes the JSON Schema (no ajv dep, not referenced in the validator). The schema file is currently decorative.
- [ ] Validator gaps: no phase-*order* check (you_do before i_do would pass — runtime saves you, but the content layer should reject it), no diagnosticTag vocabulary check (`order-ops` vs `order` vs `ltr` vs `partial` describe the same misconception across items), no linkage between `diagnosticTag` and `knowledgePoints[].misconceptions` (misconceptions have no ids), no LaTeX compile check.
- [x] What the validator *does* check is genuinely useful: locale completeness, KP/item/phase referential integrity, phase↔item kind consistency, MCQ exactly-one-correct, mastery counts, unlock↔worldIntegration wiring. Runs green in ~6s.

## Largest gap (single most important)

**The content↔runtime contract for items is undefined, and it silently disables the pedagogy's core mechanism.** Items are authored as dual-mode (typed answer + tagged MCQ distractors) but the type enum (`mcq|short|evaluate|translate`) can't express that, the schema permits it without comment, the validator doesn't flag it, and the renderer resolves the ambiguity by throwing the choices away. Result: the diagnostic-distractor feedback loop — the strongest part of the authoring — reaches students on only 7 of 12 items, and nobody would notice without reading the renderer. One sentence in the schema ("choices only valid when type=mcq", or an explicit `dual` mode) plus a renderer rule ("render choices whenever present") closes it; right now it's an unowned seam. The `MathText` prose-drop (Bar 2) is the same class of bug: an unexamined either/or branch eating authored content.

## Required fixes before PASS

Ordered by leverage. Items 1–3 are the bar-critical ones; 4–6 can land in the same pass.

1. **Resolve dual-mode items.** Either (a) flip `item.wedo.1/2`, `item.youdo.3`, `item.retr.1/2` to `type: "mcq"` and drop the typed path, or (b) define an explicit dual mode in schema + types + renderer (`render choices when present, else input`). Add a validator rule so `choices` on non-MCQ types is an error or a first-class semantic. Dead authored content is not allowed to survive review again.
2. **Fix `MathText`**: render localized text *and* the LaTeX twin (or migrate stems to `$…$` inline and delete the twin fields). Restore instruction verbs and worked-solution prose. Add a KaTeX-compile check to the validator while touching it.
3. **Kill the schema/validator drift**: fix the `id` pattern mismatch one direction or the other, and actually execute `content-schema.v1.json` in `validate-content.ts` (ajv) so the schema stops being decorative. This is a 30-minute fix that prevents every future silent divergence.
4. **Localization fidelity**: translate or drop "MD y AS" / "MD i AS" in `kp.orderops.with-vars.successCriteria` (es/pl); add a lint for untranslated English abbreviations in non-EN locales. Minor: es title "Informe de misión" → "Sesión informativa"; es "Rango avanzado" reads as adjective, not promotion.
5. **Standards audit**: re-map TX TEKS tags off process standards (A.1A/B/C) onto content strands; spot-verify FL B.E.S.T. and MN codes. Structure already supports this.
6. **Close the diagnostic loop**: give `misconceptions` stable ids, enum-validate `diagnosticTag` against them, unify the tag vocabulary. Decide whether the mastery gate enforces `requiredKpIds` per-KP or demote `requiredKpIds` to advisory in the schema docs — pick one, write it down.

## What already meets bar

- **Groshell sequence is load-bearing, not cosmetic**: canonical phase order enforced at runtime, phase tabs show progress, `tutorScript` per phase in 3 locales with TTS hook.
- **Mastery gate**: count-based 3/4 with live in-lesson score UI, unlock cascade (blueprint + rank + Zone Beta) wired through `worldIntegration` and cross-validated.
- **Immediate feedback on MCQs**: per-choice, per-locale, diagnostic-tagged, misconceptions authored per KP — the feedback design is the strongest part of this package.
- **KP atomization**: 5 tight KPs, validated acyclic prereq DAG, localized success criteria shown up front (objectives phase = "mission briefing" with success criteria — good Groshell/Wong alignment).
- **Math bar**: zero image math; KaTeX fully wired including `$…$` inline parsing; LaTeX is simple and safe.
- **Coverage bar (structural)**: EN/ES/PL completeness validator-enforced; standards union of CCSS + 12 jurisdictions on every KP *and* every item, schema-enumerated; IRT 1PL priors and SR defaults present at both content and runtime-type level with an honest stub story.
- **Pipeline realism**: 7-stage pipeline documented (`content/PIPELINE.md`), validator and stub generator exist and run (`content:validate` / `content:generate` / `content:pipeline` npm scripts), builder notes are candid about what's stubbed.
- **Validator substance**: referential integrity across KP↔item↔phase↔unlock is genuinely checked, not just JSON shape.

Bottom line: ship the slice as PASS_WITH_GAPS. The bones are good and the pedagogy is honestly implemented; the required fixes are all seam-closing between artifacts that individually look fine, which is exactly what a gauntlet exists to catch.
