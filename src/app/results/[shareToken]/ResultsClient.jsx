'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { saveSession as saveSessionIDB } from '@/lib/storage/sessions'
import { ShareCard } from '@/components/results/ShareCard'
import { Toast } from '@/components/ui'
import { getReadiness } from '@/lib/utils/constants'
import { MathText } from '@/components/ui/MathText'
import { ExplanationCard } from '@/components/exam/ExplanationCard'

// ─── Score ring ───────────────────────────────────────────────
function ScoreRing({ pct }) {
  const r    = 58
  const circ = 2 * Math.PI * r
  const ref  = useRef(null)
  const [count, setCount] = useState(0)
  const color = pct >= 80 ? '#6DC77A' : pct >= 60 ? '#2D3CE6' : pct >= 40 ? '#D97706' : '#DC2626'

  useEffect(() => {
    const target = Math.round(pct); const step = target / (1200 / 16); let cur = 0
    const t = setInterval(() => { cur = Math.min(cur + step, target); setCount(Math.round(cur)); if (cur >= target) clearInterval(t) }, 16)
    setTimeout(() => { if (ref.current) ref.current.style.strokeDashoffset = String(circ - circ * pct / 100) }, 80)
    return () => clearInterval(t)
  }, [pct])

  return (
    <div style={{ position: 'relative', width: 144, height: 144, margin: '0 auto 16px' }}>
      <svg width="144" height="144" viewBox="0 0 144 144" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="72" cy="72" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10"/>
        <circle ref={ref} cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={String(circ)} strokeDashoffset={String(circ)}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.0, 0.0, 0.2, 1)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 26, color: '#0A0A0A', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{count}%</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>score</span>
      </div>
    </div>
  )
}

