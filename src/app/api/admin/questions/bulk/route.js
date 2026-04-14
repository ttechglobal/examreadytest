import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}


export async function POST(request) {
  const supabase = createServerClient()
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 }) }

  const { questions } = body
  if (!Array.isArray(questions) || !questions.length) {
    return NextResponse.json({ message: 'questions array required' }, { status: 400 })
  }

  // Resolve topic IDs — find or create by name per subject
  const topicCache = {}
  const rows = await Promise.all(questions.map(async q => {
    const subjectId = q.subject?.toLowerCase().replace(/\s+/g, '_') || null
    let topicId = null

    if (q.topic && subjectId) {
      const key = `${subjectId}:${q.topic.toLowerCase()}`
      if (topicCache[key]) {
        topicId = topicCache[key]
      } else {
        const { data: existing } = await supabase
          .from('topics').select('id').eq('subject_id', subjectId).ilike('title', q.topic).single()
        if (existing) {
          topicId = existing.id
        } else {
          const { data: created } = await supabase
            .from('topics').insert({ subject_id: subjectId, title: q.topic }).select('id').single()
          topicId = created?.id || null
        }
        if (topicId) topicCache[key] = topicId
      }
    }

    return {
      exam_type:      q.examType || 'JAMB',
      subject_id:     subjectId,
      topic_id:       topicId,
      year:           q.year ? parseInt(q.year) : null,
      question_text:  q.questionText?.trim() || '',
      option_a:       q.optionA?.trim() || '',
      option_b:       q.optionB?.trim() || '',
      option_c:       q.optionC?.trim() || '',
      option_d:       q.optionD?.trim() || '',
      correct_answer: q.correctAnswer || null,
      difficulty:     q.difficulty || 'medium',
      high_frequency: false,
      verified:       q.verified || false,
    }
  }))

  const { data, error } = await supabase.from('questions').insert(rows).select('id')
  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json({ inserted: data.length }, { status: 201 })
}
