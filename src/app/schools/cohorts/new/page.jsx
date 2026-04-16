'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ALL_SUBJECTS = [
  { id: 'physics', label: 'Physics' }, { id: 'mathematics', label: 'Mathematics' },
  { id: 'chemistry', label: 'Chemistry' }, { id: 'biology', label: 'Biology' },
  { id: 'english', label: 'English' }, { id: 'government', label: 'Government' },
  { id: 'history', label: 'History' }, { id: 'economics', label: 'Economics' },
  { id: 'literature', label: 'Literature' },
]
const EXAMS = ['JAMB','WAEC','IGCSE','SAT']

export default function NewCohortPage() {
  const router = useRouter()
  const [year,     setYear]     = useState(new Date().getFullYear())
  const [label,    setLabel]    = useState('')
  const [examType, setExamType] = useState('WAEC')
  const [subjects, setSubjects] = useState(['physics','mathematics','chemistry','biology'])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [created,  setCreated]  = useState(null)

  function toggleSubject(id) {
    setSubjects(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function handleCreate() {
    if (subjects.length === 0) { setError('Select at least one subject.'); return }
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/schools/cohorts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academicYear: year, label, examType, subjects }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create cohort'); return }
      setCreated(data.cohort)
    } catch { setError('Network error. Please try again.') }
    finally   { setLoading(false) }
  }

  const inp = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '11px 14px', fontSize: 14, fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#0A0A0A', background: '#fff' }
  const lbl = { display: 'block', fontWeight: 700, fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }
  const mw  = { maxWidth: 560, margin: '0 auto', padding: '0 24px' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Nunito, sans-serif', padding: '40px 0' }}>
      <div style={mw}>
        <Link href="/schools/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#64748B', textDecoration: 'none', marginBottom: 28 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Dashboard
        </Link>

        {created ? (
          <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 16, padding: 36, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', border: '2px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>✓</div>
            <h2 style={{ fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 8 }}>Cohort created!</h2>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Share this link with your students:</p>
            <div style={{ background: '#EEF0FE', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <code style={{ fontSize: 14, fontWeight: 700, color: '#2D3CE6', wordBreak: 'break-all' }}>{`${window.location.origin}/join/${created.access_code || created.cohort?.access_code}`}</code>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join/${created.access_code || created.cohort?.access_code}`)}
                style={{ fontSize: 13, fontWeight: 700, padding: '10px 20px', border: '1.5px solid #2D3CE6', borderRadius: 9, background: '#fff', color: '#2D3CE6', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                Copy link
              </button>
              <Link href={`/schools/cohorts/${created.id}`}
                style={{ fontSize: 13, fontWeight: 700, padding: '10px 20px', border: 'none', borderRadius: 9, background: '#2D3CE6', color: '#fff', textDecoration: 'none' }}>
                View cohort →
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 16, padding: 32 }}>
            <h1 style={{ fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 6 }}>Create new cohort</h1>
            <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 28 }}>Students will join via a unique link generated for this cohort.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Academic year *</label>
                  <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ ...inp, cursor: 'pointer' }}>
                    {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Exam type *</label>
                  <select value={examType} onChange={e => setExamType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>Label <span style={{ fontWeight: 400, color: '#C4C4C4' }}>(optional)</span></label>
                <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. SS3 Set A, Morning Batch" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Subjects to include *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ALL_SUBJECTS.map(s => (
                    <button key={s.id} onClick={() => toggleSubject(s.id)}
                      style={{ padding: '8px 14px', border: `1.5px solid ${subjects.includes(s.id) ? '#2D3CE6' : '#E2E8F0'}`, borderRadius: 99, background: subjects.includes(s.id) ? '#EEF0FE' : '#fff', color: subjects.includes(s.id) ? '#2D3CE6' : '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                      {subjects.includes(s.id) ? '✓ ' : ''}{s.label}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{error}</p>}
              <button onClick={handleCreate} disabled={loading}
                style={{ padding: '13px 0', border: 'none', borderRadius: 10, background: '#2D3CE6', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Nunito, sans-serif' }}>
                {loading ? 'Creating…' : 'Create cohort →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}