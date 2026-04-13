'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

export default function SchoolDashboard() {
  const router   = useRouter()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(null)

  useEffect(() => {
    fetch('/api/schools/dashboard')
      .then(r => { if (r.status === 401) { router.push('/schools/login'); return null } return r.json() })
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/schools/logout', { method: 'POST' })
    router.push('/schools/login')
  }

  function handleCopy(text, key) {
    copyToClipboard(text); setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #2D3CE6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const { institution, stats, cohorts = [] } = data || {}
  const mw = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Nunito, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E8EAED', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ ...mw, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, background: '#2D3CE6', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>E</div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 14, color: '#0A0A0A', margin: 0 }}>{institution?.name}</p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>School Dashboard</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/schools/cohorts/new"
              style={{ fontSize: 13, fontWeight: 700, background: '#2D3CE6', color: '#fff', padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>
              + New cohort
            </Link>
            <button onClick={logout} style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
          </div>
        </div>
      </header>

      <div style={{ ...mw, padding: '32px 24px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
          {[
            { label: 'Total students',   value: stats?.totalStudents   ?? 0 },
            { label: 'Tests completed',  value: stats?.totalSessions   ?? 0 },
            { label: 'Average score',    value: stats?.avgScore != null ? `${stats.avgScore}%` : '—' },
            { label: 'Active cohorts',   value: stats?.activeCohorts   ?? 0 },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 12, padding: '20px 22px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: '#0A0A0A', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Cohorts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 900, fontSize: 20, color: '#0A0A0A', margin: 0 }}>Your cohorts</h2>
          <Link href="/schools/cohorts/new"
            style={{ fontSize: 13, fontWeight: 700, color: '#2D3CE6', textDecoration: 'none' }}>
            Create new cohort →
          </Link>
        </div>

        {cohorts.length === 0 ? (
          <div style={{ background: '#fff', border: '1.5px dashed #E2E8F0', borderRadius: 14, padding: '56px 24px', textAlign: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: 18, color: '#0A0A0A', marginBottom: 8 }}>No cohorts yet</p>
            <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>Create your first cohort to get started. Students join via your unique link.</p>
            <Link href="/schools/cohorts/new"
              style={{ fontSize: 14, fontWeight: 700, background: '#2D3CE6', color: '#fff', padding: '12px 24px', borderRadius: 9, textDecoration: 'none' }}>
              Create first cohort →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cohorts.map(c => (
              <div key={c.id} style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 17, color: '#0A0A0A', margin: 0 }}>{c.label || `${c.exam_type} ${c.academic_year}`}</h3>
                      {c.is_active && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '3px 10px', borderRadius: 99 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }}/>Active
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 10px' }}>
                      {c.exam_type} · {(c.subjects || []).join(', ')}
                    </p>
                    <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                      {c.studentCount} student{c.studentCount !== 1 ? 's' : ''} · {c.sessionCount} test{c.sessionCount !== 1 ? 's' : ''} completed
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <code style={{ fontSize: 13, fontWeight: 700, color: '#2D3CE6', background: '#EEF0FE', padding: '6px 12px', borderRadius: 7 }}>{c.access_code}</code>
                    <button onClick={() => handleCopy(c.access_url || `${window.location.origin}/join/${c.access_code}`, c.id)}
                      style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', border: `1.5px solid ${copied === c.id ? '#86EFAC' : '#E2E8F0'}`, borderRadius: 7, background: copied === c.id ? '#F0FDF4' : '#fff', color: copied === c.id ? '#15803D' : '#374151', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                      {copied === c.id ? 'Copied ✓' : 'Copy link'}
                    </button>
                    <Link href={`/schools/cohorts/${c.id}`}
                      style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', border: 'none', borderRadius: 7, background: '#2D3CE6', color: '#fff', textDecoration: 'none' }}>
                      View analytics →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
