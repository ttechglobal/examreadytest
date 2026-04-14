import { NextResponse } from 'next/server'

const _INSTRUCTION_PATTERNS = [
  /^choose\s+(the\s+)?correct\s+(option|answer)[:\.\s]*/i,
  /^choose\s+your\s+question\s+type[:\.\s]*/i,
  /^select\s+(the\s+)?correct\s+(option|answer)[:\.\s]*/i,
  /^\d+[\.\)]\s*/,
  /^question\s+\d+[\.\):\s]*/i,
]
function cleanQuestionText(text) {
  if (!text) return ''
  let c = text.trim()
  _INSTRUCTION_PATTERNS.forEach(p => { c = c.replace(p, '') })
  return c.trim()
}
function cleanOptionText(text) {
  if (!text) return ''
  return text.trim().replace(/^[A-Ea-e][\.\)]\s+/, '').trim()
}


const REQUIRED = ['questionText','optionA','optionB','optionC','optionD','correctAnswer','topic','difficulty','explanation']
const VALID_ANSWERS = ['A','B','C','D']
const VALID_DIFFICULTIES = ['easy','medium','hard']

export async function POST(request) {
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { rawJson } = body
  if (!rawJson?.trim()) return NextResponse.json({ error: 'No JSON provided' }, { status: 400 })

  // Strip markdown fences Claude sometimes adds despite being told not to
  let clean = rawJson.trim()
    .replace(/^```json?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  let parsed
  try { parsed = JSON.parse(clean) }
  catch (err) {
    return NextResponse.json({
      error: 'Invalid JSON',
      detail: `Parse error: ${err.message}. Make sure you copied the complete response from Claude.`,
    }, { status: 422 })
  }

  if (!Array.isArray(parsed)) {
    return NextResponse.json({
      error: 'Wrong structure',
      detail: 'Expected a JSON array at the top level. Make sure you used the exact extraction prompt.',
    }, { status: 422 })
  }

  if (parsed.length === 0) {
    return NextResponse.json({ error: 'Empty array — no questions found.' }, { status: 422 })
  }

  const questions = []
  const warnings  = []

  for (let i = 0; i < parsed.length; i++) {
    const q = parsed[i]
    const missing = REQUIRED.filter(f => !q[f] || typeof q[f] !== 'string' || !q[f].trim())

    if (missing.length) {
      return NextResponse.json({
        error: `Question ${i + 1} is missing: ${missing.join(', ')}`,
        detail: 'Every question must have all required fields. Check that you used the exact extraction prompt.',
      }, { status: 422 })
    }

    const answer = q.correctAnswer.trim().toUpperCase()
    if (!VALID_ANSWERS.includes(answer)) {
      return NextResponse.json({
        error: `Question ${i + 1}: correctAnswer must be A, B, C, or D — got "${q.correctAnswer}"`,
      }, { status: 422 })
    }

    let difficulty = q.difficulty.trim().toLowerCase()
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      warnings.push(`Q${i + 1}: difficulty "${q.difficulty}" is invalid, defaulted to "medium"`)
      difficulty = 'medium'
    }

    questions.push({
      questionText:  cleanQuestionText(q.questionText),
      optionA:       cleanOptionText(q.optionA),
      optionB:       cleanOptionText(q.optionB),
      optionC:       cleanOptionText(q.optionC),
      optionD:       cleanOptionText(q.optionD),
      // optionE deliberately excluded — system only supports A-D
      correctAnswer: answer,
      topic:         q.topic.trim(),
      difficulty,
      explanation:   q.explanation.trim(),
    })
  }

  return NextResponse.json({ questions, warnings, count: questions.length })
}
