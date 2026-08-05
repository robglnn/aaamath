import type { Locale } from '@/content/types'

export type UiKey =
  | 'startLesson'
  | 'submit'
  | 'next'
  | 'close'
  | 'speak'
  | 'listen'
  | 'listening'
  | 'masteryUnlocked'
  | 'approachTerminal'
  | 'build'
  | 'zoneLocked'
  | 'zoneUnlocked'
  | 'progress'
  | 'jurisdiction'
  | 'phaseObjectives'
  | 'phaseIDo'
  | 'phaseWeDo'
  | 'phaseYouDo'
  | 'phaseRetrieval'
  | 'phaseComplete'
  | 'correct'
  | 'incorrect'
  | 'yourAnswer'
  | 'workedSolution'
  | 'objectives'
  | 'successCriteria'
  | 'loadingLesson'
  | 'lessonUnavailable'
  | 'continue'
  | 'masteryGate'
  | 'independentScore'
  | 'standardsTitle'
  | 'kpStatusTitle'
  | 'statusNotIntroduced'
  | 'statusInProgress'
  | 'statusMastered'
  | 'statusDueReview'
  | 'standardEvidenced'
  | 'standardPartial'
  | 'standardMissing'
  | 'resetProgress'
  | 'speechUnavailable'
  | 'micUnavailable'
  | 'lessonComplete'
  | 'unlockBlueprint'
  | 'unlockRank'
  | 'unlockZone'

