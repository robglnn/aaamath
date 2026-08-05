import { Suspense, useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Mesh, MeshStandardMaterial, Object3D } from 'three'

const base = import.meta.env.BASE_URL

/** CDN Draco decoder — keeps GLB payloads iPhone-friendly without vendoring wasm. */
const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

export const HERO_URLS = {
  player: `${base}models/riser-player.glb`,
  terminal: `${base}models/algebra-terminal.glb`,
  blueprint: `${base}models/blueprint-pad.glb`,
  zone: `${base}models/zone-marker.glb`,
} as const

type HeroKind = keyof typeof HERO_URLS

/** Punch emissives so authored PBR reads under ACES without a bloom pass. */
function boostHeroMaterials(root: Object3D) {
  root.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const m of mats) {
      const std = m as MeshStandardMaterial
      if (!std || std.emissiveIntensity == null) continue
      const name = (std.name || '').toLowerCase()
      if (name.includes('cyan') || name.includes('crystal') || name.includes('amber')) {
        std.emissiveIntensity = Math.max(std.emissiveIntensity, 2.8)
      } else if (name.includes('gold')) {
        std.emissiveIntensity = Math.max(std.emissiveIntensity, 1.1)
        std.metalness = Math.max(std.metalness ?? 0, 0.85)
        std.roughness = Math.min(std.roughness ?? 1, 0.28)
      } else {
        std.metalness = Math.max(std.metalness ?? 0, 0.25)
        std.roughness = Math.min(Math.max(std.roughness ?? 0.5, 0.28), 0.62)
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
    boostHeroMaterials(clone)
    return clone
  }, [scene])

  useEffect(() => {
    boostHeroMaterials(root)
  }, [root])

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
}
