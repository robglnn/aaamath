# Gauntlet Critic — Wave 24 Lesson 5 (algebra-i-05: Solving Two-Step Equations)

Critic pass with fresh context over `content/lessons/algebra-i-05/package.json`, `src/content/loadLesson.ts`, and the builder handoff `docs/gauntlet/builder-wave24-lesson5.md`. Grading style follows `docs/gauntlet/critic-wave22.md`. Validator reproduced locally: `npm run content:validate` → **5/5 PASSED, 0 warnings** (confirmed both before and after the critic fixes below).

## Verdict: PASS_WITH_GAPS

All 12 answer keys are mathematically correct and every worked solution / `bodyLatex` chain checks out. Two feedback strings that misdiagnosed their distractor's arithmetic (one asserting a false "step one") were found and fixed in place by this critic, plus three distractor tags brought in line with their own feedback (feedback/tag-only; no answer keys touched). Structure mirrors L2–L4 exactly (6 phases, 12 items, 4 KPs, 3/4 gate). Answer-value monotony — W22's largest gap — is genuinely fixed: all 12 keys are distinct. Remaining gaps are a carried-forward choice-position pattern and graph-honesty nits, not ship-blockers.

## Critical fixes applied by critic (in `algebra-i-05/package.json`, EN/ES/PL each)

1. **`item.ido.2` choice c feedback + tag** (`2x + 3 = 11`, distractor `x = 7`) — stated: *"11 ÷ 2 divides before removing the constant — subtract 3 first."* But 11 ÷ 2 = 5.5, which is not 7 and not on any path to 7; the only way to obtain `x = 7` is `(11 + 3) ÷ 2 = 7` — adding 3 instead of subtracting (wrong inverse), then dividing correctly. The `wrong-order` tag likewise didn't fit (every true wrong-order path yields 4, 2.5, or 8). Fixed feedback to: *"x = 7 comes from (11 + 3) ÷ 2 — adding 3 instead of subtracting: 2x = 8, then x = 4."* and retagged `wrong-order` → `wrong-inverse`. (ES/PL likewise.)
2. **`item.wedo.2` choice b feedback + tag** (`5x − 3 = 22`, distractor `x = 19`) — stated: *"22 − 3 = 19 is only step one — divide by 5 next."* This asserts a false step: 22 − 3 undoes nothing; undoing −3 means **adding** 3 (22 + 3 = 25). The distractor is wrong-inverse, not partial-solve. Fixed feedback to: *"19 comes from subtracting 3 — undo −3 by adding: 22 + 3 = 25, then divide by 5."* and retagged `partial-solve` → `wrong-inverse`. (ES/PL likewise.)
3. **`item.wedo.3` choice d tag** (`−4x + 8 = 0`, distractor `x = −8`) — tag said `sign-slip`, but the distractor is the intermediate RHS reported early (−4x = −8 → x = −8) and the item's own feedback already diagnosed exactly that ("After −4x = −8, divide both sides by −4"). Retagged `sign-slip` → `partial-solve`; feedback text unchanged. Sign-slip coverage is retained on choices b of this item and `item.youdo.3`.

## Checklist (9 bars from the gauntlet brief)