const UI_STRINGS: Record<Locale, Record<UiKey, string>> = {
  en: {
    startLesson: 'Start lesson',
    submit: 'Submit',
    next: 'Next',
    close: 'Close',
    speak: 'Speak',
    listen: 'Listen',
    listening: 'Listening…',
    masteryUnlocked: 'Mastery unlocked',
    approachTerminal: 'Approach terminal',
    build: 'Build',
    zoneLocked: 'Zone locked',
    zoneUnlocked: 'Zone unlocked',
    progress: 'Progress',
    jurisdiction: 'Jurisdiction',
    phaseObjectives: 'Objectives',
    phaseIDo: 'I do',
    phaseWeDo: 'We do',
    phaseYouDo: 'You do',
    phaseRetrieval: 'Retrieval',
    phaseComplete: 'Complete',
    correct: 'Correct',
    incorrect: 'Not quite',
    yourAnswer: 'Your answer',
    workedSolution: 'Worked solution',
    objectives: 'Learning objectives',
    successCriteria: 'Success criteria',
    loadingLesson: 'Loading lesson…',
    lessonUnavailable: 'Lesson content is not available yet.',
    continue: 'Continue',
    masteryGate: 'Mastery gate',
    independentScore: 'Independent practice',
    standardsTitle: 'Standards coverage',
    kpStatusTitle: 'Knowledge points',
    statusNotIntroduced: 'Not introduced',
    statusInProgress: 'In progress',
    statusMastered: 'Mastered',
    statusDueReview: 'Due review',
    standardEvidenced: 'Evidenced',
    standardPartial: 'Partial',
    standardMissing: 'Missing',
    resetProgress: 'Reset progress',
    speechUnavailable: 'Speech output unavailable',
    micUnavailable: 'Microphone input unavailable',
    lessonComplete: 'Lesson complete',
    unlockBlueprint: 'Blueprint unlocked',
    unlockRank: 'Rank insignia earned',
    unlockZone: 'New zone unlocked',
  },
  es: {
    startLesson: 'Iniciar lección',
    submit: 'Enviar',
    next: 'Siguiente',
    close: 'Cerrar',
    speak: 'Hablar',
    listen: 'Escuchar',
    listening: 'Escuchando…',
    masteryUnlocked: 'Dominio desbloqueado',
    approachTerminal: 'Acércate al terminal',
    build: 'Construir',
    zoneLocked: 'Zona bloqueada',
    zoneUnlocked: 'Zona desbloqueada',
    progress: 'Progreso',
    jurisdiction: 'Jurisdicción',
    phaseObjectives: 'Objetivos',
    phaseIDo: 'Yo hago',
    phaseWeDo: 'Hacemos',
    phaseYouDo: 'Tú haces',
    phaseRetrieval: 'Recuperación',
    phaseComplete: 'Completado',
    correct: 'Correcto',
    incorrect: 'Casi',
    yourAnswer: 'Tu respuesta',
    workedSolution: 'Solución trabajada',
    objectives: 'Objetivos de aprendizaje',
    successCriteria: 'Criterios de éxito',
    loadingLesson: 'Cargando lección…',
    lessonUnavailable: 'El contenido de la lección aún no está disponible.',
    continue: 'Continuar',
    masteryGate: 'Puerta de dominio',
    independentScore: 'Práctica independiente',
    standardsTitle: 'Cobertura de estándares',
    kpStatusTitle: 'Puntos de conocimiento',
    statusNotIntroduced: 'No introducido',
    statusInProgress: 'En progreso',
    statusMastered: 'Dominado',
    statusDueReview: 'Repaso pendiente',
    standardEvidenced: 'Evidenciado',
    standardPartial: 'Parcial',
    standardMissing: 'Faltante',
    resetProgress: 'Restablecer progreso',
    speechUnavailable: 'Salida de voz no disponible',
    micUnavailable: 'Entrada de micrófono no disponible',
    lessonComplete: 'Lección completada',
    unlockBlueprint: 'Plano desbloqueado',
    unlockRank: 'Insignia de rango obtenida',
    unlockZone: 'Nueva zona desbloqueada',
  },
  pl: {
    startLesson: 'Rozpocznij lekcję',
    submit: 'Wyślij',
    next: 'Dalej',
    close: 'Zamknij',
    speak: 'Mów',
    listen: 'Słuchaj',
    listening: 'Nasłuchiwanie…',
    masteryUnlocked: 'Opanowanie odblokowane',
    approachTerminal: 'Podejdź do terminala',
    build: 'Buduj',
    zoneLocked: 'Strefa zablokowana',
    zoneUnlocked: 'Strefa odblokowana',
    progress: 'Postęp',
    jurisdiction: 'Jurysdykcja',
    phaseObjectives: 'Cele',
    phaseIDo: 'Ja robię',
    phaseWeDo: 'Robimy',
    phaseYouDo: 'Ty robisz',
    phaseRetrieval: 'Przypominanie',
    phaseComplete: 'Ukończono',
    correct: 'Poprawnie',
    incorrect: 'Prawie',
    yourAnswer: 'Twoja odpowiedź',
    workedSolution: 'Rozwiązanie krok po kroku',
    objectives: 'Cele nauki',
    successCriteria: 'Kryteria sukcesu',
    loadingLesson: 'Ładowanie lekcji…',
    lessonUnavailable: 'Treść lekcji nie jest jeszcze dostępna.',
    continue: 'Kontynuuj',
    masteryGate: 'Brama opanowania',
    independentScore: 'Ćwiczenia samodzielne',
    standardsTitle: 'Pokrycie standardów',
    kpStatusTitle: 'Punkty wiedzy',
    statusNotIntroduced: 'Nie wprowadzono',
    statusInProgress: 'W toku',
    statusMastered: 'Opanowane',
    statusDueReview: 'Do powtórki',
    standardEvidenced: 'Potwierdzone',
    standardPartial: 'Częściowe',
    standardMissing: 'Brak',
    resetProgress: 'Resetuj postęp',
    speechUnavailable: 'Synteza mowy niedostępna',
    micUnavailable: 'Mikrofon niedostępny',
    lessonComplete: 'Lekcja ukończona',
    unlockBlueprint: 'Plan odblokowany',
    unlockRank: 'Odznaka rangi zdobyta',
    unlockZone: 'Nowa strefa odblokowana',
  },
}

export function ui(locale: Locale, key: UiKey): string {
  return UI_STRINGS[locale][key] ?? UI_STRINGS.en[key]
}

export function phaseLabel(locale: Locale, kind: string): string {
  const map: Record<string, UiKey> = {
    objectives: 'phaseObjectives',
    i_do: 'phaseIDo',
    we_do: 'phaseWeDo',
    you_do: 'phaseYouDo',
    retrieval: 'phaseRetrieval',
    complete: 'phaseComplete',
  }
  const key = map[kind]
  return key ? ui(locale, key) : kind
}

export function masteryStatusLabel(locale: Locale, status: string): string {
  const map: Record<string, UiKey> = {
    not_introduced: 'statusNotIntroduced',
    in_progress: 'statusInProgress',
    mastered: 'statusMastered',
    due_review: 'statusDueReview',
  }
  const key = map[status]
  return key ? ui(locale, key) : status
}
