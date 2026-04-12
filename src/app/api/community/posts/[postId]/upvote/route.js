import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getDeviceHash } from '@/lib/community/deviceHash'

export async function POST(request, { params }) {
  const deviceHash = getDeviceHash(request)
  const supabase   = createServerClient()
  const { postId } = params

  // Check if already upvoted
  const { data: existing } = await supabase
    .from('community_upvotes')
    .select('id')
    .eq('post_id', postId)
    .eq('device_hash', deviceHash)
    .single()

  if (existing) {
    // Remove upvote
    await supabase.from('community_upvotes').delete().eq('id', existing.id)
    const { data: post } = await supabase
      .from('community_posts')
      .update({ upvotes: supabase.rpc('greatest', { a: 0, b: -1 }) })
      .eq('id', postId)
      .select('upvotes')
      .single()
    // Simple decrement
    await supabase.rpc('decrement_upvotes', { post_id: postId }).catch(() => {
      supabase.from('community_posts')
        .select('upvotes').eq('id', postId).single()
        .then(({ data: p }) => {
          if (p) supabase.from('community_posts').update({ upvotes: Math.max(0, p.upvotes - 1) }).eq('id', postId)
        })
    })
    return NextResponse.json({ upvoted: false })
  }

  // Add upvote
  const { error: upErr } = await supabase
    .from('community_upvotes')
    .insert({ post_id: postId, device_hash: deviceHash })

  if (upErr?.code === '23505') {
    // Race condition duplicate
    return NextResponse.json({ upvoted: true })
  }

  // Increment counter
  const { data: cur } = await supabase.from('community_posts').select('upvotes').eq('id', postId).single()
  await supabase.from('community_posts').update({ upvotes: (cur?.upvotes || 0) + 1 }).eq('id', postId)

  return NextResponse.json({ upvoted: true })
}
