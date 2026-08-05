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
  | 'continueToRange'
  | 'celebrationTitle'
  | 'celebrationSub'
  | 'feedbackCorrectLead'
  | 'feedbackIncorrectLead'
  | 'tryAgainHint'
  | 'reviewSolutionHint'
  | 'rankStanding'
  | 'theoremCompleteness'
  | 'academyAudit'
  | 'compactStandards'
  | 'houseStanding'
  | 'abilityDetail'
  | 'missionBrief'
  | 'challengeFocus'
  | 'masteryProgress'
  | 'phaseRailLabel'
  | 'unlocksEarned'
  | 'noStandardsMapped'
  | 'lessonMasteredStanding'
  | 'academySelect'
  | 'theoremsTitle'
  | 'sprint'
  | 'jump'
  | 'moveStick'
  | 'lookLeft'
  | 'lookRight'

const UI_STRINGS: Record<Locale, Record<UiKey, string>> = {
  en: {
    startLesson: 'Enter briefing',
    submit: 'Lock in',
    next: 'Next',
    close: 'Close',
    speak: 'Hear tutor',
    listen: 'Speak answer',
    listening: 'Listening…',
    masteryUnlocked: 'Mastery cleared',
    approachTerminal: 'Approach terminal',
    build: 'Build',
    zoneLocked: 'Zone locked',
    zoneUnlocked: 'Zone unlocked',
    progress: 'House standing',
    jurisdiction: 'Academy',
    phaseObjectives: 'Brief',
    phaseIDo: 'I do',
    phaseWeDo: 'We do',
    phaseYouDo: 'You do',
    phaseRetrieval: 'Recall',
    phaseComplete: 'Cleared',
    correct: 'Nailed it',
    incorrect: 'Not yet',
    yourAnswer: 'Your answer',
    workedSolution: 'Worked solution',
    objectives: 'Mission objectives',
    successCriteria: 'Clear conditions',
    loadingLesson: 'Syncing terminal…',
    lessonUnavailable: 'Terminal content is offline.',
    continue: 'Continue',
    masteryGate: 'Clearance check',
    independentScore: 'Solo challenges',
    standardsTitle: 'Compact standards',
    kpStatusTitle: 'Theorem completeness',
    statusNotIntroduced: 'Locked',
    statusInProgress: 'In training',
    statusMastered: 'Cleared',
    statusDueReview: 'Review due',
    standardEvidenced: 'Proven',
    standardPartial: 'Partial',
    standardMissing: 'Open',
    resetProgress: 'Reset house progress',
    speechUnavailable: 'Speech output unavailable',
    micUnavailable: 'Microphone input unavailable',
    lessonComplete: 'Terminal cleared',
    unlockBlueprint: 'Blueprint unlocked',
    unlockRank: 'Rank insignia earned',
    unlockZone: 'New zone unlocked',
    continueToRange: 'Return to range',
    celebrationTitle: 'Clearance earned',
    celebrationSub: 'Rewards unlocked for the training range.',
    feedbackCorrectLead: 'Clean hit — keep the streak.',
    feedbackIncorrectLead: 'Miss — study the fix, then advance.',
    tryAgainHint: 'Compare your path to the worked solution.',
    reviewSolutionHint: 'Use the solution below, then continue.',
    rankStanding: 'Rank standing',
    theoremCompleteness: 'Theorem completeness',
    academyAudit: 'Academy audit',
    compactStandards: 'Compact standards',
    houseStanding: 'House standing',
    abilityDetail: 'Ability estimate',
    missionBrief: 'Mission brief',
    challengeFocus: 'Your challenge',
    masteryProgress: 'Clearance',
    phaseRailLabel: 'Run path',
    unlocksEarned: 'Unlocked',
    noStandardsMapped: 'No compact standards mapped for this academy in the current lesson.',
    lessonMasteredStanding: 'Lesson cleared',
    academySelect: 'Academy jurisdiction',
    theoremsTitle: 'Theorems',
    sprint: 'Sprint',
    jump: 'Jump',
    moveStick: 'Move',
    lookLeft: 'Look L',
    lookRight: 'Look R',
  },
  es: {
    startLesson: 'Entrar al briefing',
    submit: 'Confirmar',
    next: 'Siguiente',
    close: 'Cerrar',
    speak: 'Oír tutor',
    listen: 'Decir respuesta',
    listening: 'Escuchando…',
    masteryUnlocked: 'Dominio superado',
    approachTerminal: 'Acércate al terminal',
    build: 'Construir',
    zoneLocked: 'Zona bloqueada',
    zoneUnlocked: 'Zona desbloqueada',
    progress: 'Posición de la casa',
    jurisdiction: 'Academia',
    phaseObjectives: 'Brief',
    phaseIDo: 'Yo hago',
    phaseWeDo: 'Hacemos',
    phaseYouDo: 'Tú haces',
    phaseRetrieval: 'Recuerdo',
    phaseComplete: 'Superado',
    correct: 'Acertado',
    incorrect: 'Aún no',
    yourAnswer: 'Tu respuesta',
    workedSolution: 'Solución trabajada',
    objectives: 'Objetivos de misión',
    successCriteria: 'Condiciones de superación',
    loadingLesson: 'Sincronizando terminal…',
    lessonUnavailable: 'El contenido del terminal está fuera de línea.',
    continue: 'Continuar',
    masteryGate: 'Control de autorización',
    independentScore: 'Desafíos en solitario',
    standardsTitle: 'Estándares compactos',
    kpStatusTitle: 'Completitud de teoremas',
    statusNotIntroduced: 'Bloqueado',
    statusInProgress: 'En entrenamiento',
    statusMastered: 'Superado',
    statusDueReview: 'Repaso pendiente',
    standardEvidenced: 'Probado',
    standardPartial: 'Parcial',
    standardMissing: 'Abierto',
    resetProgress: 'Restablecer progreso de la casa',
    speechUnavailable: 'Salida de voz no disponible',
    micUnavailable: 'Entrada de micrófono no disponible',
    lessonComplete: 'Terminal superado',
    unlockBlueprint: 'Plano desbloqueado',
    unlockRank: 'Insignia de rango obtenida',
    unlockZone: 'Nueva zona desbloqueada',
    continueToRange: 'Volver al campo',
    celebrationTitle: 'Autorización ganada',
    celebrationSub: 'Recompensas desbloqueadas para el campo de entrenamiento.',
    feedbackCorrectLead: 'Golpe limpio — mantén la racha.',
    feedbackIncorrectLead: 'Fallo — estudia la corrección y avanza.',
    tryAgainHint: 'Compara tu camino con la solución trabajada.',
    reviewSolutionHint: 'Usa la solución de abajo y continúa.',
    rankStanding: 'Posición de rango',
    theoremCompleteness: 'Completitud de teoremas',
    academyAudit: 'Auditoría de academia',
    compactStandards: 'Estándares compactos',
    houseStanding: 'Posición de la casa',
    abilityDetail: 'Estimación de habilidad',
    missionBrief: 'Briefing de misión',
    challengeFocus: 'Tu desafío',
    masteryProgress: 'Autorización',
    phaseRailLabel: 'Ruta de la run',
    unlocksEarned: 'Desbloqueado',
    noStandardsMapped: 'No hay estándares compactos mapeados para esta academia en la lección actual.',
    lessonMasteredStanding: 'Lección superada',
    academySelect: 'Jurisdicción de academia',
    theoremsTitle: 'Teoremas',
    sprint: 'Sprint',
    jump: 'Saltar',
    moveStick: 'Mover',
    lookLeft: 'Mirar I',
    lookRight: 'Mirar D',
  },
  pl: {
    startLesson: 'Wejdź do briefingu',
    submit: 'Zatwierdź',
    next: 'Dalej',
    close: 'Zamknij',
    speak: 'Posłuchaj tutora',
    listen: 'Powiedz odpowiedź',
    listening: 'Nasłuchiwanie…',
    masteryUnlocked: 'Opanowanie zaliczone',
    approachTerminal: 'Podejdź do terminala',
    build: 'Buduj',
    zoneLocked: 'Strefa zablokowana',
    zoneUnlocked: 'Strefa odblokowana',
    progress: 'Pozycja domu',
    jurisdiction: 'Akademia',
    phaseObjectives: 'Brief',
    phaseIDo: 'Ja robię',
    phaseWeDo: 'Robimy',
    phaseYouDo: 'Ty robisz',
    phaseRetrieval: 'Przypomnienie',
    phaseComplete: 'Zaliczone',
    correct: 'Trafione',
    incorrect: 'Jeszcze nie',
    yourAnswer: 'Twoja odpowiedź',
    workedSolution: 'Rozwiązanie krok po kroku',
    objectives: 'Cele misji',
    successCriteria: 'Warunki zaliczenia',
    loadingLesson: 'Synchronizacja terminala…',
    lessonUnavailable: 'Treść terminala jest niedostępna.',
    continue: 'Kontynuuj',
    masteryGate: 'Kontrola uprawnień',
    independentScore: 'Wyzwania solo',
    standardsTitle: 'Zwarte standardy',
    kpStatusTitle: 'Kompletność twierdzeń',
    statusNotIntroduced: 'Zablokowane',
    statusInProgress: 'W treningu',
    statusMastered: 'Zaliczone',
    statusDueReview: 'Do powtórki',
    standardEvidenced: 'Udowodnione',
    standardPartial: 'Częściowe',
    standardMissing: 'Otwarte',
    resetProgress: 'Zresetuj postęp domu',
    speechUnavailable: 'Synteza mowy niedostępna',
    micUnavailable: 'Mikrofon niedostępny',
    lessonComplete: 'Terminal zaliczony',
    unlockBlueprint: 'Plan odblokowany',
    unlockRank: 'Odznaka rangi zdobyta',
    unlockZone: 'Nowa strefa odblokowana',
    continueToRange: 'Wróć na poligon',
    celebrationTitle: 'Uprawnienie zdobyte',
    celebrationSub: 'Nagrody odblokowane na poligonie treningowym.',
    feedbackCorrectLead: 'Czyste trafienie — trzymaj serię.',
    feedbackIncorrectLead: 'Pudło — przeanalizuj poprawkę i idź dalej.',
    tryAgainHint: 'Porównaj swoją ścieżkę z rozwiązaniem.',
    reviewSolutionHint: 'Użyj rozwiązania poniżej, potem kontynuuj.',
    rankStanding: 'Pozycja rangi',
    theoremCompleteness: 'Kompletność twierdzeń',
    academyAudit: 'Audyt akademii',
    compactStandards: 'Zwarte standardy',
    houseStanding: 'Pozycja domu',
    abilityDetail: 'Szacunek umiejętności',
    missionBrief: 'Briefing misji',
    challengeFocus: 'Twoje wyzwanie',
    masteryProgress: 'Uprawnienie',
    phaseRailLabel: 'Ścieżka runu',
    unlocksEarned: 'Odblokowano',
    noStandardsMapped: 'Brak zwartych standardów dla tej akademii w bieżącej lekcji.',
    lessonMasteredStanding: 'Lekcja zaliczona',
    academySelect: 'Jurysdykcja akademii',
    theoremsTitle: 'Twierdzenia',
    sprint: 'Sprint',
    jump: 'Skok',
    moveStick: 'Ruch',
    lookLeft: 'Patrz L',
    lookRight: 'Patrz P',
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

export function unlockKindLabel(locale: Locale, kind: string): string {
  const map: Record<string, UiKey> = {
    blueprint: 'unlockBlueprint',
    rank: 'unlockRank',
    zone: 'unlockZone',
  }
  const key = map[kind]
  return key ? ui(locale, key) : kind
}
