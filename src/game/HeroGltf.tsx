import { Suspense, useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Mesh, MeshStandardMaterial, Object3D } from 'three'

const base = import.meta.env.BASE_URL

/** CDN Draco decoder — keeps GLB payloads iPhone-friendly without vendoring wasm. */
const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

/** Cache-bust Meshy GLB ships so Pages clients don't keep stale primitives. */
const MESHY_V = 'm53'

export const HERO_URLS = {
  player: `${base}models/riser-player.glb?v=${MESHY_V}`,
  terminal: `${base}models/algebra-terminal.glb?v=${MESHY_V}`,
  blueprint: `${base}models/blueprint-pad.glb?v=${MESHY_V}`,
  zone: `${base}models/zone-marker.glb?v=${MESHY_V}`,
  arch: `${base}models/plaza-arch.glb?v=${MESHY_V}`,
  banner: `${base}models/plaza-banner.glb?v=${MESHY_V}`,
  monolith: `${base}models/skyline-monolith.glb?v=${MESHY_V}`,
  island: `${base}models/floating-island.glb?v=${MESHY_V}`,
  flowerIsland: `${base}models/flower-island.glb?v=${MESHY_V}`,
  waterfall: `${base}models/waterfall-cliff.glb?v=${MESHY_V}`,
  floor: `${base}models/plaza-floor.glb?v=${MESHY_V}`,
  bloom: `${base}models/crystal-bloom.glb?v=${MESHY_V}`,
  lamp: `${base}models/crystal-lamp.glb?v=${MESHY_V}`,
  crate: `${base}models/supply-crate.glb?v=${MESHY_V}`,
  mesa: `${base}models/mesa-cluster.glb?v=${MESHY_V}`,
} as const

export type HeroKind = keyof typeof HERO_URLS

const SKYLINE_EMISSIVE_KINDS = new Set<HeroKind>(['monolith', 'island', 'flowerIsland', 'waterfall', 'bloom', 'lamp', 'mesa'])

/** Punch emissives so authored / Meshy PBR reads under ACES without a bloom pass. */
function boostHeroMaterials(root: Object3D, kind?: HeroKind) {
  const skylineEmissive = kind != null && SKYLINE_EMISSIVE_KINDS.has(kind)
  root.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const m of mats) {
      const std = m as MeshStandardMaterial
      if (!std || std.emissiveIntensity == null) continue
      const name = (std.name || '').toLowerCase()
      // Loop 31+/36: Meshy heroes — skyline props need stronger ACES punch
      if (std.emissiveMap) {
        const floor =
          kind === 'bloom' ? 3.5 : skylineEmissive ? 3.0 : 2.4
        std.emissiveIntensity = Math.max(std.emissiveIntensity, floor)
      }
      if (name.includes('piping')) {
        // Loop 17/28: Fortnite tech-suit cyan piping — punch emissive under ACES
        std.emissiveIntensity = Math.max(std.emissiveIntensity, 4.0)
        std.metalness = Math.min(std.metalness ?? 0.2, 0.22)
        std.roughness = Math.min(std.roughness ?? 0.2, 0.2)
      } else if (name.includes('cyan') || name.includes('crystal') || name.includes('amber') || name.includes('gem')) {
        std.emissiveIntensity = Math.max(std.emissiveIntensity, 3.6)
        if (name.includes('gem') || name.includes('crystal')) {
          std.metalness = Math.min(std.metalness ?? 0.15, 0.18)
          std.roughness = Math.min(std.roughness ?? 0.2, 0.16)
        }
      } else if (name.includes('chest')) {
        std.emissiveIntensity = Math.max(std.emissiveIntensity, 2.2)
        std.metalness = Math.max(std.metalness ?? 0, 0.45)
        std.roughness = Math.min(Math.max(std.roughness ?? 0.4, 0.28), 0.42)
      } else if (name.includes('gold')) {
        std.emissiveIntensity = Math.max(std.emissiveIntensity, 1.1)
        std.metalness = Math.max(std.metalness ?? 0, 0.85)
        std.roughness = Math.min(std.roughness ?? 1, 0.28)
      } else if (name.includes('cloth') || name.includes('suit')) {
        // Form-fitting navy cloth — keep fabric read (low metal, higher roughness)
        std.metalness = Math.min(std.metalness ?? 0.1, 0.12)
        std.roughness = Math.max(std.roughness ?? 0.7, 0.62)
      } else if (name.includes('armor') || name.includes('plate')) {
        std.metalness = Math.max(std.metalness ?? 0, 0.68)
        std.roughness = Math.min(Math.max(std.roughness ?? 0.35, 0.18), 0.32)
      } else if (name.includes('hair')) {
        std.metalness = Math.min(std.metalness ?? 0.05, 0.08)
        std.roughness = Math.max(std.roughness ?? 0.6, 0.55)
      } else if (name.includes('skin')) {
        std.metalness = 0
        std.roughness = Math.min(Math.max(std.roughness ?? 0.55, 0.45), 0.58)
      } else if (name.includes('eye')) {
        std.emissiveIntensity = Math.max(std.emissiveIntensity, 1.8)
        std.metalness = Math.min(std.metalness ?? 0.15, 0.2)
        std.roughness = Math.min(std.roughness ?? 0.2, 0.2)
      } else if (name.includes('visor')) {
        std.metalness = Math.max(std.metalness ?? 0, 0.35)
        std.roughness = Math.min(std.roughness ?? 0.15, 0.18)
        std.emissiveIntensity = Math.max(std.emissiveIntensity, 1.4)
      } else if (!std.map && !std.emissiveMap) {
        std.metalness = Math.max(std.metalness ?? 0, 0.25)
        std.roughness = Math.min(Math.max(std.roughness ?? 0.5, 0.28), 0.62)
      }
      // Meshy textured mats: slight albedo lift so navy suit / grass pops under golden hour
      if (std.map && std.color) {
        const grassish =
          skylineEmissive && std.color.g > std.color.r * 0.92 && std.color.g > std.color.b * 0.88
        if (grassish) {
          std.color.setRGB(
            Math.min(1, std.color.r * 1.06),
            Math.min(1, std.color.g * 1.14),
            Math.min(1, std.color.b * 1.05),
          )
        } else {
          std.color.setRGB(
            Math.min(1, std.color.r * 1.08),
            Math.min(1, std.color.g * 1.08),
            Math.min(1, std.color.b * 1.05),
          )
        }
      }
      std.needsUpdate = true
    }
  })
}

