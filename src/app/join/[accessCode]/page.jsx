'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage({ params }) {
  const router   = useRouter()
  const [cohort, setCohort]     = useState(null)
  const [name,   setName]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [joining, setJoining]   = useState(false)
  const [error,   setError]     = useState(null)

  useEffect(() => {
    fetch(`/api/join/${params.accessCode}`)
      .then(r => r.json())
      .then(d => { if (d.cohort) setCohort(d.cohort); else setError('This link is invalid or has expired.') })
      .catch(() => setError('Could not load this page. Please check your link.'))
      .finally(() => setLoading(false))
  }, [params.accessCode])

  async function handleJoin() {
    if (!name.trim()) return
    setJoining(true); setError(null)
    try {
      const res  = await fetch(`/api/join/${params.accessCode}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not join. Please try again.'); return }

      // Store school context in sessionStorage for the test setup
      sessionStorage.setItem('learniie_school', JSON.stringify({
        cohortId:       data.cohortId,
        schoolStudentId: data.student.id,
        studentName:    name.trim(),
        accessCode:     params.accessCode,
        examType:       cohort.exam_type,
        subjects:       cohort.subjects,
      }))

      router.push(`/join/${params.accessCode}/setup`)
    } catch { setError('Network error. Please try again.') }
    finally   { setJoining(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #2D3CE6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error && !cohort) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔗</p>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 12 }}>Invalid link</h1>
        <p style={{ fontSize: 15, color: '#64748B', marginBottom: 24 }}>{error}</p>
        <a href="/" style={{ fontSize: 14, fontWeight: 700, color: '#2D3CE6', textDecoration: 'none' }}>Go to Exam Ready Test →</a>
      </div>
    </div>
  )

  const institution = cohort?.institutions

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* School badge */}
        {institution?.name && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF0FE', border: '1.5px solid #C7D2FE', borderRadius: 99, padding: '8px 16px' }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#2D3CE6' }}>{institution.name}</span>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 20, padding: '36px 32px', textAlign: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: 26, color: '#0A0A0A', lineHeight: 1.2, marginBottom: 10 }}>
            Test your exam readiness
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>
            {cohort?.exam_type} · {cohort?.academic_year}
          </p>
          <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 32 }}>
            {(cohort?.subjects || []).length} subjects available
          </p>

          <div style={{ textAlign: 'left', marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              What's your name?
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleJoin()}
              placeholder="e.g. Chidera Okafor"
              autoFocus
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '13px 16px', fontSize: 15, fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#0A0A0A' }}
            />
          </div>

          {error && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{error}</p>}

          <button onClick={handleJoin} disabled={!name.trim() || joining}
            style={{ width: '100%', padding: '14px 0', border: 'none', borderRadius: 10, background: name.trim() ? '#2D3CE6' : '#E2E8F0', color: name.trim() ? '#fff' : '#94A3B8', fontWeight: 800, fontSize: 16, cursor: name.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Nunito, sans-serif', opacity: joining ? 0.7 : 1 }}>
            {joining ? 'Joining…' : 'Join & choose subject →'}
          </button>
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 16 }}>No sign-up. No account needed.</p>
        </div>
      </div>
    </div>
  )
}
