# Lesson UI Builder Notes

**Agent:** Efficiency builder (lesson session slice)  
**Date:** 2026-08-05  
**Scope:** `src/lesson/`, `src/progress/`, `src/speech/`, `src/i18n/`, `src/components/LocaleSwitcher.tsx`, `src/styles/app.css`, `src/content/loadLesson.ts`

## Delivered

| Module | Role |
|--------|------|
| `src/i18n/ui.ts` | EN/ES/PL UI chrome via `ui(locale, key)` |
| `src/speech/webSpeech.ts` | Web Speech TTS/STT + `canTTS()` / `canSTT()` |
| `src/progress/storage.ts` | IndexedDB (`idb-keyval`) + localStorage mirror |
| `src/progress/store.ts` | Zustand hydrate/persist, mastery unlocks, standards selectors |
| `src/progress/StandardsView.tsx` | Jurisdiction picker + standards/KP status |
| `src/lesson/MathText.tsx` | KaTeX inline/block + `$...$` / `$$...$$` in prose |
| `src/lesson/useLessonSession.ts` | Phase machine, answer normalize/check, independent scoring |
| `src/lesson/LessonOverlay.tsx` | Full-screen I/We/You flow + mastery gate |
| `src/components/LocaleSwitcher.tsx` | EN \| ES \| PL |
| `src/content/loadLesson.ts` | Dynamic import of `content/lessons/algebra-i-01/package.json` (null if missing) |

## Mastery unlock path

1. During **you_do**, independent items increment `independentCorrect` / `independentTotal` in session + progress blob (`recordAnswer` with `isIndependent`).
2. When `independentCorrect >= package.mastery.minIndependentCorrect` **and** `independentTotal >= package.mastery.minIndependentTotal`, `useLessonSession` sets `masteryMet`.
3. `LessonOverlay` `useEffect` calls `completeLessonMastery(pkg)` once, which:
   - Sets lesson status `mastered`
   - Marks `mastery.requiredKpIds` as mastered
   - Pushes `package.unlocks` + `worldIntegration` IDs into `blob.unlocks` (blueprint, rank, zone)
4. `onMastered()` fires → `App.tsx` closes overlay; `GameView` reads unlock flags from the same store.

## Defensive empty states

- `loadLesson` returns `null` if JSON missing → overlay shows “Lesson content is not available yet.”
- Speech: text input always available; mic/TTS buttons degrade gracefully.
- Standards view shows empty hints when package absent.

## Integration contracts (do not break)

- Import lesson via `@/content/loadLesson` only — do not embed lesson JSON in UI code.
- Progress shape matches ADR-002 `ProgressBlob`.
- Do not modify `content/lessons/**` or `src/game/**` from this builder.

## Critic follow-ups

- [ ] Wire real Lesson 1 package when content pipeline lands
- [ ] Verify mastery thresholds against authored `you_do` item count
- [ ] Mobile Safari STT permission UX
- [ ] Debounce `recordAnswer` KP streak rules vs content author intent (3-streak = mastered stub)
