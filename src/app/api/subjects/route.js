import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const LABELS = {
  physics: 'Physics', mathematics: 'Mathematics', chemistry: 'Chemistry',
  biology: 'Biology', english: 'English', government: 'Government',
  history: 'History', economics: 'Economics', literature: 'Literature',
}

// GET /api/subjects?examType=JAMB
// Returns subjects that have verified questions for the given exam type
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const examType = searchParams.get('examType')?.toUpperCase().trim() || null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let query = supabase.from('questions').select('subject_id, exam_type').eq('verified', true)
  if (examType) query = query.eq('exam_type', examType)

  const { data, error } = await query
  if (error) return NextResponse.json({ subjects: [] }, { status: 500 })

  const available = [...new Set((data || []).map(r => r.subject_id))].filter(Boolean).sort()

  const subjects = available.map(id => ({
    id,
    title: LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1),
  }))

  return NextResponse.json({ subjects })
}