1. **Explicit I/We/You (Groshell)** — PASS. Objectives ("mission briefing" with success criteria) → i_do (2 modeled items with full worked LaTeX chains) → we_do (4 guided, incl. 2 typed) → you_do (4 independent) → retrieval (2) → complete. TutorScript per phase per locale. The two-form objective split (x/a + b vs ax + b) maps cleanly onto the two i_do models — good example–problem pairing.
2. **Math correctness** — PASS (after critic fixes). Every stem, answer key, worked solution, `bodyLatex` line, and distractor hand-verified; see audit table below. All 12 keys distinct (9, 4, 14, 5, 2, −3, 36, 6, −5, 7, 25, 3).
3. **Diagnostic distractors** — PASS (after critic fixes). Tags now match both the distractor arithmetic and their own feedback across all items. Remaining nits: `item.ido.1` d (`x = 1`, tagged `wrong-order`) is more naturally read as divide-instead-of-multiply on step 2, though a defensible wrong-order path exists (divide both sides by 3 first, then read x/9 = 1 as x = 1) and the feedback is correct either way — left as-is. `item.youdo.3` c (`x = −15`, tagged `wrong-inverse`) has several plausible buggy paths (−(10+5); −x = 15 after dropping the 3) and the "do not multiply" phrasing matches none precisely — feedback's correction is right, diagnosis imprecise.
4. **KP atomicity + prereq graph** — PASS_WITH_GAPS. Four genuinely atomic KPs, acyclic chain, all qualified cross-lesson refs resolve (validator-confirmed) and the **cross-lesson edges are truly epistemic**: x/a + b = c needs both L4 one-step KPs; signed needs `one-step-signed`; verify extends `one-step-verify`. However, the three in-package chain edges (`mult-then-add` ← `add-then-mult`, `signed` ← `mult-then-add`, `verify` ← `mult-then-add`) are **sequencing, not epistemic** — ax + b = c does not require x/a + b = c, and verifying by substitution does not require the ability to solve. Same flag as W22; defensible as spiral ordering but should be declared as such in `_pipelineMeta`.
5. **Localization fidelity EN/ES/PL** — PASS. Spot-checked ES and PL across stems, feedback, KP descriptions, phases, unlocks: no English leaks; math register correct (ES *despejar*, *coeficiente*, *sustitución*, *viga*; PL *współczynnik*, *podstawienie*, *cofnij*). The two fixed feedback strings were rewritten in all three locales with matching register. Same PL title nuance as W22 ("dwustopniowe" ~ "of two degrees"); acceptable.
6. **Mastery gate 3/4 + you_do covers required KPs** — PASS (full, and better than W22). Package: 4 `you_do` items ↔ 4 `requiredKpIds` exactly 1:1. Runtime: W22's carried gap is **closed** — `useLessonSession.ts:133-141` now requires both count (3/4) AND per-KP evidence (`requiredKpIds.every` against KPs evidenced by *correct* independent answers, lines 178-188). A student can no longer skip the verify item and still master.
7. **Terminal resolve L4→L5** — PASS. `loadLesson.ts:41-54`: L4 mastered → L5, else L3 → L4, else L2 → L3, else L1 → L2, else L1 — full chain L1…L5 correct. `LESSON_5_ID` exported, L5 registered in `LESSONS`, PIPELINE.md loader note accurate.
8. **Unlock ids collision-free** — PASS. `bp.balance.calibrator` / `rank.riser.chief` / `zone.epsilon.cal` are distinct from L1–L4 ids (grep-verified: ramp/initiate/pad.beta, rail/adept/annex, splitter/expert/gamma.relay, beam/operator/delta.balance) and have zero references in `src/` — consistent with the deferred GameView wiring. `worldIntegration` cross-references match; `terminal.lesson5` declared.
9. **Standards tags** — PASS (representative). Present on every KP and every item across all 13 jurisdictions. TX `7.11A` ("model and solve one-variable, two-step equations") and FL `MA.7.AR.2.2` (two-step one-variable equations) are precise content matches — the tightest jurisdiction anchoring so far. Verify KP/item carry the `6.EE.B.5` family (incl. TX `6.10B`, FL `MA.6.AR.2.3`, MN `6.2.3.3`) — the W22 critic's recommendation, adopted. Builder's open item stands: course-wide jurisdiction audit still owed.

## Math audit (every item hand-verified)