// ─── Topic bar ────────────────────────────────────────────────
function TopicRow({ topic }) {
  const barRef  = useRef(null)
  const wrapRef = useRef(null)
  const st = { strong: { label: 'Strong ✓', bg: '#DCFCE7', color: '#15803D', bar: '#22C55E' }, needs_work: { label: 'Needs work ⚠', bg: '#FEF3C7', color: '#D97706', bar: '#F59E0B' }, critical: { label: 'Critical ✗', bg: '#FEE2E2', color: '#DC2626', bar: '#EF4444' } }[topic.status] || { label: 'Needs work', bg: '#FEF3C7', color: '#D97706', bar: '#F59E0B' }

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && barRef.current) { barRef.current.style.width = topic.percentage + '%'; obs.disconnect() } }, { threshold: 0.3 })
    if (wrapRef.current) obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [topic.percentage])

  return (
    <div ref={wrapRef} style={{ padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#0A0A0A' }}>{topic.topicTitle}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9CA3AF' }}>{topic.correct}/{topic.total}</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: st.bg, color: st.color }}>{st.label}</span>
        </div>
      </div>
      <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
        <div ref={barRef} style={{ width: '0%', height: '100%', background: st.bar, borderRadius: 3, transition: 'width 0.9s cubic-bezier(0.0,0.0,0.2,1)' }}/>
      </div>
    </div>
  )
}

// ─── Answer review panel ──────────────────────────────────────
function AnswerReview({ questionReview }) {
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)

  if (!questionReview?.length) return null

  const correct     = questionReview.filter(q => q.isCorrect)
  const wrong       = questionReview.filter(q => !q.isCorrect && q.studentAnswer)
  const unanswered  = questionReview.filter(q => !q.studentAnswer)

  const tabs = [
    { key: 'all',        label: `All ${questionReview.length}` },
    { key: 'correct',    label: `Correct (${correct.length})` },
    { key: 'wrong',      label: `Wrong (${wrong.length})` },
    { key: 'unanswered', label: `Unanswered (${unanswered.length})` },
  ]

  const filtered = filter === 'correct' ? correct : filter === 'wrong' ? wrong : filter === 'unanswered' ? unanswered : questionReview

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 17, color: '#0A0A0A', marginBottom: 4 }}>Review your answers</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 16 }}>See what you got right, what you got wrong, and why.</p>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #F1F5F9', marginBottom: 0 }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: filter === tab.key ? 700 : 500,
              padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
              color: filter === tab.key ? '#2D3CE6' : '#6B7280',
              borderBottom: `2px solid ${filter === tab.key ? '#2D3CE6' : 'transparent'}`,
              marginBottom: -1, borderRadius: '6px 6px 0 0', transition: 'all 0.15s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question cards */}
      <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((q, i) => {
          const isOpen = expanded === q.questionId
          const verdict = q.isCorrect ? { bg: '#F0FDF4', color: '#15803D', label: 'Correct ✓' }
            : q.studentAnswer ? { bg: '#FEF2F2', color: '#DC2626', label: 'Wrong ✗' }
            : { bg: '#F9FAFB', color: '#6B7280', label: 'Not answered' }

          return (
            <div key={q.questionId} style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
              {/* Collapsed row */}
              <button onClick={() => setExpanded(isOpen ? null : q.questionId)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                background: isOpen ? '#F8FAFC' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12, color: '#9CA3AF', width: 26, flexShrink: 0 }}>
                  Q{questionReview.indexOf(q) + 1}
                </span>
                <span style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {q.questionText.slice(0, 80)}{q.questionText.length > 80 ? '…' : ''}
                </span>
                {q.studentAnswer && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#EEF0FE', color: '#2D3CE6', flexShrink: 0 }}>
                    You: {q.studentAnswer}
                  </span>
                )}
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: verdict.bg, color: verdict.color, flexShrink: 0 }}>
                  {verdict.label}
                </span>
                <span style={{ color: '#9CA3AF', fontSize: 11, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
              </button>

              {/* Expanded */}
              {isOpen && (
                <div style={{ padding: '0 14px 16px', borderTop: '1px solid #F1F5F9' }}>
                  {/* Full question */}
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: '#0A0A0A', lineHeight: 1.65, margin: '14px 0 12px' }}>
                    <MathText>{q.questionText}</MathText>
                  </p>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 0 }}>
                    {['A','B','C','D'].map(l => {
                      const isCorrect  = l === q.correctAnswer
                      const isStudent  = l === q.studentAnswer
                      const isWrongPick = isStudent && !isCorrect

                      let bg = '#F9FAFB'; let border = '#E5E7EB'; let labelBg = '#E5E7EB'; let labelColor = '#6B7280'
                      if (isCorrect)   { bg = '#F0FDF4'; border = '#86EFAC'; labelBg = '#22C55E'; labelColor = '#fff' }
                      if (isWrongPick) { bg = '#FEF2F2'; border = '#FCA5A5'; labelBg = '#EF4444'; labelColor = '#fff' }

                      return (
                        <div key={l} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 8, background: bg, border: `1.5px solid ${border}` }}>
                          <span style={{ width: 20, height: 20, borderRadius: 5, background: labelBg, color: labelColor, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{l}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', lineHeight: 1.5, flex: 1 }}>
                            <MathText>{q[`option${l}`]}</MathText>
                          </span>
                          {isCorrect   && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#15803D', flexShrink: 0 }}>✓ Correct answer</span>}
                          {isWrongPick && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#DC2626', flexShrink: 0 }}>✗ Your answer</span>}
                        </div>
                      )
                    })}
                  </div>

                  <ExplanationCard
                    explanation={q.explanation}
                    isCorrect={q.isCorrect}
                    correctAnswer={q.correctAnswer}
                    studentAnswer={q.studentAnswer}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ─── Community post modal ─────────────────────────────────────
function CommunityPostModal({ session, readiness, onClose }) {
  const [message,   setMessage]   = useState('')
  const [name,      setName]      = useState('')
  const [posting,   setPosting]   = useState(false)
  const [posted,    setPosted]    = useState(false)
  const [error,     setError]     = useState(null)
  const roomId = session.exam_type?.toLowerCase() || 'jamb'

  async function handlePost() {
    setPosting(true); setError(null)
    const content = message.trim() ||
      `I just completed my ${session.exam_type} ${session.subject} readiness test! Scored ${Math.round(session.percentage)}%.`
    try {
      const res = await fetch(`/api/community/${roomId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: name?.trim() || 'Anonymous',
          content,
          postType: 'score_share',
          scoreData: {
            subject:       session.subject,
            examType:      session.exam_type,
            percentage:    session.percentage,
            readinessLabel: readiness.label,
            score:          session.score,
            totalQuestions: session.total_questions,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to post'); return }
      setPosted(true)
    } catch { setError('Network error. Please try again.') }
    finally { setPosting(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}/>
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
        background: '#fff', borderRadius: '20px 20px 0 0',
        padding: '24px 20px 32px', maxWidth: 500, margin: '0 auto',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>
        <style>{`@media(min-width:520px){#community-modal{left:50%;transform:translateX(-50%);bottom:24px;border-radius:16px!important}}`}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <p style={{ fontWeight: 900, fontSize: 17, color: '#0A0A0A', margin: 0 }}>
            Post to {session.exam_type} Community
          </p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94A3B8', lineHeight: 1 }}>×</button>
        </div>

        {/* Score preview */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#0A0A0A', margin: '0 0 2px' }}>
              {session.subject} · {session.exam_type}
            </p>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              {session.score}/{session.total_questions} · {Math.round(session.percentage)}% · {readiness.label}
            </p>
          </div>
        </div>

        {posted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>🎉</p>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#0A0A0A', marginBottom: 4 }}>Posted!</p>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Your result is now in the {session.exam_type} community feed.</p>
            <a href={`/community/${roomId}`} style={{ display: 'inline-block', background: '#2D3CE6', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 22px', borderRadius: 99, textDecoration: 'none' }}>
              View post →
            </a>
          </div>
        ) : (
          <>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Add a message (optional)
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 250))}
              placeholder={`Just finished my ${session.exam_type} ${session.subject} test. Need to work on ${session.topic_results?.[0]?.topicTitle || 'a few topics'}!`}
              rows={3}
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 14, lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 4 }}
            />
            <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'right', marginBottom: 14 }}>{250 - message.length} chars remaining</p>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Your name (optional)
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value.slice(0, 40))}
              placeholder="What should we call you?"
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            />

            {error && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 10 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#fff', fontWeight: 700, fontSize: 14, color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handlePost} disabled={posting}
                style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 10, background: '#2D3CE6', fontWeight: 700, fontSize: 14, color: '#fff', cursor: posting ? 'not-allowed' : 'pointer', opacity: posting ? 0.7 : 1 }}>
                {posting ? 'Posting…' : 'Post to community →'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─── Main results client ──────────────────────────────────────
export default function ResultsClient({ session, shareToken }) {
  const router = useRouter()
  const [toast,        setToast]        = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const url       = typeof window !== 'undefined' ? window.location.href : `${process.env.NEXT_PUBLIC_APP_URL || ''}/results/${shareToken}`
  const readiness = getReadiness(session.percentage)
  const sorted    = [...(session.topic_results || session.topicResults || [])].sort((a, b) => a.percentage - b.percentage)
  const REC_COLORS = { 1: '#DC2626', 2: '#D97706', 3: '#2D3CE6' }

  const pillStyle = {
    green: { bg: '#DCFCE7', color: '#15803D' },
    blue:  { bg: '#EEF0FE', color: '#2D3CE6' },
    amber: { bg: '#FEF3C7', color: '#D97706' },
    red:   { bg: '#FEE2E2', color: '#DC2626' },
  }[readiness.color] || { bg: '#EEF0FE', color: '#2D3CE6' }

  useEffect(() => {
    saveSessionIDB({
      shareToken,
      studentName:    session.student_name,
      examType:       session.exam_type,
      subject:        session.subject,
      score:          session.score,
      totalQuestions: session.total_questions,
      percentage:     session.percentage,
      readinessLabel: readiness.label,
      topicResults:   session.topic_results,
      savedAt:        Date.now(),
    })
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(url).catch(() => {})
    setToast(true); setTimeout(() => setToast(false), 3000)
  }

  const card = { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 22px', marginBottom: 12 }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '32px 16px 48px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#2D3CE6"/><path d="M10 22V10l6 9 6-9v12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: '#0A0A0A' }}>Learniie</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#EEF0FE', color: '#2D3CE6' }}>Exam Prep</span>
        </div>

        {/* Score hero */}
        <div style={{ ...card, textAlign: 'center', marginBottom: 12 }}>
          <ScoreRing pct={Math.round(session.percentage)} />
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 22, color: '#0A0A0A', margin: '0 0 8px' }}>
            {session.score} / {session.total_questions}
          </p>
          <span style={{ display: 'inline-block', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, padding: '5px 16px', borderRadius: 99, marginBottom: 12, ...pillStyle }}>
            {readiness.label}
          </span>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 16, color: '#0A0A0A', margin: '0 0 4px' }}>{session.student_name}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9CA3AF', margin: 0 }}>{session.exam_type} · {session.subject}</p>
        </div>

        {/* Topic breakdown */}
        <div style={card}>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: '#0A0A0A', marginBottom: 4 }}>Topic breakdown</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>Weakest topics first</p>
          {sorted.map(t => <TopicRow key={t.topicId} topic={t} />)}
        </div>

        {/* Recommendations */}
        {session.recommendations?.length > 0 && (
          <div style={card}>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: '#0A0A0A', marginBottom: 16 }}>Study recommendations</p>
            {session.recommendations.map((r, i) => (
              <div key={r.topicId || i} style={{ borderLeft: `3px solid ${REC_COLORS[r.priority] || '#2D3CE6'}`, paddingLeft: 14, paddingTop: 10, paddingBottom: 10, background: '#FAFAFA', borderRadius: '0 8px 8px 0', marginBottom: 10 }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, color: '#0A0A0A', marginBottom: 4 }}>{r.topicTitle || r.topicId}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{r.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Review your answers */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#0A0A0A', marginBottom: 4 }}>📋 Review your answers</p>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
              Go through all {session.total_questions} questions with explanations, one at a time.
            </p>
          </div>
          <Link href={`/review/${shareToken}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0A0A0A', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 22px', borderRadius: 10, textDecoration: 'none', flexShrink: 0 }}>
            Review answers →
          </Link>
        </div>



        {/* Share card */}
        <div style={card}>
          <p style={{ fontWeight: 800, fontSize: 15, color: '#0A0A0A', marginBottom: 14 }}>Share with your classmates</p>
          <ShareCard session={{ ...session, studentName: session.student_name, examType: session.exam_type, readinessLabel: readiness.label }} />
          <div style={{ marginTop: 14 }}>
            <button onClick={() => setShowPostModal(true)}
              style={{ width: '100%', padding: '11px 0', border: '1.5px solid #2D3CE6', borderRadius: 10, background: '#fff', color: '#2D3CE6', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              💬 Post to {session.exam_type} Community
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          <Link href={`/setup?subject=${encodeURIComponent(session.subject)}`}
            style={{ textAlign: 'center', border: 'none', borderRadius: 10, padding: '13px 0', fontWeight: 700, fontSize: 14, color: '#fff', textDecoration: 'none', background: '#2D3CE6', display: 'block' }}>
            Retake {session.subject}
          </Link>
          <Link href="/setup"
            style={{ textAlign: 'center', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '13px 0', fontWeight: 700, fontSize: 14, color: '#374151', textDecoration: 'none', background: '#fff', display: 'block' }}>
            Try another subject
          </Link>
          <button onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#94A3B8', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 1.5L3.5 6.5l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to home
          </button>
        </div>
      </div>

      {/* ── Community post modal ── */}
      {showPostModal && (
        <CommunityPostModal
          session={session}
          readiness={readiness}
          onClose={() => setShowPostModal(false)}
        />
      )}

      <Toast show={toast} message="Link copied!" type="success" />
    </main>
  )
}
