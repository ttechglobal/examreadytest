'use client'
import { useState } from 'react'
import { MathText } from '@/components/ui/MathText'
import { ExplanationCard } from '@/components/exam/ExplanationCard'

const TABS = [
  { id: 'all',        label: 'All'          },
  { id: 'correct',    label: 'Correct'      },
  { id: 'wrong',      label: 'Wrong'        },
  { id: 'unanswered', label: 'Not answered' },
]

function QuestionCard({ item, globalIndex }) {
  const [open,         setOpen]         = useState(false)
  const [showExplain,  setShowExplain]  = useState(false)

  const status = item.isCorrect
    ? { label: 'Correct ✓',    bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' }
    : item.studentAnswer
    ? { label: 'Wrong ✗',      bg: '#FFF1F2', text: '#B91C1C', dot: '#EF4444' }
    : { label: 'Not answered', bg: '#F8FAFC', text: '#6B7280', dot: '#D1D5DB' }

  return (
    <div style={{
      border: `1px solid ${open ? '#C7D2FE' : '#E8EAED'}`,
      borderRadius: 14, overflow: 'hidden', background: '#fff',
      transition: 'border-color 0.15s', marginBottom: 8,
    }}>
      {/* ── Collapsed row ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: status.dot, flexShrink: 0 }}/>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#94A3B8', minWidth: 26, flexShrink: 0 }}>
          Q{globalIndex + 1}
        </span>
        <span style={{ fontSize: 14, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.questionText.slice(0, 88)}{item.questionText.length > 88 ? '…' : ''}
        </span>
        {item.studentAnswer && !item.isCorrect && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: '#FFF1F2', color: '#B91C1C', flexShrink: 0 }}>
            You: {item.studentAnswer}
          </span>
        )}
        {!item.isCorrect && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: '#F0FDF4', color: '#15803D', flexShrink: 0 }}>
            Ans: {item.correctAnswer}
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: status.bg, color: status.text, flexShrink: 0 }}>
          {status.label}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94A3B8' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Expanded body ── */}
      {open && (
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '18px 18px 20px' }}>
          {/* Topic pill */}
          {item.topicTitle && (
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 99, background: '#EEF0FE', color: '#2D3CE6' }}>
                {item.topicTitle}
              </span>
            </div>
          )}

          {/* Full question */}
          <div style={{ fontSize: 17, fontWeight: 600, color: '#0A0A0A', lineHeight: 1.7, marginBottom: 16 }}>
            <MathText>{item.questionText}</MathText>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {['A','B','C','D'].map(letter => {
              const isCorrect = letter === item.correctAnswer
              const isWrong   = letter === item.studentAnswer && !isCorrect
              let bg = '#F8FAFC', border = '#E8EAED', textColor = '#374151', tag = null
              if (isCorrect) { bg = '#F0FDF4'; border = '#86EFAC'; textColor = '#15803D'; tag = '✓ Correct answer' }
              if (isWrong)   { bg = '#FFF1F2'; border = '#FCA5A5'; textColor = '#B91C1C'; tag = '✗ Your answer'    }
              return (
                <div key={letter} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: bg, border: `1.5px solid ${border}` }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: isCorrect ? '#22C55E' : isWrong ? '#EF4444' : '#E2E8F0', color: isCorrect || isWrong ? '#fff' : '#94A3B8', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {letter}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: textColor, fontWeight: isCorrect || isWrong ? 600 : 400, lineHeight: 1.6 }}>
                      <MathText>{item[`option${letter}`]}</MathText>
                    </div>
                    {tag && <p style={{ fontSize: 11, fontWeight: 700, color: isCorrect ? '#15803D' : '#B91C1C', margin: '3px 0 0' }}>{tag}</p>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* See explanation toggle */}
          <div>
            <button
              onClick={() => setShowExplain(v => !v)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 99,
                border: '1.5px solid #2D3CE6', background: showExplain ? '#2D3CE6' : '#fff',
                color: showExplain ? '#fff' : '#2D3CE6',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.15s', marginBottom: 14,
              }}
            >
              <span>💡</span>
              {showExplain ? 'Hide explanation' : 'See why →'}
            </button>

            {/* Smooth expand */}
            <div className={`explanation-expand ${showExplain ? 'open' : 'closed'}`}>
              {showExplain && (
                <ExplanationCard
                  explanation={item.explanation}
                  isCorrect={item.isCorrect}
                  correctAnswer={item.correctAnswer}
                  studentAnswer={item.studentAnswer}
                  subject={subject}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AnswerReview({ questionReview, subject }) {
  const [activeTab, setActiveTab] = useState('all')
  const [visible,   setVisible]   = useState(false)

  if (!questionReview?.length) return null

  const counts = {
    all:        questionReview.length,
    correct:    questionReview.filter(q => q.isCorrect).length,
    wrong:      questionReview.filter(q => !q.isCorrect && q.studentAnswer).length,
    unanswered: questionReview.filter(q => !q.studentAnswer).length,
  }

  const filtered = {
    all:        questionReview,
    correct:    questionReview.filter(q => q.isCorrect),
    wrong:      questionReview.filter(q => !q.isCorrect && q.studentAnswer),
    unanswered: questionReview.filter(q => !q.studentAnswer),
  }[activeTab]

  return (
    <div className="student-page" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EAED', overflow: 'hidden', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontWeight: 900, fontSize: 18, color: '#0A0A0A', margin: '0 0 3px' }}>Review your answers</p>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>See what you got right, what you got wrong, and why.</p>
        </div>
        <button
          onClick={() => setVisible(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: `1.5px solid #2D3CE6`, borderRadius: 10, background: visible ? '#2D3CE6' : '#fff', color: visible ? '#fff' : '#2D3CE6', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
        >
          {visible ? 'Collapse' : 'Review answers →'}
        </button>
      </div>

      {visible && (
        <div style={{ padding: '16px 20px' }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${activeTab === tab.id ? '#2D3CE6' : '#E2E8F0'}`, background: activeTab === tab.id ? '#EEF0FE' : '#fff', color: activeTab === tab.id ? '#2D3CE6' : '#6B7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {tab.label}
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: activeTab === tab.id ? '#2D3CE6' : '#F1F5F9', color: activeTab === tab.id ? '#fff' : '#6B7280' }}>
                  {counts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          {/* Cards */}
          {filtered.length === 0
            ? <p style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: '32px 0' }}>No questions in this category.</p>
            : filtered.map(item => (
                <QuestionCard
                  key={item.questionId}
                  item={item}
                  globalIndex={questionReview.indexOf(item)}
                />
              ))
          }
        </div>
      )}
    </div>
  )
}