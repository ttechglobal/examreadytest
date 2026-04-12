import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { selectQuestions } from '@/lib/questions/selector'
import { normaliseSubject, normaliseExamType } from '@/lib/utils/constants'

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  // Normalise on ingress — students may pass "Physics" or "JAMB" in any case
  const subject  = normaliseSubject(searchParams.get('subject'))
  const examType = normaliseExamType(searchParams.get('examType'))

  if (!subject || !examType) {
    return NextResponse.json({ error: 'subject and examType are required' }, { status: 400 })
  }
  if (!['JAMB','WAEC','NECO'].includes(examType)) {
    return NextResponse.json({ error: 'Invalid examType — must be JAMB, WAEC, or NECO' }, { status: 400 })
  }

  // Use service role so RLS doesn't interfere with reads either
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      option_a, option_b, option_c, option_d,
      topic_id,
      topic_title,
      difficulty,
      high_frequency,
      exam_type,
      subject_id
    `)
    .eq('subject_id', subject)      // lowercase e.g. "physics"
    .eq('exam_type',  examType)     // uppercase e.g. "JAMB"
    .eq('verified', true)

  if (error) {
    console.error('Question fetch error:', { subject, examType, error })
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
  }

  if (!questions?.length) {
    return NextResponse.json({
      error: `No questions found for ${examType} ${subject}. Check that questions have been uploaded with the correct subject and exam type.`,
      questions: [],
      debug: { subject, examType },
    }, { status: 404 })
  }

  const annotated = questions.map(q => ({
    id:            q.id,
    questionText:  q.question_text,
    optionA:       q.option_a,
    optionB:       q.option_b,
    optionC:       q.option_c,
    optionD:       q.option_d,
    topicId:       q.topic_id,
    topicTitle:    q.topic_title || '',
    difficulty:    q.difficulty,
    high_frequency: q.high_frequency,
    topic_id:      q.topic_id,
  }))

  const selected = selectQuestions(annotated)
  return NextResponse.json({ questions: selected })
}
