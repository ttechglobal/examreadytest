'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Helpers ──────────────────────────────────────────────────
function pct(n) { return n != null ? `${Math.round(n)}%` : '—' }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '' }

const STATUS = {
  strong:     { bg: '#DCFCE7', text: '#15803D', bar: '#22C55E', label: 'Strong' },
  needs_work: { bg: '#FEF3C7', text: '#D97706', bar: '#F59E0B', label: 'Needs Work' },
  critical:   { bg: '#FEE2E2', text: '#DC2626', bar: '#EF4444', label: 'Critical' },
}
function statusStyle(score) {
  if (score == null) return STATUS.needs_work
  return score >= 70 ? STATUS.strong : score >= 40 ? STATUS.needs_work : STATUS.critical
}

// ─── Icons ─────────────────────────────────────────────────────
const ICONS = {
  overview:  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
  students:  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  subjects:  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 8h8M2 13h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  improvements: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13L8 4l5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 9.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  cohorts:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 13V6l7-4 7 4v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="5" y="9" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>,
}

// ─── Sub-components ────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '18px 20px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#0A0A0A', margin: '0 0 3px', letterSpacing: '-0.5px' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{sub}</p>}
    </div>
  )
}

function ScoreBar({ score }) {
  const s = statusStyle(score)
  return (
    <div style={{ flex: 1 }}>
      <div style={{ height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score ?? 0}%`, background: s.bar, borderRadius: 4, transition: 'width 0.6s ease' }}/>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, body, cta }) {
  return (
    <div style={{ background: '#fff', border: '1.5px dashed #E2E8F0', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontWeight: 800, fontSize: 16, color: '#0A0A0A', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: cta ? 20 : 0, maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>{body}</p>
      {cta && <div style={{ marginTop: 20 }}>{cta}</div>}
    </div>
  )
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
      <div>
        <h2 style={{ fontWeight: 900, fontSize: 18, color: '#0A0A0A', margin: '0 0 3px' }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function exportCSV(studentStats, subjectStats, institution) {
  const lines = [
    `Exam Ready Test — ${institution?.name || 'School'} Analytics`,
    `Generated: ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    '', 'STUDENT PERFORMANCE', 'Name,Sessions,Average Score,Improvement',
    ...(studentStats || []).map(s => `"${s.name}",${s.sessionCount},${s.avgScore ?? ''},${s.improvement != null ? (s.improvement > 0 ? '+' : '') + s.improvement + '%' : ''}`),
    '', 'SUBJECT PERFORMANCE', 'Subject,Sessions,Average Score,Status',
    ...(subjectStats || []).map(s => `"${capitalize(s.subject)}",${s.sessionCount},${s.avgScore}%,${s.status}`),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `analytics-${new Date().toISOString().slice(0,10)}.csv` })
  a.click()
}

// ─── Sidebar nav ────────────────────────────────────────────────
const TABS = [
  { id: 'overview',      label: 'Overview' },
  { id: 'students',      label: 'Students' },
  { id: 'subjects',      label: 'Subjects' },
  { id: 'improvements',  label: 'Areas to Improve' },
  { id: 'cohorts',       label: 'Cohorts' },
]

