/**
 * EXAM_REGISTRY — single source of truth for all exam bodies.
 * Adding a new exam = adding one entry here. Zero code changes elsewhere.
 */
export const EXAM_REGISTRY = {
  JAMB: {
    id:               'JAMB',
    fullName:         'Joint Admissions and Matriculation Board',
    country:          'NG',
    status:           'live',          // 'live' | 'coming_soon' | 'planned'
    description:      'Nigerian university entrance examination',
    subjects:         ['physics','mathematics','chemistry','biology',
                       'english','government','history','economics','literature'],
    questionsPerTest: 40,
    timeLimit:        null,
  },
  WAEC: {
    id:               'WAEC',
    fullName:         'West African Examinations Council',
    country:          'NG',
    status:           'coming_soon',
    description:      'Senior Secondary Certificate Examination for West African students',
    subjects:         ['physics','mathematics','chemistry','biology',
                       'english','government','history','economics','literature'],
    questionsPerTest: 50,
    timeLimit:        null,
  },
  IGCSE: {
    id:               'IGCSE',
    fullName:         'International General Certificate of Secondary Education',
    country:          'INTL',
    status:           'planned',
    description:      'Cambridge international secondary qualification',
    subjects:         ['mathematics','english','physics','chemistry','biology','history','economics'],
    questionsPerTest: 40,
    timeLimit:        null,
  },
  SAT: {
    id:               'SAT',
    fullName:         'Scholastic Assessment Test',
    country:          'US',
    status:           'planned',
    description:      'US college admissions standardised test',
    subjects:         ['mathematics','english'],
    questionsPerTest: 44,
    timeLimit:        null,
  },
}

export const LIVE_EXAMS       = Object.values(EXAM_REGISTRY).filter(e => e.status === 'live')
export const AVAILABLE_EXAMS  = Object.values(EXAM_REGISTRY).filter(e => e.status !== 'planned')

export function getExam(id) {
  return EXAM_REGISTRY[id?.toUpperCase()] ?? null
}

export function isExamLive(id) {
  return EXAM_REGISTRY[id?.toUpperCase()]?.status === 'live'
}
