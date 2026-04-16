import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// PUT /api/admin/exam-types/[id] — update exam type
export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, full_name, description, level, active, sort_order } = body

    const updates = {}
    if (name       !== undefined) updates.name        = name.trim()
    if (full_name  !== undefined) updates.full_name   = full_name.trim()
    if (description !== undefined) updates.description = description.trim()
    if (level      !== undefined) updates.level       = level.trim()
    if (active     !== undefined) updates.active      = active
    if (sort_order !== undefined) updates.sort_order  = sort_order

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase()
      .from('exam_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ examType: data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin/exam-types/[id] — deactivate (soft delete)
export async function DELETE(request, { params }) {
  try {
    const id = params.id
    // Soft delete — never hard delete exam types as they may be referenced by sessions
    const { data, error } = await supabase()
      .from('exam_types')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ examType: data, message: 'Exam type deactivated' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}