import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { searchParams } = new URL(request.url)
  const testId = searchParams.get('id')

  // Get sample questions directly from DB
  const { data: sample } = await supabase
    .from('questions')
    .select('id, subject_id, exam_type')
    .eq('subject_id', 'government')
    .eq('exam_type', 'JAMB')
    .limit(3)

  // If an ID was passed, check if it exists
  let idCheck = null
  if (testId) {
    const { data } = await supabase
      .from('questions')
      .select('id, subject_id, exam_type')
      .eq('id', testId)
      .maybeSingle()
    idCheck = data ? 'FOUND' : 'NOT FOUND'
  }

  // Also check what the questions API would return
  const { data: apiQuestions } = await supabase
    .from('questions')
    .select('id')
    .eq('subject_id', 'government')
    .eq('exam_type', 'JAMB')
    .eq('verified', true)
    .limit(5)

  return NextResponse.json({
    governmentJAMBSample: sample?.map(q => q.id),
    apiWouldReturn: apiQuestions?.map(q => q.id),
    idCheck: testId ? { id: testId, result: idCheck } : 'pass ?id=UUID to check',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0],
  })
}