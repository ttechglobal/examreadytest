function mean(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key]; acc[k] = acc[k] ?? []; acc[k].push(item); return acc
  }, {})
}

function generateRecommendation({ topicTitle, averagePercentage, status }) {
  if (status === 'critical') {
    return `Most students are struggling with ${topicTitle}. Class average is ${averagePercentage}% — recommend dedicated revision sessions before the exam.`
  }
  return `${topicTitle} needs reinforcement — class average is ${averagePercentage}%. Focus on bridging gaps with targeted practice.`
}

export async function computeCohortAnalytics(cohortId, supabase) {
  const { data: sessions } = await supabase
    .from('exam_sessions')
    .select('id, subject, score, total_questions, percentage, topic_results, school_student_id, created_at')
    .eq('cohort_id', cohortId)

  if (!sessions?.length) return { cohortId, subjectAnalytics: {}, totalSessions: 0, lastUpdated: new Date().toISOString() }

  const bySubject = groupBy(sessions, 'subject')
  const subjectAnalytics = {}

  for (const [subject, subjectSessions] of Object.entries(bySubject)) {
    const percentages = subjectSessions.map(s => s.percentage)
    const avgScore    = mean(percentages)
    const topScore    = Math.max(...percentages)
    const bottomScore = Math.min(...percentages)

    // Aggregate topic performance
    const topicMap = {}
    subjectSessions.forEach(session => {
      ;(session.topic_results || []).forEach(topic => {
        if (!topicMap[topic.topicId]) {
          topicMap[topic.topicId] = { topicId: topic.topicId, topicTitle: topic.topicTitle, scores: [] }
        }
        topicMap[topic.topicId].scores.push(topic.percentage)
      })
    })

    const topics = Object.values(topicMap).map(t => {
      const avg = mean(t.scores)
      const status = avg >= 70 ? 'strong' : avg >= 40 ? 'needs_work' : 'critical'
      return { ...t, averagePercentage: Math.round(avg), status, sampleSize: t.scores.length }
    }).sort((a, b) => a.averagePercentage - b.averagePercentage)

    const priorityTopics = topics
      .filter(t => t.status !== 'strong')
      .slice(0, 3)
      .map(t => ({ ...t, recommendation: generateRecommendation(t) }))

    subjectAnalytics[subject] = {
      subject,
      averageScore: Math.round(avgScore),
      topScore:     Math.round(topScore),
      bottomScore:  Math.round(bottomScore),
      studentsCount: subjectSessions.length,
      topics,
      priorityTopics,
    }
  }

  return { cohortId, subjectAnalytics, totalSessions: sessions.length, lastUpdated: new Date().toISOString() }
}

export function buildAnalyticsCSV(sessions, studentMap) {
  const headers = ['Student Name','Subject','Score','Percentage','Weak Topics','Date']
  const lines   = [headers.join(',')]

  sessions.forEach(s => {
    const weakTopics = (s.topic_results || [])
      .filter(t => t.percentage < 50)
      .map(t => t.topicTitle)
      .slice(0, 3)

    lines.push([
      `"${studentMap[s.school_student_id] || s.student_name || 'Unknown'}"`,
      s.subject,
      `${s.score}/${s.total_questions}`,
      `${Math.round(s.percentage)}%`,
      `"${weakTopics.join('; ')}"`,
      new Date(s.created_at).toLocaleDateString('en-GB'),
    ].join(','))
  })

  return lines.join('\n')
}
