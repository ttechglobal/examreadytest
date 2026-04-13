'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUS_COLORS = { strong: { bg: '#DCFCE7', bar: '#22C55E', text: '#15803D' }, needs_work: { bg: '#FEF3C7', bar: '#F59E0B', text: '#D97706' }, critical: { bg: '#FEE2E2', bar: '#EF4444', text: '#B91C1C' } }
const STATUS_ICONS  = { strong: '✓', needs_work: '⚠', critical: '✗' }

function TopicHeatmap({ topics }) {
  if (!topics?.length) return <p style={{ fontSize: 14, color: '#94A3B8' }}>No topic data yet.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {topics.map(t => {
        const c = STATUS_COLORS[t.status] || STATUS_COLORS.needs_work
        return (
          <div key={t.topicId} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{t.topicTitle}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: c.text }}>{STATUS_ICONS[t.status]} {t.averagePercentage}%</span>
              </div>
              <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${t.averagePercentage}%`, background: c.bar, borderRadius: 4, transition: 'width 0.6s ease' }}/>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function CohortPage({ params }) {
  const router   = useRouter()
  const [tab, setTab] = useState('overview')
  const [cohort, setCohort]       = useState(null)
  const [students, setStudents]   = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [copied, setCopied]       = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/schools/cohorts/${params.cohortId}`).then(r => r.status === 401 ? router.push('/schools/login') : r.json()),
      fetch(`/api/schools/cohorts/${params.cohortId}/students`).then(r => r.json()),
      fetch(`/api/schools/cohorts/${params.cohortId}/analytics`).then(r => r.json()),
    ]).then(([c, s, a]) => {
      if (c?.cohort) setCohort(c)
      if (s?.students) setStudents(s.students)
      setAnalytics(a)
    }).finally(() => setLoading(false))
  }, [params.cohortId])

  function handleCopy() {
    const url = cohort?.cohort?.access_url || `${window.location.origin}/join/${cohort?.cohort?.access_code}`
    navigator.clipboard.writeText(url)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function exportCSV() {
    window.open(`/api/schools/cohorts/${params.cohortId}/analytics?export=csv`, '_blank')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #2D3CE6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const c = cohort?.cohort
  const mw = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }
  const TABS = ['overview','students','analytics']

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Nunito, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E8EAED' }}>
        <div style={{ ...mw, padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/schools/dashboard" style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 1.5L3.5 6.5l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Dashboard
              </Link>
              <span style={{ color: '#E2E8F0' }}>/</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>{c?.label || `${c?.exam_type} ${c?.academic_year}`}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCopy}
                style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', border: `1.5px solid ${copied ? '#86EFAC' : '#E2E8F0'}`, borderRadius: 7, background: copied ? '#F0FDF4' : '#fff', color: copied ? '#15803D' : '#374151', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                {copied ? 'Copied ✓' : 'Copy student link'}
              </button>
              <button onClick={exportCSV}
                style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', border: '1.5px solid #E2E8F0', borderRadius: 7, background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                Export CSV
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '10px 18px', border: 'none', borderBottom: `2px solid ${tab === t ? '#2D3CE6' : 'transparent'}`, background: 'none', fontWeight: tab === t ? 700 : 600, fontSize: 14, color: tab === t ? '#2D3CE6' : '#64748B', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ ...mw, padding: '32px 24px' }}>
        {/* Overview tab */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Access code card */}
            <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Student access</p>
              <code style={{ display: 'block', fontWeight: 900, fontSize: 22, color: '#2D3CE6', marginBottom: 12 }}>{c?.access_code}</code>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 1.6 }}>Share this link with your students. They click it, enter their name, and start testing immediately.</p>
              <div style={{ background: '#F8F9FA', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#64748B', wordBreak: 'break-all', marginBottom: 12 }}>
                {c?.access_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${c?.access_code}`}
              </div>
              <button onClick={handleCopy}
                style={{ width: '100%', padding: '10px 0', border: '1.5px solid #2D3CE6', borderRadius: 9, background: '#fff', color: '#2D3CE6', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                {copied ? 'Copied ✓' : 'Copy link'}
              </button>
            </div>

            {/* Quick stats */}
            <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Cohort overview</p>
              {[
                { label: 'Students joined',    value: cohort?.studentCount ?? 0 },
                { label: 'Tests completed',    value: cohort?.sessionCount ?? 0 },
                { label: 'Exam type',          value: c?.exam_type || '—' },
                { label: 'Academic year',      value: c?.academic_year || '—' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students tab */}
        {tab === 'students' && (
          <div>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>{students.length} student{students.length !== 1 ? 's' : ''} in this cohort</p>
            {students.length === 0 ? (
              <div style={{ background: '#fff', border: '1.5px dashed #E2E8F0', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#94A3B8', margin: 0 }}>No students yet. Share the cohort link to get started.</p>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E8EAED' }}>
                      {['Student','Tests taken','Avg score','Last active'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '11px 16px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>{s.student_name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#64748B' }}>{s.sessionsCount}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {s.avgScore != null ? (
                            <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: s.avgScore >= 70 ? '#DCFCE7' : s.avgScore >= 40 ? '#FEF3C7' : '#FEE2E2', color: s.avgScore >= 70 ? '#15803D' : s.avgScore >= 40 ? '#D97706' : '#B91C1C' }}>
                              {s.avgScore}%
                            </span>
                          ) : <span style={{ fontSize: 13, color: '#CBD5E1' }}>Not tested</span>}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94A3B8' }}>
                          {s.lastActive ? new Date(s.lastActive).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics tab */}
        {tab === 'analytics' && (
          <div>
            {!analytics?.subjectAnalytics || Object.keys(analytics.subjectAnalytics).length === 0 ? (
              <div style={{ background: '#fff', border: '1.5px dashed #E2E8F0', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#94A3B8', margin: 0 }}>No test data yet. Analytics will appear here once students start taking tests.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Subject overview table */}
                <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
                    <h3 style={{ fontWeight: 800, fontSize: 17, color: '#0A0A0A', margin: 0 }}>Subject performance overview</h3>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E8EAED' }}>
                        {['Subject','Class avg','Top score','Bottom score','Students tested'].map(h => (
                          <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(analytics.subjectAnalytics).map(s => (
                        <tr key={s.subject} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#0A0A0A', textTransform: 'capitalize' }}>{s.subject}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: s.averageScore >= 70 ? '#DCFCE7' : s.averageScore >= 40 ? '#FEF3C7' : '#FEE2E2', color: s.averageScore >= 70 ? '#15803D' : s.averageScore >= 40 ? '#D97706' : '#B91C1C' }}>
                              {s.averageScore}%
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#15803D' }}>{s.topScore}%</td>
                          <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#DC2626' }}>{s.bottomScore}%</td>
                          <td style={{ padding: '12px 16px', fontSize: 14, color: '#64748B' }}>{s.studentsCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Topic heatmaps per subject */}
                {Object.values(analytics.subjectAnalytics).map(s => (
                  <div key={s.subject} style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0A0A0A', margin: 0, textTransform: 'capitalize' }}>{s.subject} — topic breakdown</h3>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>Class avg: {s.averageScore}%</span>
                    </div>
                    <TopicHeatmap topics={s.topics} />

                    {/* Priority topics */}
                    {s.priorityTopics?.length > 0 && (
                      <div style={{ marginTop: 20, padding: '16px 18px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>⚠ Priority teaching areas</p>
                        {s.priorityTopics.map((t, i) => (
                          <div key={t.topicId} style={{ marginBottom: i < s.priorityTopics.length - 1 ? 12 : 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 3 }}>{i + 1}. {t.topicTitle} — {t.averagePercentage}%</p>
                            <p style={{ fontSize: 13, color: '#D97706', margin: 0, lineHeight: 1.6 }}>{t.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
