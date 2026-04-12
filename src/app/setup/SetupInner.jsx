'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui'

const SUBJECTS = ['Physics','Mathematics','Chemistry','Biology','English','Government','History','Economics','Literature']
const EXAMS = [
  { id: 'JAMB', sub: 'UTME', desc: 'University entry' },
  { id: 'WAEC', sub: 'SSCE', desc: 'West African' },
  { id: 'NECO', sub: 'SSCE', desc: 'National' },
]

export default function SetupInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [name,      setName]      = useState('')
  const [examType,  setExamType]  = useState('')
  const [subject,   setSubject]   = useState(params.get('subject') || '')
  const [nameError, setNameError] = useState('')
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isReady = name.trim().length >= 2 && examType && subject

  function handleStart() {
    if (name.trim().length < 2) {
      setNameError('Please enter at least 2 characters')
      return
    }
    sessionStorage.setItem('learniie_setup', JSON.stringify({
      studentName: name.trim().slice(0, 60),
      examType,
      subject,
    }))
    router.push('/test')
  }

  return (
    <main className="min-h-screen bg-surface font-nunito flex flex-col">
      <div className="max-w-[480px] mx-auto w-full px-4 py-8 flex-1">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-brand rounded-[8px] flex items-center justify-center text-white font-black text-sm">L</div>
          <span className="font-black text-[16px] text-dark">Learniie</span>
          <span className="bg-brand-light text-brand text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-1">Exam Prep</span>
        </div>

        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-dark transition-colors mb-7">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </Link>

        <div className={`bg-white rounded-card border border-slate-100 shadow-card p-6 ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}>
          <h1 className="text-[22px] font-black text-dark mb-1">Set up your test</h1>
          <p className="text-[14px] text-muted mb-7">Fill in the fields below to get started</p>

          {/* Name */}
          <div className="mb-7">
            <Input
              id="student-name"
              label="What's your name?"
              type="text"
              value={name}
              maxLength={60}
              placeholder="e.g. Chidera Okafor"
              error={nameError}
              onChange={e => { setName(e.target.value); setNameError('') }}
            />
          </div>

          {/* Exam type */}
          <div className="mb-7">
            <p className="text-[13px] font-bold text-dark mb-3">Which exam are you preparing for?</p>
            <div className="grid grid-cols-3 gap-2.5">
              {EXAMS.map(e => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setExamType(e.id)}
                  className={`relative border-[1.5px] rounded-xl p-3 text-center cursor-pointer transition-all duration-150 active:scale-[.97]
                    ${examType === e.id
                      ? 'border-brand bg-brand-light scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-brand/40 hover:bg-brand-light/30'}`}
                >
                  {examType === e.id && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-brand rounded-full flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  <p className={`text-[17px] font-black ${examType === e.id ? 'text-brand' : 'text-dark'}`}>{e.id}</p>
                  <p className="text-[10px] text-muted mt-0.5">{e.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-8">
            <p className="text-[13px] font-bold text-dark mb-3">Choose a subject</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`border-[1.5px] rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-150 active:scale-[.97]
                    ${subject === s
                      ? 'border-brand bg-brand text-white'
                      : 'border-slate-200 bg-white text-dark hover:border-brand hover:text-brand'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleStart}
            disabled={!isReady}
            className={`w-full py-3.5 rounded-[10px] text-[15px] font-bold transition-all duration-150
              ${isReady
                ? 'bg-brand text-white hover:bg-brand-dark hover:shadow-brand-glow active:scale-[.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            {isReady ? 'Start Test →' : 'Complete all fields to continue'}
          </button>
          <p className="text-center text-[12px] text-muted mt-3">40 questions · No time limit · Results in under 30 minutes</p>
        </div>
      </div>
    </main>
  )
}
