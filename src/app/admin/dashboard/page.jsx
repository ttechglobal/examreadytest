'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils/format'
import { SkeletonCard, ErrorState } from '@/components/ui'
import { AdminTopbar } from '@/components/admin/AdminTopbar'

const examBadge = e => e === 'JAMB' ? 'bg-brand-light text-brand' : e === 'WAEC' ? 'bg-green-light text-green-dark' : 'bg-amber-100 text-amber-700'
const scorePill = p => p >= 80 ? 'bg-green-light text-green-dark' : p >= 60 ? 'bg-brand-light text-brand' : p >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'

function BarChart({ data }) {
  const values = Object.values(data)
  const labels = Object.keys(data)
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-[3px] h-28 mt-3">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <div
            title={`${labels[i]}: ${v} sessions`}
            className="w-full bg-brand rounded-t-sm hover:opacity-75 transition-opacity cursor-default min-h-[2px]"
            style={{ height: `${Math.max(2, Math.round(v / max * 108))}px` }}
          />
          {i % 5 === 0 && <span className="text-[8px] text-muted" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 28 }}>{labels[i]?.slice(5)}</span>}
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, subUp }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-[12px] text-muted font-medium mb-1.5">{label}</p>
      <p className="text-[24px] font-bold text-dark leading-none">{value}</p>
      {sub && <p className={`text-[11px] font-semibold mt-1.5 ${subUp ? 'text-green-dark' : 'text-muted'}`}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats,       setStats]       = useState(null)
  const [sessions,    setSessions]    = useState([])
  const [diagnostics, setDiagnostics] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics').then(r => r.json()),
      fetch('/api/admin/sessions?page=1').then(r => r.json()),
      fetch('/api/admin/diagnostics').then(r => r.json()),
    ]).then(([s, sess]) => {
      setStats(s)
      setSessions(sess.sessions?.slice(0, 10) || [])
    }).catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  if (error) return (
    <>
      <AdminTopbar title="Dashboard" />
      <div className="p-6"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>
    </>
  )

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <div className="p-6 overflow-y-auto flex-1">
        {loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            {[1,2,3,4].map(i => <SkeletonCard key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total questions"    value={stats.totalQ.toLocaleString()} sub={`${Math.round(stats.verifiedQ / Math.max(stats.totalQ,1) * 100)}% verified`} />
            <StatCard label="Verified questions" value={stats.verifiedQ.toLocaleString()} />
            <StatCard label="Total sessions"     value={stats.totalS.toLocaleString()} subUp sub="+214 this week" />
            <StatCard label="Average score"      value={`${stats.avgScore}%`} />
          </div>
        )}

        {/* ── Database health ── */}
        {diagnostics && !diagnostics.error && (
          <div className="bg-white rounded-card border border-slate-100 shadow-card p-5 mb-5">
            <p className="text-[13px] font-bold text-dark mb-3">Database health</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Total questions',    value: diagnostics.health?.totalQuestions     || 0 },
                { label: 'Verified questions', value: diagnostics.health?.verifiedQuestions  || 0 },
                { label: 'Topics',             value: diagnostics.health?.totalTopics        || 0 },
                { label: 'Unverified',         value: diagnostics.health?.unverifiedQuestions || 0, warn: (diagnostics.health?.unverifiedQuestions || 0) > 0 },
              ].map(s => (
                <div key={s.label} className={`rounded-lg p-3 ${s.warn ? 'bg-amber-50 border border-amber-200' : 'bg-surface'}`}>
                  <p className="text-[11px] text-muted mb-1">{s.label}</p>
                  <p className={`text-[20px] font-black ${s.warn ? 'text-warning' : 'text-dark'}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="text-[12px] text-muted space-y-0.5">
              <p><span className="font-semibold">Subjects:</span> {(diagnostics.health?.subjects || []).join(', ') || 'none'}</p>
              <p><span className="font-semibold">Exam types:</span> {(diagnostics.health?.examTypes || []).join(', ') || 'none'}</p>
              {diagnostics.health?.unverifiedQuestions > 0 && (
                <p className="text-warning font-semibold mt-1">⚠ {diagnostics.health.unverifiedQuestions} questions have verified=false and won't appear to students.</p>
              )}
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
            <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-[13px] font-bold text-dark">Sessions — last 30 days</p>
              <BarChart data={stats.sessionsByDay} />
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-[13px] font-bold text-dark mb-3">Top subjects</p>
              <div className="space-y-2.5">
                {stats.subjects.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-dark w-20 shrink-0">{s.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${Math.round(s.count / Math.max(stats.subjects[0]?.count,1) * 100)}%` }} />
                    </div>
                    <span className="text-[11px] text-muted w-5 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-bold text-dark">Recent sessions</p>
            <Link href="/admin/sessions" className="text-[12px] text-brand font-semibold hover:underline">View all →</Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '22%' }}/><col style={{ width: '12%' }}/><col style={{ width: '15%' }}/><col style={{ width: '12%' }}/><col style={{ width: '12%' }}/><col style={{ width: '13%' }}/><col style={{ width: '14%' }}/>
              </colgroup>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Student','Exam','Subject','Score','Time','Date','Result'].map(h => (
                    <th key={h} className="text-left text-[11px] font-bold text-muted uppercase tracking-wider px-3.5 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && [1,2,3].map(i => (
                  <tr key={i}><td colSpan={7} className="px-3.5 py-3"><div className="skeleton h-4 w-full" /></td></tr>
                ))}
                {!loading && sessions.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-[13px] text-muted">No sessions yet</td></tr>
                )}
                {sessions.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-3.5 py-3 text-[13px] font-medium text-dark truncate">{s.student_name}</td>
                    <td className="px-3.5 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${examBadge(s.exam_type)}`}>{s.exam_type}</span></td>
                    <td className="px-3.5 py-3 text-[13px] text-muted truncate">{s.subject}</td>
                    <td className="px-3.5 py-3 text-[13px] font-semibold text-dark">{s.score}/{s.total_questions}</td>
                    <td className="px-3.5 py-3 text-[13px] text-muted">{s.time_taken ? formatTime(s.time_taken) : '—'}</td>
                    <td className="px-3.5 py-3 text-[13px] text-muted">{formatDate(new Date(s.created_at).getTime())}</td>
                    <td className="px-3.5 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${scorePill(s.percentage)}`}>{Math.round(s.percentage)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