function Sidebar({ tab, setTab, institution, onLogout, studentCount, cohortCount, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 39 }}/>
      )}

      <aside style={{
        width: 240, flexShrink: 0,
        background: '#0F172A',
        display: 'flex', flexDirection: 'column',
        minHeight: '100vh',
        position: 'sticky', top: 0, alignSelf: 'flex-start',
        // Mobile: slide in from left
        ...(typeof window !== 'undefined' && window.innerWidth < 768 ? {
          position: 'fixed', left: mobileOpen ? 0 : -260, top: 0, bottom: 0,
          zIndex: 40, transition: 'left 0.25s ease',
          boxShadow: mobileOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
        } : {}),
      }} className="dashboard-sidebar">

        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="7" fill="#2D3CE6"/><path d="M8 20V8l6 8 6-8v12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>
              <p style={{ fontWeight: 900, fontSize: 13, color: '#fff', margin: 0, lineHeight: 1.2 }}>Exam Ready Test</p>
              <p style={{ fontSize: 10, color: '#475569', margin: 0 }}>School Dashboard</p>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px' }}>
            <p style={{ fontWeight: 800, fontSize: 13, color: '#E2E8F0', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{institution?.name || '—'}</p>
            <p style={{ fontSize: 11, color: '#475569', margin: 0, textTransform: 'capitalize' }}>{institution?.type?.replace('_', ' ') || 'Institution'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMobileOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 9, border: 'none', background: tab === t.id ? 'rgba(45,60,230,0.25)' : 'none', color: tab === t.id ? '#818CF8' : '#64748B', fontWeight: tab === t.id ? 700 : 500, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', textAlign: 'left', transition: 'all 0.15s', marginBottom: 2 }}>
              <span style={{ color: tab === t.id ? '#818CF8' : '#475569' }}>{ICONS[t.id]}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/schools/cohorts/new"
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 9, background: '#2D3CE6', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', marginBottom: 6 }}>
            <span style={{ fontSize: 14 }}>+</span> New cohort
          </Link>
          <button onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 9, border: 'none', background: 'none', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Log out
          </button>
        </div>
      </aside>

      <style>{`
        @media (min-width: 768px) {
          .dashboard-sidebar { position: sticky !important; left: auto !important; box-shadow: none !important; }
          .dashboard-mobile-header { display: none !important; }
        }
        @media (max-width: 767px) {
          .dashboard-sidebar { position: fixed !important; left: ${mobileOpen ? '0' : '-260px'} !important; transition: left 0.25s ease !important; box-shadow: ${mobileOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none'} !important; }
          .dashboard-mobile-header { display: flex !important; }
        }
      `}</style>
    </>
  )
}

// ─── Main dashboard ────────────────────────────────────────────
export default function SchoolDashboard() {
  const router = useRouter()
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState('overview')
  const [copied,     setCopied]     = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/schools/dashboard')
      .then(r => { if (r.status === 401) { router.push('/schools/login'); return null } return r.json() })
      .then(d => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/schools/logout', { method: 'POST' })
    router.push('/schools/login')
  }

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#2D3CE6', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }}/>
        <p style={{ fontSize: 14, color: '#64748B' }}>Loading dashboard…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const { institution, stats, cohorts = [], studentStats = [], subjectStats = [], topPerformers = [], consistentImprovers = [], areasToImprove = [] } = data || {}

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Nunito, sans-serif' }}>

      <Sidebar
        tab={tab} setTab={setTab}
        institution={institution}
        onLogout={logout}
        studentCount={stats?.totalStudents}
        cohortCount={cohorts.length}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Mobile top bar */}
        <header className="dashboard-mobile-header" style={{ background: '#fff', borderBottom: '1px solid #E8EAED', padding: '0 16px', height: 56, display: 'none', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#374151' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
          <p style={{ fontWeight: 800, fontSize: 14, color: '#0A0A0A', margin: 0 }}>
            {TABS.find(t => t.id === tab)?.label}
          </p>
          <button onClick={() => data && exportCSV(studentStats, subjectStats, institution)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#64748B', fontSize: 12, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
            ↓ Export
          </button>
        </header>

        {/* Desktop page header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 20, color: '#0A0A0A', margin: '0 0 3px' }}>
              {TABS.find(t => t.id === tab)?.label}
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
              {stats?.totalStudents ?? 0} students · {stats?.totalSessions ?? 0} tests · {stats?.avgScore != null ? `${stats.avgScore}% avg` : 'No data yet'}
            </p>
          </div>
          <button onClick={() => data && exportCSV(studentStats, subjectStats, institution)}
            style={{ fontSize: 13, fontWeight: 700, background: '#F1F5F9', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
            className="dashboard-mobile-header-hide">
            ↓ Export CSV
          </button>
        </div>

        <main style={{ flex: 1, padding: '20px 28px 48px' }}>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                <StatCard label="Students"      value={stats?.totalStudents ?? 0} sub={`${cohorts.length} cohort${cohorts.length !== 1 ? 's' : ''}`}/>
                <StatCard label="Tests done"    value={stats?.totalSessions ?? 0}/>
                <StatCard label="Avg score"     value={stats?.avgScore != null ? `${stats.avgScore}%` : '—'} sub={stats?.avgScore != null ? statusStyle(stats.avgScore).label : ''}/>
                <StatCard label="Active cohorts" value={stats?.activeCohorts ?? 0}/>
              </div>

              {stats?.totalSessions === 0 ? (
                <EmptyState icon="📊" title="No test data yet"
                  body="Once students take tests via your cohort links, performance data appears here."
                  cta={cohorts.length === 0
                    ? <Link href="/schools/cohorts/new" style={{ display: 'inline-block', background: '#2D3CE6', color: '#fff', padding: '11px 24px', borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Create first cohort →</Link>
                    : <button onClick={() => setTab('cohorts')} style={{ background: '#2D3CE6', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>Share cohort links →</button>
                  }/>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 16 }}>
                  {/* Top performers */}
                  <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '22px' }}>
                    <p style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A', margin: '0 0 4px' }}>🏆 Top performers</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 18px' }}>Highest average scores</p>
                    {topPerformers.length === 0 ? <p style={{ fontSize: 14, color: '#94A3B8' }}>No data yet.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {topPerformers.map((s, i) => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? '#FEF3C7' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0, color: i === 0 ? '#D97706' : '#64748B' }}>{i + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 700, fontSize: 13, color: '#0A0A0A', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                              <ScoreBar score={s.avgScore}/>
                            </div>
                            <span style={{ fontWeight: 900, fontSize: 14, color: '#0A0A0A', flexShrink: 0 }}>{pct(s.avgScore)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Most improved */}
                  <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '22px' }}>
                    <p style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A', margin: '0 0 4px' }}>📈 Most improved</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 18px' }}>Biggest score gains</p>
                    {consistentImprovers.length === 0 ? <p style={{ fontSize: 14, color: '#94A3B8' }}>Need 2+ sessions per student to show improvement.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {consistentImprovers.map(s => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <p style={{ fontWeight: 700, fontSize: 13, color: '#0A0A0A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{s.name}</p>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '1px 7px', borderRadius: 99 }}>+{s.improvement}%</span>
                              </div>
                              <ScoreBar score={s.avgScore}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subject overview — full width */}
                  <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '22px', gridColumn: '1 / -1' }}>
                    <p style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A', margin: '0 0 18px' }}>📚 Subject overview</p>
                    {subjectStats.length === 0 ? <p style={{ fontSize: 14, color: '#94A3B8' }}>No subject data yet.</p> : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                        {subjectStats.map(s => {
                          const st = statusStyle(s.avgScore)
                          return (
                            <div key={s.subject} style={{ padding: '14px 16px', background: '#F8FAFB', borderRadius: 10, border: `1.5px solid ${st.bg}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <p style={{ fontWeight: 800, fontSize: 13, color: '#0A0A0A', margin: 0 }}>{capitalize(s.subject)}</p>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: st.bg, color: st.text }}>{st.label}</span>
                              </div>
                              <p style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', margin: '0 0 4px' }}>{pct(s.avgScore)}</p>
                              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{s.sessionCount} session{s.sessionCount !== 1 ? 's' : ''}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STUDENTS ── */}
          {tab === 'students' && (
            <div>
              <SectionHeader title={`${studentStats.length} student${studentStats.length !== 1 ? 's' : ''}`} sub="Sorted by average score"/>
              {studentStats.length === 0 ? (
                <EmptyState icon="👥" title="No students yet" body="Students join via your cohort links."/>
              ) : (
                <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, overflow: 'hidden' }}>
                  {/* Table header — hidden on mobile */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px 80px 90px', gap: 12, padding: '11px 18px', background: '#F8FAFB', borderBottom: '1px solid #E8EAED' }} className="student-table-header">
                    {['Student', 'Sessions', 'Avg', 'Change', 'Status'].map(h => (
                      <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                    ))}
                  </div>
                  {studentStats.map((s, i) => {
                    const st = statusStyle(s.avgScore)
                    return (
                      <div key={s.id} style={{ padding: '13px 18px', borderBottom: i < studentStats.length - 1 ? '1px solid #F8FAFC' : 'none', display: 'grid', gridTemplateColumns: '1fr 70px 80px 80px 90px', gap: 12, alignItems: 'center', transition: 'background 0.1s' }}
                        className="student-row"
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: '#0A0A0A', margin: '0 0 2px' }}>{s.name}</p>
                          <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{s.lastActive ? new Date(s.lastActive).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'Never'}</p>
                        </div>
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{s.sessionCount}</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#0A0A0A' }}>{pct(s.avgScore)}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.improvement == null ? '#94A3B8' : s.improvement > 0 ? '#15803D' : s.improvement < 0 ? '#DC2626' : '#64748B' }}>
                          {s.improvement == null ? '—' : (s.improvement > 0 ? '↑' : s.improvement < 0 ? '↓' : '→') + ` ${Math.abs(s.improvement)}%`}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: st.bg, color: st.text, display: 'inline-block' }}>{st.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SUBJECTS ── */}
          {tab === 'subjects' && (
            <div>
              <SectionHeader title="Subject performance" sub="Class average per subject with topic breakdown"/>
              {subjectStats.length === 0 ? (
                <EmptyState icon="📚" title="No subject data yet" body="Appears once students take tests."/>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {subjectStats.map(s => {
                    const st = statusStyle(s.avgScore)
                    return (
                      <div key={s.subject} style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                          <div>
                            <h3 style={{ fontWeight: 900, fontSize: 17, color: '#0A0A0A', margin: '0 0 3px' }}>{capitalize(s.subject)}</h3>
                            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{s.sessionCount} session{s.sessionCount !== 1 ? 's' : ''}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 28, fontWeight: 900, color: '#0A0A0A', margin: '0 0 3px' }}>{pct(s.avgScore)}</p>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: st.bg, color: st.text }}>{st.label}</span>
                          </div>
                        </div>
                        {s.allTopics?.length > 0 && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Topics</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {s.allTopics.map(t => {
                                const ts = statusStyle(t.avgScore)
                                return (
                                  <div key={t.topicId} style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 12, alignItems: 'center' }}>
                                    <div>
                                      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.topicTitle}</p>
                                      <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${t.avgScore}%`, background: ts.bar, borderRadius: 3 }}/>
                                      </div>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: ts.text, textAlign: 'right' }}>{pct(t.avgScore)}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── AREAS TO IMPROVE ── */}
          {tab === 'improvements' && (
            <div>
              <SectionHeader title="Areas to improve" sub="Subjects where class performance is below 60%"/>
              {areasToImprove.length === 0 && subjectStats.length > 0 ? (
                <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: '#15803D', marginBottom: 6 }}>All subjects above 60%</p>
                  <p style={{ fontSize: 14, color: '#16A34A' }}>Students are performing well. Keep it up.</p>
                </div>
              ) : areasToImprove.length === 0 ? (
                <EmptyState icon="🎯" title="No data yet" body="Areas to improve appear once students take tests."/>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {areasToImprove.map(a => {
                    const st = statusStyle(a.avgScore)
                    return (
                      <div key={a.subject} style={{ background: '#fff', border: `1.5px solid ${a.avgScore < 40 ? '#FECACA' : '#FEF3C7'}`, borderRadius: 14, padding: '22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{a.avgScore < 40 ? '🚨' : '⚠️'}</span>
                            <h3 style={{ fontWeight: 900, fontSize: 16, color: '#0A0A0A', margin: 0 }}>{capitalize(a.subject)}</h3>
                          </div>
                          <span style={{ fontSize: 20, fontWeight: 900, color: st.text }}>{pct(a.avgScore)}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#64748B', marginBottom: a.weakTopics.length ? 14 : 0, lineHeight: 1.6 }}>
                          {a.avgScore < 40 ? 'Critical — recommend dedicated revision before the exam.' : 'Needs attention — focus teaching here.'}
                        </p>
                        {a.weakTopics.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {a.weakTopics.map(t => (
                              <div key={t.topicId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', background: '#FFF8F8', borderRadius: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 900, color: '#DC2626', flexShrink: 0, minWidth: 36 }}>{pct(t.avgScore)}</span>
                                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{t.topicTitle}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── COHORTS ── */}
          {tab === 'cohorts' && (
            <div>
              <SectionHeader title="Your cohorts" sub="Manage cohorts and share access links"
                action={<Link href="/schools/cohorts/new" style={{ fontSize: 13, fontWeight: 700, background: '#2D3CE6', color: '#fff', padding: '8px 18px', borderRadius: 9, textDecoration: 'none' }}>+ New cohort</Link>}/>
              {cohorts.length === 0 ? (
                <EmptyState icon="👥" title="No cohorts yet" body="Create a cohort for each class. Students join via your unique link."
                  cta={<Link href="/schools/cohorts/new" style={{ display: 'inline-block', background: '#2D3CE6', color: '#fff', padding: '11px 24px', borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Create first cohort →</Link>}/>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cohorts.map(c => (
                    <div key={c.id} style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '20px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0A0A0A', margin: 0 }}>{c.label || `${c.exam_type} ${c.academic_year}`}</h3>
                            {c.is_active && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 7px', borderRadius: 99 }}>Active</span>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 6px' }}>{c.exam_type} · {(c.subjects || []).map(s => capitalize(s)).join(', ')}</p>
                          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{c.studentCount ?? 0} students · {c.sessionCount ?? 0} tests</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <code style={{ fontSize: 13, fontWeight: 700, color: '#2D3CE6', background: '#EEF0FE', padding: '5px 10px', borderRadius: 7 }}>{c.access_code}</code>
                          <button onClick={() => handleCopy(c.access_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${c.access_code}`, c.id)}
                            style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', border: `1.5px solid ${copied === c.id ? '#86EFAC' : '#E2E8F0'}`, borderRadius: 7, background: copied === c.id ? '#F0FDF4' : '#fff', color: copied === c.id ? '#15803D' : '#374151', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s' }}>
                            {copied === c.id ? '✓ Copied' : 'Copy link'}
                          </button>
                          <Link href={`/schools/cohorts/${c.id}`} style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', border: 'none', borderRadius: 7, background: '#2D3CE6', color: '#fff', textDecoration: 'none' }}>
                            Analytics →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .dashboard-mobile-header { display: flex !important; }
          .dashboard-mobile-header-hide { display: none !important; }
          .student-table-header { display: none !important; }
          .student-row { grid-template-columns: 1fr 60px 60px !important; }
          .student-row > :nth-child(4), .student-row > :nth-child(5) { display: none !important; }
        }
      `}</style>
    </div>
  )
}