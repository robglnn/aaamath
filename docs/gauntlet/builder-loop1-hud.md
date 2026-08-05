# Builder notes — Gauntlet Loop 1 (diegetic Fortnite HUD)

**Date:** 2026-08-05  
**Builder:** visual gauntlet (curriculum frozen)  
**Mandate:** Fortnite visual only — no L8+; L7 already on `origin/main` left in place

## A/B before

Live spawn (`docs/gauntlet/_critic-shots` pre-loop / Playwright live Pages) vs bars:

- Refs win on **HUD diegesis** (winged crest, ability wheel, zone minimap) and brand-first first 10s
- Ours read as spreadsheet chrome: centered text watermark + **“House standing”** progress button + no loadout wheel

**Single largest gap selected:** diegetic Fortnite HUD (not more Algebra).

## Delivered

1. `BrandCrest` SVG (gold wings + cyan gem) — hero reveal + top-left persistent mark
2. Top-left rank strip: brand + rank ladder + gold progress bar (Riser → Vanguard)
3. Bottom-center ability wheel: Explore / Build / House standing (opens progress drawer)
4. Bottom-right zone minimap (Alpha→Zeta unlock colors)
5. App chrome Progress demoted to circular seal (no spreadsheet label in first viewport)
6. Refs copied to `docs/gauntlet/bars/` (9 source jpgs + named HUD bars)

## Out of scope this loop

Lighting / cyan grid / GLTF hero art / curriculum.

## Build

`npm run build` green (tsc + vite + spa-fallback).