function HeroClone({
  kind,
  scale = 1,
  position,
  rotation,
}: {
  kind: HeroKind
  scale?: number | [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const { scene } = useGLTF(HERO_URLS[kind], DRACO)
  const root = useMemo(() => {
    const clone = scene.clone(true)
    boostHeroMaterials(clone, kind)
    return clone
  }, [scene, kind])

  useEffect(() => {
    boostHeroMaterials(root, kind)
  }, [root, kind])

  return <primitive object={root as Object3D} scale={scale} position={position} rotation={rotation} />
}

/** Authored Blender PBR GLB (Draco); Suspense fallback keeps profile-geo parent visible until ready. */
export function HeroModel({
  kind,
  scale = 1,
  position,
  rotation,
}: {
  kind: HeroKind
  scale?: number | [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <Suspense fallback={null}>
      <HeroClone kind={kind} scale={scale} position={position} rotation={rotation} />
    </Suspense>
  )
}

export function preloadHeroModels() {
  useGLTF.preload(HERO_URLS.player, DRACO)
  useGLTF.preload(HERO_URLS.terminal, DRACO)
  useGLTF.preload(HERO_URLS.blueprint, DRACO)
  useGLTF.preload(HERO_URLS.zone, DRACO)
  useGLTF.preload(HERO_URLS.arch, DRACO)
  useGLTF.preload(HERO_URLS.banner, DRACO)
  useGLTF.preload(HERO_URLS.monolith, DRACO)
  useGLTF.preload(HERO_URLS.island, DRACO)
  useGLTF.preload(HERO_URLS.flowerIsland, DRACO)
  useGLTF.preload(HERO_URLS.waterfall, DRACO)
  useGLTF.preload(HERO_URLS.floor, DRACO)
  useGLTF.preload(HERO_URLS.bloom, DRACO)
  useGLTF.preload(HERO_URLS.lamp, DRACO)
  useGLTF.preload(HERO_URLS.crate, DRACO)
  useGLTF.preload(HERO_URLS.mesa, DRACO)
}
