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

Refs: `docs/gauntlet/bars/` (9 source + named HUD bars)  
Shots: `docs/gauntlet/_critic-shots/loop1-*`, `loop2-3-landscape-*`, `loop6-10-*`  
Reports: `critic-loop2-5-visual.md`, `critic-loop6-10-sculpted-pbr.md`, `builder-loop6-10-sculpted-pbr.md`

## Plateau judgment

Loops 6–10 raised hero fidelity (bevel PBR + panel maps), daylight juice, and first-10s camera read. Absolute Fortnite sculpted character skins (organic proportions + baked ORM/normal) remain the open ceiling. **No more Algebra.**

## Guards held

- Pages `base: '/aaamath/'`; KaTeX deferred; L1–L7 pedagogy untouched; speech + text fallback intact
- Curriculum frozen — no L8+
- Draco decode via gstatic; iPhone-budget GLB sizes (~28–208 kB)
