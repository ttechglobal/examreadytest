'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner, Modal, Toast } from '@/components/ui'
import { MathText } from '@/components/ui/MathText'

// ─── Option button ────────────────────────────────────────────
function Option({ letter, text, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-start gap-3 p-4 rounded-xl border-[1.5px] text-left w-full transition-all duration-150 active:scale-[.99]
        ${selected
          ? 'border-brand bg-brand shadow-brand-glow'
          : 'border-slate-200 bg-white hover:border-brand/40 hover:bg-brand-light/30'}`}
    >
      <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[12px] font-bold mt-0.5 transition-colors
        ${selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-muted'}`}>
        {letter}
      </span>
      <MathText as="span" className={`text-[15px] leading-relaxed font-medium transition-colors ${selected ? 'text-white' : 'text-dark'}`}>
        {text}
      </MathText>
      {selected && (
        <svg className="ml-auto mt-1 shrink-0 animate-scale-in" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}

// ─── Question grid ────────────────────────────────────────────
function QuestionGrid({ total, currentIdx, answeredIds, questions, onSelect }) {
  const answered = new Set(answeredIds)
  return (
    <div className="bg-white rounded-card border border-slate-100 shadow-card p-4">
      <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Question Navigator</p>
      <div className="grid grid-cols-8 gap-1.5 mb-4">
        {Array.from({ length: total }, (_, i) => {
          const q = questions[i]
          const ans = q && answered.has(q.id)
          const cur = i === currentIdx
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`aspect-square rounded-[7px] text-[11px] font-bold transition-all duration-100
                ${cur ? 'border-[1.5px] border-brand text-brand bg-brand-light scale-110 z-10'
                : ans ? 'bg-brand text-white border border-brand'
                : 'border border-slate-200 text-muted hover:border-brand/40 hover:text-brand bg-white'}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-brand rounded-full transition-all duration-300"
          style={{ width: `${Math.round(answeredIds.length / total * 100)}%` }}
        />
      </div>
      <p className="text-[12px] text-muted">
        <span className="font-bold text-dark">{answeredIds.length}</span> answered ·{' '}
        <span className="font-bold text-dark">{total - answeredIds.length}</span> remaining
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
        const e = (expr + display).replace(/\^2/g,'**2').replace(/sqrt\(/g,'Math.sqrt(')
        const r = Function(`"use strict";return(${e})`)()
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
                <button
                  key={btn.v}
                  onClick={() => press(btn.v)}
                  className={`py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95
                    ${btn.a === 'op' ? 'bg-brand text-white hover:bg-brand-dark'
                    : btn.a === 'eq' ? 'bg-warning text-white hover:opacity-90'
                    : btn.a === 'gray' ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                >
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

// ─── Main test page ───────────────────────────────────────────
export default function TestPage() {
  const router = useRouter()
  const [setup, setSetup]           = useState(null)
  const setupRef = useRef(null)
  const [questions, setQuestions]   = useState([])
  const [answers, setAnswers]       = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [seconds, setSeconds]       = useState(0)
  const [calcOpen, setCalcOpen]     = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('learniie_setup')
    if (!raw) { router.replace('/setup'); return }
    const parsed = JSON.parse(raw)
    setSetup(parsed)
    setupRef.current = parsed  // keep ref in sync
    fetch(`/api/questions?subject=${encodeURIComponent(parsed.subject)}&examType=${parsed.examType}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setQuestions(d.questions); setLoading(false) })
      .catch(() => { setError('Could not load questions. Please try again.'); setLoading(false) })
  }, [])

  useEffect(() => {
    const handler = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  useEffect(() => {
    if (!loading) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [loading])

  const formatTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const answeredIds = Object.keys(answers)
  const currentQ = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  async function handleSubmit() {
    setSubmitting(true); clearInterval(timerRef.current); setModalOpen(false)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            studentName:     (setupRef.current || setup)?.studentName,
            examType:        (setupRef.current || setup)?.examType,
            subject:         (setupRef.current || setup)?.subject,
            answers,
            questionIds:     questions.map(q => q.id),
            timeTaken:       seconds,
            cohortId:        (setupRef.current || setup)?.cohortId        || null,
            schoolStudentId: (setupRef.current || setup)?.schoolStudentId || null,
          }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Submission failed') }
      const data = await res.json()
      sessionStorage.removeItem('learniie_setup')
      router.push(`/results/${data.shareToken}`)
    } catch (err) { setError(err.message); setSubmitting(false) }
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="bg-white rounded-card border border-slate-100 shadow-card p-8 max-w-sm text-center">
        <div className="text-3xl mb-3">😕</div>
        <p className="font-bold text-dark mb-2 text-[16px]">Something went wrong</p>
        <p className="text-[13px] text-muted mb-6 leading-relaxed">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-brand text-white px-5 py-2.5 rounded-[10px] font-bold text-[13px] hover:bg-brand-dark transition-colors">Try again</button>
      </div>
    </div>
  )

  if (loading || submitting) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface">
      <Spinner size={36}/>
      <p className="text-[14px] text-muted font-semibold">{submitting ? 'Calculating your results…' : 'Loading your questions…'}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface font-nunito">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <p className="text-[13px] font-bold text-dark leading-none truncate">{setup?.studentName}</p>
          <p className="text-[11px] text-muted mt-0.5 truncate">{setup?.subject} · {setup?.examType}</p>
        </div>
        <div className="text-[13px] font-bold text-dark shrink-0">Q {currentIdx + 1} / {questions.length}</div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-brand-light text-brand text-[13px] font-bold px-2.5 py-1 rounded-full tabular-nums">{formatTime(seconds)}</span>
          <button
            onClick={() => setCalcOpen(o => !o)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-muted hover:bg-slate-50 transition-colors"
            title="Calculator"
          >
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

        {/* Question panel */}
        <div className="lg:flex-1 lg:min-w-0">
          {currentQ && (
            <div className="bg-white rounded-card border border-slate-100 shadow-card p-5 mb-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Question {currentIdx + 1}</span>
                <span className="bg-brand-light text-brand text-[11px] font-bold px-2.5 py-0.5 rounded-full">{currentQ.topicTitle}</span>
              </div>
              <MathText as="p" className="text-[17px] font-semibold text-dark leading-relaxed mb-6 question-text">{currentQ.questionText}</MathText>
              <div className="flex flex-col gap-2.5">
                {[['A', currentQ.optionA], ['B', currentQ.optionB], ['C', currentQ.optionC], ['D', currentQ.optionD]].map(([l, t]) => (
                  <Option
                    key={l} letter={l} text={t}
                    selected={answers[currentQ.id] === l}
                    onSelect={() => setAnswers(prev => ({ ...prev, [currentQ.id]: l }))}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="flex-1 border-[1.5px] border-slate-200 text-dark font-bold text-[14px] py-3 rounded-[10px] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => isLast ? setModalOpen(true) : setCurrentIdx(i => i + 1)}
              className="flex-1 border-[1.5px] border-brand text-brand font-bold text-[14px] py-3 rounded-[10px] hover:bg-brand-light transition-colors"
            >
              {isLast ? 'Review & Submit →' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="mt-5 lg:mt-0 lg:w-[220px] lg:shrink-0">
          <QuestionGrid
            total={questions.length}
            currentIdx={currentIdx}
            answeredIds={answeredIds}
            questions={questions}
            onSelect={setCurrentIdx}
          />
          <button
            onClick={() => setModalOpen(true)}
            className="w-full mt-3 border-[1.5px] border-danger text-danger font-bold text-[13px] py-2.5 rounded-[10px] hover:bg-red-50 transition-colors"
          >
            Submit Test
          </button>
        </div>
      </div>

      <Calculator open={calcOpen} onClose={() => setCalcOpen(false)}/>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit your test?"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-slate-200 text-dark font-bold text-[14px] py-3 rounded-[10px] hover:bg-slate-50 transition-colors">Keep reviewing</button>
            <button onClick={handleSubmit} className="flex-1 bg-brand text-white font-bold text-[14px] py-3 rounded-[10px] hover:bg-brand-dark transition-colors">Submit now</button>
          </>
        }
      >
        <p className="text-[14px] text-muted leading-relaxed">
          {answeredIds.length === questions.length
            ? "You've answered all questions. Ready to see your results?"
            : `You have ${questions.length - answeredIds.length} unanswered question${questions.length - answeredIds.length > 1 ? 's' : ''}. Continue reviewing or submit now?`}
        </p>
      </Modal>
    </div>
  )
}