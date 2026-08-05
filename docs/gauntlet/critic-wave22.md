# Gauntlet Critic — Wave 22 Lesson 4 (algebra-i-04: Solving One-Step Equations)

Critic pass with fresh context over `content/lessons/algebra-i-04/package.json`, `src/content/loadLesson.ts`, and the builder handoff `docs/gauntlet/builder-wave22-lesson4.md`. Grading style follows `docs/gauntlet/critic-lesson1-content.md`. Validator reproduced locally: `npm run content:validate` → **4/4 PASSED, 0 warnings** (confirmed both before and after the critic fixes below).

## Verdict: PASS_WITH_GAPS

All 12 marked answers are mathematically correct and every distractor's arithmetic matches its tagged misconception. Two feedback strings that stated **false math** were found and fixed in place by this critic (feedback-only; no answer keys touched). Structure mirrors L3 exactly (6 phases, 12 items, 4 KPs, 3/4 gate). Remaining gaps are assessment-integrity and graph-honesty issues, not ship-blockers.

## Critical fixes applied by critic (in `algebra-i-04/package.json`, EN/ES/PL each)

1. **`item.wedo.3` choice b feedback** (`-3x = 12`, distractor `x = 4`) — stated: *"A negative divided by a negative is negative here: 12 ÷ (−3)."* Two errors: 12 is **positive**, and negative ÷ negative is **positive** anyway. It also directly contradicted choice d's feedback in the same item ("positive ÷ negative = negative", which is correct). Fixed to: *"12 is positive: positive ÷ negative = negative, so x = −4, not 4."* (ES/PL likewise.)
2. **`item.wedo.2` choice d feedback** (`x/4 = 5`, distractor `x = 4/5`) — stated: *"Multiply 5 by 4, not 4 by 5 in the wrong order."* Implies multiplication order matters (4×5 = 5×4 regardless) and misdiagnoses the error — the student divided 4 by 5. Fixed to: *"4/5 comes from dividing 4 by 5 — undo division by multiplying: 5 × 4 = 20."* (ES/PL likewise.)

## Checklist (9 bars from the gauntlet brief)

