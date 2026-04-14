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

function mean(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key]; acc[k] = acc[k] ?? []; acc[k].push(item); return acc
  }, {})
}

function generateRecommendation({ topicTitle, averagePercentage, status }) {
  if (status === 'critical')
    return `Most students are struggling with ${topicTitle}. Class average is ${averagePercentage}% — recommend dedicated revision sessions before the exam.`
  return `${topicTitle} needs reinforcement — class average is ${averagePercentage}%. Focus on bridging gaps with targeted practice.`
}

async function computeAnalytics(cohortId, supabase) {
  const { data: sessions } = await supabase
    .from('exam_sessions')
    .select('id, subject, score, total_questions, percentage, topic_results, school_student_id, created_at')
    .eq('cohort_id', cohortId)

  if (!sessions?.length) return { cohortId, subjectAnalytics: {}, totalSessions: 0, lastUpdated: new Date().toISOString() }

  const bySubject = groupBy(sessions, 'subject')
  const subjectAnalytics = {}

  for (const [subject, subjectSessions] of Object.entries(bySubject)) {
    const percentages = subjectSessions.map(s => s.percentage)
    const topicMap = {}
    subjectSessions.forEach(session => {
      ;(session.topic_results || []).forEach(topic => {
        if (!topicMap[topic.topicId]) topicMap[topic.topicId] = { topicId: topic.topicId, topicTitle: topic.topicTitle, scores: [] }
        topicMap[topic.topicId].scores.push(topic.percentage)
      })
    })
    const topics = Object.values(topicMap).map(t => {
      const avg = mean(t.scores)
      const status = avg >= 70 ? 'strong' : avg >= 40 ? 'needs_work' : 'critical'
      return { ...t, averagePercentage: Math.round(avg), status, sampleSize: t.scores.length }
    }).sort((a, b) => a.averagePercentage - b.averagePercentage)

    subjectAnalytics[subject] = {
      subject,
      averageScore:  Math.round(mean(percentages)),
      topScore:      Math.round(Math.max(...percentages)),
      bottomScore:   Math.round(Math.min(...percentages)),
      studentsCount: subjectSessions.length,
      topics,
      priorityTopics: topics.filter(t => t.status !== 'strong').slice(0, 3).map(t => ({ ...t, recommendation: generateRecommendation(t) })),
    }
  }

  return { cohortId, subjectAnalytics, totalSessions: sessions.length, lastUpdated: new Date().toISOString() }
}

function buildCSV(sessions, studentMap) {
  const lines = [['Student Name','Subject','Score','Percentage','Weak Topics','Date'].join(',')]
  sessions.forEach(s => {
    const weak = (s.topic_results || []).filter(t => t.percentage < 50).map(t => t.topicTitle).slice(0, 3)
    lines.push([
      `"${studentMap[s.school_student_id] || 'Unknown'}"`,
      s.subject, `${s.score}/${s.total_questions}`, `${Math.round(s.percentage)}%`,
      `"${weak.join('; ')}"`, new Date(s.created_at).toLocaleDateString('en-GB'),
    ].join(','))
  })
  return lines.join('\n')
}

export async function GET(request, { params }) {
  const token = cookies().get('institution_token')?.value
  const inst  = await verifyInstitutionToken(token)
  if (!inst) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)

  if (searchParams.get('export') === 'csv') {
    const [{ data: sessions }, { data: students }] = await Promise.all([
      supabase.from('exam_sessions').select('*').eq('cohort_id', params.cohortId),
      supabase.from('school_students').select('id, student_name').eq('cohort_id', params.cohortId),
    ])
    const studentMap = Object.fromEntries((students || []).map(s => [s.id, s.student_name]))
    return new Response(buildCSV(sessions || [], studentMap), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${params.cohortId}.csv"`,
      },
    })
  }

  const analytics = await computeAnalytics(params.cohortId, supabase)
  return NextResponse.json(analytics)
}
