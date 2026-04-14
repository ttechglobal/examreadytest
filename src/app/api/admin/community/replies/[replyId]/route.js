import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}


export async function DELETE(request, { params }) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('community_replies')
    .delete()
    .eq('id', params.replyId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
