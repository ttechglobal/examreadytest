// lib/storage/sessions.js
// IndexedDB-based session persistence with localStorage fallback.
// Silent — never prompts the user, never throws to UI.

const DB_NAME = 'learniie_ep'
const STORE   = 'sessions'
const MAX     = 20

async function getDB() {
  const { openDB } = await import('idb')
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'shareToken' })
        store.createIndex('savedAt', 'savedAt')
      }
    },
  })
}

export async function saveSession(session) {
  if (typeof window === 'undefined') return
  try {
    const db  = await getDB()
    await db.put(STORE, { ...session, savedAt: Date.now() })
    // Trim to MAX oldest-first
    const all = await db.getAllFromIndex(STORE, 'savedAt')
    if (all.length > MAX) {
      for (const s of all.slice(0, all.length - MAX)) {
        await db.delete(STORE, s.shareToken)
      }
    }
  } catch {
    // Fallback: localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('lep_sessions') || '[]')
      const filtered = existing.filter(s => s.shareToken !== session.shareToken)
      const updated  = [...filtered, { ...session, savedAt: Date.now() }]
      localStorage.setItem('lep_sessions', JSON.stringify(updated.slice(-MAX)))
    } catch {}
  }
}

export async function getSessions() {
  if (typeof window === 'undefined') return []
  try {
    const db  = await getDB()
    const all = await db.getAllFromIndex(STORE, 'savedAt')
    return all.reverse() // newest first
  } catch {
    try {
      return JSON.parse(localStorage.getItem('lep_sessions') || '[]').reverse()
    } catch { return [] }
  }
}

export async function clearSessions() {
  if (typeof window === 'undefined') return
  try {
    const db = await getDB()
    await db.clear(STORE)
  } catch {
    localStorage.removeItem('lep_sessions')
  }
}
