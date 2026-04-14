import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function score(questions, answers, questionIds) {
  const map = new Map(questions.map(q => [q.id, q]))

  const review = questionIds.map((id, i) => {
    const q          = map.get(id)
    const student    = answers[id] ?? null
    const correct    = q?.correct_answer ?? null
    const answered   = student !== null
    const isCorrect  = answered && student === correct
    return {
      index:         i + 1,
      questionId:    id,
      questionText:  q?.question_text ?? '',
      optionA:       q?.option_a      ?? '',
      optionB:       q?.option_b      ?? '',
      optionC:       q?.option_c      ?? '',
      optionD:       q?.option_d      ?? '',
      correctAnswer: correct,
      studentAnswer: student,
      wasAnswered:   answered,
      isCorrect,
      explanation:   q?.explanation   ?? '',
      topicId:       q?.topic_id      ?? null,
      topicTitle:    q?.topic_title   ?? '',
      difficulty:    q?.difficulty    ?? 'medium',
    }
  })

  const total      = questionIds.length
  const correct    = review.filter(r => r.isCorrect).length
  const percentage = total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0

  // Topic breakdown
  const topicMap = new Map()
  review.forEach(r => {
    if (!r.topicId) return
    if (!topicMap.has(r.topicId)) topicMap.set(r.topicId, { topicId: r.topicId, topicTitle: r.topicTitle, items: [] })
    topicMap.get(r.topicId).items.push(r)
  })

  const topicResults = Array.from(topicMap.values()).map(t => {
    const tot = t.items.length
    const cor = t.items.filter(r => r.isCorrect).length
    const pct = Math.round((cor / tot) * 100)
    return {
      topicId: t.topicId, topicTitle: t.topicTitle,
      correct: cor, total: tot, percentage: pct,
      status: pct >= 70 ? 'strong' : pct >= 40 ? 'needs_work' : 'critical',
    }
  }).sort((a, b) => a.percentage - b.percentage)

  const recommendations = topicResults
    .filter(t => t.status !== 'strong')
    .slice(0, 3)
    .map(t => ({
      topicId: t.topicId, topicTitle: t.topicTitle,
      priority: t.status === 'critical' ? 1 : 2,
      message: t.status === 'critical'
        ? `Focus on ${t.topicTitle} first — you missed most questions here.`
        : `Review ${t.topicTitle} — there are gaps in your understanding.`,
    }))

  return { total, correct, percentage, topicResults, recommendations, review }
}

export async function POST(request) {
  // Parse
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { studentName, examType, subject, answers = {}, questionIds = [], timeTaken, cohortId, schoolStudentId } = body

  // Validate
  if (!studentName?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!examType?.trim())    return NextResponse.json({ error: 'Exam type is required' }, { status: 400 })
  if (!subject?.trim())     return NextResponse.json({ error: 'Subject is required' }, { status: 400 })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase      = getSupabase()
  const safeAnswers   = typeof answers === 'object' && answers !== null ? answers : {}
  const normSubject   = subject.trim().toLowerCase()
  const normExamType  = examType.trim().toUpperCase()

  // Determine which questions to fetch
  // Priority: use submitted questionIds (the exact 40 the student saw)
  // Fallback: fetch by subject+examType and pick 40 (handles stale IDs)
  let questions = []

  if (Array.isArray(questionIds) && questionIds.length > 0) {
    const { data } = await supabase
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
      .in('id', questionIds)
    questions = data || []
  }

  // Fallback: submitted IDs not found — fetch from DB and use those
  if (questions.length === 0) {
    const { data } = await supabase
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
      .eq('subject_id', normSubject)
      .eq('exam_type',  normExamType)
      .eq('verified',   true)
    questions = shuffle(data || []).slice(0, 40) // ALWAYS cap at 40
  }

  if (questions.length === 0) {
    return NextResponse.json({ error: `No questions found for ${normExamType} ${normSubject}` }, { status: 400 })
  }

  // Use submitted IDs if they matched, otherwise use the fetched question IDs
  // Always cap at 40
  const idsToScore = (
    questionIds.length > 0 && questions.length > 0 && questions.some(q => questionIds.includes(q.id))
      ? questionIds
      : questions.map(q => q.id)
  ).slice(0, 40)

  const scored = score(questions, safeAnswers, idsToScore)

  // Save session
  const { data: session, error: sErr } = await supabase
    .from('exam_sessions')
    .insert({
      student_name:      studentName.trim().slice(0, 60),
      exam_type:         normExamType,
      subject:           normSubject,
      total_questions:   scored.total,
      score:             scored.correct,
      percentage:        scored.percentage,
      time_taken:        typeof timeTaken === 'number' ? timeTaken : null,
      topic_results:     scored.topicResults,
      recommendations:   scored.recommendations,
      answers:           safeAnswers,
      question_review:   scored.review,
      cohort_id:         cohortId        || null,
      school_student_id: schoolStudentId || null,
    })
    .select('id, share_token')
    .single()

  if (sErr) {
    return NextResponse.json({ error: `Failed to save session: ${sErr.message}` }, { status: 500 })
  }

  // Save attempts (non-blocking)
  supabase.from('question_attempts')
    .insert(scored.review.map(r => ({
      session_id:      session.id,
      question_id:     r.questionId,
      selected_answer: r.studentAnswer || null,
      is_correct:      r.isCorrect,
    })))
    .then(() => {}).catch(() => {})

  return NextResponse.json({
    shareToken:      session.share_token,
    score:           scored.correct,
    totalQuestions:  scored.total,
    percentage:      scored.percentage,
    topicResults:    scored.topicResults,
    recommendations: scored.recommendations,
    questionReview:  scored.review,
  })
}