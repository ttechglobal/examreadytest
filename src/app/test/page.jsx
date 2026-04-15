'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner, Modal } from '@/components/ui'
import { MathText } from '@/components/ui/MathText'
import { ExplanationCard } from '@/components/exam/ExplanationCard'

// ─── Logo ─────────────────────────────────────────────────────
function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#2D3CE6"/>
      <path d="M8 20V8l6 8 6-8v12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Shake keyframe (injected once) ───────────────────────────
const SHAKE_STYLE = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes timerPulse{0%,100%{opacity:1}50%{opacity:0.65}}`

// ─── Exam mode option ─────────────────────────────────────────
function ExamOption({ letter, text, selected, onSelect }) {
  return (
    <button type="button" onClick={onSelect}
      className={`flex items-start gap-3 p-4 rounded-xl border-[1.5px] text-left w-full transition-all duration-150 active:scale-[.99]
        ${selected ? 'border-brand bg-brand shadow-brand-glow' : 'border-slate-200 bg-white hover:border-brand/40 hover:bg-brand-light/30'}`}>
      <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[12px] font-bold mt-0.5 ${selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-muted'}`}>
        {letter}
      </span>
      <MathText as="span" className={`text-[15px] leading-relaxed font-medium ${selected ? 'text-white' : 'text-dark'}`}>{text}</MathText>
      {selected && <svg className="ml-auto mt-1 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  )
}

// ─── Study mode option (with correct/wrong states) ────────────
function StudyOption({ letter, text, state, onSelect, disabled }) {
  const styles = {
    idle:    { border: '1.5px solid #E2E8F0', background: '#fff', color: '#1A1A1A' },
    correct: { border: '2px solid #6DC77A', background: '#EAF5EC', color: '#166534', cursor: 'default' },
    wrong:   { border: '2px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B', animation: 'shake 0.3s ease' },
  }
  const letterStyles = {
    idle:    { background: '#F1F5F9', color: '#64748B' },
    correct: { background: '#6DC77A', color: '#fff' },
    wrong:   { background: '#FCA5A5', color: '#fff' },
  }
  const s = styles[state] || styles.idle
  const ls = letterStyles[state] || letterStyles.idle

  return (
    <button type="button" onClick={!disabled ? onSelect : undefined}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, textAlign: 'left', width: '100%', transition: 'all 0.15s', cursor: disabled ? 'default' : 'pointer', ...s }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1, transition: 'all 0.15s', ...ls }}>
        {letter}
      </span>
      <MathText as="span" style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500, flex: 1 }}>{text}</MathText>
      {state === 'correct' && <span style={{ marginLeft: 'auto', fontSize: 16, flexShrink: 0 }}>✓</span>}
      {state === 'wrong'   && <span style={{ marginLeft: 'auto', fontSize: 16, flexShrink: 0 }}>✗</span>}
    </button>
  )
}

