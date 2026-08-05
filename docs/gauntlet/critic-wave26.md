# Gauntlet Critic — Wave 26 Lesson 6 (algebra-i-06: Variables on Both Sides)

Critic pass with fresh context over `content/lessons/algebra-i-06/package.json`, `src/content/loadLesson.ts`, and the builder handoff `docs/gauntlet/builder-wave26-lesson6.md`. Grading style follows `docs/gauntlet/critic-wave24.md`. Validator reproduced locally: `npm run content:validate` → **6/6 PASSED, 0 warnings** (confirmed both before and after the critic fixes below).

## Verdict: PASS_WITH_GAPS

All 12 answer keys are mathematically correct and every worked solution / `bodyLatex` chain checks out. Five distractor feedback strings that misdiagnosed their choice's arithmetic (asserting steps that do not produce the distractor value) were found and fixed in place by this critic, plus three distractor tags brought in line with the corrected diagnoses (feedback/tag-only; no answer keys touched). Structure mirrors L2–L5 exactly (6 phases, 12 items, 4 KPs, 3/4 gate). Answer keys are all distinct (5, 4, 6, 7, 3, −3, 8, 2, −2, 9, 10, −4). MCQ correct positions are genuinely mixed within this lesson (c, a, b, c, d, a, b, c, a) — a partial response to W24's all-a monotony, though the runtime still does not shuffle. Remaining gaps are deferred L6 3D props, course-wide choice shuffle, and in-package prereq sequencing — not ship-blockers for content.

## Critical fixes applied by critic (in `algebra-i-06/package.json`, EN/ES/PL each)

1. **`item.ido.2` choice c feedback + tag** (`5x − 1 = 2x + 11`, distractor `x = 3`) — stated: *"11 − 1 = 10 is wrong: undo −1 by adding 1 → 12."* But 11 − 1 = 10 is not on any path to `x = 3`; the only way to obtain `x = 3` is `12 ÷ 4` after correctly reaching `3x = 12` — dividing by 4 instead of 3 (coefficient confusion from `2x`). Fixed feedback to: *"x = 3 comes from 12 ÷ 4 — after 3x = 12, divide by 3, not 4."* and retagged `wrong-inverse` → `wrong-order`. (ES/PL likewise.)
2. **`item.ido.2` choice d feedback + tag** (`5x − 1 = 2x + 11`, distractor `x = 2`) — stated: *"Subtracting 5x instead of 2x flips the variable side incorrectly."* Subtracting 5x yields `x = −4`, not 2; `x = 2` comes from `12 ÷ 6` after `3x = 12`. Fixed feedback to: *"x = 2 comes from 12 ÷ 6 — after 3x = 12, divide by 3, not 6."* and retagged `wrong-side` → `wrong-order`. (ES/PL likewise.)
3. **`item.wedo.3` choice a feedback** (`−2x + 9 = 3x − 6`, distractor `x = −3`) — stated: *"subtracting 3x from −2x gives −5x, not +x."* That sign-slip path yields `x = −15`, not −3; `x = −3` comes from `−15 ÷ 5` — dividing by +5 instead of −5 after `−5x = −15`. Fixed feedback to: *"−15 ÷ 5 = −3 uses +5 as the divisor — after −5x = −15, divide by −5."* Tag `sign-slip` retained; feedback text corrected. (ES/PL likewise.)
4. **`item.youdo.1` choice c feedback + tag** (`5x + 2 = 2x + 26`, distractor `x = 6`) — stated: *"Subtracting 5x from both sides leaves a negative path to a different value."* Subtracting 5x yields `x = −8`; `x = 6` comes from `26 − 8` — wrong inverse on the constant after collecting (`3x + 2 = 26`). Fixed feedback to: *"x = 6 comes from 26 − 8 — after collecting, subtract 2 (not 8): 3x = 24, x = 8."* and retagged `wrong-side` → `wrong-inverse`. (ES/PL likewise.)
5. **`item.youdo.3` choice d feedback + tag** (`−3x + 5 = x + 13`, distractor `x = −8`) — stated: *"Subtracting 5 from 13 with a sign flip error on the variable side."* `13 − 5 = 8`, not −8; `x = −8` is the intermediate `−4x` value reported as the answer after `−4x = 8`. Fixed feedback to: *"−8 is the intermediate −4x value — divide both sides by −4 to get x = −2."* and retagged `wrong-inverse` → `partial-solve`. (ES/PL likewise.)

## Checklist (9 bars from the gauntlet brief)

