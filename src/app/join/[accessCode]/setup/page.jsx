'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const LABELS = {
  physics: 'Physics', mathematics: 'Mathematics', chemistry: 'Chemistry',
  biology: 'Biology', english: 'English', government: 'Government',
  history: 'History', economics: 'Economics', literature: 'Literature',
}

const MODES = [
  {
    id:    'exam',
    icon:  '📝',
    label: 'Practice Mode',
    desc:  '40 questions · 30-min timer · Results sent to your teacher',
    badge: 'Default',
    badgeColor: '#2D3CE6',
  },
  {
    id:    'study',
    icon:  '💡',
    label: 'Study Mode',
    desc:  '20 questions · Instant feedback per answer · Private — teacher won\'t see this',
    badge: 'Private',
    badgeColor: '#7C3AED',
  },
]

export default function JoinSetupPage({ params }) {
  const router  = useRouter()
  const [school,  setSchool]  = useState(null)
  const [subject, setSubject] = useState('')
  const [mode,    setMode]    = useState('exam')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const data = JSON.parse(sessionStorage.getItem('learniie_school') || '{}')
      if (!data.cohortId) { router.push(`/join/${params.accessCode}`); return }
      setSchool(data)
    } catch { router.push(`/join/${params.accessCode}`) }
  }, [])

  function handleStart() {
    if (!subject || !school) return
    const isStudy = mode === 'study'
    sessionStorage.setItem('learniie_setup', JSON.stringify({
      studentName:     school.studentName,
      examType:        school.examType,
      subject,
      mode,
      questionCount:   isStudy ? 20 : 40,
      timeLimit:       isStudy ? 600 : 1800,
      // Study mode is private — do NOT pass school IDs so results aren't reported
      cohortId:        isStudy ? null : school.cohortId,
      schoolStudentId: isStudy ? null : school.schoolStudentId,
    }))
    router.push('/test')
  }

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 500 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 15, color: '#374151', fontWeight: 700, margin: '0 0 4px' }}>
            Hello, {school?.studentName} 👋
          </p>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
            {school?.examType} · Choose how you want to practice today
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 20, padding: '32px 28px' }}>

          {/* Subject */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Choose a subject
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(school?.subjects || []).map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  style={{ padding: '9px 16px', border: `1.5px solid ${subject === s ? '#2D3CE6' : '#E2E8F0'}`, borderRadius: 99, background: subject === s ? '#2D3CE6' : '#fff', color: subject === s ? '#fff' : '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s' }}>
                  {LABELS[s] || s}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Choose a mode
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', border: `1.5px solid ${mode === m.id ? '#2D3CE6' : '#E2E8F0'}`, borderRadius: 12, background: mode === m.id ? '#F5F7FF' : '#fff', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', textAlign: 'left', transition: 'all 0.15s', position: 'relative' }}>
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: mode === m.id ? '#2D3CE6' : '#0A0A0A' }}>{m.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: m.badgeColor + '18', color: m.badgeColor }}>{m.badge}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{m.desc}</p>
                  </div>
                  {mode === m.id && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#2D3CE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button onClick={handleStart} disabled={!subject}
            style={{ width: '100%', padding: '14px 0', border: 'none', borderRadius: 10, background: subject ? '#2D3CE6' : '#E2E8F0', color: subject ? '#fff' : '#94A3B8', fontWeight: 800, fontSize: 16, cursor: subject ? 'pointer' : 'not-allowed', fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s' }}>
            {subject
              ? `Start ${mode === 'exam' ? 'Practice' : 'Study'} — ${LABELS[subject] || subject} →`
              : 'Choose a subject to continue'}
          </button>

          <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 14 }}>
            {mode === 'exam'
              ? '40 questions · 30 minutes · Your teacher will see your results'
              : '20 questions · 10 minutes · Results are private — just for you'}
          </p>
        </div>
      </div>
    </div>
  )
}