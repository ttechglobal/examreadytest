import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/exam-types — public, returns active exam types sorted
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from('exam_types')
      .select('id, name, full_name, description, level')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ examTypes: data || [] })
  } catch (err) {
    // Fallback to hardcoded list if table doesn't exist yet
    return NextResponse.json({
      examTypes: [
        { id: 'JAMB', name: 'JAMB', full_name: 'Joint Admissions & Matriculation Board', description: 'University entry exam', level: 'secondary' },
        { id: 'WAEC', name: 'WAEC', full_name: 'West African Examinations Council',       description: 'Senior Secondary Certificate', level: 'secondary' },
        { id: 'BECE', name: 'BECE', full_name: 'Basic Education Certificate Examination', description: 'Junior Secondary Certificate', level: 'junior' },
      ]
    })
  }
}