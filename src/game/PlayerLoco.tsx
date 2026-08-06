import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { LoopOnce, LoopRepeat } from 'three'
import type { Group, Object3D } from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { HERO_URLS, type LocoKind } from '@/game/HeroGltf'

const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

export type LocoState = 'idle' | 'walk' | 'run' | 'jump' | 'crawl'

function stateToKind(state: LocoState): LocoKind {
  switch (state) {
    case 'run':
      return 'playerRun'
    case 'jump':
      return 'playerJump'
    case 'crawl':
      return 'playerCrawl'
    case 'idle':
    case 'walk':
    default:
      return 'playerWalk'
  }
}

function LocoClip({
  kind,
  active,
  idleHold,
}: {
  kind: LocoKind
  active: boolean
  idleHold: boolean
}) {
  const { scene, animations } = useGLTF(HERO_URLS[kind], DRACO)
  const root = useMemo(() => SkeletonUtils.clone(scene) as Object3D, [scene])
  const group = useRef<Group>(null)
  const { actions, mixer } = useAnimations(animations, root)
  const actionName = animations[0]?.name

  useEffect(() => {
    if (!actionName) return
    const action = actions[actionName]
    if (!action) return
    if (active) {
      action.reset()
      const loop = kind === 'playerJump' ? LoopOnce : LoopRepeat
      action.setLoop(loop, Infinity)
      action.clampWhenFinished = kind === 'playerJump'
      action.fadeIn(0.12).play()
      if (idleHold) {
        action.paused = true
        action.time = 0.05
      } else {
        action.paused = false
        action.setEffectiveTimeScale(kind === 'playerRun' ? 1.05 : 1)
      }
    } else {
      action.fadeOut(0.1)
    }
    return () => {
      action.fadeOut(0.05)
    }
  }, [active, idleHold, actions, actionName, kind])

  useFrame((_, dt) => {
    if (active && mixer) mixer.update(dt)
  })

  return (
    <group ref={group} visible={active}>
      <primitive object={root} />
    </group>
  )
}

/** Loops 59-60: Meshy-rigged walk/run/jump/crawl clips driven by move state. */
export function PlayerLoco({ state }: { state: LocoState }) {
  const kinds: LocoKind[] = ['playerWalk', 'playerRun', 'playerJump', 'playerCrawl']
  const activeKind = stateToKind(state)
  return (
    <Suspense fallback={null}>
      <group>
        {kinds.map((kind) => (
          <LocoClip
            key={kind}
            kind={kind}
            active={kind === activeKind}
            idleHold={state === 'idle' && kind === 'playerWalk'}
          />
        ))}
      </group>
    </Suspense>
  )
}
