import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const LABELS = {
  physics:          'Physics',
  mathematics:      'Mathematics',
  chemistry:        'Chemistry',
  biology:          'Biology',
  english:          'English',
  government:       'Government',
  history:          'History',
  economics:        'Economics',
  literature:       'Literature',
  commerce:         'Commerce',
  accounting:       'Accounting',
  geography:        'Geography',
  civic_education:  'Civic Education',
  basic_science:    'Basic Science',
  social_studies:   'Social Studies',
  basic_technology: 'Basic Technology',
  computer_studies: 'Computer Studies',
  agricultural_science: 'Agricultural Science',
}

// GET /api/subjects?examType=BECE
// Returns subjects that have at least one verified question for the given exam type.
// Only shows what actually has content — no placeholders.
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  // Accept any casing and normalise to uppercase for query
  const examTypeRaw = searchParams.get('examType') || ''
  const examType    = examTypeRaw.toUpperCase().trim()

  if (!examType) {
    return NextResponse.json({ subjects: [] })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase
    .from('questions')
    .select('subject_id')
    .eq('exam_type', examType)
    .eq('verified',  true)

  if (error) {
    console.error('subjects API error:', error.message)
    return NextResponse.json({ subjects: [] }, { status: 500 })
  }

  // Deduplicate, filter nulls, sort alphabetically
  const available = [...new Set((data || []).map(r => r.subject_id).filter(Boolean))].sort()

  const subjects = available.map(id => ({
    id,
    title: LABELS[id] || id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }))

  return NextResponse.json({ subjects })
}