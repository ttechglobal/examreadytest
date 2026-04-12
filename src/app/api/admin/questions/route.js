import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const supabase = createServerClient()

  // Topics-only for filter dropdowns
  if (searchParams.get('topicsOnly') === '1') {
    const { data } = await supabase
      .from('topics').select('id, title')
      .eq('subject_id', searchParams.get('subjectId') || '')
      .order('title')
    return NextResponse.json({ topics: data || [] })
  }

  const page       = parseInt(searchParams.get('page') || '1')
  const pageSize   = 50
  const subject    = searchParams.get('subject')    || ''
  const examType   = searchParams.get('examType')   || ''
  const difficulty = searchParams.get('difficulty') || ''
  const year       = searchParams.get('year')       || ''
  const search     = searchParams.get('search')     || ''

  let query = supabase
    .from('questions')
    .select('id, question_text, subject_id, topic_title, exam_type, year, difficulty, correct_answer, upload_batch, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (subject)    query = query.eq('subject_id', subject)
  if (examType)   query = query.eq('exam_type', examType)
  if (difficulty) query = query.eq('difficulty', difficulty)
  if (year)       query = query.eq('year', parseInt(year))
  if (search)     query = query.ilike('question_text', `%${search}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questions: data || [], total: count || 0 })
}
