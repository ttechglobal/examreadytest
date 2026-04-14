import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function _shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function _groupBy(arr, key) {
  return arr.reduce((acc, item) => { const k = item[key]; acc[k] = acc[k] ?? []; acc[k].push(item); return acc }, {})
}
function selectQuestions(allQuestions, targetCount = 40) {
  if (allQuestions.length <= targetCount) return _shuffle(allQuestions)
  const byTopic  = _groupBy(allQuestions, 'topic_id')
  const topicIds = Object.keys(byTopic)
  const perTopic = Math.max(1, Math.floor(targetCount / topicIds.length))
  let selected = [], surplusPools = []
  for (const topicId of topicIds) {
    const qs = byTopic[topicId]
    const hf = qs.filter(q => q.high_frequency)
    const pool = [...hf, ..._shuffle(qs.filter(q => !q.high_frequency))]
    if (pool.length <= perTopic) { selected.push(...pool) }
    else { selected.push(...pool.slice(0, perTopic)); surplusPools.push(...pool.slice(perTopic)) }
  }
  const deficit = targetCount - selected.length
  if (deficit > 0) selected.push(..._shuffle(surplusPools).slice(0, deficit))
  return _shuffle(selected).slice(0, targetCount)
}


function normaliseSubject(s)  { return s?.toLowerCase().trim().replace(/\s+/g, '_') || '' }
function normaliseExamType(e) { return e?.toUpperCase().trim() || '' }


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
