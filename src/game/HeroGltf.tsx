import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Object3D } from 'three'

const base = import.meta.env.BASE_URL

export const HERO_URLS = {
  player: `${base}models/riser-player.glb`,
  terminal: `${base}models/algebra-terminal.glb`,
  blueprint: `${base}models/blueprint-pad.glb`,
  zone: `${base}models/zone-marker.glb`,
} as const

type HeroKind = keyof typeof HERO_URLS

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
  const { scene } = useGLTF(HERO_URLS[kind])
  const root = useMemo(() => scene.clone(true), [scene])
  return <primitive object={root as Object3D} scale={scale} position={position} rotation={rotation} />
}

/** Authored Blender GLB; Suspense fallback keeps profile-geo parent visible until ready. */
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
  useGLTF.preload(HERO_URLS.player)
  useGLTF.preload(HERO_URLS.terminal)
  useGLTF.preload(HERO_URLS.blueprint)
  useGLTF.preload(HERO_URLS.zone)
}
