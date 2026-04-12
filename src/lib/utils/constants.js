export const EXAM_TYPES = ['JAMB', 'WAEC', 'NECO']

export const SUBJECTS = [
  { id: 'physics',     title: 'Physics'     },
  { id: 'mathematics', title: 'Mathematics' },
  { id: 'chemistry',   title: 'Chemistry'   },
  { id: 'biology',     title: 'Biology'     },
  { id: 'english',     title: 'English'     },
  { id: 'government',  title: 'Government'  },
  { id: 'history',     title: 'History'     },
  { id: 'economics',   title: 'Economics'   },
  { id: 'literature',  title: 'Literature'  },
]

// Canonical normalisers — use everywhere a subject or exam type is stored or queried
export function normaliseSubject(s)  { return s?.toLowerCase().trim().replace(/\s+/g, '_') || '' }
export function normaliseExamType(e) { return e?.toUpperCase().trim() || '' }

export const READINESS = [
  { min: 80, label: 'Exam Ready',     color: 'green' },
  { min: 60, label: 'Almost Ready',   color: 'blue'  },
  { min: 40, label: 'Keep Studying',  color: 'amber' },
  { min: 0,  label: 'Needs More Prep', color: 'red'  },
]

export function getReadiness(pct) {
  return READINESS.find(r => pct >= r.min) || READINESS[3]
}

export const QUESTIONS_PER_TEST = 40
export const PAGE_SIZE = 50
export const MAX_SESSIONS_STORED = 20
