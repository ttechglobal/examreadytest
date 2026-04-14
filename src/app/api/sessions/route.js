import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Supabase ──────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── Scorer (inlined — no @/lib import) ───────────────────────

function scoreSession({ questions, answers, questionIds }) {
  const questionMap = new Map(questions.map(q => [q.id, q]))

  const questionReview = questionIds.map((qId, index) => {
    const q           = questionMap.get(qId)
    const studentAns  = answers[qId] ?? null
    const correctAns  = q?.correct_answer ?? null
    const wasAnswered = studentAns !== null
    const isCorrect   = wasAnswered && studentAns === correctAns
    return {
      index:         index + 1,
      questionId:    qId,
      questionText:  q?.question_text ?? '',
      optionA:       q?.option_a      ?? '',
      optionB:       q?.option_b      ?? '',
      optionC:       q?.option_c      ?? '',
      optionD:       q?.option_d      ?? '',
      correctAnswer: correctAns,
      studentAnswer: studentAns,
      wasAnswered,
      isCorrect,
      explanation:   q?.explanation   ?? '',
      topicId:       q?.topic_id      ?? null,
      topicTitle:    q?.topic_title   ?? '',
      difficulty:    q?.difficulty    ?? 'medium',
    }
  })

  const totalQuestions = questionIds.length
  const score          = questionReview.filter(q => q.isCorrect).length
  const percentage     = totalQuestions > 0
    ? parseFloat(((score / totalQuestions) * 100).toFixed(2))
    : 0

  const topicMap = new Map()
  questionReview.forEach(q => {
    if (!q.topicId) return
    if (!topicMap.has(q.topicId)) topicMap.set(q.topicId, { topicId: q.topicId, topicTitle: q.topicTitle, qs: [] })
    topicMap.get(q.topicId).qs.push(q)
  })

  const topicResults = Array.from(topicMap.values()).map(t => {
    const total   = t.qs.length
    const correct = t.qs.filter(q => q.isCorrect).length
    const pct     = Math.round((correct / total) * 100)
    return { topicId: t.topicId, topicTitle: t.topicTitle, correct, total, percentage: pct, status: pct >= 70 ? 'strong' : pct >= 40 ? 'needs_work' : 'critical' }
  }).sort((a, b) => a.percentage - b.percentage)

  const recommendations = topicResults
    .filter(t => t.status !== 'strong')
    .slice(0, 3)
    .map(t => ({
      topicId: t.topicId, topicTitle: t.topicTitle, priority: t.status === 'critical' ? 1 : 2,
      message: t.status === 'critical'
        ? `Focus on ${t.topicTitle} first — you missed most questions here.`
        : `Review ${t.topicTitle} — there are gaps in your understanding.`,
    }))

  return { totalQuestions, score, percentage, topicResults, recommendations, questionReview }
}

// ── Route ─────────────────────────────────────────────────────

export async function POST(request) {
  // 1. Parse body
  let body
  try { body = await request.json() }
  catch (e) { return NextResponse.json({ error: 'Invalid JSON', detail: String(e) }, { status: 400 }) }

  const {
    studentName, examType, subject,
    answers    = {},
    questionIds = [],
    timeTaken, cohortId, schoolStudentId,
  } = body

  // 2. Validate
  if (!studentName?.trim()) return NextResponse.json({ error: 'studentName is required' }, { status: 400 })
  if (!examType?.trim())    return NextResponse.json({ error: 'examType is required' }, { status: 400 })
  if (!subject?.trim())     return NextResponse.json({ error: 'subject is required' }, { status: 400 })
  if (!Array.isArray(questionIds) || questionIds.length === 0)
    return NextResponse.json({ error: 'questionIds array is required — must be the list of question IDs shown to the student' }, { status: 400 })

  // 3. Env check
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL)  return NextResponse.json({ error: 'Missing env: NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Missing env: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })

  const safeAnswers = typeof answers === 'object' && answers !== null ? answers : {}
  const supabase    = getSupabase()

  // 4. Fetch EXACTLY these questions by ID — never re-run selector
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
    .in('id', questionIds)

  if (qErr) {
    return NextResponse.json({ error: 'DB error fetching questions', detail: qErr.message }, { status: 500 })
  }

  if (!questions || questions.length === 0) {
    // Diagnostic: check total count so we know if DB is empty or IDs are wrong
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true })
    return NextResponse.json({
      error: 'No questions found for the submitted IDs',
      detail: `Submitted ${questionIds.length} IDs but found 0 in DB. Total questions in DB: ${count}. Sample submitted ID: ${questionIds[0]}`,
    }, { status: 400 })
  }

  // 5. Score
  const scored = scoreSession({ questions, answers: safeAnswers, questionIds })

  // 6. Save session
  const { data: session, error: sErr } = await supabase
    .from('exam_sessions')
    .insert({
      student_name:      studentName.trim().slice(0, 60),
      exam_type:         examType.trim().toUpperCase(),
      subject:           subject.trim().toLowerCase(),
      total_questions:   scored.totalQuestions,
      score:             scored.score,
      percentage:        scored.percentage,
      time_taken:        typeof timeTaken === 'number' ? timeTaken : null,
      topic_results:     scored.topicResults,
      recommendations:   scored.recommendations,
      answers:           safeAnswers,
      question_review:   scored.questionReview,
      cohort_id:         cohortId        || null,
      school_student_id: schoolStudentId || null,
    })
    .select('id, share_token')
    .single()

  if (sErr) {
    return NextResponse.json({ error: 'Session insert failed', detail: sErr.message, code: sErr.code }, { status: 500 })
  }

  // 7. Save attempts (non-blocking)
  supabase.from('question_attempts')
    .insert(scored.questionReview.map(q => ({
      session_id:      session.id,
      question_id:     q.questionId,
      selected_answer: q.studentAnswer || null,
      is_correct:      q.isCorrect,
    })))
    .then(() => {}).catch(() => {})

  // 8. Return full result
  return NextResponse.json({
    shareToken:     session.share_token,
    score:          scored.score,
    totalQuestions: scored.totalQuestions,
    percentage:     scored.percentage,
    topicResults:   scored.topicResults,
    recommendations: scored.recommendations,
    questionReview:  scored.questionReview,
  })
}