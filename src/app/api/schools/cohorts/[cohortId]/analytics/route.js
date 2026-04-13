import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyInstitutionJWT } from '@/lib/auth/jwt'
import { computeCohortAnalytics, buildAnalyticsCSV } from '@/lib/schools/analytics'

export async function GET(request, { params }) {
  const token = cookies().get('institution_token')?.value
  const inst  = token ? await verifyInstitutionJWT(token) : null
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { searchParams } = new URL(request.url)

  if (searchParams.get('export') === 'csv') {
    const { data: sessions } = await supabase
      .from('exam_sessions')
      .select('*, school_students(student_name)')
      .eq('cohort_id', params.cohortId)

    const { data: students } = await supabase
      .from('school_students')
      .select('id, student_name')
      .eq('cohort_id', params.cohortId)

    const studentMap = Object.fromEntries((students || []).map(s => [s.id, s.student_name]))
    const csv = buildAnalyticsCSV(sessions || [], studentMap)

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${params.cohortId}.csv"`,
      },
    })
  }

  const analytics = await computeCohortAnalytics(params.cohortId, supabase)
  return NextResponse.json(analytics)
}
