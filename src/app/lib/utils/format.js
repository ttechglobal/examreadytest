export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}
export function formatPct(p) { return `${Math.round(p)}%` }

export function formatTimeAgo(ts) {
  const diff  = Date.now() - new Date(ts).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins} min${mins > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  if (days < 7)   return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}
