import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyInstitutionJWT } from '@/lib/auth/jwt'

export async function GET() {
  const token = cookies().get('institution_token')?.value
  const inst  = token ? await verifyInstitutionJWT(token) : null
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id, label, exam_type, subjects, academic_year, access_code, access_url, is_active, created_at')
    .eq('institution_id', inst.institutionId)
    .order('created_at', { ascending: false })

  const cohortIds = (cohorts || []).map(c => c.id)

  const [{ count: totalStudents }, { count: totalSessions }, { data: sessions }] = await Promise.all([
    supabase.from('school_students').select('*', { count: 'exact', head: true }).in('cohort_id', cohortIds),
    supabase.from('exam_sessions').select('*', { count: 'exact', head: true }).in('cohort_id', cohortIds),
    supabase.from('exam_sessions').select('percentage, cohort_id').in('cohort_id', cohortIds),
  ])

  const avgScore = sessions?.length
    ? Math.round(sessions.reduce((a, s) => a + s.percentage, 0) / sessions.length)
    : null

  // Enrich cohorts with counts
  const { data: studentCounts } = await supabase
    .from('school_students')
    .select('cohort_id')
    .in('cohort_id', cohortIds)

  const { data: sessionCounts } = await supabase
    .from('exam_sessions')
    .select('cohort_id')
    .in('cohort_id', cohortIds)

  const enrichedCohorts = (cohorts || []).map(c => ({
    ...c,
    studentCount: (studentCounts || []).filter(s => s.cohort_id === c.id).length,
    sessionCount: (sessionCounts || []).filter(s => s.cohort_id === c.id).length,
  }))

  return NextResponse.json({
    institution: { id: inst.institutionId, name: inst.name, type: inst.type },
    stats:  { totalStudents, totalSessions, avgScore, activeCohorts: (cohorts || []).filter(c => c.is_active).length },
    cohorts: enrichedCohorts,
  })
}
