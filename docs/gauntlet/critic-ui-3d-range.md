# Critic report — UI/3D range readability

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (no product-code edits)  
**Artifact commits:** `2e6db91` (visual pass), `1642fa3` (builder doc)  
**Judged surface:** `TrainingRange.tsx`, `BlueprintGhost.tsx`, `Player.tsx`, parallel HUD CSS (`gr-unlock-flash`, `gr-prompt-pulse`)  
**Method:** Full read of builder spec (`builder-ui-3d-range.md`) and implementation; cross-check with Wave 1 Playwright viewport evidence (`critic-wave1-visuals.md`); local code-only spot-check (headless WebGL did not produce a usable in-session screenshot — judgment leans on shipped geometry/lighting math + prior live/local captures).

## Verdict: PASS_WITH_GAPS

The readability pass clears the Fortnite-lite training-range bar: terminal beacon hierarchy, unlock transformation, blueprint pop, and no-bloom lighting are all implemented with intent and restraint. One coupling gap keeps the Zone Beta payoff from landing as reliably as the builder spec claims.

## Single largest gap

**Zone Beta unlock burst is decoupled from when the player can see it.**  
`GateUnlockFx` fires on the instant `hasZoneBeta` false→true transition (~1.5s shockwave at `GATE_Z`), with no replay guard beyond skipping persisted loads. Mastery unlocks propagate while the lesson overlay is open (`GameView` sets `mode: 'lesson'`; HUD deferral queues `gr-unlock-flash` until explore). The 3D burst therefore often plays off-camera, under UI, or both; when the player returns to explore they get the HUD card and persistent gate/stud/holo changes, but the one-shot spatial “payoff punch” is already spent. Bar 2 is **partially** met — transformation reads, moment-of-unlock beat does not consistently.

## Bar comparison

| # | Bar | Status | Evidence |
|---|-----|--------|----------|
| 1 | Terminal obvious interactive objective at distance | **Pass** | Additive 7-unit beam + emissive diamond (`Terminal`, y≈8), animated amber scanline sweep, cyan screen emissive, kiosk silhouette with amber fins, ground proximity ring; `nearTerminal` widens beam (1.28×) and doubles opacity/light. Wave 1 viewport: strongest POI in frame from Alpha spawn (~8m). HUD `gr-prompt-pulse` mirrors proximity (explore-only, within `TERMINAL_RADIUS`). |
| 2 | Zone Beta unlock feels like payoff | **Partial** | **Pass (persistent):** gate pane sinks/fades, amber→cyan posts/beam, threshold glow strip, `GatePathLights` cyan march toward Beta, `BetaZone` holo ring + expanding scan wave, HUD `gr-unlock-flash--zone`. **Gap:** `GateUnlockFx` one-shot not tied to player position or post-lesson reveal — see largest gap. |
| 3 | Blueprint place feedback clear | **Pass** | Ghost: additive footprint ring + four emissive corner brackets. Place: `easeOutBack` scale pop (0.55→1), emissive flash decay (~0.7s), additive shockwave ring, cyan point-light pulse; one-shot refs stop per-frame work after settle. Build-mode ghost tracks ahead of player yaw. |
| 4 | Lighting readable; mobile-safe (no heavy bloom) | **Pass** | Warm key (`#ffe8c2` 1.55) + cool rim (0.5), hemisphere 0.62 / ambient 0.22, lifted ground/grid albedos, spawn pad pool light, brighter player palette + emissive chest core. **No** postprocessing bloom — glow is emissive + additive transparent meshes only. Residual risk: dense additive stack at terminal + 34-intensity gate spike unverified on physical phone (builder follow-up). |
| 5 | Still Fortnite-lite, not over-FX | **Pass** | Procedural meshes, one-shot unlock/place FX (~1.5s / ~0.7s), no particle systems or post stack; ~+18 mesh budget per builder. Stars/grid atmosphere without FX bloat. |

## Notes by file

### `TrainingRange.tsx`
- **Terminal:** Layered distance read (beam, diamond, scanline, screen, fins) with proximity amplification — meets bar 1.
- **Unlock:** `GateUnlockFx` + `BetaBarrier` fade + `GatePathLights` + `BetaZone` holo/scan form a complete payoff kit; timing coupling is the weakness.
- **Lighting:** Deliberate contrast restoration; fog `[18, 55]` keeps spawn→terminal (~8m) inside clear range.

### `BlueprintGhost.tsx`
- Ghost affordance and placement pop match builder spec; no screen-space placement flash (only persistent `Blueprint online` chip in HUD — acceptable given 3D feedback strength).

### `Player.tsx`
- Palette lift + emissive chest core improve distance read without extra lights; supports bar 4 without adding FX.

## Scope & verification limits

- Judged training-range readability only; no lesson pedagogy, controls, or store-shape changes.
- Zone Beta unlock burst and blueprint placement pop were **not** re-captured on camera this pass (headless WebGL blank; Wave 1 + code review used instead).
- Recommend next verify: (a) trigger `hasZoneBeta` while at gate vs during lesson — confirm payoff feel; (b) physical phone pass on terminal additive stack in a dark room.

## Related

- Builder: `docs/gauntlet/builder-ui-3d-range.md`
- Prior viewport baseline: `docs/gauntlet/critic-wave1-visuals.md` (PASS_WITH_GAPS on glyph zone labels — orthogonal to this pass’s five bars)
