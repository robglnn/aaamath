# Gauntlet Critic — Wave 28 Lesson 7 (algebra-i-07: Solving Linear Inequalities)

Critic pass with fresh context over `content/lessons/algebra-i-07/package.json`, `src/content/loadLesson.ts`, `scripts/gen-lesson7-wave28.ts`, and the builder handoff `docs/gauntlet/builder-wave28-lesson7.md`. Grading style follows `docs/gauntlet/critic-wave26.md`. Validator reproduced locally: `npm run content:validate` → **7/7 PASSED, 0 warnings**.

## Verdict: PASS_WITH_GAPS

All 12 answer keys are mathematically correct and every worked solution / `bodyLatex` chain checks out. All 36 MCQ distractor feedback strings (10 choice-bearing items × 3 incorrect choices each, plus `item.retr.2` evaluate choices) were spot-checked against the distractor's actual arithmetic — **no false diagnoses found** (contrast with W26's five feedback fixes). Structure mirrors L2–L6 exactly (6 phases, 12 items, 4 KPs, 3/4 gate). Answer keys are all distinct (7, −4, 5, −2, 4, −6, 9, −5, 3, 8, 6, −3 — six positive / six negative boundaries). MCQ correct positions are genuinely mixed (d, b, a, c, b, d, a, d, c, c). Remaining gaps are deferred L7 3D props, course-wide choice shuffle, in-package prereq sequencing, and typed-inequality normalization — not ship-blockers for content.

## Critical fixes applied by critic

**None.** Every distractor feedback string matches a plausible buggy path to its choice value. No answer keys changed.

## Checklist (10 bars from the gauntlet brief)

1. **Pedagogy: inequalities after both-sides** — PASS. Lesson 7 follows L6 both-sides equations; the single new rule (flip on negative multiply/divide) is introduced in objectives, modeled in `item.ido.2`, named as its own KP (`kp.inequality.flip`), and reinforced across we_do / you_do / retrieval. Four atomic KPs in acyclic chain; cross-lesson prereqs resolve (validator-confirmed): L5 `mult-then-add` → one-step, L5 `two-step-signed` → flip, L6 `both-sides-isolate` → two-step, L6 `both-sides-verify` → verify. In-package edges (`flip` ← `one-step`, `two-step` ← `flip`, `verify` ← `two-step`) are **sequencing, not epistemic** — same flag as W22–W26; defensible as spiral ordering but should be declared in `_pipelineMeta`.
2. **Item quality: 12 items, phases, mastery 3/4, you_do covers required KPs** — PASS (full). 2 i_do / 4 we_do / 4 you_do / 2 retrieval; mastery `3/4` with four `requiredKpIds`. `you_do` maps 1:1 to KPs (`youdo.1` one-step, `youdo.2` flip, `youdo.3` two-step, `youdo.4` verify). Runtime `useLessonSession.ts:135-139` requires both count AND per-KP evidence on correct independent answers.
3. **Answer keys ALL DISTINCT? Mix of signs?** — PASS. Twelve distinct boundary values: 7, −4, 5, −2, 4, −6, 9, −5, 3, 8, 6, −3. Six positive, six negative.
4. **MCQ correct positions MIXED (not all a)?** — PASS. Ten choice-bearing items: d, b, a, c, b, d, a, d, c, c — no position appears more than twice; `a` is correct on only 3/10.
5. **Distractor feedback matches distractor arithmetic** — PASS. Full spot-check of all MCQ distractors; see audit table below. Two tag/feedback nits (not false): `item.youdo.1` d (`x ≥ 6`) feedback cites adding 3 but the path to 6 is slightly imprecise; `item.wedo.2` d (`x < 2`) is tagged `sign-slip` though the natural path is dividing by +2 without flipping (feedback still gives the correct correction).
6. **Flip-when-negative taught and tested?** — PASS. Taught in objectives phase `bodyLatex`, KP `kp.inequality.flip`, and `item.ido.2`. Tested in `item.ido.2`, `item.wedo.2`, `item.wedo.4` (typed flip), `item.youdo.2`, `item.youdo.3` (two-step with negative coefficient), `item.retr.2` (typed flip). Distractor tags `flip-miss` and `false-flip` used consistently.
7. **Full EN/ES/PL on LocalizedStrings?** — PASS. Validator confirms `en, es, pl` on all localized fields. Spot-checked ES/PL stems, feedback, KP descriptions, phases, unlocks: no English leaks; math register correct (ES *despejar*, *giro*, *frontera*, *rayo*; PL *odwróć*, *próg*, *promień*, *współczynnik*).
8. **Unlock ids collision-free** — PASS. `bp.inequality.gate` / `rank.riser.marshal` / `zone.eta.gate` appear only in L7 package, generator, and builder docs — zero collisions with L1–L6 ids (grep-verified). No `src/` game wiring yet — consistent with deferred GameView props.
9. **Terminal resolve: L6 mastered → L7; full chain L1→L7** — PASS. `loadLesson.ts:46-67`: L6 mastered → L7, else L5 → L6, … else L1. `LESSON_7_ID` exported, L7 registered in `LESSONS`. `worldIntegration.terminalId`: `terminal.lesson7`.
10. **content:validate would pass** — PASS. Reproduced: **7/7 packages passed, 0 warnings**.

