import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyAdminJWT } from '@/lib/auth/jwt'

export async function GET(request) {
  const token   = cookies().get('admin_token')?.value
  const payload = token ? await verifyAdminJWT(token).catch(() => null) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [
    { data: countRows },
    { data: sample },
    { count: totalTopics },
    { count: totalSessions },
  ] = await Promise.all([
    supabase.from('questions').select('subject_id, exam_type, verified'),
    supabase.from('questions').select('id, subject_id, exam_type, verified, topic_title, correct_answer, upload_batch, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('topics').select('*', { count: 'exact', head: true }),
    supabase.from('exam_sessions').select('*', { count: 'exact', head: true }),
  ])

  // Aggregate counts
  const counts = {}
  ;(countRows || []).forEach(r => {
    const key = `${r.subject_id} · ${r.exam_type} · verified=${r.verified}`
    counts[key] = (counts[key] || 0) + 1
  })

  const totalQuestions = (countRows || []).length
  const verifiedCount  = (countRows || []).filter(r => r.verified).length
  const subjects       = [...new Set((countRows || []).map(r => r.subject_id))]
  const examTypes      = [...new Set((countRows || []).map(r => r.exam_type))]

  return NextResponse.json({
    health: {
      totalQuestions,
      verifiedQuestions: verifiedCount,
      unverifiedQuestions: totalQuestions - verifiedCount,
      totalTopics,
      totalSessions,
      subjects,
      examTypes,
    },
    counts,
    recentSample: sample || [],
    env: {
      supabaseUrl:      !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey:   !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleValid: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ'),
    },
  })
}
