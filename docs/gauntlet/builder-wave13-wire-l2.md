# Builder — Wave 13 wire Lesson 2 into terminal

**Date:** 2026-08-05

## Goal

After Lesson 1 is mastered, the Algebra Terminal opens `algebra-i-02` instead of `algebra-i-01`.

## Changes

### `src/content/loadLesson.ts`

- Exported `LESSON_1_ID`, `LESSON_2_ID`; `LESSON_ID` remains L1 for StandardsView / legacy call sites.
- Added `resolveTerminalLessonId(lessonStates)`:
  - `lessonStates['algebra-i-01']?.status === 'mastered'` → `algebra-i-02`
  - otherwise → `algebra-i-01`

### `src/App.tsx`

- Reads full `lessonStates` from progress store.
- Computes `terminalLessonId` via `resolveTerminalLessonId`.
- Passes `lessonId={terminalLessonId}` to `LessonOverlay`.
- L1 unlock gating for GameView (`blueprint`, `rank`, `zoneBeta`) unchanged — still keyed on L1 mastery.

### `src/lesson/LessonOverlay.tsx`

- New required prop `lessonId: string`.
- `loadLesson(lessonId)` on mount / id change; resets session UI state when switching lessons.
- Mastery, KP tracking, and unlock application use the loaded package id (store `ensureLessonState` handles L2 on first play).

## L2 unlocks

L2 package unlocks (`bp.pad.rail`, `rank.riser.adept`, `zone.beacon.cyan`) are recorded in progress via existing `completeLessonMastery` paths. GameView `unlocked` flags are **not** extended for L2 in this wave — no crash if those blueprint/rank/zone ids are absent from 3D range props.

## Regression guard

Players without L1 mastery still open `algebra-i-01` at the terminal.

## Verification

```bash
npm run build
npm run content:validate
```

Both green.
