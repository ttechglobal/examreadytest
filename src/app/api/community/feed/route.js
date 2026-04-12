import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()

  const { data: posts, error } = await supabase
    .from('community_posts')
    .select('id, room_id, display_name, content, post_type, score_data, upvotes, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get reply counts
  const postIds = (posts || []).map(p => p.id)
  const { data: replies } = await supabase
    .from('community_replies')
    .select('post_id')
    .in('post_id', postIds)

  const replyMap = {}
  ;(replies || []).forEach(r => {
    replyMap[r.post_id] = (replyMap[r.post_id] || 0) + 1
  })

  const result = (posts || []).map(p => ({
    ...p,
    replyCount: replyMap[p.id] || 0,
  }))

  return NextResponse.json({ posts: result })
}
