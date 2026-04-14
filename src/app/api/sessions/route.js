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
  // Check env vars first — surface misconfiguration clearly
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env vars')
    return NextResponse.json({ error: 'Server misconfiguration — missing Supabase credentials' }, { status: 500 })
  }

  let body
  try { body = await request.json() }
  catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { studentName, examType, subject, answers, timeTaken, cohortId, schoolStudentId } = body

  // Log what arrived — helps diagnose Vercel-specific issues
  console.log('Session submit received:', {
    studentName: studentName ? `"${String(studentName).slice(0,20)}"` : 'MISSING',
    examType:    examType    ? `"${examType}"` : 'MISSING',
    subject:     subject     ? `"${subject}"` : 'MISSING',
    answerCount: answers     ? Object.keys(answers).length : 0,
  })

  // Validation — permissive on examType (accept any non-empty string)
  if (!studentName?.trim() || studentName.trim().length < 2)
    return NextResponse.json({ error: `Name is required — received: "${studentName}"` }, { status: 400 })
  if (!examType?.trim())
    return NextResponse.json({ error: `Exam type is required — received: "${examType}"` }, { status: 400 })
  if (!subject?.trim())
    return NextResponse.json({ error: `Subject is required — received: "${subject}"` }, { status: 400 })
  if (!answers || typeof answers !== 'object' || !Object.keys(answers).length)
    return NextResponse.json({ error: 'No answers were submitted.' }, { status: 400 })

  const supabase    = createServerClient()
  const answerIds   = Object.keys(answers)

  // Fetch questions server-side — correct answers never exposed to client before this point
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
    .in('id', answerIds)

  if (qErr) {
    console.error('Question fetch error:', qErr)
    return NextResponse.json({ error: `Could not load questions: ${qErr.message}` }, { status: 500 })
  }

  if (!questions?.length) {
    return NextResponse.json({ error: 'No valid questions found for submission.' }, { status: 400 })
  }

  const { score, topicResults, recommendations } = analyseResults(questions, answers)
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
    studentAnswer: answers[q.id] ?? null,
    isCorrect:     answers[q.id] === q.correct_answer,
    wasAnswered:   answers[q.id] != null,
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
      answers,
      question_review:   questionReview,
      cohort_id:         cohortId        || null,
      school_student_id: schoolStudentId || null,
    })
    .select('id, share_token')
    .single()

  if (sErr) {
    console.error('Session insert error:', sErr)
    return NextResponse.json({ error: `Failed to save session: ${sErr.message}` }, { status: 500 })
  }

  // Save question attempts — non-blocking, failure is acceptable
  supabase
    .from('question_attempts')
    .insert(
      questions.map(q => ({
        session_id:      session.id,
        question_id:     q.id,
        selected_answer: answers[q.id] || null,
        is_correct:      answers[q.id] === q.correct_answer,
      }))
    )
    .then(() => {})
    .catch(() => {}) // Never let this block the response

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