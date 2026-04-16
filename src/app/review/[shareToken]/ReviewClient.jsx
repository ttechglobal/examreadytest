'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MathText } from '@/components/ui/MathText'
import { ExplanationCard } from '@/components/exam/ExplanationCard'

const FILTERS = [
  { id: 'all',        label: 'All'        },
  { id: 'correct',    label: 'Correct'    },
  { id: 'wrong',      label: 'Wrong'      },
  { id: 'unanswered', label: 'Unanswered' },
]

// ─── Option button (display-only in review mode) ──────────────
function ReviewOption({ letter, text, state }) {
  // state: 'correct' | 'wrong' | 'correct-answer' | 'neutral'
  const styles = {
    correct: {
      bg: '#F0FDF4', border: '#86EFAC', textColor: '#15803D',
      badge: { bg: '#22C55E', color: '#fff' }, label: '✓ Correct',
    },
    wrong: {
      bg: '#FFF1F2', border: '#FCA5A5', textColor: '#B91C1C',
      badge: { bg: '#EF4444', color: '#fff' }, label: '✗ Your answer',
    },
    'correct-answer': {
      bg: '#F0FDF4', border: '#86EFAC', textColor: '#15803D',
      badge: { bg: '#22C55E', color: '#fff' }, label: '✓ Correct answer',
    },
    neutral: {
      bg: '#F8FAFC', border: '#E2E8F0', textColor: '#374151',
      badge: { bg: '#E2E8F0', color: '#64748B' }, label: null,
    },
  }[state] || styles.neutral

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 16px', borderRadius: 12,
      background: styles.bg, border: `1.5px solid ${styles.border}`,
      marginBottom: 8,
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: styles.badge.bg, color: styles.badge.color,
        fontWeight: 800, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {letter}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: styles.textColor, lineHeight: 1.65 }}>
          <MathText>{text}</MathText>
        </div>
        {styles.label && (
          <p style={{ fontSize: 12, fontWeight: 700, color: styles.textColor, margin: '4px 0 0' }}>
            {styles.label}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Question Navigator Grid ──────────────────────────────────
function Navigator({ review, currentIdx, activeFilter, onJump, onFilterChange }) {
  const counts = {
    all:        review.length,
    correct:    review.filter(q => q.isCorrect).length,
    wrong:      review.filter(q => !q.isCorrect && q.studentAnswer).length,
    unanswered: review.filter(q => !q.studentAnswer).length,
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, padding: 18 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Question Navigator
      </p>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginBottom: 16 }}>
        {review.map((q, i) => {
          const isCurrent = i === currentIdx
          const isDimmed  = activeFilter !== 'all' && (
            (activeFilter === 'correct'    && !q.isCorrect) ||
            (activeFilter === 'wrong'      && (q.isCorrect || !q.studentAnswer)) ||
            (activeFilter === 'unanswered' && q.studentAnswer)
          )
          let bg = '#F1F5F9', color = '#64748B', border = '#E2E8F0'
          if (q.isCorrect)                      { bg = '#DCFCE7'; color = '#15803D'; border = '#86EFAC' }
          else if (!q.isCorrect && q.studentAnswer) { bg = '#FEE2E2'; color = '#B91C1C'; border = '#FCA5A5' }
          else if (!q.studentAnswer)             { bg = '#FEF3C7'; color = '#92400E'; border = '#FCD34D' }

          return (
            <button key={i} onClick={() => onJump(i)}
              style={{
                aspectRatio: '1', borderRadius: 7,
                fontSize: 11, fontWeight: 700,
                background: isCurrent ? '#2D3CE6' : bg,
                color: isCurrent ? '#fff' : color,
                border: `1.5px solid ${isCurrent ? '#2D3CE6' : border}`,
                cursor: 'pointer', transition: 'all 0.1s',
                opacity: isDimmed ? 0.3 : 1,
                outline: isCurrent ? '2px solid #2D3CE6' : 'none',
                outlineOffset: 2,
              }}>
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
        {[
          { label: 'Correct',     count: counts.correct,    bg: '#DCFCE7', color: '#15803D' },
          { label: 'Wrong',       count: counts.wrong,      bg: '#FEE2E2', color: '#B91C1C' },
          { label: 'Unanswered',  count: counts.unanswered, bg: '#FEF3C7', color: '#92400E' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', borderRadius: 8, background: s.bg }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Filter
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => onFilterChange(f.id)}
            style={{ padding: '5px 11px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: `1.5px solid ${activeFilter === f.id ? '#2D3CE6' : '#E2E8F0'}`, background: activeFilter === f.id ? '#EEF0FE' : '#fff', color: activeFilter === f.id ? '#2D3CE6' : '#6B7280' }}>
            {f.label}
            <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: activeFilter === f.id ? '#2D3CE6' : '#F1F5F9', color: activeFilter === f.id ? '#fff' : '#94A3B8' }}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main review client ────────────────────────────────────────
export default function ReviewClient({ session, shareToken }) {
  const router = useRouter()
  const review = session.question_review || session.questionReview || []

  const [currentIdx,   setCurrentIdx]   = useState(0)
  const [showExplain,  setShowExplain]  = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const current = review[currentIdx]
  const isLast  = currentIdx === review.length - 1
  const isFirst = currentIdx === 0

  // Auto-jump to first unanswered when arriving via ?filter=unanswered
  useEffect(() => {
    if (activeFilter === 'unanswered') {
      const firstUnanswered = review.findIndex(q => !q.studentAnswer)
      if (firstUnanswered !== -1) setCurrentIdx(firstUnanswered)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' && !isLast)  { setCurrentIdx(i => i + 1); setShowExplain(false) }
      if (e.key === 'ArrowLeft'  && !isFirst) { setCurrentIdx(i => i - 1); setShowExplain(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isLast, isFirst])

  function goTo(i) { setCurrentIdx(i); setShowExplain(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function next()  { if (!isLast)  goTo(currentIdx + 1) }
  function prev()  { if (!isFirst) goTo(currentIdx - 1) }

  function getOptionState(letter) {
    if (!current) return 'neutral'
    const isCorrect = letter === current.correctAnswer
    const isStudent = letter === current.studentAnswer
    if (isCorrect && isStudent) return 'correct'           // got it right
    if (isCorrect && !isStudent) return 'correct-answer'   // correct but not picked
    if (!isCorrect && isStudent) return 'wrong'            // student's wrong pick
    return 'neutral'
  }

  const correctCount    = review.filter(q => q.isCorrect).length
  const wrongCount      = review.filter(q => !q.isCorrect && q.studentAnswer).length
  const unansweredCount = review.filter(q => !q.studentAnswer).length

  if (!current) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', color: '#374151', flexDirection: 'column', gap: 16 }}>
        <p>No review data available.</p>
        <Link href={`/results/${shareToken}`} style={{ color: '#2D3CE6', fontWeight: 700 }}>← Back to results</Link>
      </div>
    )
  }

  return (
    <div className="student-page" style={{ minHeight: '100vh', background: '#F8FAFC' }}>

      {/* ── Sticky header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E8EAED',
        padding: '0 20px', height: 56,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Link href={`/results/${shareToken}`}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#64748B', textDecoration: 'none', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Results
        </Link>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
            Review Mode
          </span>
          <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 8 }}>
            Q {currentIdx + 1} / {review.length}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#DCFCE7', color: '#15803D' }}>
            ✓ {correctCount}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#FEE2E2', color: '#B91C1C' }}>
            ✗ {wrongCount}
          </span>
          {unansweredCount > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#FEF3C7', color: '#92400E' }}>
              — {unansweredCount}
            </span>
          )}
        </div>
      </header>

      {/* ── Main layout ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20 }}
        className="review-layout">
        <style>{`@media(max-width:768px){.review-layout{grid-template-columns:1fr!important}}`}</style>

        {/* ── Left: Question ── */}
        <div>
          {/* Topic + number */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
            {current.topicTitle && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: '#EEF0FE', color: '#2D3CE6' }}>
                {current.topicTitle}
              </span>
            )}
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
              Question {currentIdx + 1}
            </span>
            {current.difficulty && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: { easy: '#F0FDF4', medium: '#FEF3C7', hard: '#FFF1F2' }[current.difficulty] || '#F8FAFC', color: { easy: '#15803D', medium: '#D97706', hard: '#B91C1C' }[current.difficulty] || '#64748B' }}>
                {current.difficulty}
              </span>
            )}
          </div>

          {/* Unanswered banner */}
          {!current.studentAnswer && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#92400E' }}>
              You didn't answer this question
            </div>
          )}

          {/* Question text */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EAED', padding: '22px 24px', marginBottom: 16 }}>
            <MathText as="p" className="question-text" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.85, color: '#0A0A0A', margin: 0 }}>
              {current.questionText}
            </MathText>
          </div>

          {/* Options */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EAED', padding: '18px 20px', marginBottom: 16 }}>
            {['A','B','C','D'].map(letter => (
              <ReviewOption
                key={letter}
                letter={letter}
                text={current[`option${letter}`]}
                state={getOptionState(letter)}
              />
            ))}
          </div>

          {/* See explanation toggle */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowExplain(v => !v)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 99,
                border: '1.5px solid #2D3CE6',
                background: showExplain ? '#2D3CE6' : '#fff',
                color: showExplain ? '#fff' : '#2D3CE6',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s', marginBottom: 14,
              }}
            >
              💡 {showExplain ? 'Hide explanation' : 'See explanation'}
            </button>

            <div className={`explanation-expand ${showExplain ? 'open' : 'closed'}`}>
              {showExplain && (
                <ExplanationCard
                  explanation={current.explanation}
                  isCorrect={current.isCorrect}
                  correctAnswer={current.correctAnswer}
                  studentAnswer={current.studentAnswer}
                  subject={session?.subject}
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={prev} disabled={isFirst}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#fff', fontSize: 14, fontWeight: 700, color: isFirst ? '#C4C4C4' : '#374151', cursor: isFirst ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Previous
            </button>

            <span style={{ flex: 1, textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
              {currentIdx + 1} of {review.length}
            </span>

            {isLast ? (
              <Link href={`/results/${shareToken}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', border: 'none', borderRadius: 10, background: '#2D3CE6', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
                Back to results
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            ) : (
              <button onClick={next}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', border: 'none', borderRadius: 10, background: '#2D3CE6', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                Next
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Navigator ── */}
        <div>
          <Navigator
            review={review}
            currentIdx={currentIdx}
            activeFilter={activeFilter}
            onJump={goTo}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>
    </div>
  )
}