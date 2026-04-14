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

  const [{ data: students }, { data: sessions }] = await Promise.all([
    supabase.from('school_students').select('*').eq('cohort_id', params.cohortId).order('student_name'),
    supabase.from('exam_sessions').select('school_student_id, subject, percentage, score, total_questions, created_at').eq('cohort_id', params.cohortId),
  ])

  const enriched = (students || []).map(s => {
    const ss  = (sessions || []).filter(x => x.school_student_id === s.id)
    const avg = ss.length ? Math.round(ss.reduce((a, x) => a + x.percentage, 0) / ss.length) : null
    return { ...s, sessionsCount: ss.length, avgScore: avg, lastActive: ss[0]?.created_at ?? null }
  })

  return NextResponse.json({ students: enriched })
}
