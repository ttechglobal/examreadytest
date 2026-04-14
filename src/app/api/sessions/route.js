import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// v3 - fully defensive

function getSupabase() {
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
      correct, total, percentage: pct,
      status: pct >= 70 ? 'strong' : pct >= 40 ? 'needs_work' : 'critical',
    }
  })

  const score = topicResults.reduce((sum, t) => sum + t.correct, 0)
  const recommendations = topicResults
    .filter(t => t.status !== 'strong')
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
    .map(t => ({
      topicId: t.topicId, topicTitle: t.topicTitle,
      priority: t.status === 'critical' ? 1 : 2,
      message: t.status === 'critical'
        ? `Focus on ${t.topicTitle} first — you missed most questions here.`
        : `Review ${t.topicTitle} — there are gaps in your understanding.`,
    }))

  return { score, topicResults, recommendations }
}

export async function POST(request) {
  // Step 1: parse body
  let body
  try { body = await request.json() }
  catch (e) { return NextResponse.json({ error: 'Invalid JSON', detail: String(e) }, { status: 400 }) }

  const {
    studentName, examType, subject,
    answers = {}, questionIds = [],
    timeTaken, cohortId, schoolStudentId,
  } = body

  // Step 2: validate required fields
  if (!studentName?.trim()) return NextResponse.json({ error: 'studentName missing' }, { status: 400 })
  if (!examType?.trim())    return NextResponse.json({ error: 'examType missing' }, { status: 400 })
  if (!subject?.trim())     return NextResponse.json({ error: 'subject missing' }, { status: 400 })

  // Step 3: build ID list — prefer questionIds (all 40), fall back to answered keys
  const safeAnswers  = typeof answers === 'object' && answers !== null ? answers : {}
  const answeredIds  = Object.keys(safeAnswers)
  const allIds       = Array.isArray(questionIds) && questionIds.length > 0 ? questionIds : answeredIds

  if (allIds.length === 0) {
    return NextResponse.json({ error: 'No question IDs — answers and questionIds both empty' }, { status: 400 })
  }

  // Step 4: check env vars
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL)    return NextResponse.json({ error: 'Env missing: NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)   return NextResponse.json({ error: 'Env missing: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })

  const supabase = getSupabase()

  // Step 5: fetch questions — NO verified filter, fetch by ID only
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
    .in('id', allIds)

  if (qErr) return NextResponse.json({ error: 'DB error fetching questions', detail: qErr.message }, { status: 500 })

  if (!questions || questions.length === 0) {
    // Try to diagnose — check if ANY questions exist
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true })
    return NextResponse.json({
      error: 'No questions found for submitted IDs',
      submittedIdCount: allIds.length,
      sampleId: allIds[0],
      totalQuestionsInDB: count,
    }, { status: 400 })
  }

  // Step 6: score
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

  // Step 7: insert session
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

  if (sErr) return NextResponse.json({ error: 'Session insert failed', detail: sErr.message, code: sErr.code }, { status: 500 })

  // Step 8: attempts (non-blocking)
  supabase.from('question_attempts').insert(
    questions.map(q => ({
      session_id:      session.id,
      question_id:     q.id,
      selected_answer: safeAnswers[q.id] || null,
      is_correct:      safeAnswers[q.id] === q.correct_answer,
    }))
  ).then(() => {}).catch(() => {})

  return NextResponse.json({
    shareToken: session.share_token,
    score, totalQuestions, percentage,
    topicResults, recommendations, questionReview,
  })
}