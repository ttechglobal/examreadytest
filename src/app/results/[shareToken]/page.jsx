import { notFound } from 'next/navigation'
import ResultsClient from './ResultsClient'

export async function generateMetadata() {
  return { title: 'Your Exam Readiness Result — Learniie' }
}

async function getSession(token) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/sessions/${token}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function ResultsPage({ params }) {
  const data = await getSession(params.shareToken)
  if (!data) notFound()
  return <ResultsClient session={data.session} shareToken={params.shareToken} />
}
