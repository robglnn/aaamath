# Builder — Wave 14 harden Web Speech voice mapping (EN/ES/PL)

**Date:** 2026-08-05

## Goal

Reliable browser-native TTS/STT for EN/ES/PL with zero cloud keys, and graceful degradation to typing.

## Changes

### `src/speech/webSpeech.ts` (only file touched)

Public API unchanged: `canTTS`, `canSTT`, `speak`, `stopSpeaking`, `listenOnce`. `LessonOverlay.tsx` and the text-input fallback are untouched.

**TTS voice selection — tiered `pickVoice(locale)`:**

1. **Exact BCP-47 match** — `en-US` / `es-ES` / `pl-PL`, with lang tags normalized (case-insensitive, `en_US` → `en-us`) since engines report tags inconsistently.
2. **Language-family prefix** — `en-` / `es-` / `pl-`; within the family prefer the browser's `default` voice, then an on-device (`localService`) voice, then the first match.
3. **Whole-word name hints** — "english", "spanish"/"español"/"espanol", "polish"/"polski" — for engines that misreport `lang`. Dropped the old bare `en`/`es`/`pl` substring hints: `es` substring-matched unrelated voices (e.g. Ukrainian "Lesya"), a real mis-voicing bug.
4. **No match → `undefined`** — `utterance.lang` is always set, so the browser applies its own language-aware default voice. Speaking is never blocked by a missing voice.

**Voice-list warming:** Chrome populates `getVoices()` asynchronously. Module now warms the cache at load and re-warms on `voiceschanged` (`addEventListener` with `onvoiceschanged` fallback), so the first `speak` call sees the full voice list.

**STT lang hint:** `listenOnce(locale)` sets `recognition.lang` from `LOCALE_TO_BCP47[locale]`, where `locale` comes from the progress store (`blob.locale` → `LessonOverlay`). Unsupported recognition rejects the promise; the overlay already surfaces the error and keeps the text input — text fallback intact.

## Behavior guarantees

- No cloud keys, no network calls of our own; browser voices only (local or the browser's own bundled network voices).
- Unknown/empty voice list → still speaks via browser default for the utterance `lang`.
- SSR/test environments (`window` undefined) → all entry points no-op or reject cleanly.

## Verification

```bash
npm run build   # tsc -b && vite build && spa-fallback — green
```

Manual spot-check path: lesson → "Speak" (tutor script) and mic button on short-answer items, across EN/ES/PL locale switches.
