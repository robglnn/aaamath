import { Component, Suspense, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { LoopOnce, LoopRepeat, Vector3 } from 'three'
import type { AnimationClip, Object3D } from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { boostHeroMaterials, HERO_URLS, HeroModel, stripMeshyHelpers } from '@/game/HeroGltf'

const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

export type LocoState = 'idle' | 'walk' | 'run' | 'jump' | 'crawl'

type LocoClipName = 'walk' | 'run' | 'jump' | 'crawl'

const CLIP_OF: Record<LocoState, LocoClipName> = {
  idle: 'walk',
  walk: 'walk',
  run: 'run',
  jump: 'jump',
  crawl: 'crawl',
}

/**
 * Meshy bakes carry booth-space Hips translation (FK-verified): walk flings the
 * skeleton to y −5.5 / x +4.8 mid-cycle, crawl sits at y −57.9 → x +25.9, jump
 * dives to y −9.8. Player physics owns the world root, so pin the Hips position
 * track to the skeleton rest offset and let bone rotations carry the motion.
 */
const CRAWL_HIP_DROP = 0.55

function pinHipsTrack(clip: AnimationClip, pin: Vector3) {
  for (const track of clip.tracks) {
    if (!track.name.endsWith('.position')) continue
    if (track.name.slice(0, -'.position'.length) !== 'Hips') continue
    const v = track.values
    for (let i = 0; i < v.length; i += 3) {
      v[i] = pin.x
      v[i + 1] = pin.y
      v[i + 2] = pin.z
    }
  }
}

function LocoBody({ state }: { state: LocoState }) {
  const walk = useGLTF(HERO_URLS.playerWalk, DRACO)
  const run = useGLTF(HERO_URLS.playerRun, DRACO)
  const jump = useGLTF(HERO_URLS.playerJump, DRACO)
  const crawl = useGLTF(HERO_URLS.playerCrawl, DRACO)

  const { root, clips } = useMemo(() => {
    // SkeletonUtils: plain scene.clone() leaves SkinnedMesh bound to the source
    // skeleton, so the mesh would freeze at bind pose while cloned bones move.
    const root = SkeletonUtils.clone(walk.scene) as Object3D
    stripMeshyHelpers(root)
    boostHeroMaterials(root, 'player')
    const hips = root.getObjectByName('Hips')
    const rest = hips ? hips.position.clone() : new Vector3(0, 1.12, -0.05)
    const crawlRest = rest.clone()
    crawlRest.y = Math.max(0.32, rest.y - CRAWL_HIP_DROP)
    const prep = (animations: AnimationClip[], name: LocoClipName, pin: Vector3) => {
      const clip = animations[0]
      clip.name = name
      pinHipsTrack(clip, pin)
      return clip
    }
    return {
      root,
      clips: [
        prep(walk.animations, 'walk', rest),
        prep(run.animations, 'run', rest),
        prep(jump.animations, 'jump', rest),
        prep(crawl.animations, 'crawl', crawlRest),
      ],
    }
  }, [walk, run, jump, crawl])

  const { actions } = useAnimations(clips, root)
  const currentRef = useRef<LocoState>('idle')

  useEffect(() => {
    const clipName = CLIP_OF[state]
    const next = actions[clipName]
    if (!next) return
    next.reset()
    next.enabled = true
    if (clipName === 'jump') {
      next.setLoop(LoopOnce, 1)
      next.clampWhenFinished = true
      next.timeScale = 1
    } else {
      next.setLoop(LoopRepeat, Infinity)
      next.clampWhenFinished = false
      // Crawl bakes as Crawl_Backward_inplace — reverse so it reads forward.
      next.timeScale = clipName === 'crawl' ? -1 : state === 'run' ? 1.12 : 1
    }
    if (state === 'idle') {
      next.time = 0.05
      next.timeScale = 0.14
    }
    const prev = actions[CLIP_OF[currentRef.current]]
    if (prev && prev !== next) {
      // Loop 72: longer crossfade under shoulder cam — walk↔run/crawl less snap
      const fade =
        (currentRef.current === 'walk' || currentRef.current === 'run') &&
        (state === 'walk' || state === 'run')
          ? 0.34
          : currentRef.current === 'idle' || state === 'idle'
            ? 0.3
            : state === 'crawl' || currentRef.current === 'crawl'
              ? 0.26
              : state === 'jump'
                ? 0.14
                : 0.24
      next.crossFadeFrom(prev, fade, false)
    }
    next.play()
    currentRef.current = state
  }, [state, actions])

  return <primitive object={root} />
}

/**
 * Fail-soft: if any loco GLB 404s or fails to parse, the suspense rejection
 * would unmount the whole canvas. Fall back to the static riser-player hero
 * (itself soft-failed inside HeroModel) so the player always has a silhouette.
 */
class LocoErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(err: unknown) {
    console.warn('[PlayerLoco] animated hero failed — using static hero fallback:', err)
  }

  render() {
    return this.state.failed ? <HeroModel kind="player" /> : this.props.children
  }
}

/** Loops 59-60: Meshy-rigged walk/run/jump/crawl driven by Player move state. */
export function PlayerLoco({ state }: { state: LocoState }) {
  return (
    <LocoErrorBoundary>
      <Suspense fallback={<HeroModel kind="player" />}>
        <LocoBody state={state} />
      </Suspense>
    </LocoErrorBoundary>
  )
}
