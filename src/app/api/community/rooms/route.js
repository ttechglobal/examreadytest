import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}


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
