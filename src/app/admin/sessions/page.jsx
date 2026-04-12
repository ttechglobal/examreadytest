'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { EmptyState, ErrorState } from '@/components/ui'
import { formatDate, formatTime } from '@/lib/utils/format'
import { AdminTopbar } from '@/components/admin/AdminTopbar'

const examBadge = e => e === 'JAMB' ? 'bg-brand-light text-brand' : e === 'WAEC' ? 'bg-green-light text-green-dark' : 'bg-amber-100 text-amber-700'
const scorePill = p => p >= 80 ? 'bg-green-light text-green-dark' : p >= 60 ? 'bg-brand-light text-brand' : p >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
const statusLabel = p => p >= 80 ? 'Exam Ready' : p >= 60 ? 'Almost Ready' : p >= 40 ? 'Keep Studying' : 'Needs More Prep'
const barColor = p => p >= 70 ? '#6DC77A' : p >= 40 ? '#D97706' : '#DC2626'

function TopicBreakdown({ topicResults }) {
  if (!topicResults?.length) return <p className="text-[12px] text-muted">No topic data</p>
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {[...topicResults].sort((a,b) => a.percentage - b.percentage).map(t => (
        <div key={t.topicId}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[12px] font-medium text-dark truncate max-w-[160px]">{t.topicTitle}</span>
            <span className="text-[11px] text-muted shrink-0 ml-2">{t.correct}/{t.total}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${t.percentage}%`, background: barColor(t.percentage), height: '100%', borderRadius: 9999, transition: 'width .5s ease' }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

function exportCSV(sessions) {
  const headers = ['Student','Exam','Subject','Score','Percentage','Time (s)','Date','Token']
  const rows = sessions.map(s => [
    `"${s.student_name}"`, s.exam_type, s.subject,
    `${s.score}/${s.total_questions}`, Math.round(s.percentage),
    s.time_taken || '', new Date(s.created_at).toISOString().slice(0,10), s.share_token,
  ])
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: `sessions-${Date.now()}.csv` })
  a.click(); URL.revokeObjectURL(url)
}

export default function SessionsPage() {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const page     = parseInt(searchParams.get('page') || '1')
  const subject  = searchParams.get('subject')  || ''
  const examType = searchParams.get('examType') || ''
  const search   = searchParams.get('search')   || ''
  const scoreMin = searchParams.get('scoreMin') || ''
  const scoreMax = searchParams.get('scoreMax') || ''

  const [sessions,  setSessions]  = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [expanded,  setExpanded]  = useState(null)
  const pageSize   = 50
  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, subject, examType, search, scoreMin, scoreMax })
    fetch(`/api/admin/sessions?${params}`)
      .then(r => r.json())
      .then(d => { setSessions(d.sessions || []); setTotal(d.total || 0) })
      .catch(() => setError('Failed to load sessions'))
      .finally(() => setLoading(false))
  }, [page, subject, examType, search, scoreMin, scoreMax])

  function updateFilter(key, value) {
    const p = new URLSearchParams({ subject, examType, search, scoreMin, scoreMax, page: '1', [key]: value })
    startTransition(() => router.push(`${pathname}?${p}`))
  }

  function changePage(p) {
    const params = new URLSearchParams({ subject, examType, search, scoreMin, scoreMax, page: String(p) })
    startTransition(() => router.push(`${pathname}?${params}`))
  }

  const filterCls = 'text-[13px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-dark outline-none focus:border-brand'

  return (
    <>
      <AdminTopbar
        title="Sessions"
        action={
          <button onClick={() => exportCSV(sessions)} className="border border-brand text-brand text-[13px] font-bold px-4 py-2 rounded-lg hover:bg-brand-light transition-colors">
            Export CSV
          </button>
        }
      />

      <div className="p-6 overflow-y-auto flex-1">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={examType} onChange={e => updateFilter('examType', e.target.value)} className={filterCls}>
            <option value="">All exams</option>
            {['JAMB','WAEC','NECO'].map(e => <option key={e}>{e}</option>)}
          </select>
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <span className="text-[12px] text-muted">Score</span>
            <input type="number" min="0" max="100" defaultValue={scoreMin}
              onBlur={e => updateFilter('scoreMin', e.target.value)}
              placeholder="0" className="w-10 text-[13px] text-dark outline-none bg-transparent"/>
            <span className="text-slate-300">–</span>
            <input type="number" min="0" max="100" defaultValue={scoreMax}
              onBlur={e => updateFilter('scoreMax', e.target.value)}
              placeholder="100" className="w-10 text-[13px] text-dark outline-none bg-transparent"/>
            <span className="text-[12px] text-muted">%</span>
          </div>
          <input
            defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && updateFilter('search', e.target.value)}
            placeholder="Search by name…"
            className={`${filterCls} flex-1 min-w-[180px]`}
          />
        </div>

        <p className="text-[12px] text-muted mb-3">{total.toLocaleString()} session{total !== 1 ? 's' : ''}</p>

        {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : (
          <div className={`bg-white rounded-xl border border-slate-100 overflow-hidden transition-opacity ${pending || loading ? 'opacity-50' : ''}`}>
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '3%' }}/><col style={{ width: '18%' }}/><col style={{ width: '10%' }}/><col style={{ width: '13%' }}/><col style={{ width: '10%' }}/><col style={{ width: '9%' }}/><col style={{ width: '10%' }}/><col style={{ width: '12%' }}/><col style={{ width: '15%' }}/>
              </colgroup>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-2.5"/>
                  {['Student','Exam','Subject','Score','%','Time','Date','Readiness'].map(h => (
                    <th key={h} className="text-left text-[11px] font-bold text-muted uppercase tracking-wider px-3 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && sessions.length === 0 && (
                  <tr><td colSpan={9}>
                    <EmptyState icon="📭" title="No sessions yet" description="Sessions will appear here once students start taking tests." />
                  </td></tr>
                )}
                {sessions.map(s => (
                  <>
                    <tr key={s.id}
                      className={`border-b border-slate-50 cursor-pointer transition-colors ${expanded === s.id ? 'bg-slate-50/80' : 'hover:bg-slate-50/60'}`}
                      onClick={() => setExpanded(e => e === s.id ? null : s.id)}>
                      <td className="px-3 py-3 text-center">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-muted mx-auto transition-transform" style={{ transform: expanded === s.id ? 'rotate(90deg)' : 'none' }}>
                          <path d="M3.5 2l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </td>
                      <td className="px-3 py-3 text-[13px] font-medium text-dark truncate">{s.student_name}</td>
                      <td className="px-3 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${examBadge(s.exam_type)}`}>{s.exam_type}</span></td>
                      <td className="px-3 py-3 text-[13px] text-muted truncate">{s.subject}</td>
                      <td className="px-3 py-3 text-[13px] font-semibold text-dark">{s.score}/{s.total_questions}</td>
                      <td className="px-3 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${scorePill(s.percentage)}`}>{Math.round(s.percentage)}%</span></td>
                      <td className="px-3 py-3 text-[13px] text-muted">{s.time_taken ? formatTime(s.time_taken) : '—'}</td>
                      <td className="px-3 py-3 text-[13px] text-muted">{formatDate(new Date(s.created_at).getTime())}</td>
                      <td className="px-3 py-3 text-[12px] text-muted truncate">{statusLabel(s.percentage)}</td>
                    </tr>
                    {expanded === s.id && (
                      <tr key={`${s.id}-exp`} className="bg-slate-50/80 border-b border-slate-100">
                        <td colSpan={9} className="px-6 py-5">
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                            <div className="xl:col-span-2">
                              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Topic breakdown</p>
                              <TopicBreakdown topicResults={s.topic_results} />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Recommendations</p>
                              {(s.recommendations || []).slice(0,3).map((r,i) => (
                                <div key={i} className="text-[12px] text-muted mb-2 pl-3 border-l-2 border-brand/40 leading-relaxed">{r.message}</div>
                              ))}
                              {!s.recommendations?.length && <p className="text-[12px] text-muted">No recommendations</p>}
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <a href={`/results/${s.share_token}`} target="_blank" rel="noopener noreferrer"
                                  className="text-[12px] font-semibold text-brand hover:underline" onClick={e => e.stopPropagation()}>
                                  View full result →
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-[12px] text-muted">Showing {((page-1)*pageSize)+1}–{Math.min(page*pageSize,total)} of {total.toLocaleString()}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => changePage(page-1)} disabled={page===1} className="text-[12px] border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors">← Prev</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i+1).map(p => (
                    <button key={p} onClick={() => changePage(p)} className={`text-[12px] border px-3 py-1.5 rounded-lg transition-colors ${p===page ? 'bg-brand text-white border-brand' : 'border-slate-200 hover:bg-slate-100'}`}>{p}</button>
                  ))}
                  <button onClick={() => changePage(page+1)} disabled={page===totalPages} className="text-[12px] border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors">Next →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
