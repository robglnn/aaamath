# Builder notes — Overnight wave (progress + controls + adaptive stub)

**Date:** 2026-08-05 (resume after sleep interrupt)  
**Model tier:** efficiency / orchestrator (`cursor-grok-4.5-medium`)

## Delivered

1. **Progress reactivity:** `StandardsView` subscribes to `kpStates` / `lessonStates`; coverage updates after answers/mastery.
2. **Introduce → progress:** Opening Lesson 1 marks KPs `in_progress` via `introduceLessonKps`.
3. **Live 1PL θ:** `recordAnswer` updates `thetaStub`; independent items sorted by Rasch information at θ.
4. **Spaced review fields:** Mastery sets `nextReviewAt`; past due → `due_review`.
5. **Pointer-lock mouse-look:** Click-to-lock, pitch+yaw, Esc release; Q/C yaw fallback; touch drag orbit retained.
6. **Visual lift:** Limb/helm silhouette, terminal screen+proximity ring, zone markers, hemisphere lighting, HUD less pill-chip.
7. **Deploy:** `.github/workflows/deploy-pages.yml` for `dist/` on `main`.
8. **ADR-004:** Standards tags documented as best-effort union.

## Build

`npm run build` green after fixes (Hud props, null lesson guard).
