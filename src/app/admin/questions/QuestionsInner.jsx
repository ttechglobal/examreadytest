'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { MathText } from '@/components/ui/MathText'
import { ExplanationCard } from '@/components/exam/ExplanationCard'

const SUBJECTS = [
  { id: 'physics', label: 'Physics' }, { id: 'mathematics', label: 'Mathematics' },
  { id: 'chemistry', label: 'Chemistry' }, { id: 'biology', label: 'Biology' },
  { id: 'english', label: 'English' }, { id: 'government', label: 'Government' },
  { id: 'history', label: 'History' }, { id: 'economics', label: 'Economics' },
  { id: 'literature', label: 'Literature' },
]

const diffStyle = d => ({
  easy:   { bg: '#F0FDF4', text: '#15803D' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  hard:   { bg: '#FFF1F2', text: '#B91C1C' },
}[d] || { bg: '#F8FAFC', text: '#64748B' })

const examStyle = e => ({
  JAMB: { bg: '#EEF0FE', text: '#2D3CE6' },
  WAEC: { bg: '#F0FDF4', text: '#15803D' },
  NECO: { bg: '#FEF3C7', text: '#D97706' },
}[e] || { bg: '#F8FAFC', text: '#64748B' })

// ─── Detail drawer ────────────────────────────────────────────
function DetailDrawer({ questionId, onClose }) {
  const [question,   setQuestion]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genError,   setGenError]   = useState(null)

  async function handleGenerate() {
    if (!question) return
    setGenerating(true); setGenError(null)
    try {
      const res  = await fetch('/api/admin/questions/generate-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id }),
      })
      const data = await res.json()
      if (!res.ok) { setGenError(data.error || 'Generation failed'); return }
      setQuestion(q => ({ ...q, explanation: data.explanation }))
    } catch (err) { setGenError('Network error: ' + err.message) }
    finally { setGenerating(false) }
  }

  useEffect(() => {
    if (!questionId) return
    setLoading(true); setQuestion(null)
    fetch(`/api/admin/questions/${questionId}`)
      .then(r => r.json())
      .then(d => setQuestion(d.question))
      .finally(() => setLoading(false))
  }, [questionId])

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }}/>
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 560,
        background: '#fff', zIndex: 50, overflowY: 'auto',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
        animation: 'slideInRight 0.25s ease',
      }}>
        <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        <div style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #E8EAED', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: '#0A0A0A', margin: 0 }}>Question detail</p>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#6B7280', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: 24 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[100, 80, 60].map((w, i) => (
                <div key={i} style={{ height: 14, background: '#F1F5F9', borderRadius: 6, width: `${w}%`, animation: 'pulse 1.5s ease-in-out infinite' }}/>
              ))}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            </div>
          )}

          {question && !loading && (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { label: question.exam_type,   ...examStyle(question.exam_type) },
                  { label: question.subject_id?.charAt(0).toUpperCase() + question.subject_id?.slice(1), bg: '#F8FAFC', text: '#374151' },
                  { label: question.topic_title, bg: '#EEF0FE', text: '#2D3CE6' },
                  { label: question.difficulty,  ...diffStyle(question.difficulty) },
                  ...(question.year  ? [{ label: String(question.year), bg: '#F8FAFC', text: '#94A3B8' }] : []),
                  ...(question.paper ? [{ label: question.paper,        bg: '#F8FAFC', text: '#94A3B8' }] : []),
                ].map(({ label, bg, text }) => label ? (
                  <span key={label} style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: bg, color: text }}>{label}</span>
                ) : null)}
              </div>

              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#0A0A0A', lineHeight: 1.7, marginBottom: 18 }}>
                <MathText>{question.question_text}</MathText>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {['a','b','c','d'].map(l => {
                  const letter    = l.toUpperCase()
                  const isCorrect = letter === question.correct_answer
                  return (
                    <div key={l} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: isCorrect ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${isCorrect ? '#86EFAC' : '#E8EAED'}` }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: isCorrect ? '#22C55E' : '#E2E8F0', color: isCorrect ? '#fff' : '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {letter}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: isCorrect ? '#15803D' : '#374151', fontWeight: isCorrect ? 600 : 400, lineHeight: 1.6 }}>
                          <MathText>{question[`option_${l}`]}</MathText>
                        </div>
                        {isCorrect && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#15803D', margin: '3px 0 0' }}>✓ Correct answer</p>}
                      </div>
                    </div>
                  )
                })}
              </div>

              <ExplanationCard
                explanation={question.explanation}
                isCorrect={null}
                correctAnswer={question.correct_answer}
                studentAnswer={null}
              />

              <div style={{ marginTop: 16 }}>
                <button onClick={handleGenerate} disabled={generating}
                  style={{ width: '100%', padding: '10px 0', border: '1.5px solid #2D3CE6', borderRadius: 9, background: generating ? '#EEF0FE' : '#fff', color: '#2D3CE6', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {generating
                    ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Generating…</>
                    : question?.explanation ? 'Regenerate explanation with AI' : 'Generate explanation with AI'
                  }
                </button>
                {genError && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#DC2626', margin: '8px 0 0' }}>{genError}</p>}
              </div>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

              <div style={{ marginTop: 16, padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E8EAED', borderRadius: 8 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#9CA3AF', margin: 0 }}>
                  Uploaded {new Date(question.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {question.upload_batch ? ` · Batch ${question.upload_batch.slice(0, 8)}…` : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main inner component ─────────────────────────────────────
export default function QuestionsInner() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const page       = parseInt(searchParams.get('page')       || '1')
  const subject    = searchParams.get('subject')    || ''
  const examType   = searchParams.get('examType')   || ''
  const difficulty = searchParams.get('difficulty') || ''
  const search     = searchParams.get('search')     || ''

  const [questions, setQuestions] = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [drawerQId, setDrawerQId] = useState(null)

  const pageSize   = 50
  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams({ page, subject, examType, difficulty, search })
    fetch(`/api/admin/questions?${p}`)
      .then(r => r.json())
      .then(d => { setQuestions(d.questions || []); setTotal(d.total || 0) })
      .catch(() => setError('Failed to load questions'))
      .finally(() => setLoading(false))
  }, [page, subject, examType, difficulty, search])

  function updateFilter(key, value) {
    const p = new URLSearchParams({ subject, examType, difficulty, search, page: '1', [key]: value })
    startTransition(() => router.push(`${pathname}?${p}`))
  }

  function changePage(p) {
    const params = new URLSearchParams({ subject, examType, difficulty, search, page: String(p) })
    startTransition(() => router.push(`${pathname}?${params}`))
  }

  const fSel = {
    fontFamily: 'Inter, sans-serif', fontSize: 13,
    border: '1.5px solid #E2E8F0', borderRadius: 8,
    padding: '8px 12px', outline: 'none',
    background: '#fff', color: '#0A0A0A', cursor: 'pointer',
  }

  return (
    <>
      <AdminTopbar
        title="Question Bank"
        action={
          <Link href="/admin/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2D3CE6', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 9.5V2M4 5l3-3 3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 11.5h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Upload questions
          </Link>
        }
      />

      <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <select value={examType} onChange={e => updateFilter('examType', e.target.value)} style={fSel}>
            <option value="">All exams</option>
            {['JAMB','WAEC','NECO'].map(e => <option key={e}>{e}</option>)}
          </select>
          <select value={subject} onChange={e => updateFilter('subject', e.target.value)} style={fSel}>
            <option value="">All subjects</option>
            {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={difficulty} onChange={e => updateFilter('difficulty', e.target.value)} style={fSel}>
            <option value="">All difficulties</option>
            {['easy','medium','hard'].map(d => <option key={d}>{d}</option>)}
          </select>
          <input
            defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && updateFilter('search', e.currentTarget.value)}
            placeholder="Search questions…"
            style={{ ...fSel, flex: 1, minWidth: 200, cursor: 'text' }}
          />
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
          {total.toLocaleString()} question{total !== 1 ? 's' : ''}
          {total > 0 && ' · click any row to view full question and explanation'}
        </p>

        {error ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#DC2626' }}>{error}</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden', opacity: pending || loading ? 0.55 : 1, transition: 'opacity 0.2s' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '4%' }}/><col style={{ width: '38%' }}/><col style={{ width: '12%' }}/><col style={{ width: '20%' }}/><col style={{ width: '10%' }}/><col style={{ width: '8%' }}/><col style={{ width: '8%' }}/>
              </colgroup>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E8EAED' }}>
                  {['#','Question','Exam','Topic','Year','Difficulty','Ans'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && questions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '64px 24px', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 17, color: '#374151', marginBottom: 8 }}>No questions yet</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>Upload a past paper to get started.</p>
                      <Link href="/admin/upload" style={{ background: '#2D3CE6', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                        Upload questions →
                      </Link>
                    </td>
                  </tr>
                )}
                {questions.map((q, i) => {
                  const ds = diffStyle(q.difficulty)
                  const es = examStyle(q.exam_type)
                  return (
                    <tr key={q.id}
                      onClick={() => setDrawerQId(q.id)}
                      style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <td style={{ padding: '11px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8' }}>
                        {(page - 1) * pageSize + i + 1}
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={q.question_text}>
                        {q.question_text}
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: es.bg, color: es.text }}>{q.exam_type}</span>
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.topic_title}
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8' }}>{q.year || '—'}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: ds.bg, color: ds.text }}>{q.difficulty}</span>
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: '#2D3CE6' }}>{q.correct_answer}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', margin: 0 }}>
                  {((page-1)*pageSize)+1}–{Math.min(page*pageSize,total)} of {total.toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => changePage(page-1)} disabled={page===1}
                    style={{ padding: '5px 12px', border: '1px solid #E2E8F0', borderRadius: 7, background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 12, cursor: page===1 ? 'not-allowed' : 'pointer', opacity: page===1 ? 0.4 : 1 }}>
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => changePage(p)}
                      style={{ padding: '5px 12px', border: '1px solid', borderColor: p===page ? '#2D3CE6' : '#E2E8F0', borderRadius: 7, background: p===page ? '#2D3CE6' : '#fff', color: p===page ? '#fff' : '#374151', fontFamily: 'Inter, sans-serif', fontSize: 12, cursor: 'pointer', fontWeight: p===page ? 700 : 400 }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => changePage(page+1)} disabled={page===totalPages}
                    style={{ padding: '5px 12px', border: '1px solid #E2E8F0', borderRadius: 7, background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 12, cursor: page===totalPages ? 'not-allowed' : 'pointer', opacity: page===totalPages ? 0.4 : 1 }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {drawerQId && <DetailDrawer questionId={drawerQId} onClose={() => setDrawerQId(null)} />}
    </>
  )
}