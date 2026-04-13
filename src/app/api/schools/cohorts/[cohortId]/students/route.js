import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyInstitutionJWT } from '@/lib/auth/jwt'

export async function GET(request, { params }) {
  const token = cookies().get('institution_token')?.value
  const inst  = token ? await verifyInstitutionJWT(token) : null
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: students } = await supabase
    .from('school_students')
    .select('*')
    .eq('cohort_id', params.cohortId)
    .order('student_name')

  const { data: sessions } = await supabase
    .from('exam_sessions')
    .select('school_student_id, subject, percentage, score, total_questions, topic_results, created_at')
    .eq('cohort_id', params.cohortId)

  // Enrich each student with session stats
  const enriched = (students || []).map(s => {
    const studentSessions = (sessions || []).filter(x => x.school_student_id === s.id)
    const avgScore = studentSessions.length
      ? Math.round(studentSessions.reduce((a, x) => a + x.percentage, 0) / studentSessions.length)
      : null
    return { ...s, sessionsCount: studentSessions.length, avgScore, lastActive: studentSessions[0]?.created_at ?? null }
  })

  return NextResponse.json({ students: enriched })
}
