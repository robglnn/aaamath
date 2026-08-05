# Builder — Wave 10 defer KaTeX to terminal open

**Date:** 2026-08-05  
**Closes:** critic-wave8 note that KaTeX was still eagerly modulepreloaded via sync LessonOverlay import.

## Delivered
- `LessonOverlay` lazy + Suspense; first paint no longer pulls katex chunk
- Prefetch on near-terminal (Hud) and on openTerminal
- Fallback uses existing `loadingLesson` i18n string

## Build
Verify chunk graph: katex absent from initial modulepreload list for cold range load.
