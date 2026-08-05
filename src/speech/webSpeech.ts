import type { Locale } from '@/content/types'

/**
 * Browser-native Web Speech wiring (no cloud keys, no network calls of our own).
 *
 * TTS voice selection (`pickVoice`) is tiered, most specific first:
 *   1. Exact BCP-47 match for the locale target (en-US / es-ES / pl-PL),
 *      with lang tags normalized (case-insensitive, `en_US` → `en-us`).
 *   2. Same language family by prefix (`en-`, `es-`, `pl-`), preferring the
 *      browser's default voice in that family, then an on-device
 *      (`localService`) voice, then the first family match.
 *   3. Voice-name hints as whole words ("English", "español", "polski", …) for
 *      engines that misreport `lang`. Short hints like "es" are deliberately
 *      avoided — they substring-match unrelated voices (e.g. "Lesya").
 *   4. No match → `undefined`: the utterance still carries `lang`, so the
 *      browser applies its own default voice for that language. Speaking is
 *      never blocked by a missing voice.
 *
 * STT (`listenOnce`) takes its language hint from the caller's progress-store
 * locale via `LOCALE_TO_BCP47`. Unsupported recognition rejects the promise;
 * callers keep the text input as the fallback path, so speech is always
 * optional chrome on top of typing.
 */

const LOCALE_TO_BCP47: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  pl: 'pl-PL',
}

/** Whole-word name hints; safe as substrings, unlike bare "en"/"es"/"pl". */
const LOCALE_VOICE_NAME_HINTS: Record<Locale, string[]> = {
  en: ['english'],
  es: ['spanish', 'español', 'espanol'],
  pl: ['polish', 'polski'],
}

function normalizeLangTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/_/g, '-')
}

function langMatchesLocale(voiceLang: string, locale: Locale): boolean {
  const norm = normalizeLangTag(voiceLang)
  return norm === locale || norm.startsWith(`${locale}-`)
}

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  return window.speechSynthesis.getVoices()
}

function pickVoice(locale: Locale): SpeechSynthesisVoice | undefined {
  const voices = getVoices()
  if (voices.length === 0) return undefined

  const target = normalizeLangTag(LOCALE_TO_BCP47[locale])
  const exact = voices.find((v) => normalizeLangTag(v.lang) === target)
  if (exact) return exact

  const family = voices.filter((v) => langMatchesLocale(v.lang, locale))
  if (family.length > 0) {
    return family.find((v) => v.default) ?? family.find((v) => v.localService) ?? family[0]
  }

  const hints = LOCALE_VOICE_NAME_HINTS[locale]
  return voices.find((v) => {
    const name = v.name.toLowerCase()
    return hints.some((h) => name.includes(h))
  })
}

export function canTTS(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function canSTT(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as Window & {
    SpeechRecognition?: typeof SpeechRecognition
    webkitSpeechRecognition?: typeof SpeechRecognition
  }
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)
}

export function speak(text: string, locale: Locale): void {
  if (!canTTS() || !text.trim()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  // `lang` is set even without a matched voice so the browser's own
  // language-aware default kicks in as the final fallback.
  utterance.lang = LOCALE_TO_BCP47[locale]
  const voice = pickVoice(locale)
  if (voice) utterance.voice = voice
  utterance.rate = 0.95
  synth.speak(utterance)
}

export function stopSpeaking(): void {
  if (canTTS()) window.speechSynthesis.cancel()
}

type RecognitionCtor = new () => SpeechRecognition

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function listenOnce(locale: Locale): Promise<string> {
  const Ctor = getRecognitionCtor()
  if (!Ctor) {
    return Promise.reject(
      new Error('Speech recognition is not available in this browser.'),
    )
  }

  return new Promise((resolve, reject) => {
    const recognition = new Ctor()
    recognition.lang = LOCALE_TO_BCP47[locale]
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    let settled = false

    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      fn()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      finish(() => resolve(transcript.trim()))
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      finish(() => reject(new Error(event.error || 'Speech recognition failed')))
    }

    recognition.onnomatch = () => {
      finish(() => reject(new Error('No speech matched')))
    }

    recognition.onend = () => {
      finish(() => reject(new Error('Speech recognition ended without a result')))
    }

    try {
      recognition.start()
    } catch (err) {
      finish(() =>
        reject(err instanceof Error ? err : new Error('Failed to start speech recognition')),
      )
    }
  })
}

// Chrome populates the voice list asynchronously after load; warm the cache now
// and re-warm on `voiceschanged` so the first `speak` sees the full list.
if (typeof window !== 'undefined' && canTTS()) {
  const synth = window.speechSynthesis
  const warm = () => synth.getVoices()
  warm()
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', warm)
  } else {
    synth.onvoiceschanged = warm
  }
}
