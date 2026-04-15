import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/study/check
// Study mode only — check a single answer after student commits.
// Returns:
//   isCorrect: bool
//   correctAnswer: always returned (after student has committed)
//   explanation: full explanation — only when correct
//   hint: per-option hint for the chosen wrong answer — only when wrong

export async function POST(request) {
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const { questionId, selectedAnswer, reveal } = body
  if (!questionId || (!selectedAnswer && !reveal)) {
    return NextResponse.json({ error: 'questionId and selectedAnswer required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase
    .from('questions')
    .select('id, correct_answer, explanation, option_hints')
    // reveal=true means student gave up — return correct answer + explanation unconditionally
    .eq('id', questionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  // reveal=true: student gave up — return correct answer + full explanation
  if (reveal) {
    return NextResponse.json({
      isCorrect:     false,
      correctAnswer: data.correct_answer,
      explanation:   data.explanation || null,
      hint:          null,
      revealed:      true,
    })
  }

  const isCorrect = selectedAnswer === data.correct_answer

  // Get hint for wrong answer — try option_hints first, then extract from explanation
  let hint = null
  if (!isCorrect) {
    if (data.option_hints && typeof data.option_hints === 'object') {
      hint = data.option_hints[selectedAnswer] || null
    }
    // Fallback: extract from ❌ section of explanation
    if (!hint && data.explanation) {
      hint = extractHintFromExplanation(data.explanation, selectedAnswer)
    }
    if (!hint) {
      hint = 'Think carefully about what this question is really asking — look at each option again.'
    }
  }

  return NextResponse.json({
    isCorrect,
    correctAnswer: data.correct_answer,
    explanation:   isCorrect ? (data.explanation || null) : null,
    hint:          isCorrect ? null : hint,
  })
}

function extractHintFromExplanation(explanation, letter) {
  if (!explanation) return null
  try {
    const wrongSection = (() => {
      const idx = explanation.indexOf('❌')
      return idx >= 0 ? explanation.slice(idx) : ''
    })()
    if (!wrongSection) return null
    // Look for "Option X" followed by explanation text
    const patterns = [
      new RegExp(`Option\\s+${letter}[:\\s—\\-]+([^\\n.]{10,120})`, 'i'),
      new RegExp(`\\*\\*${letter}\\)\\*\\*[:\\s—\\-]+([^\\n.]{10,120})`, 'i'),
      new RegExp(`${letter}[)\\.]\\s+([^\\n.]{10,120})`, 'i'),
    ]
    for (const p of patterns) {
      const m = wrongSection.match(p)
      if (m?.[1]) return m[1].trim().replace(/\*\*/g, '').slice(0, 130)
    }
  } catch {}
  return null
}