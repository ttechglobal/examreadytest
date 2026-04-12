import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()

  const [
    { count: totalQ },
    { data: qData },
    { data: sessions },
  ] = await Promise.all([
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('verified'),
    supabase.from('exam_sessions').select('percentage, subject, exam_type, created_at'),
  ])

  const verifiedQ  = (qData || []).filter(q => q.verified).length
  const totalS     = (sessions || []).length
  const avgScore   = totalS
    ? Math.round((sessions.reduce((s, x) => s + Number(x.percentage), 0)) / totalS)
    : 0

  // Sessions per day — last 30 days
  const now = Date.now()
  const sessionsByDay = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000).toISOString().slice(0, 10)
    sessionsByDay[d] = 0
  }
  ;(sessions || []).forEach(s => {
    const d = s.created_at?.slice(0, 10)
    if (d && d in sessionsByDay) sessionsByDay[d]++
  })

  // Subject counts
  const subjectMap = {}
  ;(sessions || []).forEach(s => { subjectMap[s.subject] = (subjectMap[s.subject] || 0) + 1 })
  const subjects = Object.entries(subjectMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Avg score by subject
  const subjectScores = {}
  ;(sessions || []).forEach(s => {
    if (!subjectScores[s.subject]) subjectScores[s.subject] = { total: 0, count: 0 }
    subjectScores[s.subject].total += Number(s.percentage)
    subjectScores[s.subject].count++
  })
  const avgBySubject = Object.entries(subjectScores).map(([name, v]) => ({
    name, avg: Math.round(v.total / v.count),
  })).sort((a, b) => b.avg - a.avg)

  return NextResponse.json({ totalQ: totalQ || 0, verifiedQ, totalS, avgScore, sessionsByDay, subjects, avgBySubject })
}