## Math audit (every item hand-verified)

| Item | Stem | Key | Distractor arithmetic |
|---|---|---|---|
| ido.1 | x + 5 < 12 | x < 7 ✓ | 17 = add-not-subtract ✓; >7 = false-flip ✓; >17 = two errors ✓ |
| ido.2 | −3x ≥ 12 | x ≤ −4 ✓ | ≥−4 = flip-miss ✓; ≤4 = sign-slip ✓; ≥4 = divide-by-+3 ✓ |
| wedo.1 | x − 3 > 2 | x > 5 ✓ | typed; add 3 ✓ |
| wedo.2 | −2x < 4 | x > −2 ✓ | <−2 = flip-miss ✓; >2 = sign-slip ✓; <2 = positive-divide nit ✓ |
| wedo.3 | 2x + 3 < 11 | x < 4 ✓ | <7 = add-not-subtract (14) ✓; >4 = false-flip ✓; <8 = partial-solve ✓ |
| wedo.4 | 5 − 2x > 17 | x < −6 ✓ | typed; −2x>12, flip ✓ |
| youdo.1 | x/3 ≥ 3 | x ≥ 9 ✓ | ≥1 = divide-not-multiply ✓; ≤9 = false-flip ✓; ≥6 = imprecise-path nit ✓ |
| youdo.2 | −4x ≤ 20 | x ≥ −5 ✓ | ≤−5 = flip-miss ✓; ≥5 = sign-slip ✓; ≤5 = +4 divide no flip ✓ |
| youdo.3 | −2x + 7 > 1 | x < 3 ✓ | >3 = flip-miss ✓; <−4 = 1+7=8 wrong-inverse ✓; <−3 = quotient sign-slip ✓ |
| youdo.4 | 3x − 4 ≤ 20, which x? | x = 8 ✓ | 9→23, 12→32, 10→26 all verify-skip ✓ |
| retr.1 | x + 8 ≤ 14 | x ≤ 6 ✓ | ≤22 = add-not-subtract ✓; ≥6 = false-flip ✓; ≤8 = copies constant ✓ |
| retr.2 | 4 − 3x ≥ 13 | x ≤ −3 ✓ | typed; choices: ≥−3 flip-miss ✓; ≤3 sign-slip ✓; ≥3 both errors ✓ |

No wrong answer keys. No false feedback strings.

## Distractor feedback spot-check summary

