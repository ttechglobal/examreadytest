'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { MathText } from '@/components/ui/MathText'
import { EXTRACTION_PROMPT_WITH_LATEX as EXTRACTION_PROMPT } from '@/lib/prompts/explanationGeneration'

const SUBJECTS = [
  { id: 'physics',     label: 'Physics'     },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'chemistry',   label: 'Chemistry'   },
  { id: 'biology',     label: 'Biology'     },
  { id: 'english',     label: 'English'     },
  { id: 'government',  label: 'Government'  },
  { id: 'history',     label: 'History'     },
  { id: 'economics',   label: 'Economics'   },
  { id: 'literature',  label: 'Literature'  },
]

// ─── Step indicator ───────────────────────────────────────────
function Steps({ current }) {
  const labels = ['Configure', 'Extract', 'Review & Save']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {labels.map((label, i) => {
        const n = i + 1; const done = n < current; const active = n === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < labels.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#22C55E' : active ? '#2D3CE6' : '#E2E8F0', color: done || active ? '#fff' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12, transition: 'all 0.2s' }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#0A0A0A' : done ? '#22C55E' : '#94A3B8' }}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ flex: 1, height: 1, background: n < current ? '#22C55E' : '#E2E8F0', margin: '0 14px', transition: 'background 0.3s' }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Explanation preview inside accordion ─────────────────────
function ExplanationPreview({ text }) {
  if (!text) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', margin: 0 }}>No explanation provided.</p>

  // Use ExplanationCard's structured parser if it has Step N: sections,
  // otherwise just render with MathText
  const hasSteps = /step \d+:/i.test(text)

  if (!hasSteps) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', lineHeight: 1.75 }}>
        <MathText>{text}</MathText>
      </div>
    )
  }

  const lines = text.split('\n').filter(Boolean)
  const steps = []; const whyNot = []; let why = ''; let whatTests = ''; let currentStep = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (/^Step \d+:/i.test(line)) {
      if (currentStep) steps.push(currentStep)
      currentStep = { header: line.replace(/\*\*/g, ''), body: [] }
      continue
    }
    if (currentStep) {
      if (/^(\*\*)?Answer:/i.test(line) || /^(\*\*)?What this tests:/i.test(line) || /^(\*\*)?Why not [A-D]:/i.test(line)) {
        steps.push(currentStep); currentStep = null
      } else { currentStep.body.push(line); continue }
    }
    const wn = line.match(/^(\*\*)?Why not ([A-D]):\s*(.*)/i)
    if (wn) { whyNot.push({ letter: wn[2].toUpperCase(), reason: wn[3].replace(/\*\*$/, '') }); continue }
    if (/^(\*\*)?What this tests:/i.test(line)) { whatTests = line.replace(/^(\*\*)?What this tests:\s*/i, '').replace(/\*\*/g, ''); continue }
    if (/^(\*\*)?Why:/i.test(line)) { why = line.replace(/^(\*\*)?Why:\s*/i, '').replace(/\*\*/g, ''); continue }
  }
  if (currentStep) steps.push(currentStep)

  return (
    <div>
      {why && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 12 }}>
          <MathText>{why}</MathText>
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#EEF0FE', color: '#2D3CE6', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
              {step.header.match(/\d+/)?.[0] || i + 1}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12, color: '#0A0A0A', margin: '0 0 4px' }}>
                {step.header.replace(/^Step \d+:\s*/i, '')}
              </p>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                <MathText>{step.body.join('\n')}</MathText>
              </div>
            </div>
          </div>
        ))}
      </div>
      {whyNot.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Why other options are wrong</p>
          {whyNot.map(({ letter, reason }) => (
            <div key={letter} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5 }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: '#FFF1F2', color: '#B91C1C', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{letter}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525B', lineHeight: 1.6 }}><MathText>{reason}</MathText></span>
            </div>
          ))}
        </div>
      )}
      {whatTests && (
        <div style={{ padding: '9px 13px', background: '#F0FDF4', borderLeft: '3px solid #22C55E', borderRadius: '0 7px 7px 0' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#15803D', margin: '0 0 2px' }}>Key takeaway</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#166534', lineHeight: 1.6, margin: 0 }}><MathText>{whatTests}</MathText></p>
        </div>
      )}
    </div>
  )
}

