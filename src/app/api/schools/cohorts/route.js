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

function generateAccessCode(name, year) {
  const slug = (name || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'SCHOOL'
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${slug}-${year}-${rand}`
}

export async function GET() {
  const token = cookies().get('institution_token')?.value
  const inst  = await verifyInstitutionToken(token)
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('cohorts')
    .select('*')
    .eq('institution_id', inst.institutionId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cohorts: data || [] })
}

export async function POST(request) {
  const token = cookies().get('institution_token')?.value
  const inst  = await verifyInstitutionToken(token)
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { academicYear, label, examType, subjects } = await request.json()
  if (!academicYear || !examType || !subjects?.length) {
    return NextResponse.json({ error: 'academicYear, examType, and subjects are required' }, { status: 400 })
  }

  const supabase   = getSupabase()
  const accessCode = generateAccessCode(inst.name, academicYear)
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL || 'https://examreadytest.com'

  const { data, error } = await supabase
    .from('cohorts')
    .insert({
      institution_id: inst.institutionId,
      academic_year:  parseInt(academicYear),
      label:          label?.trim() || null,
      exam_type:      examType.toUpperCase(),
      subjects,
      access_code:    accessCode,
      access_url:     `${appUrl}/join/${accessCode}`,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cohort: data }, { status: 201 })
}
