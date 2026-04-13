'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function JoinSetupPage({ params }) {
  const router   = useRouter()
  const [school,   setSchool]   = useState(null)
  const [subject,  setSubject]  = useState('')
  const [mounted,  setMounted]  = useState(false)

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
    sessionStorage.setItem('learniie_setup', JSON.stringify({
      studentName:     school.studentName,
      examType:        school.examType,
      subject:         subject,
      cohortId:        school.cohortId,
      schoolStudentId: school.schoolStudentId,
    }))
    router.push('/test')
  }

  const LABELS = { physics:'Physics',mathematics:'Mathematics',chemistry:'Chemistry',biology:'Biology',english:'English',government:'Government',history:'History',economics:'Economics',literature:'Literature' }

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 20, padding: '36px 32px' }}>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Hello, {school?.studentName} 👋</p>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 6 }}>Choose a subject</h1>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28 }}>
            {school?.examType} · Select the subject you want to test today
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            {(school?.subjects || []).map(s => (
              <button key={s} onClick={() => setSubject(s)}
                style={{ padding: '10px 18px', border: `1.5px solid ${subject === s ? '#2D3CE6' : '#E2E8F0'}`, borderRadius: 99, background: subject === s ? '#2D3CE6' : '#fff', color: subject === s ? '#fff' : '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s' }}>
                {LABELS[s] || s}
              </button>
            ))}
          </div>
          <button onClick={handleStart} disabled={!subject}
            style={{ width: '100%', padding: '14px 0', border: 'none', borderRadius: 10, background: subject ? '#2D3CE6' : '#E2E8F0', color: subject ? '#fff' : '#94A3B8', fontWeight: 800, fontSize: 16, cursor: subject ? 'pointer' : 'not-allowed', fontFamily: 'Nunito, sans-serif' }}>
            {subject ? `Start ${LABELS[subject] || subject} test →` : 'Choose a subject to continue'}
          </button>
          <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 16 }}>40 questions · Your teacher will see your results</p>
        </div>
      </div>
    </div>
  )
}
