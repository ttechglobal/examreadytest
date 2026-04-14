import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function analyseResults(questions, answers) {
  const byTopic = questions.reduce((acc, q) => {
    acc[q.topic_id] = acc[q.topic_id] ?? []
    acc[q.topic_id].push(q)
    return acc
  }, {})

  const topicResults = Object.entries(byTopic).map(([topicId, qs]) => {
    const correct = qs.filter(q => answers[q.id] === q.correct_answer).length
    const total   = qs.length
    const pct     = Math.round((correct / total) * 100)
    return {
      topicId,
      topicTitle: qs[0].topic_title || 'Unknown topic',
      correct,
      total,
      percentage: pct,
      status: pct >= 70 ? 'strong' : pct >= 40 ? 'needs_work' : 'critical',
    }
  })

  const score = topicResults.reduce((sum, t) => sum + t.correct, 0)

  const recommendations = topicResults
    .filter(t => t.status !== 'strong')
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
    .map(t => ({
      topicId:    t.topicId,
      topicTitle: t.topicTitle,
      priority:   t.status === 'critical' ? 1 : 2,
      message:    t.status === 'critical'
        ? `Focus on ${t.topicTitle} first — you missed most questions here.`
        : `Review ${t.topicTitle} — there are gaps in your understanding.`,
    }))

  return { score, topicResults, recommendations }
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body', detail: String(e) }, { status: 400 })
  }

  const { studentName, examType, subject, answers, questionIds, timeTaken, cohortId, schoolStudentId } = body

  // Return the exact values received so we can debug
  if (!studentName || !examType || !subject) {
    return NextResponse.json({
      error: 'Missing required fields',
      received: { studentName, examType, subject, answerKeys: Object.keys(answers || {}).length }
    }, { status: 400 })
  }

  const safeAnswers = answers && typeof answers === 'object' ? answers : {}
  const idsToFetch  = Array.isArray(questionIds) && questionIds.length > 0
    ? questionIds
    : Object.keys(safeAnswers)

  if (!idsToFetch.length) {
    return NextResponse.json({ error: 'No question IDs to process' }, { status: 400 })
  }

  // Check env vars
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  const supabase = createServerClient()

  // Fetch questions
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
    .in('id', idsToFetch)

  if (qErr) {
    return NextResponse.json({ error: 'Question fetch failed', detail: qErr.message }, { status: 500 })
  }
  if (!questions?.length) {
    return NextResponse.json({ error: 'No questions found in DB for provided IDs', idCount: idsToFetch.length }, { status: 400 })
  }

  const { score, topicResults, recommendations } = analyseResults(questions, safeAnswers)
  const totalQuestions = questions.length
  const percentage     = parseFloat(((score / totalQuestions) * 100).toFixed(2))

  const questionReview = questions.map(q => ({
    questionId:    q.id,
    questionText:  q.question_text,
    optionA:       q.option_a,
    optionB:       q.option_b,
    optionC:       q.option_c,
    optionD:       q.option_d,
    correctAnswer: q.correct_answer,
    studentAnswer: safeAnswers[q.id] ?? null,
    isCorrect:     safeAnswers[q.id] === q.correct_answer,
    wasAnswered:   safeAnswers[q.id] != null,
    explanation:   q.explanation,
    topicTitle:    q.topic_title,
    difficulty:    q.difficulty,
  }))

  const { data: session, error: sErr } = await supabase
    .from('exam_sessions')
    .insert({
      student_name:      studentName.trim().slice(0, 60),
      exam_type:         examType.trim().toUpperCase(),
      subject:           subject.trim().toLowerCase(),
      total_questions:   totalQuestions,
      score,
      percentage,
      time_taken:        typeof timeTaken === 'number' ? timeTaken : null,
      topic_results:     topicResults,
      recommendations,
      answers:           safeAnswers,
      question_review:   questionReview,
      cohort_id:         cohortId        || null,
      school_student_id: schoolStudentId || null,
    })
    .select('id, share_token')
    .single()

  if (sErr) {
    return NextResponse.json({ error: 'Session insert failed', detail: sErr.message, code: sErr.code }, { status: 500 })
  }

  // Save attempts non-blocking
  supabase
    .from('question_attempts')
    .insert(questions.map(q => ({
      session_id:      session.id,
      question_id:     q.id,
      selected_answer: safeAnswers[q.id] || null,
      is_correct:      safeAnswers[q.id] === q.correct_answer,
    })))
    .then(() => {})
    .catch(() => {})

  return NextResponse.json({
    shareToken:    session.share_token,
    score,
    totalQuestions,
    percentage,
    topicResults,
    recommendations,
    questionReview,
  })
}