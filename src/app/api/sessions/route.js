import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { analyseResults } from '@/lib/results/analyser'
import { getRateLimiter } from '@/lib/utils/rateLimit'

export async function POST(request) {
  const limiter = getRateLimiter()
  if (limiter) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const { success } = await limiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
  }

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { studentName, examType, subject, answers, timeTaken } = body

  if (!studentName?.trim() || studentName.trim().length < 2)
    return NextResponse.json({ error: 'Valid student name required' }, { status: 400 })
  if (!['JAMB','WAEC','NECO'].includes(examType))
    return NextResponse.json({ error: 'Invalid exam type' }, { status: 400 })
  if (!subject?.trim())
    return NextResponse.json({ error: 'Subject required' }, { status: 400 })
  if (!answers || typeof answers !== 'object' || !Object.keys(answers).length)
    return NextResponse.json({ error: 'No answers submitted' }, { status: 400 })

  const supabase = createServerClient()

  // Fetch full questions server-side — correct_answer + explanation never sent to client before this
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id, topic_title, difficulty')
    .in('id', Object.keys(answers))

  if (qErr || !questions?.length)
    return NextResponse.json({ error: 'Could not verify questions' }, { status: 500 })

  const { score, topicResults, recommendations } = analyseResults(questions, answers)
  const totalQuestions = questions.length
  const percentage = parseFloat(((score / totalQuestions) * 100).toFixed(2))

  // Build full question review — revealed only after submission
  const questionReview = questions.map(q => ({
    questionId:    q.id,
    questionText:  q.question_text,
    optionA:       q.option_a,
    optionB:       q.option_b,
    optionC:       q.option_c,
    optionD:       q.option_d,
    correctAnswer: q.correct_answer,
    studentAnswer: answers[q.id] ?? null,   // null if not answered
    isCorrect:     answers[q.id] === q.correct_answer,
    wasAnswered:   !!answers[q.id],          // explicit flag
    explanation:   q.explanation,
    topicTitle:    q.topic_title,
    difficulty:    q.difficulty,
  }))
  // Score counts only answered-correct questions
  // (score variable is already calculated before this point)

  const { data: session, error: sErr } = await supabase
    .from('exam_sessions')
    .insert({
      student_name:    studentName.trim().slice(0, 60),
      exam_type:       examType,
      subject:         subject.trim(),
      total_questions: totalQuestions,
      score,
      percentage,
      time_taken:      typeof timeTaken === 'number' ? timeTaken : null,
      topic_results:   topicResults,
      recommendations,
      answers,
      question_review: questionReview,
      cohort_id:           body.cohortId        ?? null,
      school_student_id:   body.schoolStudentId ?? null,
    })
    .select('id, share_token')
    .single()

  if (sErr) return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })

  // Save attempts non-blocking
  supabase.from('question_attempts').insert(
    questions.map(q => ({
      session_id:      session.id,
      question_id:     q.id,
      selected_answer: answers[q.id] || null,
      is_correct:      answers[q.id] === q.correct_answer,
    }))
  ).then(() => {})

  return NextResponse.json({
    shareToken: session.share_token,
    score, totalQuestions, percentage,
    topicResults, recommendations, questionReview,
  })
}
