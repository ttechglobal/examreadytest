import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ReviewClient from './ReviewClient'

export default async function ReviewPage({ params }) {
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

  return <ReviewClient session={session} shareToken={params.shareToken} />
}
