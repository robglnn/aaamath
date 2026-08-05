# Builder — Wave 20 Lesson 3 content + terminal wire

**Date:** 2026-08-05

## Content

- `content/lessons/algebra-i-03/package.json` — **The Distributive Property**
- 4 KPs, 12 items, EN/ES/PL, mastery 3/4
- Unlocks: `bp.relay.splitter`, `rank.riser.expert`, `zone.gamma.relay`
- See `builder-wave20-lesson3.md` for full pedagogy notes

## Runtime wire (this addendum)

### `src/content/loadLesson.ts`

- Import + export `lesson3` / `LESSON_3_ID`
- `LESSONS` registry includes L3
- `resolveTerminalLessonId`: L2 mastered → L3; else L1 mastered → L2; else L1

L3 unlocks recorded in progress on mastery via existing `completeLessonMastery` paths. **No 3D GameView props** for L3 unlocks this wave (same deferral pattern as L2 wave 13 → 16).

## Validation

```
npm run content:validate  # 3/3 PASSED
npm run build             # green
```