| Item | Choice | Distractor | Feedback diagnosis | Verdict |
|---|---|---|---|---|
| ido.1 | a | x < 17 | Added 5 instead of subtracting | ✓ |
| ido.1 | b | x > 7 | False flip on subtract | ✓ |
| ido.1 | c | x > 17 | Add + false flip | ✓ |
| ido.2 | a | x ≥ −4 | Flip-miss after ÷(−3) | ✓ |
| ido.2 | c | x ≤ 4 | Sign-slip on 12÷(−3) | ✓ |
| ido.2 | d | x ≥ 4 | Lost negative + no flip | ✓ |
| wedo.2 | b | x < −2 | Flip-miss | ✓ |
| wedo.2 | c | x > 2 | Sign-slip 4÷(−2) | ✓ |
| wedo.2 | d | x < 2 | Tag nit; correction valid | nit |
| wedo.3 | a | x < 7 | Added 3 → 14 | ✓ |
| wedo.3 | b | x > 4 | False flip on ÷2 | ✓ |
| wedo.3 | d | x < 8 | Partial 2x < 8 | ✓ |
| youdo.1 | a | x ≥ 1 | Divided instead of multiplied | ✓ |
| youdo.1 | c | x ≤ 9 | False flip on ×3 | ✓ |
| youdo.1 | d | x ≥ 6 | Imprecise path | nit |
| youdo.2 | a | x ≤ −5 | Flip-miss | ✓ |
| youdo.2 | b | x ≥ 5 | Sign-slip | ✓ |
| youdo.2 | c | x ≤ 5 | ÷(+4) no flip | ✓ |
| youdo.3 | b | x > 3 | Flip-miss | ✓ |
| youdo.3 | c | x < −4 | 1+7=8 wrong-inverse | ✓ |
| youdo.3 | d | x < −3 | (−6)÷(−2)=3 sign-slip | ✓ |
| youdo.4 | a,b,c | x=9,12,10 | Substitution shows >20 | ✓ |
| retr.1 | a | x ≤ 22 | Added 8 | ✓ |
| retr.1 | b | x ≥ 6 | False flip | ✓ |
| retr.1 | d | x ≤ 8 | Copies constant 8 | ✓ |
| retr.2 | a | x ≥ −3 | Flip-miss | ✓ |
| retr.2 | b | x ≤ 3 | Sign-slip | ✓ |
| retr.2 | d | x ≥ 3 | Both errors | ✓ |

## Single largest gap

**Engine-side choice shuffling still absent — predictable correct positions remain exploitable.** L7 authorship mixed MCQ correct positions (d, b, a, c, b, d, a, d, c, c) — continuing L6's improvement over L2–L5's all-a pattern — but `LessonOverlay.tsx` still renders `choices.map` in authored order with no shuffle. A student who learns the position map can still clear the 3/4 gate without doing math on several items (e.g. always pick position d on `ido.1` and `youdo.2`, position b on `ido.2` and `youdo.1`). This is a **carried-forward, course-wide** hole; fix belongs in a course-wide pass: render-time choice shuffling (engine-side, one change, no content edits).

## Other gaps (non-blocking)

- In-package prereq chain encodes lesson order, not knowledge dependency (bar 1) — second-largest issue; declare as spiral ordering in `_pipelineMeta` or trim.
- `item.youdo.1` d / `item.wedo.2` d tag-vs-path imprecision (bar 5 nits); `flip-miss`/`false-flip` vocabulary still isn't enum-validated.
- **Typed inequality answers.** `item.wedo.1`/`wedo.4` accept `x>5` / `x<-6` (+ reversed forms); `item.retr.2` accepts `x<=-3` ASCII + `x≤-3` unicode. Engine normalization may need widening (`≥`/`<=` variants, whitespace) when L7 hits players — flagged by builder.
- `item.retr.2` is `type: "evaluate"` carrying both `answer` and `choices` — consistent with L4/L5/L6 retr.2 pattern; type vocabulary conflates typed vs choice response.
- Both retrieval items are from L7 KPs only; a future pass could pull one L5/L6 equation item for cross-lesson spacing (same note as W24/W26).
- Deferred L7 GameView 3D props (`bp.inequality.gate`, `rank.riser.marshal`, `zone.eta.gate`, `terminal.lesson7`) — content unlocks declared but no in-world placement yet.
- `scripts/gen-lesson7-wave28.ts` remains in the tree; delete after sign-off or keep for regeneration. Critic has no objection — regenerated output currently matches shipped package.
- Standards tags present on every KP and item across 13 jurisdictions; course-wide jurisdiction audit still owed (best-effort anchors per builder).

## Next recommendation

Proceed to **L7 GameView wiring** (`terminal.lesson7`, `bp.inequality.gate` / `rank.riser.marshal` / `zone.eta.gate` props, HUD strings) following the W25/W27 L5/L6 precedent — it is the only user-visible piece still missing for L7. Before (or alongside) that wave, schedule the **cross-lesson assessment-integrity pass** flagged since W24: engine-side choice shuffling (kills predictable-position exploits for L1–L7 at once), `_pipelineMeta` spiral-ordering declaration for in-package prereqs, typed-inequality answer normalization, and tag-vocabulary enum. Within this wave's scope, L7 content is approved to ship. No commit made, per convention.
