import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/admin/exam-types — all exam types including inactive
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from('exam_types')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({ examTypes: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin/exam-types — create new exam type
export async function POST(request) {
  try {
    const body = await request.json()
    const { id, name, full_name, description, level, sort_order } = body

    if (!id?.trim() || !name?.trim() || !full_name?.trim()) {
      return NextResponse.json({ error: 'id, name, and full_name are required' }, { status: 400 })
    }

    const examId = id.trim().toUpperCase().replace(/\s+/g, '_')

    const { data, error } = await supabase()
      .from('exam_types')
      .insert({
        id:          examId,
        name:        name.trim(),
        full_name:   full_name.trim(),
        description: description?.trim() || '',
        level:       level?.trim() || 'secondary',
        sort_order:  sort_order ?? 100,
        active:      true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: `Exam type "${examId}" already exists` }, { status: 409 })
      throw error
    }
    return NextResponse.json({ examType: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}