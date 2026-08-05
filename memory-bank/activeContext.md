# Active Context

## Current focus
Overnight **Gauntlet Loop** — AAA visuals / training-range bar. Wave 1 shipped (`2e6db91`); Wave 2 shipping (readable signs, decor, player, mobile/celebrate).

## Locked decisions
See `docs/decisions.md`. Standards honesty: `docs/adr/004-standards-tags.md`.

## Recent changes
- Wave 1: terminal objective beam, gate unlock FX, blueprint place pop, lighting
- Wave 2: readable `Text` zone labels, RangeDecor, sky dome, HUD objective, player silhouette+anim, touch/celebrate polish
- Live Pages: https://robglnn.github.io/aaamath/ (`base: '/aaamath/'`, Actions deploy healthy)
- Adaptive you_do order freeze remains intact

## Active considerations
- Bundle ~1.55MB after troika Text — still ok for Slice 0; code-split later
- Procedural canvas textures kit still thin (next wave)
- Lesson 2 not started
- Critic wave-1 largest gap (unread signs) addressed in wave 2 — needs fresh critic verify
