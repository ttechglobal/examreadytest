import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

async function verifyInstitutionToken(token) {
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== 'institution') return null
    return payload
  } catch { return null }
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const token = cookies().get('institution_token')?.value
  const inst  = await verifyInstitutionToken(token)
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()

  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id, label, exam_type, subjects, academic_year, access_code, access_url, is_active, created_at')
    .eq('institution_id', inst.institutionId)
    .order('created_at', { ascending: false })

  const cohortIds = (cohorts || []).map(c => c.id)

  const [
    { count: totalStudents },
    { count: totalSessions },
    { data: sessions },
    { data: studentCounts },
    { data: sessionCounts },
  ] = await Promise.all([
    supabase.from('school_students').select('*', { count: 'exact', head: true }).in('cohort_id', cohortIds.length ? cohortIds : ['none']),
    supabase.from('exam_sessions').select('*', { count: 'exact', head: true }).in('cohort_id', cohortIds.length ? cohortIds : ['none']),
    supabase.from('exam_sessions').select('percentage, cohort_id').in('cohort_id', cohortIds.length ? cohortIds : ['none']),
    supabase.from('school_students').select('cohort_id').in('cohort_id', cohortIds.length ? cohortIds : ['none']),
    supabase.from('exam_sessions').select('cohort_id').in('cohort_id', cohortIds.length ? cohortIds : ['none']),
  ])

  const avgScore = sessions?.length
    ? Math.round(sessions.reduce((a, s) => a + s.percentage, 0) / sessions.length)
    : null

  const enrichedCohorts = (cohorts || []).map(c => ({
    ...c,
    studentCount: (studentCounts || []).filter(s => s.cohort_id === c.id).length,
    sessionCount: (sessionCounts || []).filter(s => s.cohort_id === c.id).length,
  }))

  return NextResponse.json({
    institution: { id: inst.institutionId, name: inst.name, type: inst.type },
    stats: { totalStudents: totalStudents || 0, totalSessions: totalSessions || 0, avgScore, activeCohorts: (cohorts || []).filter(c => c.is_active).length },
    cohorts: enrichedCohorts,
  })
}