// ─── Navigator grid ───────────────────────────────────────────
function Navigator({ total, currentIdx, answeredIds, onSelect }) {
  const answered = new Set(answeredIds)
  return (
    <div className="bg-white rounded-card border border-slate-100 shadow-card p-4">
      <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Navigator</p>
      <div className="grid grid-cols-8 gap-1.5 mb-3">
        {Array.from({ length: total }, (_, i) => (
          <button key={i} onClick={() => onSelect(i)}
            className={`aspect-square rounded-[7px] text-[11px] font-bold transition-all duration-100
              ${i === currentIdx ? 'border-[1.5px] border-brand text-brand bg-brand-light scale-110 z-10'
              : answered.has(i) ? 'bg-brand text-white border border-brand'
              : 'border border-slate-200 text-muted hover:border-brand/40 bg-white'}`}>
            {i + 1}
          </button>
        ))}
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${Math.round(answeredIds.length / total * 100)}%` }}/>
      </div>
      <p className="text-[12px] text-muted">
        <span className="font-bold text-dark">{answeredIds.length}</span> answered · <span className="font-bold text-dark">{total - answeredIds.length}</span> remaining
      </p>
    </div>
  )
}

// ─── Calculator ───────────────────────────────────────────────
const CALC_ROWS = [
  [{ l:'(',v:'(' },{ l:')',v:')' },{ l:'x²',v:'^2' },{ l:'√',v:'sqrt(' }],
  [{ l:'C',v:'clear',a:'gray' },{ l:'±',v:'negate',a:'gray' },{ l:'%',v:'%',a:'gray' },{ l:'÷',v:'/',a:'op' }],
  [{ l:'7',v:'7' },{ l:'8',v:'8' },{ l:'9',v:'9' },{ l:'×',v:'*',a:'op' }],
  [{ l:'4',v:'4' },{ l:'5',v:'5' },{ l:'6',v:'6' },{ l:'−',v:'-',a:'op' }],
  [{ l:'1',v:'1' },{ l:'2',v:'2' },{ l:'3',v:'3' },{ l:'+',v:'+',a:'op' }],
  [{ l:'0',v:'0',wide:true },{ l:'.',v:'.' },{ l:'=',v:'=',a:'eq' }],
]
function Calculator({ open, onClose }) {
  const [display, setDisplay] = useState('0')
  const [expr, setExpr] = useState('')
  const press = useCallback((val) => {
    if (val === 'clear')  { setDisplay('0'); setExpr(''); return }
    if (val === 'negate') { setDisplay(d => d.startsWith('-') ? d.slice(1) : '-' + d); return }
    if (val === '=') {
      try {
        const r = Function(`"use strict";return(${(expr+display).replace(/\^2/g,'**2').replace(/sqrt\(/g,'Math.sqrt(')})`)()
        setDisplay(parseFloat(r.toFixed(8)).toString()); setExpr('')
      } catch { setDisplay('Error'); setExpr('') }
      return
    }
    if (['+','-','*','/','%'].includes(val)) { setExpr(e => e + display + val); setDisplay('0'); return }
    setDisplay(d => { if (d === '0' && val !== '.') return val; if (val === '.' && d.includes('.')) return d; return d + val })
  }, [display, expr])
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}/>
      <div className="fixed bottom-0 right-0 z-50 w-[280px] bg-[#1E2433] rounded-tl-2xl animate-slide-in-right">
        <div className="px-4 pt-4 pb-3 border-b border-white/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 text-[11px] font-mono truncate max-w-[200px]">{expr}</span>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none ml-2">×</button>
          </div>
          <div className="text-white text-[28px] font-bold font-mono text-right leading-none truncate">{display}</div>
        </div>
        <div className="p-3 grid gap-2">
          {CALC_ROWS.map((row, ri) => (
            <div key={ri} className="grid gap-2" style={{ gridTemplateColumns: row.map(b => b.wide ? '2fr' : '1fr').join(' ') }}>
              {row.map(btn => (
                <button key={btn.v} onClick={() => press(btn.v)}
                  className={`py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95
                    ${btn.a === 'op' ? 'bg-brand text-white' : btn.a === 'eq' ? 'bg-warning text-white' : btn.a === 'gray' ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'}`}>
                  {btn.l}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────
export default function TestPage() {
  const router   = useRouter()
  const setupRef = useRef(null)

  const [setup,      setSetup]      = useState(null)
  const [questions,  setQuestions]  = useState([])
  const [answers,    setAnswers]    = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [seconds,    setSeconds]    = useState(0)
  const [calcOpen,   setCalcOpen]   = useState(false)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [exitModal,  setExitModal]  = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [timesUp,    setTimesUp]    = useState(false)

  // Study mode per-question state
  const [studySelected,   setStudySelected]   = useState(null)   // letter currently picked
  const [studyCorrect,    setStudyCorrect]    = useState(false)  // got it right
  const [studyCorrectAns, setStudyCorrectAns] = useState(null)   // correctAnswer from server
  const [studyExplanation,setStudyExplanation]= useState(null)   // explanation from server
  const [studyAttempts,   setStudyAttempts]   = useState(0)      // number of wrong tries
  const [studyChecking,   setStudyChecking]   = useState(false)  // waiting for server
  const [studyShowExp,    setStudyShowExp]    = useState(false)  // show explanation panel
  const [studyHint,       setStudyHint]       = useState(null)   // per-option hint from server
  const [studyRevealed,   setStudyRevealed]   = useState(false) // student tapped 'Reveal Solution'

  const timerRef = useRef(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('learniie_setup')
    if (!raw) { router.replace('/setup'); return }
    const parsed = JSON.parse(raw)
    setSetup(parsed)
    setupRef.current = parsed

    const count = parsed.questionCount || 40
    fetch(`/api/questions?subject=${encodeURIComponent(parsed.subject)}&examType=${parsed.examType}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setQuestions((d.questions || []).slice(0, count)); setLoading(false) })
      .catch(() => { setError('Could not load questions. Please try again.'); setLoading(false) })
  }, [])

  useEffect(() => {
    if (loading) return
    const s = setupRef.current
    const isExam = !s?.mode || s.mode === 'exam'
    const limit  = s?.timeLimit || (isExam ? 1800 : null) // 30 min default for exam

    if (isExam && limit) {
      setSeconds(limit)
      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setTimesUp(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [loading])

  // Auto-submit when time's up
  useEffect(() => {
    if (timesUp) {
      const t = setTimeout(() => handleSubmit(), 1500)
      return () => clearTimeout(t)
    }
  }, [timesUp])

  useEffect(() => {
    const handler = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // Reset study state on question change
  useEffect(() => {
    setStudySelected(null)
    setStudyCorrect(false)
    setStudyCorrectAns(null)
    setStudyExplanation(null)
    setStudyAttempts(0)
    setStudyChecking(false)
    setStudyShowExp(false)
    setStudyHint(null)
    setStudyRevealed(false)
  }, [currentIdx])

  const formatTime = s => {
    const t = Math.abs(s)
    return `${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`
  }

  const isExamMode  = !setup?.mode || setup.mode === 'exam'
  const isStudyMode = setup?.mode === 'study'
  const answeredIds = Object.keys(answers)
  const currentQ    = questions[currentIdx]
  const isLast      = currentIdx === questions.length - 1
  const isCountdown = isExamMode

  // Study mode: answer picked — check immediately with server
  async function handleStudyAnswer(letter) {
    if (studyCorrect || studyChecking) return
    setStudySelected(letter)
    setStudyChecking(true)
    setStudyAttempts(a => a + 1)

    try {
      const res = await fetch('/api/study/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentQ.id, selectedAnswer: letter }),
      })
      const data = await res.json()

      if (data.isCorrect) {
        setStudyCorrect(true)
        setStudyCorrectAns(data.correctAnswer)
        setStudyExplanation(data.explanation || null)
        setAnswers(prev => ({ ...prev, [currentQ.id]: letter }))
      } else {
        // Wrong — store correctAnswer for later, show contextual hint
        setStudyCorrectAns(data.correctAnswer)
        setStudyHint(data.hint || null)
        setStudySelected(null) // clear selection so they can pick again
      }
    } catch {
      // On network error, treat as unanswered and allow retry
      setStudySelected(null)
    } finally {
      setStudyChecking(false)
    }
  }

  // Study mode: reveal solution after 2+ failed attempts
  async function handleReveal() {
    if (studyRevealed || studyChecking) return
    setStudyChecking(true)
    try {
      // Fetch correct answer + explanation — pass a dummy answer that's guaranteed wrong
      // Actually: re-fetch by requesting the correct answer directly
      const res = await fetch('/api/study/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentQ.id, selectedAnswer: '__reveal__', reveal: true }),
      })
      const data = await res.json()
      setStudyCorrectAns(data.correctAnswer)
      setStudyExplanation(data.explanation || null)
      setStudyRevealed(true)
      setStudyShowExp(true) // auto-open explanation on reveal
      // Record as unanswered — don't record an answer since student didn't get it right
    } catch {
      // Silently fail — button stays visible for retry
    } finally {
      setStudyChecking(false)
    }
  }

  function studyNext() {
    if (isLast) { handleSubmit() }
    else { setCurrentIdx(i => i + 1) }
  }

  async function handleSubmit() {
    setSubmitting(true)
    clearInterval(timerRef.current)
    setModalOpen(false)
    const s = setupRef.current || setup
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName:     s?.studentName,
          examType:        s?.examType,
          subject:         s?.subject,
          answers,
          questionIds:     questions.map(q => q.id),
          timeTaken:       isCountdown ? (s?.timeLimit || 1800) - seconds : seconds,
          cohortId:        s?.cohortId        || null,
          schoolStudentId: s?.schoolStudentId || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Submission failed') }
      const data = await res.json()
      sessionStorage.removeItem('learniie_setup')
      router.push(`/results/${data.shareToken}`)
    } catch (err) { setError(err.message); setSubmitting(false); setTimesUp(false) }
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="bg-white rounded-card border border-slate-100 shadow-card p-8 max-w-sm text-center">
        <div className="text-3xl mb-3">😕</div>
        <p className="font-bold text-dark mb-2 text-[16px]">Something went wrong</p>
        <p className="text-[13px] text-muted mb-6 leading-relaxed">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-brand text-white px-5 py-2.5 rounded-[10px] font-bold text-[13px] hover:bg-brand-dark">Try again</button>
      </div>
    </div>
  )

  if (loading || submitting) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface">
      {timesUp && !submitting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏱</div>
            <p style={{ fontWeight: 900, fontSize: 20, color: '#0A0A0A', marginBottom: 6 }}>Time's up!</p>
            <p style={{ fontSize: 14, color: '#64748B' }}>Submitting your answers…</p>
          </div>
        </div>
      )}
      <Spinner size={36}/>
      <p className="text-[14px] text-muted font-semibold">{submitting ? 'Saving your results…' : 'Loading questions…'}</p>
    </div>
  )

  // ─── Time's up overlay ─────────────────────────────────────
  if (timesUp) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99, fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 44px', textAlign: 'center', maxWidth: 340 }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>⏱</div>
        <p style={{ fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 8 }}>Time's up!</p>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>Submitting your answers…</p>
      </div>
    </div>
  )

  // ─── STUDY MODE ────────────────────────────────────────────
  if (isStudyMode) {
    const q = currentQ
    const progressPct = (answeredIds.length / questions.length) * 100

    // Option state: idle | selected (pending check) | wrong | correct | revealed
    function getOptionState(letter) {
      if (studyCorrect) {
        if (letter === studyCorrectAns) return 'correct'
        if (letter === studySelected) return 'wrong-final' // what they last picked wrong
        return 'idle-locked'
      }
      if (studySelected === letter && studyChecking) return 'checking'
      return 'idle'
    }

    const optStyles = {
      idle:        { border: '1.5px solid #E2E8F0', background: '#fff', color: '#1A1A1A', cursor: 'pointer' },
      checking:    { border: '1.5px solid #A5B4FC', background: '#EEF0FE', color: '#1A1A1A', cursor: 'wait', opacity: 0.8 },
      correct:     { border: '2px solid #22C55E', background: '#F0FDF4', color: '#166534', cursor: 'default' },
      'wrong-final': { border: '1.5px solid #E2E8F0', background: '#fff', color: '#94A3B8', cursor: 'default', opacity: 0.5 },
      'idle-locked': { border: '1.5px solid #E2E8F0', background: '#fff', color: '#94A3B8', cursor: 'default', opacity: 0.5 },
    }
    const letterStyles = {
      idle:        { background: '#F1F5F9', color: '#64748B' },
      checking:    { background: '#C7D2FE', color: '#2D3CE6' },
      correct:     { background: '#22C55E', color: '#fff' },
      'wrong-final': { background: '#F1F5F9', color: '#94A3B8' },
      'idle-locked': { background: '#F1F5F9', color: '#94A3B8' },
    }

    return (
      <div className="min-h-screen bg-surface font-nunito">
        <style>{SHAKE_STYLE}</style>

        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #E8EAED', position: 'sticky', top: 0, zIndex: 20, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setExitModal(true)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', fontSize: 13, fontWeight: 700, color: '#64748B', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
              ✕ Exit
            </button>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2D3CE6', background: '#EEF0FE', padding: '3px 10px', borderRadius: 99 }}>Study Mode</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', fontFamily: 'Nunito, sans-serif' }}>Q {currentIdx + 1} / {questions.length}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>{answeredIds.length} answered</span>
        </header>

        {/* Progress bar */}
        <div style={{ height: 4, background: '#F1F5F9' }}>
          <div style={{ height: '100%', background: '#22C55E', transition: 'width 0.4s ease', width: `${progressPct}%` }}/>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 48px' }}>
          {q && (
            <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
              {/* Question header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Question {currentIdx + 1}</span>
                {q.topicTitle && <span style={{ fontSize: 11, fontWeight: 700, color: '#2D3CE6', background: '#EEF0FE', padding: '2px 10px', borderRadius: 99 }}>{q.topicTitle}</span>}
                {studyAttempts > 0 && !studyCorrect && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FFF5E6', padding: '2px 10px', borderRadius: 99 }}>
                    Attempt {studyAttempts + 1}
                  </span>
                )}
              </div>

              <MathText as="p" style={{ fontSize: 17, fontWeight: 600, color: '#0A0A0A', lineHeight: 1.65, marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>{q.questionText}</MathText>

              {/* Wrong answer feedback — shown above options on retry */}
              {studyAttempts > 0 && !studyCorrect && !studyChecking && (
                <div style={{ marginBottom: 16, padding: '13px 16px', borderRadius: 10, background: '#FFF5E6', border: '1px solid #FED7AA', display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'fadeUp 0.2s ease' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#92400E', margin: '0 0 4px', fontFamily: 'Nunito, sans-serif' }}>
                      {studyAttempts === 1 ? 'Not quite — think about it.' : `Keep going — attempt ${studyAttempts + 1}`}
                    </p>
                    <p style={{ fontSize: 13, color: '#78350F', margin: 0, fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
                      {studyHint
                        ? studyHint
                        : studyAttempts === 1
                          ? 'Read the question carefully and consider each option again.'
                          : 'What is the key difference between the remaining options?'}
                    </p>
                  </div>
                </div>
              )}

              {/* Reveal Solution — appears after 2+ wrong attempts */}
              {studyAttempts >= 2 && !studyCorrect && !studyRevealed && !studyChecking && (
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', animation: 'fadeUp 0.25s ease' }}>
                  <button onClick={handleReveal}
                    style={{ background: 'none', border: '1.5px solid #E2E8F0', borderRadius: 99, padding: '8px 20px', fontSize: 13, fontWeight: 700, color: '#64748B', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 7 }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#94A3B8';e.currentTarget.style.color='#374151'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#E2E8F0';e.currentTarget.style.color='#64748B'}}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 4v3.5M6.5 9v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    Reveal solution
                  </button>
                </div>
              )}

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['A', q.optionA], ['B', q.optionB], ['C', q.optionC], ['D', q.optionD]].map(([l, t]) => {
                  const state = getOptionState(l)
                  const os = optStyles[state] || optStyles.idle
                  const ls = letterStyles[state] || letterStyles.idle
                  const isWrong = !studyCorrect && studyAttempts > 0 && studyChecking === false
                  return (
                    <button key={l} type="button"
                      onClick={() => !studyCorrect && !studyChecking ? handleStudyAnswer(l) : undefined}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px', borderRadius: 12, textAlign: 'left', width: '100%', transition: 'all 0.15s', fontFamily: 'Nunito, sans-serif', animation: state === 'wrong-final' ? 'shake 0.3s ease' : 'none', ...os }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1, ...ls }}>
                        {state === 'correct' ? '✓' : l}
                      </span>
                      <MathText as="span" style={{ fontSize: 15, lineHeight: 1.6, fontWeight: state === 'correct' ? 700 : 500, flex: 1 }}>{t}</MathText>
                      {state === 'correct' && <span style={{ marginLeft: 'auto', fontSize: 14, flexShrink: 0, color: '#22C55E' }}>✓</span>}
                      {state === 'checking' && <span style={{ marginLeft: 'auto', fontSize: 12, flexShrink: 0, color: '#6366F1', animation: 'fadeUp 0.3s ease infinite' }}>…</span>}
                    </button>
                  )
                })}
              </div>

              {/* Correct answer / Revealed solution */}
              {(studyCorrect || studyRevealed) && (
                <div style={{ marginTop: 16, animation: 'fadeUp 0.25s ease' }}>
                  <div style={{ padding: '16px', borderRadius: 12, background: studyRevealed ? '#FFF5E6' : '#F0FDF4', border: `1.5px solid ${studyRevealed ? '#FED7AA' : '#BBF7D0'}`, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: studyExplanation ? 10 : 0 }}>
                      <span style={{ fontSize: 20 }}>{studyRevealed ? '📖' : '✓'}</span>
                      <p style={{ fontWeight: 800, fontSize: 15, color: studyRevealed ? '#92400E' : '#166534', margin: 0, fontFamily: 'Nunito, sans-serif' }}>
                        {studyRevealed ? 'Solution revealed' : studyAttempts === 1 ? 'Correct!' : `Correct on attempt ${studyAttempts}!`}
                      </p>
                    </div>
                    {studyExplanation && (
                      <>
                        <button onClick={() => setStudyShowExp(s => !s)}
                          style={{ marginTop: 8, background: 'none', border: '1.5px solid #22C55E', borderRadius: 50, padding: '6px 16px', fontSize: 13, fontWeight: 700, color: '#166534', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'background 0.15s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#DCFCE7'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                          {studyShowExp ? 'Hide explanation ↑' : '💡 See why →'}
                        </button>
                        {studyShowExp && (
                          <div style={{ marginTop: 14 }}>
                            <ExplanationCard
                              explanation={studyExplanation}
                              isCorrect={true}
                              correctAnswer={studyCorrectAns}
                              studentAnswer={studySelected}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <button onClick={() => isLast ? handleSubmit() : setCurrentIdx(i => i + 1)}
                    style={{ width: '100%', padding: '13px 0', border: 'none', borderRadius: 12, background: '#2D3CE6', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#1e2cc0'} onMouseLeave={e=>e.currentTarget.style.background='#2D3CE6'}>
                    {isLast ? 'Submit & see results →' : 'Next question →'}
                  </button>
                </div>
              )}

              {!studyCorrect && !studySelected && !studyChecking && studyAttempts === 0 && (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 14, fontFamily: 'Nunito, sans-serif' }}>Select an answer to continue</p>
              )}
            </div>
          )}
        </div>

        {/* Exit confirmation */}
        <Modal open={exitModal} onClose={() => setExitModal(false)} title="Exit study session?"
          footer={
            <>
              <button onClick={() => setExitModal(false)} className="flex-1 border border-slate-200 text-dark font-bold text-[14px] py-3 rounded-[10px] hover:bg-slate-50 transition-colors">Keep studying</button>
              <button onClick={() => { clearInterval(timerRef.current); router.push('/setup') }} className="flex-1 bg-danger text-white font-bold text-[14px] py-3 rounded-[10px] hover:bg-red-700 transition-colors">Exit session</button>
            </>
          }>
          <p className="text-[14px] text-muted leading-relaxed">
            You've answered {answeredIds.length} of {questions.length} questions. Your progress won't be saved.
          </p>
        </Modal>
      </div>
    )
  }

  // ─── EXAM MODE ────────────────────────────────────────────
  const timerWarning = isCountdown && seconds <= 300
  const timerDanger  = isCountdown && seconds <= 60

  return (
    <div className="min-h-screen bg-surface font-nunito">
      <style>{SHAKE_STYLE}</style>

      <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Logo/>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-dark leading-none truncate">{setup?.studentName}</p>
            <p className="text-[11px] text-muted mt-0.5 truncate capitalize">{setup?.subject} · {setup?.examType}</p>
          </div>
        </div>
        <div className="text-[13px] font-bold text-dark shrink-0">Q {currentIdx + 1}/{questions.length}</div>
        <div className="flex items-center gap-2 shrink-0">
          <span style={{
            fontSize: 13, fontWeight: 800, padding: '7px 14px', borderRadius: 99, tabularNums: 'true',
            fontFamily: 'Nunito, sans-serif', letterSpacing: '-0.2px',
            background: timerDanger ? '#FEF2F2' : timerWarning ? '#FFF5E6' : '#EEF0FE',
            color: timerDanger ? '#DC2626' : timerWarning ? '#D97706' : '#2D3CE6',
            animation: timerDanger ? 'timerPulse 1s infinite' : 'none',
          }}>
            {isCountdown && '⏱ '}{formatTime(seconds)}
            {timerWarning && !timerDanger && <span style={{ fontSize: 11, marginLeft: 6, fontWeight: 600 }}>5 min left</span>}
            {timerDanger && <span style={{ fontSize: 11, marginLeft: 6, fontWeight: 600 }}>Hurry!</span>}
          </span>
          <button onClick={() => setCalcOpen(o => !o)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-muted hover:bg-slate-50 transition-colors" title="Calculator">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="3" y="3" width="3" height="1.8" rx=".5" fill="currentColor"/>
              <rect x="8" y="3" width="3" height="1.8" rx=".5" fill="currentColor"/>
              <rect x="3" y="6.5" width="3" height="1.5" rx=".5" fill="currentColor" opacity=".5"/>
              <rect x="8" y="6.5" width="3" height="1.5" rx=".5" fill="currentColor" opacity=".5"/>
              <rect x="3" y="9.5" width="3" height="1.5" rx=".5" fill="currentColor" opacity=".5"/>
              <rect x="8" y="9.5" width="3" height="1.5" rx=".5" fill="currentColor" opacity=".5"/>
            </svg>
          </button>
          <button onClick={() => setModalOpen(true)} className="bg-danger text-white text-[12px] font-bold px-3.5 py-1.5 rounded-lg hover:bg-red-700 transition-colors">Submit</button>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-4 py-5 lg:flex lg:gap-6">
        <div className="lg:flex-1 lg:min-w-0">
          {currentQ && (
            <div className="bg-white rounded-card border border-slate-100 shadow-card p-5 mb-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Question {currentIdx + 1}</span>
                {currentQ.topicTitle && <span className="bg-brand-light text-brand text-[11px] font-bold px-2.5 py-0.5 rounded-full">{currentQ.topicTitle}</span>}
              </div>
              <MathText as="p" className="text-[17px] font-semibold text-dark leading-relaxed mb-6">{currentQ.questionText}</MathText>
              <div className="flex flex-col gap-2.5">
                {[['A', currentQ.optionA], ['B', currentQ.optionB], ['C', currentQ.optionC], ['D', currentQ.optionD]].map(([l, t]) => (
                  <ExamOption key={l} letter={l} text={t}
                    selected={answers[currentQ.id] === l}
                    onSelect={() => setAnswers(prev => ({ ...prev, [currentQ.id]: l }))}/>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
              className="flex-1 border-[1.5px] border-slate-200 text-dark font-bold text-[14px] py-3 rounded-[10px] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              ← Previous
            </button>
            <button onClick={() => isLast ? setModalOpen(true) : setCurrentIdx(i => i + 1)}
              className="flex-1 border-[1.5px] border-brand text-brand font-bold text-[14px] py-3 rounded-[10px] hover:bg-brand-light transition-colors">
              {isLast ? 'Review & Submit →' : 'Next →'}
            </button>
          </div>
        </div>

        <div className="mt-5 lg:mt-0 lg:w-[220px] lg:shrink-0">
          <Navigator
            total={questions.length}
            currentIdx={currentIdx}
            answeredIds={answeredIds.map(id => questions.findIndex(q => q.id === id)).filter(i => i >= 0)}
            onSelect={setCurrentIdx}/>
          <button onClick={() => setModalOpen(true)} className="w-full mt-3 border-[1.5px] border-danger text-danger font-bold text-[13px] py-2.5 rounded-[10px] hover:bg-red-50 transition-colors">
            Submit Test
          </button>
        </div>
      </div>

      <Calculator open={calcOpen} onClose={() => setCalcOpen(false)}/>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit your test?"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-slate-200 text-dark font-bold text-[14px] py-3 rounded-[10px] hover:bg-slate-50 transition-colors">Keep reviewing</button>
            <button onClick={handleSubmit} className="flex-1 bg-brand text-white font-bold text-[14px] py-3 rounded-[10px] hover:bg-brand-dark transition-colors">Submit now</button>
          </>
        }>
        <p className="text-[14px] text-muted leading-relaxed">
          {answeredIds.length === questions.length
            ? "You've answered all questions. Ready to see your results?"
            : `${questions.length - answeredIds.length} question${questions.length - answeredIds.length > 1 ? 's' : ''} unanswered. Submit anyway?`}
        </p>
      </Modal>
    </div>
  )
}