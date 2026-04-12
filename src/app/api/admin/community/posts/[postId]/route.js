import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(request, { params }) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', params.postId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