1. **Explicit I/We/You (Groshell)** — PASS. Objectives ("mission briefing" with success criteria) → i_do (2 modeled items with full worked LaTeX chains) → we_do (4 guided, incl. 2 typed) → you_do (4 independent) → retrieval (2) → complete. TutorScript per phase per locale. i_do items being answerable MCQs is the same example–problem-pair compromise accepted in L1–L3; fine.
2. **Math correctness** — PASS (after critic fixes). Every stem, answer key, and distractor hand-verified; see audit table below.
3. **Diagnostic distractors** — PASS. Distractors map to real, named misconceptions (`wrong-inverse`, `partial-solve`, `reciprocal-confusion`, `sign-slip`, `verify-skip`) and their arithmetic checks out (e.g., `x = 1/5` on `3x = 15` is exactly the flipped-division error). Nit: `divide-not-multiply` on `item.ido.1`/`item.youdo.1` actually means "divided instead of subtracting" — the tag vocabulary drift noted in the L1 critic persists; unify when tags get enum-validated.
4. **KP atomicity + prereq graph** — PASS_WITH_GAPS. Four genuinely atomic KPs, acyclic chain, qualified cross-lesson refs all resolve (validator-confirmed). Two prereqs are **sequencing, not epistemic**: `algebra-i-03:kp.distribute.basic` on `kp.equation.one-step-addsub` (one-step add/sub never uses distribution) and `kp.equation.one-step-addsub` on `kp.equation.one-step-multdiv` (ax = b doesn't require x + a = b). Math Academy's bar wants true dependencies; these encode lesson order. Defensible as spiral design, but it should be documented as such or trimmed to the genuine prereqs (`combine.constants-signed`, `orderops.with-vars`).
5. **Localization fidelity EN/ES/PL** — PASS. Spot-checked ES and PL across stems, feedback, KP descriptions, unlocks: no English leaks (the L1 "MD y AS" class of bug is absent), math register correct (ES *despejar*, *recíproco*, *coeficiente*; PL *współczynnik*, *odwrotność*, *podstawienie*). Minor nuance: PL title "Równania jednostopniowe" — *jednostopniowe* can read as "of one degree" (stopień); acceptable, but "jednym krokiem" phrasing would be unambiguous.
6. **Mastery gate 3/4 + you_do covers required KPs** — PASS structurally: 4 `you_do` items ↔ 4 `requiredKpIds` exactly 1:1. Carried-forward runtime gap (known since L1, not new): the gate is a count-only 3/4 and ignores `requiredKpIds` — a student can miss `item.youdo.4` (verify KP) entirely and still master.
7. **Terminal resolve L3→L4** — PASS. `loadLesson.ts:37-46`: L3 mastered → L4, else L2 mastered → L3, else L1 mastered → L2, else L1. Chain correct, `LESSON_4_ID` exported, L4 registered in `LESSONS`.
8. **Unlock ids collision-free** — PASS. `bp.balance.beam` / `rank.riser.operator` / `zone.delta.balance` are distinct from L1–L3 ids (validator output confirms all four sets) and have zero references in `src/` (grep-verified) — consistent with the deferred GameView wiring. `worldIntegration` cross-references match; `terminal.lesson4` declared.
9. **Standards tags** — PASS (representative). Present on every KP and every item across all 13 jurisdictions. TX uses content strands this time (`A.5A` solve one-variable linear; `6.10B` determine values that make one-step equations true — both accurate, an improvement over L1's process-standard mapping). FL `MA.6.AR.2.3` / `MA.8.AR.2.1` accurate. One precision note: for `kp.equation.one-step-verify` (and `item.youdo.4`, whose stem literally echoes it) the precise CCSS anchor is **6.EE.B.5** ("which values make the equation true"), not just 6.EE.B.7 / 8.EE.C.7.

## Math audit (every item hand-verified)

| Item | Stem | Key | Distractor arithmetic |
|---|---|---|---|
| ido.1 | x + 5 = 12 | x = 7 ✓ | 17 = 12+5 ✓; 5 partial ✓; 2.4 = 12÷5 ✓ |
| ido.2 | 3x = 15 | x = 5 ✓ | 45 = 15×3 ✓; 12 = 15−3 ✓; 1/5 = 3/15 ✓ |
| wedo.1 | x − 8 = 3 | 11 ✓ | typed; worked solution correct ✓ |
| wedo.2 | x/4 = 5 | x = 20 ✓ | 1.25 = 5÷4 ✓; 9 = 5+4 ✓; 4/5 ✓ |
| wedo.3 | −3x = 12 | x = −4 ✓ | 4 sign-slip ✓; −36 = 12×(−3) ✓; 36 both errors ✓ |
| wedo.4 | x + (−2) = 9 | 11 ✓ | typed; x − 2 = 9 rewrite correct ✓ |
| youdo.1 | x + 9 = 20 | x = 11 ✓ | 29 = 20+9 ✓; 9 partial ✓; 2.22 = 20÷9 ✓ |
| youdo.2 | 5x = 35 | x = 7 ✓ | 175 = 35×5 ✓; 30 = 35−5 ✓; 5/35 ✓ |
| youdo.3 | x − (−5) = 12 | x = 7 ✓ | 17 (as x − 5) ✓; −7 sign ✓; 5 partial ✓ |
| youdo.4 | 2x + 1 = 9 | x = 4 ✓ | 5→11 ✓; 8→17 ✓; 3→7 ✓ (all substitution-consistent) |
| retr.1 | x + 3 = 10 | x = 7 ✓ | 13 = 10+3 ✓; 3 partial ✓ |
| retr.2 | 4x = 28 | 7 ✓ | 112 = 28×4 ✓; 24 = 28−4 ✓ |

No wrong answer keys. The only wrong math shipped was in the two feedback strings fixed above.

Builder's open item #2 (youdo.4 uses a **two-step** equation while the KP success criteria say "one-step"): pedagogically acceptable — the item tests verify-by-substitution, which is what the KP teaches, and the numbers are trivial — but the KP `successCriteria` text should either say "linear equation" or the item should become one-step (e.g., "which value makes 3x = 12 true" is weaker). Recommend the criteria-text tweak, not an item change.

## Single largest gap

**Answer monotony: 8 of 12 items resolve to just two values.** `x = 7` is the answer to ido.1, youdo.2, youdo.3, retr.1, and retr.2 (5 items); `x = 11` answers wedo.1, wedo.4, and youdo.1 (3 items). A student who notices "it's usually 7" can pattern-match the whole you_do gate and both retrieval pulses without performing a single inverse operation — the mastery evidence is softer than it looks. Vary the numerals (e.g., youdo.2 → 6x = 42 stays 7… no: change constants so keys spread across values, keeping numbers integer and small). This is a one-pass content fix and worth doing before the lesson sees real students.

## Other gaps (non-blocking)

- Sequencing prereqs masquerading as knowledge prereqs (bar 4 above) — second-largest issue.
- Verify KP standards anchor should add `CCSS.MATH.CONTENT.6.EE.B.5`.
- `divide-not-multiply` tag semantics on add/sub items (vocabulary drift, known since L1).
- Runtime gate still ignores `requiredKpIds` (carried forward, cross-lesson).
- Builder-acknowledged, confirmed here: `wedo.1`/`wedo.4` short-answer normalization (`11` vs `x=11`) needs the broader matcher when the overlay runs L4; retrieval draws only same-lesson KPs (cross-lesson spacing still unwired).

## Next recommendation

Proceed to the deferred **GameView wiring wave** (place `terminal.lesson4`, surface `bp.balance.beam` / `rank.riser.operator` / `zone.delta.balance` props, HUD strings) — it is the only user-visible piece still missing and follows the wave-20→21 precedent. Fold a small **content polish pass** into that same wave: vary the 7/11 answer keys, add the 6.EE.B.5 tag to the verify KP, adjust the verify `successCriteria` wording, and either trim the two sequencing prereqs or add a `_pipelineMeta` note declaring them intentional spiral ordering. No commit made, per convention.
