# Critic report — Lesson UI + progress

**Artifact:** `src/lesson/*`, `src/progress/*`, `src/speech/*`, `src/i18n/ui.ts`, `src/App.tsx`  
**Critic:** Gauntlet CRITIC (fresh context)  
**Date:** 2026-08-05

## Verdict: PASS_WITH_GAPS

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| Explicit phase UI | Pass | `LessonOverlay` phase tabs via `phaseLabel`; session machine orders objectives → i_do → we_do → you_do → retrieval → complete (`useLessonSession`). |
| KaTeX | Pass | `MathText` uses `react-katex` Inline/Block + `$…$` / `$$…$$` split; stem/solution latex fields supported. |
| Mastery gate unlocks progress | Pass | Independent scoring in session; gate UI on `you_do`; `completeLessonMastery` marks lesson/KPs and pushes blueprint/rank/zone unlocks; `App` maps unlock IDs → `GameView`. Lesson package present at `content/lessons/algebra-i-01`. |
| Web Speech + text fallback | Pass | TTS/STT via `webSpeech.ts` with `canTTS`/`canSTT`; short-answer text input always available; mic errors surface as copy, not hard block. |
| Jurisdiction standards view | Pass | `StandardsView`: jurisdiction select, standards coverage rows, KP status, success-criteria details; wired from progress drawer in `App`. |
| Local persistence | Pass | IndexedDB (`idb-keyval`) + localStorage mirror; Zustand hydrate/debounced save; schema `1.0.0` ProgressBlob. |

## Largest gap

**Mastery immediately closes the overlay** (`handleMastery` → `onMastered` → `App` sets `lessonOpen` false), so the complete / unlock celebration panel is easy to miss. End-to-end unlock still lands in progress storage; UX of the gate is weaker than the data path.

## Notes

- EN/ES/PL chrome via `ui.ts`; locale switcher on App. Game HUD strings remain hard-coded English (outside this artifact’s strict file set, but noticeable in the slice).
- Incorrect short answers reuse `workedSolution` as feedback for both correct and incorrect — acceptable Slice 0 stub; not a bar fail.
- Empty/missing lesson defensive path exists; current `loadLesson` returns real Lesson 1 package — good for E2E.
- Slice 0 allowance: vertical path (open terminal → phases → independent mastery → unlocks persisted → standards reflect KP status) is intact without a large rewrite. Prefer holding overlay open through mastery summary before `onClose`, and keep game-shell store fixes separate.
