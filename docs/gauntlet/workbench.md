# Gauntlet Workbench — Fortnite Visual (curriculum frozen)

**Repo:** `C:\dev\aaamath` → `origin/main`  
**Live:** https://robglnn.github.io/aaamath/  
**Mandate:** Fortnite visual ONLY. No L8+. L7 already on remote — left in place.  
**Hard UX:** **Mobile = landscape-first** (rotate-to-play gate in portrait; critic shots at 844×390).

## Status board

| Loop | Theme | Result |
|------|--------|--------|
| **1** | Diegetic Fortnite HUD (crest / ability wheel / minimap); Progress demoted from spreadsheet label | PASS_WITH_GAPS |
| **2** | Cinematic lighting — warm key, sun disc, faded non-cyan grid, warmer floor | PASS_WITH_GAPS |
| **3** | Authored Blender GLB heroes (player, terminal, blueprint pad, zone marker) + landscape-first gate | PASS_WITH_GAPS |
| **4** | Camera/feel — tighter FOV, snappier follow | PASS_WITH_GAPS |
| **5** | Compact unlock rail when many chips; landscape short-viewport help hidden | PASS_WITH_GAPS |
| **6** | Sculpted bevel/subdiv PBR heroes + Draco GLBs | PASS_WITH_GAPS |
| **7** | Daylight ACES lighting / sky / rim | PASS_WITH_GAPS |
| **8** | God-ray juice + denser motes + ability pulse | PASS_WITH_GAPS |
| **9** | Diegetic HUD / plaza floor polish + emissive boost | PASS_WITH_GAPS |
| **10** | Panel albedo UVs + closer shoulder cam | PASS_WITH_GAPS |
| **11** | Organic athletic silhouette (spheres/capsules) + messy hair | PASS_WITH_GAPS |
| **12** | Baked AO/normal/panel maps on player | PASS_WITH_GAPS |
| **13** | Cloth vs armor material split + HeroGltf boosts | PASS_WITH_GAPS |
| **14** | Closer hero cam + rim lights | PASS_WITH_GAPS |
| **15** | Denser hair + quieter navy panel maps | PASS_WITH_GAPS |

Refs: `docs/gauntlet/bars/` (9 source + named HUD bars)  
Shots: `docs/gauntlet/_critic-shots/loop1-*`, `loop2-3-landscape-*`, `loop6-10-*`, `loop11-15-*`  
Reports: `critic-loop2-5-visual.md`, `critic-loop6-10-sculpted-pbr.md`, `critic-loop11-15-organic-character.md`, `builder-loop11-15-organic-character.md`

## Plateau judgment

Loops 11–15 moved the player from hard-surface kitbash toward organic Fortnite-class read (hair, skin head, cloth/armor split, closer cam). Absolute AAA sculpted skins remain the open ceiling. **No more Algebra. Stop after loop 15.**

## Guards held

- Pages `base: '/aaamath/'`; KaTeX deferred; L1–L7 pedagogy untouched; speech + text fallback intact
- Curriculum frozen — no L8+
- Draco decode via gstatic; iPhone-budget player GLB (~237 kB)
