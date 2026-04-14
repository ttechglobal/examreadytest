'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui'

const EXAMS = [
  { id: 'JAMB', label: 'JAMB', desc: 'University entry' },
  { id: 'WAEC', label: 'WAEC', desc: 'Senior Secondary' },
]

const MODES = [
  {
    id: 'exam',
    label: 'Exam Mode',
    desc: '40 questions · 2-hour timer · Submit at the end',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'study',
    label: 'Study Mode',
    desc: 'Custom questions · Instant feedback · Learn as you go',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="16" cy="14" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M15.3 14l.7.7 1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function SetupInner() {
  const router  = useRouter()
  const params  = useSearchParams()

  const [name,        setName]        = useState('')
  const [examType,    setExamType]    = useState('')
  const [subject,     setSubject]     = useState(params.get('subject') || '')
  const [mode,        setMode]        = useState('exam')
  const [numQ,        setNumQ]        = useState(20)
  const [timeLimit,   setTimeLimit]   = useState(30)
  const [nameError,   setNameError]   = useState('')
  const [mounted,     setMounted]     = useState(false)
  const [subjects,    setSubjects]    = useState([])
  const [loadingSubj, setLoadingSubj] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Fetch subjects whenever examType changes
  useEffect(() => {
    if (!examType) { setSubjects([]); return }
    setLoadingSubj(true)
    setSubject('') // reset subject when exam changes
    fetch(`/api/subjects?examType=${examType}`)
      .then(r => r.json())
      .then(d => setSubjects(d.subjects || []))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubj(false))
  }, [examType])

  const isReady = name.trim().length >= 2 && examType && subject

  function handleStart() {
    if (name.trim().length < 2) { setNameError('Please enter at least 2 characters'); return }
    const setup = {
      studentName: name.trim().slice(0, 60),
      examType,
      subject,
      mode,
      ...(mode === 'exam'  && { questionCount: 40,   timeLimit: 7200 }),
      ...(mode === 'study' && { questionCount: numQ, timeLimit: timeLimit * 60 }),
    }
    sessionStorage.setItem('learniie_setup', JSON.stringify(setup))
    router.push('/test')
  }

  return (
    <main className="min-h-screen bg-surface font-nunito flex flex-col">
      <div className="max-w-[520px] mx-auto w-full px-4 py-8 flex-1">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-2 text-dark no-underline">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#2D3CE6"/>
              <path d="M8 20V8l6 8 6-8v12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-black text-[16px] text-dark">Exam Ready Test</span>
          </Link>
        </div>

        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-dark transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to home
        </Link>

        <div className={`space-y-5 ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}>

          {/* Name */}
          <div className="bg-white rounded-card border border-slate-100 shadow-card p-5">
            <h1 className="text-[20px] font-black text-dark mb-1">Set up your test</h1>
            <p className="text-[13px] text-muted mb-5">Fill in the details below to get started</p>
            <Input
              id="student-name"
              label="Your name"
              type="text"
              value={name}
              maxLength={60}
              placeholder="e.g. Chidera Okafor"
              error={nameError}
              onChange={e => { setName(e.target.value); setNameError('') }}
            />
          </div>

          {/* Exam type */}
          <div className="bg-white rounded-card border border-slate-100 shadow-card p-5">
            <p className="text-[13px] font-bold text-dark mb-3">Exam type</p>
            <div className="grid grid-cols-2 gap-2.5">
              {EXAMS.map(e => (
                <button key={e.id} type="button" onClick={() => setExamType(e.id)}
                  className={`relative border-[1.5px] rounded-xl p-3.5 text-left transition-all duration-150 active:scale-[.97]
                    ${examType === e.id
                      ? 'border-brand bg-brand-light'
                      : 'border-slate-200 bg-white hover:border-brand/40 hover:bg-brand-light/30'}`}>
                  {examType === e.id && (
                    <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand rounded-full flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  <p className={`text-[18px] font-black ${examType === e.id ? 'text-brand' : 'text-dark'}`}>{e.label}</p>
                  <p className="text-[11px] text-muted mt-0.5">{e.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Subject — only shown after exam type selected */}
          {examType && (
            <div className="bg-white rounded-card border border-slate-100 shadow-card p-5">
              <p className="text-[13px] font-bold text-dark mb-3">Subject</p>
              {loadingSubj ? (
                <p className="text-[13px] text-muted">Loading subjects…</p>
              ) : subjects.length === 0 ? (
                <p className="text-[13px] text-muted">No subjects available for {examType} yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subjects.map(s => (
                    <button key={s.id} type="button" onClick={() => setSubject(s.id)}
                      className={`border-[1.5px] rounded-[10px] px-4 py-2 text-[13px] font-semibold transition-all duration-150 active:scale-[.97]
                        ${subject === s.id
                          ? 'border-brand bg-brand text-white'
                          : 'border-slate-200 bg-white text-dark hover:border-brand hover:text-brand'}`}>
                      {s.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mode selector */}
          {examType && subject && (
            <div className="bg-white rounded-card border border-slate-100 shadow-card p-5">
              <p className="text-[13px] font-bold text-dark mb-3">Mode</p>
              <div className="flex flex-col gap-2.5">
                {MODES.map(m => (
                  <button key={m.id} type="button" onClick={() => setMode(m.id)}
                    className={`flex items-start gap-3 border-[1.5px] rounded-xl p-3.5 text-left transition-all duration-150 active:scale-[.98]
                      ${mode === m.id
                        ? 'border-brand bg-brand-light'
                        : 'border-slate-200 bg-white hover:border-brand/40'}`}>
                    <span className={`mt-0.5 flex-shrink-0 ${mode === m.id ? 'text-brand' : 'text-muted'}`}>
                      {m.icon}
                    </span>
                    <div>
                      <p className={`text-[14px] font-bold ${mode === m.id ? 'text-brand' : 'text-dark'}`}>
                        {m.label}
                        {m.id === 'exam' && <span className="ml-2 text-[10px] font-semibold bg-brand text-white px-1.5 py-0.5 rounded">Default</span>}
                      </p>
                      <p className="text-[12px] text-muted mt-0.5">{m.desc}</p>
                    </div>
                    {mode === m.id && (
                      <span className="ml-auto mt-0.5 w-4 h-4 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Study mode options */}
              {mode === 'study' && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Questions</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setNumQ(q => Math.max(5, q - 5))}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-muted hover:bg-slate-50 font-bold text-[16px]">−</button>
                      <span className="flex-1 text-center font-black text-[18px] text-dark">{numQ}</span>
                      <button onClick={() => setNumQ(q => Math.min(40, q + 5))}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-muted hover:bg-slate-50 font-bold text-[16px]">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Time limit</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setTimeLimit(t => Math.max(5, t - 5))}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-muted hover:bg-slate-50 font-bold text-[16px]">−</button>
                      <span className="flex-1 text-center font-black text-[18px] text-dark">{timeLimit}m</span>
                      <button onClick={() => setTimeLimit(t => Math.min(120, t + 5))}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-muted hover:bg-slate-50 font-bold text-[16px]">+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <button type="button" onClick={handleStart} disabled={!isReady}
            className={`w-full py-4 rounded-[12px] text-[15px] font-bold transition-all duration-150
              ${isReady
                ? 'bg-brand text-white hover:bg-brand-dark hover:shadow-brand-glow active:scale-[.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            {isReady
              ? mode === 'exam'
                ? 'Start Exam →'
                : 'Start Study Session →'
              : 'Complete all fields to continue'}
          </button>
          <p className="text-center text-[12px] text-muted">Free · No account needed · Results instantly</p>
        </div>
      </div>
    </main>
  )
}