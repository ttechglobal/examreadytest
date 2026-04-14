import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get distinct exam_type and subject_id combos
  const { data: combos } = await supabase
    .from('questions')
    .select('subject_id, exam_type, verified')
    .limit(500)

  const summary = {}
  ;(combos || []).forEach(r => {
    const key = `${r.subject_id} | ${r.exam_type} | verified=${r.verified}`
    summary[key] = (summary[key] || 0) + 1
  })

  // Check if a specific ID from the URL exists
  const { searchParams } = new URL(request.url)
  const testId = searchParams.get('id')
  let idCheck = null
  if (testId) {
    const { data } = await supabase.from('questions').select('id, subject_id, exam_type').eq('id', testId).maybeSingle()
    idCheck = data || 'NOT FOUND'
  }

  return NextResponse.json({ summary, idCheck })
}