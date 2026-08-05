import type { Locale } from '@/content/types'
import { useProgressStore } from '@/progress/store'

const LOCALES: Locale[] = ['en', 'es', 'pl']

const LABELS: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  pl: 'PL',
}

export function LocaleSwitcher() {
  const locale = useProgressStore((s) => s.blob.locale)
  const setLocale = useProgressStore((s) => s.setLocale)

  return (
    <div className="locale-switcher" role="group" aria-label="Language">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`btn locale-btn ${locale === code ? 'active' : ''}`}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  )
}
