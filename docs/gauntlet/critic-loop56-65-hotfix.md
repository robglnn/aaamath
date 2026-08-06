# Critic addendum — spawn occlusion hotfix (post FAIL)

**Trigger:** [Fresh critic](e492bc03-8cf4-4f50-8361-3d03cf4fda9f) FAIL — cyan crystal cavern fill.
**Root cause:** Rear wall run at z=+8.4 overlapped shoulder cam (~z 7.5–8) so the lens sat *inside* Meshy wall thickness. Near flower islands + oversized bloom tip compounded the fill.
**Fix:**
- Rear walls/rails/bastions → z≈12.2 (clear of cam)
- Flower islands → z≈−19…−22, scale ~1.12–1.22
- Monolith → `[1.2,0,-24.5]` scale 1.62; bloom scale 0.85
- Waterfall → `[-14.5,0,-16.5]` scale 1.4
- Camera → height 2.32 / lookY +1.28
- PlayerLoco → `SkeletonUtils.clone` (skinned clips)

**Verify shot:** `loop56-65-hotfix-mobile.png` — player + paved yard + flank walls + arch/terminal + skyline readable again.
