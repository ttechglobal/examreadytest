import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

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
