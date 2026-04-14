import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick40(questions) {
  // Always return exactly 40 (or all if fewer than 40 exist)
  const target = 40
  if (questions.length <= target) return shuffle(questions)

  // Spread across topics proportionally so each topic is represented
  const byTopic = {}
  questions.forEach(q => {
    const k = q.topicId || 'unknown'
    byTopic[k] = byTopic[k] || []
    byTopic[k].push(q)
  })

  const topics    = Object.values(byTopic)
  const perTopic  = Math.max(1, Math.floor(target / topics.length))
  let selected    = []
  let surplus     = []

  topics.forEach(qs => {
    const shuffled = shuffle(qs)
    selected.push(...shuffled.slice(0, perTopic))
    surplus.push(...shuffled.slice(perTopic))
  })

  // Fill up to 40 from surplus
  if (selected.length < target) {
    selected.push(...shuffle(surplus).slice(0, target - selected.length))
  }

  return shuffle(selected).slice(0, target)
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const subject  = (searchParams.get('subject')  || '').toLowerCase().trim()
  const examType = (searchParams.get('examType') || '').toUpperCase().trim()

  if (!subject || !examType) {
    return NextResponse.json({ error: 'subject and examType are required' }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, topic_id, topic_title, difficulty, high_frequency')
    .eq('subject_id', subject)
    .eq('exam_type',  examType)
    .eq('verified',   true)

  if (error) {
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
  }
  if (!data?.length) {
    return NextResponse.json({ error: `No questions found for ${examType} ${subject}` }, { status: 404 })
  }

  const questions = data.map(q => ({
    id:           q.id,
    questionText: q.question_text,
    optionA:      q.option_a,
    optionB:      q.option_b,
    optionC:      q.option_c,
    optionD:      q.option_d,
    topicId:      q.topic_id,
    topicTitle:   q.topic_title || '',
    difficulty:   q.difficulty  || 'medium',
  }))

  return NextResponse.json({ questions: pick40(questions) })
}