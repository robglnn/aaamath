# Locked Product Decisions — Slice 0

Source: grilling confirmation + handoff overrides. Do not re-litigate without human approval.

| # | Decision | Lock |
|---|----------|------|
| 1 | Slice shape | **D** — Playable Algebra I Lesson 1 + content pipeline that produced it, one web app |
| 2 | Shell | **C** — Thin browser 3D training range; Lesson 1 = in-world terminal; one math-gated unlock path |
| 3 | Voice | **A+B** — STT for answers + TTS for tutor/feedback; NO social/WebRTC voice |
| 4 | Speech | **A** — Web Speech API where available; keyboard/text always works; no cloud STT/TTS keys for Slice 0 |
| 5 | Progress | **D** — localStorage/IndexedDB for Slice 0; sync-ready models; static host (GH Pages / itch.io) |
| 6 | Stack | **A** — Vite + React + TypeScript + R3F/Three.js + KaTeX |
| 7 | Unlock | **A+D** — Mastery unlocks (1) placeable blueprint pad/ramp AND (2) rank insignia + second pad/zone |
| 8 | Controls | KB/mouse + touch virtual stick; mobile-ready; no gamepad required in Slice 0 |
| 9 | i18n | Lesson 1 EN + ES + PL (UI + instructional content); KaTeX for all math |
| 10 | Subagent models | `kimi-k3-max`, `cursor-grok-4.5-medium`, `composer-2.5` only (no fast modes) |

See also: `docs/adr/` for technical ADRs, `docs/handoff.md` for full vision.
