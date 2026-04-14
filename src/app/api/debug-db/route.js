import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars', hasUrl: !!url, hasKey: !!key })
  }

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true })
  const { data: sample }  = await supabase.from('questions').select('id, subject_id, exam_type, verified').limit(3)

  return NextResponse.json({
    supabaseProject: url.split('//')[1]?.split('.')[0],
    totalQuestions:  qCount,
    sampleIds:       (sample || []).map(q => q.id),
    sampleSubjects:  (sample || []).map(q => q.subject_id),
    sampleVerified:  (sample || []).map(q => q.verified),
  })
}