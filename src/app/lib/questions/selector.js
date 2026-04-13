function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key]
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

export function selectQuestions(allQuestions, targetCount = 40) {
  if (allQuestions.length <= targetCount) return shuffle(allQuestions)

  const byTopic  = groupBy(allQuestions, 'topic_id')
  const topicIds = Object.keys(byTopic)
  const perTopic = Math.max(1, Math.floor(targetCount / topicIds.length))

  let selected = []
  const surplusPools = []

  for (const topicId of topicIds) {
    const qs   = byTopic[topicId]
    const hf   = qs.filter(q => q.high_frequency)
    const rest = shuffle(qs.filter(q => !q.high_frequency))
    const pool = [...hf, ...rest]

    if (pool.length <= perTopic) {
      selected.push(...pool)
    } else {
      selected.push(...pool.slice(0, perTopic))
      surplusPools.push(...pool.slice(perTopic))
    }
  }

  // Fill deficit from surplus
  const deficit = targetCount - selected.length
  if (deficit > 0) {
    selected.push(...shuffle(surplusPools).slice(0, deficit))
  }

  return shuffle(selected).slice(0, targetCount)
}
