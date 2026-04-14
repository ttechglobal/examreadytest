import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}


export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page     = parseInt(searchParams.get('page') || '1')
  const pageSize = 50
  const subject  = searchParams.get('subject')  || ''
  const examType = searchParams.get('examType') || ''
  const search   = searchParams.get('search')   || ''
  const scoreMin = searchParams.get('scoreMin') || ''
  const scoreMax = searchParams.get('scoreMax') || ''

  const supabase = createServerClient()
  let query = supabase
    .from('exam_sessions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (subject)  query = query.eq('subject', subject)
  if (examType) query = query.eq('exam_type', examType)
  if (search)   query = query.ilike('student_name', `%${search}%`)
  if (scoreMin) query = query.gte('percentage', Number(scoreMin))
  if (scoreMax) query = query.lte('percentage', Number(scoreMax))

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sessions: data || [], total: count || 0 })
}
