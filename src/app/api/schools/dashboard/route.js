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

export async function GET() {
  const token = cookies().get('institution_token')?.value
  const inst  = await verifyInstitutionToken(token)
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()

  // Fetch cohorts
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id, label, exam_type, subjects, academic_year, access_code, access_url, is_active, created_at')
    .eq('institution_id', inst.institutionId)
    .order('created_at', { ascending: false })

  const cohortIds = (cohorts || []).map(c => c.id)
  const none      = ['00000000-0000-0000-0000-000000000000']
  const ids       = cohortIds.length ? cohortIds : none

  // Fetch all sessions + students in parallel
  const [
    { data: allSessions },
    { data: allStudents },
  ] = await Promise.all([
    supabase.from('exam_sessions')
      .select('id, school_student_id, cohort_id, subject, score, total_questions, percentage, topic_results, created_at')
      .in('cohort_id', ids),
    supabase.from('school_students')
      .select('id, cohort_id, student_name, created_at')
      .in('cohort_id', ids),
  ])

  const sessions = allSessions || []
  const students = allStudents || []

  // ── Stats ───────────────────────────────────────────────────
  const totalStudents  = students.length
  const totalSessions  = sessions.length
  const avgScore       = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.percentage, 0) / sessions.length)
    : null

  // ── Per-student analytics ───────────────────────────────────
  const studentMap = {}
  students.forEach(s => {
    studentMap[s.id] = {
      id:         s.id,
      name:       s.student_name,
      cohortId:   s.cohort_id,
      sessions:   [],
    }
  })
  sessions.forEach(s => {
    if (s.school_student_id && studentMap[s.school_student_id]) {
      studentMap[s.school_student_id].sessions.push(s)
    }
  })

  const studentStats = Object.values(studentMap).map(s => {
    const ss  = s.sessions
    const avg = ss.length ? Math.round(ss.reduce((a, x) => a + x.percentage, 0) / ss.length) : null
    const sorted = [...ss].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    // Improvement: compare last session to first session
    const improvement = sorted.length >= 2
      ? Math.round(sorted[sorted.length-1].percentage - sorted[0].percentage)
      : null
    return {
      id:           s.id,
      name:         s.name,
      cohortId:     s.cohortId,
      sessionCount: ss.length,
      avgScore:     avg,
      improvement,
      lastActive:   ss.length ? ss.sort((a,b) => new Date(b.created_at)-new Date(a.created_at))[0].created_at : null,
    }
  }).sort((a, b) => (b.avgScore ?? -1) - (a.avgScore ?? -1))

  // ── Subject analytics ───────────────────────────────────────
  const subjectMap = {}
  sessions.forEach(s => {
    if (!subjectMap[s.subject]) subjectMap[s.subject] = { subject: s.subject, scores: [], topics: {} }
    subjectMap[s.subject].scores.push(s.percentage)
    ;(s.topic_results || []).forEach(t => {
      if (!subjectMap[s.subject].topics[t.topicId]) {
        subjectMap[s.subject].topics[t.topicId] = { title: t.topicTitle, scores: [] }
      }
      subjectMap[s.subject].topics[t.topicId].scores.push(t.percentage)
    })
  })

  const subjectStats = Object.values(subjectMap).map(s => {
    const avg = Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length)
    const topicList = Object.entries(s.topics).map(([id, t]) => {
      const ta = Math.round(t.scores.reduce((a, b) => a + b, 0) / t.scores.length)
      return { topicId: id, topicTitle: t.title, avgScore: ta, sampleSize: t.scores.length, status: ta >= 70 ? 'strong' : ta >= 40 ? 'needs_work' : 'critical' }
    }).sort((a, b) => a.avgScore - b.avgScore)
    return {
      subject:     s.subject,
      avgScore:    avg,
      sessionCount: s.scores.length,
      status:      avg >= 70 ? 'strong' : avg >= 40 ? 'needs_work' : 'critical',
      weakTopics:  topicList.filter(t => t.status !== 'strong').slice(0, 5),
      allTopics:   topicList,
    }
  }).sort((a, b) => a.avgScore - b.avgScore)

  // ── Top performers ──────────────────────────────────────────
  const topPerformers = studentStats
    .filter(s => s.avgScore !== null && s.sessionCount >= 1)
    .slice(0, 5)

  // ── Consistent improvers ────────────────────────────────────
  const consistentImprovers = studentStats
    .filter(s => s.improvement !== null && s.improvement > 0)
    .sort((a, b) => (b.improvement ?? 0) - (a.improvement ?? 0))
    .slice(0, 5)

  // ── Areas to improve (subjects + topics below 50%) ──────────
  const areasToImprove = subjectStats
    .filter(s => s.avgScore < 60)
    .map(s => ({
      subject:    s.subject,
      avgScore:   s.avgScore,
      weakTopics: s.weakTopics.slice(0, 3),
    }))

  // ── Cohort enrichment ───────────────────────────────────────
  const enrichedCohorts = (cohorts || []).map(c => ({
    ...c,
    studentCount: students.filter(s => s.cohort_id === c.id).length,
    sessionCount: sessions.filter(s => s.cohort_id === c.id).length,
  }))

  return NextResponse.json({
    institution:       { id: inst.institutionId, name: inst.name, type: inst.type },
    stats:             { totalStudents, totalSessions, avgScore, activeCohorts: (cohorts || []).filter(c => c.is_active).length },
    cohorts:           enrichedCohorts,
    studentStats,
    subjectStats,
    topPerformers,
    consistentImprovers,
    areasToImprove,
  })
}