import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: cohort, error } = await supabase
    .from('cohorts')
    .select('*, institutions(name, type)')
    .eq('access_code', params.accessCode.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !cohort) {
    return NextResponse.json({ error: 'Invalid or inactive access code' }, { status: 404 })
  }

  return NextResponse.json({ cohort })
}

export async function POST(request, { params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { studentName } = await request.json()
  if (!studentName?.trim()) return NextResponse.json({ error: 'Student name required' }, { status: 400 })

  const { data: cohort } = await supabase
    .from('cohorts')
    .select('id')
    .eq('access_code', params.accessCode.toUpperCase())
    .single()

  if (!cohort) return NextResponse.json({ error: 'Invalid access code' }, { status: 404 })

  // Check if student already exists
  const { data: existing } = await supabase
    .from('school_students')
    .select('id')
    .eq('cohort_id', cohort.id)
    .ilike('student_name', studentName.trim())
    .maybeSingle()

  if (existing) return NextResponse.json({ student: existing, cohortId: cohort.id })

  const { data: student, error } = await supabase
    .from('school_students')
    .insert({ cohort_id: cohort.id, student_name: studentName.trim() })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ student, cohortId: cohort.id }, { status: 201 })
}