// ─── Question accordion row ───────────────────────────────────
function QuestionRow({ q, index, onChange }) {
  const [open, setOpen] = useState(false)
  const ds = { easy: { bg: '#F0FDF4', text: '#15803D' }, medium: { bg: '#FEF3C7', text: '#D97706' }, hard: { bg: '#FFF1F2', text: '#B91C1C' } }[q.difficulty] || { bg: '#F8FAFC', text: '#64748B' }
  const ansColor = { A: '#3B82F6', B: '#8B5CF6', C: '#F59E0B', D: '#22C55E' }[q.correctAnswer] || '#2D3CE6'

  return (
    <div style={{ border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: '#fff' }}>
      {/* Collapsed header */}
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12, color: '#94A3B8', minWidth: 28, flexShrink: 0 }}>Q{index + 1}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {q.questionText.slice(0, 100)}{q.questionText.length > 100 ? '…' : ''}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: '#EEF0FE', color: '#2D3CE6', flexShrink: 0, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.topic}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: ds.bg, color: ds.text, flexShrink: 0 }}>{q.difficulty}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: '#fff', background: ansColor, width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{q.correctAnswer}</span>
        <span style={{ color: '#94A3B8', fontSize: 11, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 16px 18px 56px' }}>
          {/* Editable topic + difficulty */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={q.topic}
              onChange={e => onChange('topic', e.target.value)}
              style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 12, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 11px', outline: 'none', color: '#0A0A0A' }}
              placeholder="Topic"
            />
            <select
              value={q.difficulty}
              onChange={e => onChange('difficulty', e.target.value)}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 11px', outline: 'none', color: '#0A0A0A', background: '#fff', cursor: 'pointer' }}
            >
              <option>easy</option><option>medium</option><option>hard</option>
            </select>
          </div>

          {/* Question text */}
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 600, color: '#0A0A0A', lineHeight: 1.7, marginBottom: 14 }}>
            <MathText>{q.questionText}</MathText>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
            {['A','B','C','D'].map(letter => {
              const isCorrect = letter === q.correctAnswer
              return (
                <div key={letter} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 13px', borderRadius: 9, background: isCorrect ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${isCorrect ? '#86EFAC' : '#E8EAED'}` }}>
                  <span style={{ width: 21, height: 21, borderRadius: 6, background: isCorrect ? '#22C55E' : '#E2E8F0', color: isCorrect ? '#fff' : '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{letter}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: isCorrect ? '#15803D' : '#374151', flex: 1, fontWeight: isCorrect ? 600 : 400, lineHeight: 1.5 }}>
                    <MathText>{q[`option${letter}`]}</MathText>
                  </span>
                  {isCorrect && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#15803D', flexShrink: 0 }}>✓ Correct</span>}
                </div>
              )
            })}
          </div>

          {/* Explanation */}
          <div style={{ background: '#FAFAFA', border: '1px solid #E8EAED', borderRadius: 11, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #E8EAED', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#2D3CE6" strokeWidth="1.3"/><path d="M7 6v4M7 4.5v.5" stroke="#2D3CE6" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#2D3CE6', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Step-by-step explanation</span>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <ExplanationPreview text={q.explanation} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────
export default function UploadPage() {
  const router = useRouter()
  const [step,       setStep]       = useState(1)
  const [examType,   setExamType]   = useState('')
  const [subject,    setSubject]    = useState('')
  const [year,       setYear]       = useState('')
  const [paper,      setPaper]      = useState('')
  const [json,       setJson]       = useState('')
  const [copied,     setCopied]     = useState(false)
  const [validating, setValidating] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [parseError, setParseError] = useState(null)
  const [saveError,  setSaveError]  = useState(null)
  const [questions,  setQuestions]  = useState([])
  const [warnings,   setWarnings]   = useState([])
  const [saved,      setSaved]      = useState(null)
  const [lastBatch,  setLastBatch]  = useState(null)
  // Dynamic exam types — fetched from admin API, falls back to hardcoded
  const [examTypes,  setExamTypes]  = useState(['JAMB','WAEC','BECE'])

  useEffect(() => {
    fetch('/api/admin/exam-types')
      .then(r => r.json())
      .then(d => {
        if (d.examTypes?.length) {
          setExamTypes(d.examTypes.filter(e => e.active).map(e => e.id))
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  const subjectLabel = SUBJECTS.find(s => s.id === subject)?.label || ''

  function handleCopy() {
    navigator.clipboard.writeText(EXTRACTION_PROMPT).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function updateQuestion(index, key, value) {
    setQuestions(qs => qs.map((q, i) => i === index ? { ...q, [key]: value } : q))
  }

  async function handleValidate() {
    setValidating(true); setParseError(null)
    try {
      const res  = await fetch('/api/admin/upload/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawJson: json }),
      })
      const data = await res.json()
      if (!res.ok) { setParseError(data); return }
      setQuestions(data.questions)
      setWarnings(data.warnings || [])
      setStep(3)
    } catch {
      setParseError({ error: 'Network error — could not reach server.' })
    } finally { setValidating(false) }
  }

  async function handleSave() {
    setSaving(true); setSaveError(null)
    try {
      const res  = await fetch('/api/admin/upload/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, examType, subject, year, paper }),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.message || data.error || 'Save failed'); return }
      setSaved(data); setLastBatch(data.batchId)
    } catch {
      setSaveError('Network error — could not reach server.')
    } finally { setSaving(false) }
  }

  async function handleUndo() {
    if (!lastBatch) return
    await fetch(`/api/admin/upload/batch/${lastBatch}`, { method: 'DELETE' })
    setSaved(null); setLastBatch(null); reset()
  }

  function reset() {
    setStep(1); setQuestions([]); setJson(''); setSaved(null); setSaveError(null)
    setParseError(null); setWarnings([]); setSubject(''); setYear(''); setPaper(''); setExamType('')
  }

  const inp = { fontFamily: 'Inter, sans-serif', fontSize: 13, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', outline: 'none', background: '#fff', color: '#0A0A0A', width: '100%', boxSizing: 'border-box' }
  const lbl = { display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }

  return (
    <>
      <AdminTopbar title="Upload past paper" />
      <div style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <Steps current={step} />

          {/* ═══ STEP 1: Configure ═══ */}
          {step === 1 && (
            <div style={{ maxWidth: 500 }}>
              <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, padding: 28 }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 18, color: '#0A0A0A', marginBottom: 24 }}>Configure the exam paper</p>

                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Exam type *</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {examTypes.map(e => (
                      <button key={e} onClick={() => setExamType(e)}
                        style={{ padding: '11px 18px', border: `1.5px solid ${examType === e ? '#2D3CE6' : '#E2E8F0'}`, borderRadius: 10, background: examType === e ? '#EEF0FE' : '#fff', color: examType === e ? '#2D3CE6' : '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Subject *</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">Select subject…</option>
                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                  <div>
                    <label style={lbl}>Year <span style={{ fontWeight: 400, color: '#C4C4C4' }}>(optional)</span></label>
                    <input type="number" min="1990" max="2025" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2019" style={inp}/>
                  </div>
                  <div>
                    <label style={lbl}>Paper <span style={{ fontWeight: 400, color: '#C4C4C4' }}>(optional)</span></label>
                    <input type="text" value={paper} onChange={e => setPaper(e.target.value)} placeholder="e.g. Paper 1" style={inp}/>
                  </div>
                </div>

                <button onClick={() => setStep(2)} disabled={!examType || !subject}
                  style={{ width: '100%', padding: '13px 0', background: examType && subject ? '#2D3CE6' : '#E2E8F0', color: examType && subject ? '#fff' : '#94A3B8', border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, cursor: examType && subject ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
                  Next: Get extraction prompt →
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Extract ═══ */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,360px),1fr))', gap: 20 }}>
              {/* Left: Instructions */}
              <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, padding: 24 }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: '#0A0A0A', marginBottom: 6 }}>How to extract your questions</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 1.6 }}>
                  The prompt below tells Claude or Gemini to extract every question with its answer, options, topic, difficulty, and a full step-by-step explanation — all in one pass. Paste your PDF, use the prompt, paste the JSON back here.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { n: 1, text: 'Copy the prompt using the button on the right' },
                    { n: 2, text: 'Open Claude.ai or Gemini in a new tab' },
                    { n: 3, text: 'Start a new conversation and attach your past paper PDF' },
                    { n: 4, text: 'Paste the prompt and send it' },
                    { n: 5, text: 'Wait for the JSON response (includes questions, answers, and explanations)' },
                    { n: 6, text: 'Copy the entire JSON and paste it in the panel on the right' },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2D3CE6', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{n}</div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{text}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748B', margin: '0 0 2px' }}>Uploading:</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
                    {examType} · {subjectLabel}{year ? ` · ${year}` : ''}{paper ? ` · ${paper}` : ''}
                  </p>
                </div>
                <button onClick={() => setStep(1)} style={{ marginTop: 14, background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>
                  ← Change configuration
                </button>
              </div>

              {/* Right: Prompt + paste */}
              <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>Extraction prompt</p>
                  <button onClick={handleCopy}
                    style={{ background: copied ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${copied ? '#86EFAC' : '#E2E8F0'}`, borderRadius: 7, padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: copied ? '#15803D' : '#374151', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {copied ? 'Copied ✓' : 'Copy prompt'}
                  </button>
                </div>

                {/* Dark code block */}
                <div style={{ background: '#0F172A', borderRadius: 10, padding: '14px 16px', marginBottom: 20, position: 'relative', maxHeight: 220, overflowY: 'auto' }}>
                  <div style={{ position: 'absolute', top: 10, left: 16, display: 'flex', gap: 5 }}>
                    {['#EF4444','#F59E0B','#22C55E'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>)}
                  </div>
                  <pre style={{ fontFamily: 'monospace', fontSize: 10.5, color: '#94A3B8', margin: '16px 0 0', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {EXTRACTION_PROMPT}
                  </pre>
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: '#E8EAED' }}/>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>Paste the JSON response here</span>
                  <div style={{ flex: 1, height: 1, background: '#E8EAED' }}/>
                </div>

                {/* JSON textarea */}
                <textarea
                  value={json}
                  onChange={e => setJson(e.target.value)}
                  placeholder={'[\n  {\n    "questionText": "...",\n    "optionA": "...",\n    "explanation": "...",\n    ...\n  }\n]'}
                  style={{ width: '100%', minHeight: 200, fontFamily: 'monospace', fontSize: 12, border: `1.5px solid ${parseError ? '#FCA5A5' : '#E2E8F0'}`, borderRadius: 8, padding: '12px 14px', outline: 'none', resize: 'vertical', background: parseError ? '#FFF8F8' : '#FAFAFA', color: '#0A0A0A', lineHeight: 1.6, boxSizing: 'border-box' }}
                />

                {parseError && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: '#FFF1F2', border: '1px solid #FCA5A5', borderRadius: 8 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#B91C1C', margin: '0 0 4px' }}>{parseError.error}</p>
                    {parseError.detail && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#DC2626', margin: 0, lineHeight: 1.5 }}>{parseError.detail}</p>}
                  </div>
                )}

                <button onClick={handleValidate} disabled={!json.trim() || validating}
                  style={{ marginTop: 14, width: '100%', padding: '13px 0', background: json.trim() ? '#2D3CE6' : '#E2E8F0', color: json.trim() ? '#fff' : '#94A3B8', border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, cursor: json.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
                  {validating ? 'Validating…' : 'Validate & Preview →'}
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Review & Save ═══ */}
          {step === 3 && !saved && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 20, color: '#0A0A0A', margin: '0 0 4px' }}>
                    {questions.length} questions ready
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', margin: 0 }}>
                    {examType} · {subjectLabel}{year ? ` · ${year}` : ''}{paper ? ` · ${paper}` : ''}
                    &nbsp;·&nbsp;{questions.filter(q => q.difficulty === 'easy').length} easy
                    &nbsp;·&nbsp;{questions.filter(q => q.difficulty === 'medium').length} medium
                    &nbsp;·&nbsp;{questions.filter(q => q.difficulty === 'hard').length} hard
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(2)} style={{ padding: '10px 18px', border: '1px solid #E2E8F0', borderRadius: 9, background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>← Back</button>
                  <button onClick={handleSave} disabled={saving}
                    style={{ padding: '10px 22px', border: 'none', borderRadius: 9, background: '#2D3CE6', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving…' : `Save all ${questions.length} questions →`}
                  </button>
                </div>
              </div>

              {warnings.length > 0 && (
                <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8 }}>
                  {warnings.map((w, i) => <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#92400E', margin: i > 0 ? '4px 0 0' : 0 }}>{w}</p>)}
                </div>
              )}
              {saveError && (
                <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FFF1F2', border: '1px solid #FCA5A5', borderRadius: 8 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#B91C1C', margin: 0 }}>{saveError}</p>
                </div>
              )}

              <div>
                {questions.map((q, i) => (
                  <QuestionRow key={i} q={q} index={i} onChange={(key, val) => updateQuestion(i, key, val)} />
                ))}
              </div>

              {/* Sticky save bar */}
              <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid #E8EAED', padding: '14px 0', marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: '12px 28px', border: 'none', borderRadius: 10, background: '#2D3CE6', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px #2D3CE640' }}>
                  {saving ? 'Saving…' : `Save all ${questions.length} questions to database →`}
                </button>
              </div>
            </div>
          )}

          {/* ═══ SUCCESS ═══ */}
          {saved && (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 16, padding: 40, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', border: '2px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>✓</div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 8 }}>
                  {saved.inserted} questions saved
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.6 }}>
                  Added to the {subjectLabel} question bank for {examType}{year ? ` (${year})` : ''}. All questions are live immediately.
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <button onClick={handleUndo}
                    style={{ flex: 1, padding: '11px 0', border: '1px solid #FCA5A5', borderRadius: 9, background: '#fff', color: '#DC2626', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Undo upload
                  </button>
                  <button onClick={reset}
                    style={{ flex: 1, padding: '11px 0', border: '1px solid #E2E8F0', borderRadius: 9, background: '#fff', color: '#374151', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Upload another
                  </button>
                </div>
                <button onClick={() => router.push('/admin/questions')}
                  style={{ width: '100%', padding: '11px 0', border: 'none', borderRadius: 9, background: '#2D3CE6', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  View question bank →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}