/**
 * scorer.js — Pure scoring logic, no DB calls.
 * Takes questions (from DB), answers (from student), questionIds (ordered list).
 * Returns complete scored session data.
 */

export function scoreSession({ questions, answers, questionIds }) {
  // Build map for O(1) lookup by ID
  const questionMap = new Map(questions.map(q => [q.id, q]))

  // Score every question in original test order
  const questionReview = questionIds.map((qId, index) => {
    const question    = questionMap.get(qId)
    const studentAns  = answers[qId] ?? null
    const correctAns  = question?.correct_answer ?? null
    const wasAnswered = studentAns !== null
    const isCorrect   = wasAnswered && studentAns === correctAns

    return {
      index:         index + 1,
      questionId:    qId,
      questionText:  question?.question_text  ?? '',
      optionA:       question?.option_a       ?? '',
      optionB:       question?.option_b       ?? '',
      optionC:       question?.option_c       ?? '',
      optionD:       question?.option_d       ?? '',
      correctAnswer: correctAns,
      studentAnswer: studentAns,
      wasAnswered,
      isCorrect,
      explanation:   question?.explanation    ?? '',
      topicId:       question?.topic_id       ?? null,
      topicTitle:    question?.topic_title    ?? '',
      difficulty:    question?.difficulty     ?? 'medium',
    }
  })

  const totalQuestions = questionIds.length
  const score          = questionReview.filter(q => q.isCorrect).length
  const percentage     = totalQuestions > 0
    ? parseFloat(((score / totalQuestions) * 100).toFixed(2))
    : 0

  // Topic breakdown — aggregated from this test only
  const topicMap = new Map()
  questionReview.forEach(q => {
    if (!q.topicId) return
    if (!topicMap.has(q.topicId)) {
      topicMap.set(q.topicId, { topicId: q.topicId, topicTitle: q.topicTitle, questions: [] })
    }
    topicMap.get(q.topicId).questions.push(q)
  })

  const topicResults = Array.from(topicMap.values()).map(topic => {
    const total   = topic.questions.length
    const correct = topic.questions.filter(q => q.isCorrect).length
    const pct     = Math.round((correct / total) * 100)
    return {
      topicId:    topic.topicId,
      topicTitle: topic.topicTitle,
      correct,
      total,
      percentage: pct,
      status:     pct >= 70 ? 'strong' : pct >= 40 ? 'needs_work' : 'critical',
    }
  }).sort((a, b) => a.percentage - b.percentage)

  const recommendations = topicResults
    .filter(t => t.status !== 'strong')
    .slice(0, 3)
    .map(t => ({
      topicId:    t.topicId,
      topicTitle: t.topicTitle,
      priority:   t.status === 'critical' ? 1 : 2,
      message:    t.status === 'critical'
        ? `Focus on ${t.topicTitle} first — you missed most questions here.`
        : `Review ${t.topicTitle} — there are gaps in your understanding.`,
    }))

  return { totalQuestions, score, percentage, topicResults, recommendations, questionReview }
}