1. **Explicit I/We/You (Groshell)** — PASS. Objectives (mission briefing with success criteria) → i_do (2 modeled items with full worked LaTeX chains) → we_do (4 guided, incl. 2 typed) → you_do (4 independent) → retrieval (2) → complete. TutorScript per phase per locale. The three-form objective split (collect / isolate / signed+verify) maps cleanly onto the four KPs.
2. **Math correctness** — PASS (after critic fixes). Every stem, answer key, worked solution, `bodyLatex` line, and distractor hand-verified; see audit table below. All 12 keys distinct (5, 4, 6, 7, 3, −3, 8, 2, −2, 9, 10, −4).
3. **Diagnostic distractors** — PASS (after critic fixes). Tags now match both the distractor arithmetic and their own feedback across all items. Remaining nits: `item.ido.1` b (`x = 5/3`, tagged `partial-solve`) is more naturally read as wrong-side (adding x instead of subtracting); feedback's correction path is correct. `item.wedo.2` d (`x = 5`) and `item.retr.2` d (`x = 6`) have vague feedback that doesn't cite a precise buggy path — diagnosis imprecise but not false.
4. **KP atomicity + prereq graph** — PASS_WITH_GAPS. Four genuinely atomic KPs, acyclic chain, all qualified cross-lesson refs resolve (validator-confirmed) and the **cross-lesson edges are truly epistemic**: collect needs L5 `mult-then-add`; isolate needs L5 `add-then-mult`; signed needs L5 `two-step-signed`; verify needs L5 `two-step-verify`. However, the three in-package chain edges (`isolate` ← `collect`, `signed` ← `isolate`, `verify` ← `isolate`) are **sequencing, not epistemic** — signed equations do not require unsigned isolation first, and verify does not require the ability to solve signed cases. Same flag as W22–W24; defensible as spiral ordering but should be declared in `_pipelineMeta`.
5. **Localization fidelity EN/ES/PL** — PASS. Spot-checked ES and PL across stems, feedback, KP descriptions, phases, unlocks: no English leaks; math register correct (ES *despejar*, *coeficiente*, *sustitución*, *viga*; PL *współczynnik*, *podstawienie*, *cofnij*). The five fixed feedback strings were rewritten in all three locales with matching register.
6. **Mastery gate 3/4 + you_do covers required KPs** — PASS (full). Package: 4 `you_do` items ↔ 4 `requiredKpIds` exactly 1:1. Runtime: `useLessonSession.ts:133-141` requires both count (3/4) AND per-KP evidence (`requiredKpIds.every` against KPs evidenced by *correct* independent answers, lines 178-188). A student cannot skip the verify item and still master.
7. **Terminal resolve L1→L6** — PASS. `loadLesson.ts:42-60`: L5 mastered → L6, else L4 → L5, else L3 → L4, else L2 → L3, else L1 → L2, else L1 — full chain L1…L6 correct. `LESSON_6_ID` exported, L6 registered in `LESSONS`.
8. **Unlock ids collision-free** — PASS. `bp.balance.mirror` / `rank.riser.vanguard` / `zone.zeta.mirror` are distinct from L1–L5 ids (grep-verified: ramp/initiate/pad.beta, rail/adept/annex, splitter/expert/gamma.relay, beam/operator/delta.balance, calibrator/chief/epsilon.cal) and have zero references in `src/` game wiring yet — consistent with deferred GameView props (W25 owns L5). `worldIntegration` cross-references match; `terminal.lesson6` declared.
9. **Standards tags** — PASS (representative). Present on every KP and every item across all 13 jurisdictions. TX `A.5A` / `8.8C` and FL `MA.8.AR.2.1` / `MA.8.AR.2.3` are precise content matches for both-sides linear equations. Verify KP/item carry the `6.EE.B.5` family (incl. TX `6.10B`, FL `MA.6.AR.2.3`, MN `6.2.3.3`) — same pattern as W24. Course-wide jurisdiction audit still owed.

## Math audit (every item hand-verified)

