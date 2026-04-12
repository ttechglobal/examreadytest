import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Returns subjects that have at least one verified question in the DB
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase
    .from('questions')
    .select('subject_id')
    .eq('verified', true)

  if (error) return NextResponse.json({ subjects: [] }, { status: 500 })

  // Unique subject IDs that have questions
  const available = [...new Set((data || []).map(r => r.subject_id))].filter(Boolean).sort()

  // Map to title-cased labels
  const LABELS = {
    physics: 'Physics', mathematics: 'Mathematics', chemistry: 'Chemistry',
    biology: 'Biology', english: 'English', government: 'Government',
    history: 'History', economics: 'Economics', literature: 'Literature',
  }

  const subjects = available.map(id => ({
    id,
    title: LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1),
  }))

  return NextResponse.json({ subjects })
}
