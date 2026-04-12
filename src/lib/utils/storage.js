const KEY = 'learniie_ep_sessions'
const MAX = 10

export function getPastSessions() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function saveSession(session) {
  if (typeof window === 'undefined') return
  try {
    const existing = getPastSessions()
    const filtered = existing.filter(s => s.shareToken !== session.shareToken)
    localStorage.setItem(KEY, JSON.stringify([session, ...filtered].slice(0, MAX)))
  } catch {}
}

export function clearPastSessions() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
