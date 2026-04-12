import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(request, { params }) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('community_replies')
    .delete()
    .eq('id', params.replyId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
