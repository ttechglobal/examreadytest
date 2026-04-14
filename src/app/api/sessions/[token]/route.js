import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}


export async function GET(request, { params }) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('share_token', params.token)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  return NextResponse.json({ session: data })
}
