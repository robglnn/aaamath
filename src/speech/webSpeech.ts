import type { Locale } from '@/content/types'

const LOCALE_TO_BCP47: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  pl: 'pl-PL',
}

const LOCALE_VOICE_HINTS: Record<Locale, string[]> = {
  en: ['en', 'english'],
  es: ['es', 'spanish', 'español'],
  pl: ['pl', 'polish', 'polski'],
}

function pickVoice(locale: Locale): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !window.speechSynthesis) return undefined
  const voices = window.speechSynthesis.getVoices()
  const hints = LOCALE_VOICE_HINTS[locale]
  const byLang = voices.find((v) => v.lang.toLowerCase().startsWith(locale))
  if (byLang) return byLang
  return voices.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)))
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

if (typeof window !== 'undefined' && canTTS()) {
  window.speechSynthesis.getVoices()
}