| Item | Stem | Key | Distractor arithmetic |
|---|---|---|---|
| ido.1 | x/3 + 4 = 7 | x = 9 ✓ | 11 = 7+4 ✓; 3 partial ✓; 1 = 3÷3 (tag nit, feedback correct) |
| ido.2 | 2x + 3 = 11 | x = 4 ✓ | 8 = 2x partial ✓; 7 = (11+3)÷2 — **feedback+tag fixed by critic**; 14 = 11+3 ✓ |
| wedo.1 | x/2 + 3 = 10 | 14 ✓ | typed; worked solution correct ✓ |
| wedo.2 | 5x − 3 = 22 | x = 5 ✓ | 19 = 22−3 — **feedback+tag fixed by critic**; 4.4 = 22÷5 ✓; 25 = 5x partial ✓ |
| wedo.3 | −4x + 8 = 0 | x = 2 ✓ | −2 sign-slip (−8÷−4 = 2) ✓; 8 transposition-without-sign nit; −8 intermediate RHS — **retagged partial-solve** |
| wedo.4 | 5 − 3x = 14 | −3 ✓ | typed; −3x = 9 ⇒ x = −3 correct ✓ |
| youdo.1 | x/4 + 2 = 11 | x = 36 ✓ | 13 = 11+2 ✓; 9 partial ✓; 2.75 = 11÷4 ✓ |
| youdo.2 | 4x + 7 = 31 | x = 6 ✓ | 24 = 4x partial ✓; 7.75 = 31÷4 ✓; 38 = 31+7 ✓ |
| youdo.3 | −3x − 5 = 10 | x = −5 ✓ | 5 sign-slip (15÷−3 = −5) ✓; −15 path-ambiguous nit ✓; 15 = −3x partial ✓ |
| youdo.4 | 3x − 7 = 14 (verify) | x = 7 ✓ | 5→8 ✓; 8→17 ✓; 6→11 ✓ (all substitution-consistent) |
| retr.1 | x/5 + 1 = 6 | x = 25 ✓ | 7 = 6+1 ✓; 5 partial ✓ |
| retr.2 | 5x + 3 = 18 | 3 ✓ | 15 = 5x partial ✓; 21 = 18+3 ✓ |

No wrong answer keys. The only wrong math shipped was in the two feedback strings fixed above.

## Single largest gap

**Choice-position monotony: all 10 MCQ correct answers sit at position "a", and the runtime never shuffles.** `LessonOverlay.tsx:329` renders `choices.map` in authored order, so the top option is correct on every MCQ in the lesson — including all four `you_do` gate items. A student can click the first choice throughout and clear the 3/4 gate plus both retrieval pulses without doing any math. Grep confirms L2–L4 have the identical all-a pattern (L1 alone mixes a/b), so this is a **carried-forward, course-wide** hole that W22's critic missed, not something wave 24 introduced — but L5 as shipped inherits it, and it now gates five lessons. Fix belongs in a course-wide pass: either render-time choice shuffling (engine-side, one change, no content edits) or re-seating keys across positions in every package (content-side). Engine-side shuffle is the cheaper, durable fix.

## Other gaps (non-blocking)

- In-package prereq chain encodes lesson order, not knowledge dependency (bar 4) — second-largest issue; declare as spiral ordering in `_pipelineMeta` or trim.
- `item.ido.1` d / `item.youdo.3` c tag-vs-path imprecision (bar 3 nits); the `wrong-order`/`wrong-inverse` vocabulary still isn't enum-validated, drift noted since L1.
- `item.retr.2` is `type: "evaluate"` carrying both `answer` and `choices` — consistent with L4's retr.2 and handled at runtime (`useChoices` branch), but the type vocabulary conflates typed vs choice response; worth a schema note when item types get enum-validated.
- Builder-acknowledged, confirmed here: short-answer normalization (`14` vs `x=14` vs `x = 14`) is enumerated per item; a broader matcher is still preferable when the overlay runs L5. Retrieval draws only same-lesson KPs (cross-lesson spacing still unwired).
- `scripts/gen-lesson5-wave24.ts` remains in the tree; per builder note, delete after sign-off or keep for regeneration. Critic has no objection to deletion — the package no longer needs it (note: regenerated output would **revert** the three critic fixes above; delete or regenerate-then-refix).

## Next recommendation

Proceed to the deferred **GameView wiring wave** for L5 (place `terminal.lesson5`, surface `bp.balance.calibrator` / `rank.riser.chief` / `zone.epsilon.cal` props, HUD strings), following the wave-20→21 precedent — it is the only user-visible piece still missing. Before (or alongside) that wave, schedule a small **cross-lesson assessment-integrity pass**: engine-side choice shuffling (kills the all-a pattern for L1–L5 at once), the `_pipelineMeta` spiral-ordering declaration for in-package prereqs, and a tag-vocabulary enum. Within this wave's scope, L5 content is approved to ship. No commit made, per convention.