| Item | Stem | Key | Distractor arithmetic |
|---|---|---|---|
| ido.1 | 2x + 3 = x + 8 | x = 5 ✓ | 11 = 8+3 (constant grab) ✓; 5/3 = add-x collect ✓ (tag nit); 8 = intermediate RHS ✓ |
| ido.2 | 5x − 1 = 2x + 11 | x = 4 ✓ | 12 = 3x partial ✓; 3 = 12÷4 — **feedback+tag fixed by critic**; 2 = 12÷6 — **feedback+tag fixed by critic** |
| wedo.1 | 3x + 7 = x + 19 | 6 ✓ | typed; worked solution correct ✓ |
| wedo.2 | 4x − 5 = x + 16 | x = 7 ✓ | 21 = 3x partial ✓; 11/3 = (16−5) wrong-inverse ✓; 5 = vague path nit |
| wedo.3 | −2x + 9 = 3x − 6 | x = 3 ✓ | −3 = −15÷5 sign-slip — **feedback fixed by critic**; 15 = 9−(−6) partial ✓; −15 = intermediate RHS ✓ |
| wedo.4 | 5 − 2x = x + 14 | −3 ✓ | typed; −3x = 9 ⇒ x = −3 correct ✓ |
| youdo.1 | 5x + 2 = 2x + 26 | x = 8 ✓ | 28 = 2+26 wrong-inverse ✓; 24 = 3x partial ✓; 6 = 26−8 — **feedback+tag fixed by critic** |
| youdo.2 | 6x − 4 = 3x + 2 | x = 2 ✓ | 6 = 3x partial ✓; −2 sign-slip ✓; 2/3 = divide-before-add ✓ |
| youdo.3 | −3x + 5 = x + 13 | x = −2 ✓ | 2 sign-slip (8÷−4) ✓; 8 = −4x partial ✓; −8 intermediate — **feedback+tag fixed by critic** |
| youdo.4 | 2x + 5 = x + 14 (verify) | x = 9 ✓ | 5→15≠19 ✓; 14→33≠28 ✓; 4→13≠18 ✓ (all substitution-consistent) |
| retr.1 | 4x + 1 = 2x + 21 | x = 10 ✓ | 20 = 2x partial ✓; 11 = 21+1 wrong-inverse ✓; 5 = halve-too-early nit |
| retr.2 | 3 − 2x = x + 15 | −4 ✓ | typed; 4 sign-slip ✓; −12 intermediate nit; 6 vague path nit |

No wrong answer keys. The only wrong math shipped was in the five feedback strings fixed above.

## Single largest gap

**Engine-side choice shuffling still absent — predictable correct positions remain exploitable.** L6 authorship mixed MCQ correct positions (c, a, b, c, d, a, b, c, a) — a genuine improvement over L2–L5's all-a pattern — but `LessonOverlay.tsx` still renders `choices.map` in authored order with no shuffle. A student who learns the position map can still clear the 3/4 gate without doing math on several items (e.g. always pick position d on `youdo.1`, position c on `youdo.4`). This is a **carried-forward, course-wide** hole; L6 partially mitigated it at the content layer but did not close it. Fix belongs in a course-wide pass: render-time choice shuffling (engine-side, one change, no content edits) is still the cheaper, durable fix.

## Other gaps (non-blocking)

- In-package prereq chain encodes lesson order, not knowledge dependency (bar 4) — second-largest issue; declare as spiral ordering in `_pipelineMeta` or trim.
- `item.ido.1` b / `item.wedo.2` d / `item.retr.2` d tag-vs-path imprecision (bar 3 nits); the `wrong-order`/`wrong-inverse` vocabulary still isn't enum-validated, drift noted since L1.
- `item.retr.2` is `type: "evaluate"` carrying both `answer` and `choices` — consistent with L4/L5 retr.2 and handled at runtime (`useChoices` branch), but the type vocabulary conflates typed vs choice response.
- Deferred L6 GameView 3D props (`bp.balance.mirror`, `rank.riser.vanguard`, `zone.zeta.mirror`) — content unlocks declared but no `L6UnlockProps` / store flags yet (W25 owns L5 props in parallel).
- `scripts/gen-lesson6-wave26.ts` remains in the tree; per builder note, delete after sign-off or keep for regeneration. Critic has no objection to deletion — regenerated output would **revert** the five critic fixes above; delete or regenerate-then-refix.
- Short-answer normalization (`6` vs `x=6` vs `x = 6`) is enumerated per item; broader matcher still preferable when overlay runs L6.

## Next recommendation

Proceed to **L6 GameView wiring** (`terminal.lesson6`, `bp.balance.mirror` / `rank.riser.vanguard` / `zone.zeta.mirror` props, HUD strings) following the W25 L5 precedent — it is the only user-visible piece still missing for L6. Before (or alongside) that wave, schedule the **cross-lesson assessment-integrity pass** flagged since W24: engine-side choice shuffling (kills predictable-position exploits for L1–L6 at once), `_pipelineMeta` spiral-ordering declaration for in-package prereqs, and tag-vocabulary enum. Within this wave's scope, L6 content is approved to ship. No commit made, per convention.
