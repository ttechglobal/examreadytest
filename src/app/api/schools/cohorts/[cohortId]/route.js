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

export async function GET(request, { params }) {
  const token = cookies().get('institution_token')?.value
  const inst  = await verifyInstitutionToken(token)
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()

  const { data: cohort, error } = await supabase
    .from('cohorts')
    .select('*')
    .eq('id', params.cohortId)
    .eq('institution_id', inst.institutionId)
    .single()

  if (error || !cohort) return NextResponse.json({ error: 'Cohort not found' }, { status: 404 })

  const [{ count: studentCount }, { count: sessionCount }] = await Promise.all([
    supabase.from('school_students').select('*', { count: 'exact', head: true }).eq('cohort_id', params.cohortId),
    supabase.from('exam_sessions').select('*', { count: 'exact', head: true }).eq('cohort_id', params.cohortId),
  ])

  return NextResponse.json({ cohort, studentCount: studentCount || 0, sessionCount: sessionCount || 0 })
}
