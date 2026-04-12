import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()

  const { data: rooms } = await supabase
    .from('community_rooms')
    .select('id, title, description')

  // Get post counts per room
  const { data: counts } = await supabase
    .from('community_posts')
    .select('room_id')

  const countMap = {}
  ;(counts || []).forEach(r => {
    countMap[r.room_id] = (countMap[r.room_id] || 0) + 1
  })

  const result = (rooms || []).map(r => ({
    ...r,
    postCount: countMap[r.id] || 0,
  }))

  return NextResponse.json({ rooms: result })
}
