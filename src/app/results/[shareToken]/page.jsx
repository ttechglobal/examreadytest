import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ResultsClient from './ResultsClient'

export async function generateMetadata() {
  return { title: 'Your Exam Readiness Result — Learniie' }
}

export default async function ResultsPage({ params }) {
  // Direct DB query — never self-fetch via HTTP (breaks on Vercel without APP_URL)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: session, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('share_token', params.shareToken)
    .single()

  if (error || !session) notFound()

  return <ResultsClient session={session} shareToken={params.shareToken} />
}
