import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/exam-types
// Returns only exam types that have at least one verified question in the DB.
// This ensures students only see exams with actual content.
// Falls back to a hardcoded list (JAMB + WAEC) if the DB query fails entirely.
export async function GET() {
  try {
    const supabase = db()

    // Step 1: Find all exam types that have verified questions
    const { data: qRows, error: qErr } = await supabase
      .from('questions')
      .select('exam_type')
      .eq('verified', true)

    if (qErr) throw qErr

    // Distinct uppercase exam types that actually have content
    const withContent = [...new Set((qRows || [])
      .map(r => r.exam_type?.toUpperCase().trim())
      .filter(Boolean)
    )]

    if (withContent.length === 0) {
      // No questions at all — return empty so setup shows a helpful message
      return NextResponse.json({ examTypes: [] })
    }

    // Step 2: Try to get metadata from exam_types table for these specific exams
    // If the table doesn't exist this will throw and we'll use inline metadata
    const { data: meta, error: metaErr } = await supabase
      .from('exam_types')
      .select('id, name, full_name, description, level, sort_order')
      .in('id', withContent)
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (!metaErr && meta?.length) {
      return NextResponse.json({ examTypes: meta })
    }

    // Step 3: exam_types table missing or had no matching rows —
    // build inline metadata for known exams, ignore unknown ones
    const KNOWN = {
      JAMB: { name:'JAMB', full_name:'Joint Admissions & Matriculation Board', description:'University entry exam',            level:'secondary', sort_order:1 },
      WAEC: { name:'WAEC', full_name:'West African Examinations Council',       description:'Senior Secondary Certificate',    level:'secondary', sort_order:2 },
      BECE: { name:'BECE', full_name:'Basic Education Certificate Examination', description:'Junior Secondary Certificate',    level:'junior',    sort_order:3 },
      IGCSE:{ name:'IGCSE',full_name:'International GCSE (Cambridge)',          description:'Cambridge international',         level:'international', sort_order:10 },
      GCSE: { name:'GCSE', full_name:'General Certificate of Secondary Education',description:'UK secondary qualification',   level:'international', sort_order:11 },
      SAT:  { name:'SAT',  full_name:'Scholastic Assessment Test',              description:'US university admissions',        level:'international', sort_order:12 },
    }

    const examTypes = withContent
      .filter(id => KNOWN[id])
      .map(id => ({ id, ...KNOWN[id] }))
      .sort((a, b) => a.sort_order - b.sort_order)

    return NextResponse.json({ examTypes })

  } catch (err) {
    // Total failure — return empty rather than wrong data
    return NextResponse.json({ examTypes: [] })
  }
}