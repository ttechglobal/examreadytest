import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function scoreSession({ questions, answers, questionIds }) {
  const questionMap = new Map(questions.map(q => [q.id, q]))

  const questionReview = questionIds.map((qId, index) => {
    const q           = questionMap.get(qId)
    const studentAns  = answers[qId] ?? null
    const correctAns  = q?.correct_answer ?? null
    const wasAnswered = studentAns !== null
    const isCorrect   = wasAnswered && studentAns === correctAns
    return {
      index: index + 1, questionId: qId,
      questionText:  q?.question_text ?? '',
      optionA: q?.option_a ?? '', optionB: q?.option_b ?? '',
      optionC: q?.option_c ?? '', optionD: q?.option_d ?? '',
      correctAnswer: correctAns, studentAnswer: studentAns,
      wasAnswered, isCorrect,
      explanation: q?.explanation ?? '',
      topicId:     q?.topic_id    ?? null,
      topicTitle:  q?.topic_title ?? '',
      difficulty:  q?.difficulty  ?? 'medium',
    }
  })

  const totalQuestions = questionIds.length
  const score          = questionReview.filter(q => q.isCorrect).length
  const percentage     = totalQuestions > 0
    ? parseFloat(((score / totalQuestions) * 100).toFixed(2)) : 0

  const topicMap = new Map()
  questionReview.forEach(q => {
    if (!q.topicId) return
    if (!topicMap.has(q.topicId)) topicMap.set(q.topicId, { topicId: q.topicId, topicTitle: q.topicTitle, qs: [] })
    topicMap.get(q.topicId).qs.push(q)
  })

  const topicResults = Array.from(topicMap.values()).map(t => {
    const total = t.qs.length
    const correct = t.qs.filter(q => q.isCorrect).length
    const pct = Math.round((correct / total) * 100)
    return { topicId: t.topicId, topicTitle: t.topicTitle, correct, total, percentage: pct,
      status: pct >= 70 ? 'strong' : pct >= 40 ? 'needs_work' : 'critical' }
  }).sort((a, b) => a.percentage - b.percentage)

  const recommendations = topicResults.filter(t => t.status !== 'strong').slice(0, 3).map(t => ({
    topicId: t.topicId, topicTitle: t.topicTitle, priority: t.status === 'critical' ? 1 : 2,
    message: t.status === 'critical'
      ? `Focus on ${t.topicTitle} first — you missed most questions here.`
      : `Review ${t.topicTitle} — there are gaps in your understanding.`,
  }))

  return { totalQuestions, score, percentage, topicResults, recommendations, questionReview }
}

function scoreFallback({ questions, answers }) {
  // When submitted IDs don't match DB — score using DB questions as the test
  // answers won't match but we save correctly and student sees results
  const safeAnswers = answers || {}
  const questionIds = questions.map(q => q.id)
  return scoreSession({ questions, answers: safeAnswers, questionIds })
}

export async function POST(request) {
  let body
  try { body = await request.json() }
  catch (e) { return NextResponse.json({ error: 'Invalid JSON', detail: String(e) }, { status: 400 }) }

  const {
    studentName, examType, subject,
    answers    = {},
    questionIds = [],
    timeTaken, cohortId, schoolStudentId,
  } = body

  if (!studentName?.trim()) return NextResponse.json({ error: 'studentName is required' }, { status: 400 })
  if (!examType?.trim())    return NextResponse.json({ error: 'examType is required' }, { status: 400 })
  if (!subject?.trim())     return NextResponse.json({ error: 'subject is required' }, { status: 400 })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL)  return NextResponse.json({ error: 'Missing env: NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Missing env: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })

  const safeAnswers  = typeof answers === 'object' && answers !== null ? answers : {}
  const supabase     = getSupabase()
  const normSubject  = subject.trim().toLowerCase()
  const normExamType = examType.trim().toUpperCase()

  let finalQuestions = []
  let usedFallback   = false

  // Try 1: fetch exactly the submitted IDs
  if (Array.isArray(questionIds) && questionIds.length > 0) {
    const { data } = await supabase
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
      .in('id', questionIds)
    finalQuestions = data || []
  }

  // Try 2: IDs not found — fetch by subject+examType (student gets correct questions from live DB)
  if (finalQuestions.length === 0) {
    usedFallback = true
    const { data } = await supabase
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
      .eq('subject_id', normSubject)
      .eq('exam_type', normExamType)
      .eq('verified', true)
    finalQuestions = data || []
  }

  // Still nothing — genuine error
  if (finalQuestions.length === 0) {
    return NextResponse.json({
      error: `No questions found for ${normExamType} ${normSubject}. Please check that questions have been uploaded for this subject.`,
    }, { status: 400 })
  }

  // Score — if fallback, answers won't match (score = 0) but session saves correctly
  const idsToScore = usedFallback
    ? finalQuestions.map(q => q.id)   // use DB IDs
    : questionIds                      // use submitted IDs (matched)

  const scored = scoreSession({ questions: finalQuestions, answers: safeAnswers, questionIds: idsToScore })

  const { data: session, error: sErr } = await supabase
    .from('exam_sessions')
    .insert({
      student_name:      studentName.trim().slice(0, 60),
      exam_type:         normExamType,
      subject:           normSubject,
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

  supabase.from('question_attempts')
    .insert(scored.questionReview.map(q => ({
      session_id:      session.id,
      question_id:     q.questionId,
      selected_answer: q.studentAnswer || null,
      is_correct:      q.isCorrect,
    })))
    .then(() => {}).catch(() => {})

  return NextResponse.json({
    shareToken:      session.share_token,
    score:           scored.score,
    totalQuestions:  scored.totalQuestions,
    percentage:      scored.percentage,
    topicResults:    scored.topicResults,
    recommendations: scored.recommendations,
    questionReview:  scored.questionReview,
  })
}