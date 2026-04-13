function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key]
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

export function analyseResults(questions, answers) {
  const byTopic = groupBy(questions, 'topic_id')

  const topicResults = Object.entries(byTopic).map(([topicId, qs]) => {
    const correct    = qs.filter(q => answers[q.id] === q.correct_answer).length
    const total      = qs.length
    const percentage = Math.round((correct / total) * 100)
    const status     = percentage >= 70 ? 'strong' : percentage >= 40 ? 'needs_work' : 'critical'

    return {
      topicId,
      topicTitle:  qs[0].topics?.title || qs[0].topic_title || 'Unknown topic',
      correct,
      total,
      percentage,
      status,
    }
  })

  const score = topicResults.reduce((sum, t) => sum + t.correct, 0)

  const recommendations = topicResults
    .filter(t => t.status !== 'strong')
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
    .map(t => ({
      topicId:    t.topicId,
      topicTitle: t.topicTitle,
      priority:   t.status === 'critical' ? 1 : 2,
      message:    t.status === 'critical'
        ? `Focus on ${t.topicTitle} first — you missed most questions here.`
        : `Review ${t.topicTitle} — there are gaps in your understanding.`,
    }))

  return { score, topicResults, recommendations }
}
