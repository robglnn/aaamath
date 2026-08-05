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
| **16** | Soft body volumes / joint overlaps | PASS_WITH_GAPS |
| **17** | Authored ORM + cyan tech-suit piping | PASS_WITH_GAPS |
| **18** | Stylized face (eyes/brows) | PASS_WITH_GAPS |
| **19** | Hair cards + volume | PASS_WITH_GAPS |
| **20** | Contoured armor plates | PASS_WITH_GAPS |
| **21** | Brighter daylight plaza exposure/sky | PASS_WITH_GAPS |
| **22** | Academy plaza banners | PASS_WITH_GAPS |
| **23** | Warmer stone floor + crystal spires | PASS_WITH_GAPS |
| **24** | Hex ability tray + quadrant minimap | PASS_WITH_GAPS |
| **25** | Closer cam + denser motes + hero rims | PASS_WITH_GAPS |
| **26** | Voxel-fused torso/hips + cape + chest gem + pauldron skirts | PASS_WITH_GAPS |
| **27** | Floating islands + ringed crystal monolith + banner palette | PASS_WITH_GAPS (monolith unreadable from spawn) |
| **28** | Reflective plaza floor + hero material boosts | PASS_WITH_GAPS |
| **29** | Multi-sun + god-ray starburst + closer cam + fog push | PASS_WITH_GAPS (rays win; scene still nocturnal) |
| **30** | Wireframe ability glyphs + minimap quadrants + crest/mote juice | PASS_WITH_GAPS (icons lateral; tints faint) |
| **31** | Meshy organic Fortnite player → `riser-player.glb` Draco ~587 KB | PASS_WITH_GAPS |
| **32** | Meshy algebra terminal upgrade | PASS_WITH_GAPS |
| **33** | Meshy zone beacon + monolith emissive punch | PASS_WITH_GAPS |
| **34** | Meshy plaza arch + banners (6×) | PASS_WITH_GAPS |
| **35** | Golden-hour value/saturation (sky/fog/lights/exposure 1.52) | PASS_WITH_GAPS |

Refs: `docs/gauntlet/bars/` (9 source + named HUD bars)  
Shots: `docs/gauntlet/_critic-shots/loop31-35-*`  
Reports: `builder-loop31-35-meshy.md`, `critic-loop31-35-meshy.md` (+ prior loop reports)

## Plateau judgment

Loops 31–35 broke the geometry plateau with **Meshy-authored** heroes/props (not another Blender primitive rebuild). First-10s now reads as a humanoid Fortnite-leaning riser + holographic terminal + crystal beacon + stone arch + crest banners under golden-hour light. Absolute Fortnite bars still win on skyline saturation / monolith spawn bloom / HUD icon chunkiness. **Still no Algebra.**

## Guards held

- Pages `base: '/aaamath/'`; KaTeX deferred; L1–L7 pedagogy untouched; speech + text fallback intact
- Curriculum frozen — no L8+
- Draco decode via gstatic; Meshy player GLB ~600 KB / 600600 B (`?v=m31` cache-bust)
