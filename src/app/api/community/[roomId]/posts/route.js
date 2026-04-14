import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

import { createHash } from 'crypto'
function getDeviceHash(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ua = request.headers.get('user-agent') ?? 'unknown'
  return createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 16)
}


function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}


const PROFANITY = ['fuck','shit','ass','bitch','bastard','nigga','cunt']
function hasProfanity(text) {
  const lower = text.toLowerCase()
  return PROFANITY.some(w => lower.includes(w))
}

export async function GET(request, { params }) {
  const { roomId } = params
  const { searchParams } = new URL(request.url)
  const page     = parseInt(searchParams.get('page') || '1')
  const pageSize = 50

  const supabase = createServerClient()

  const { data: posts, count, error } = await supabase
    .from('community_posts')
    .select('id, room_id, display_name, content, post_type, score_data, upvotes, created_at', { count: 'exact' })
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Attach reply counts
  const postIds = (posts || []).map(p => p.id)
  const { data: replies } = postIds.length
    ? await supabase.from('community_replies').select('post_id').in('post_id', postIds)
    : { data: [] }

  const replyMap = {}
  ;(replies || []).forEach(r => { replyMap[r.post_id] = (replyMap[r.post_id] || 0) + 1 })

  const result = (posts || []).map(p => ({ ...p, replyCount: replyMap[p.id] || 0 }))
  return NextResponse.json({ posts: result, total: count || 0 })
}

export async function POST(request, { params }) {
  const { roomId } = params
  const deviceHash = getDeviceHash(request)
  const supabase   = createServerClient()

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { displayName, content, postType, subject, scoreData } = body

  // Validate
  if (!content?.trim() || content.trim().length < 10)
    return NextResponse.json({ error: 'Post must be at least 10 characters.' }, { status: 400 })
  if (content.trim().length > 500)
    return NextResponse.json({ error: 'Post cannot exceed 500 characters.' }, { status: 400 })
  if (!['jamb','waec','neco'].includes(roomId))
    return NextResponse.json({ error: 'Invalid room.' }, { status: 400 })
  if (hasProfanity(content))
    return NextResponse.json({ error: 'Your post contains language that is not allowed. Please keep it respectful.' }, { status: 400 })

  // Rate limit: 3 posts per device per hour
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const { count: recentCount } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('device_hash', deviceHash)
    .gte('created_at', oneHourAgo)

  if ((recentCount || 0) >= 3) {
    return NextResponse.json({ error: 'You have posted too many times this hour. Please wait a bit before posting again.' }, { status: 429 })
  }

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      room_id:      roomId,
      display_name: displayName?.trim().slice(0, 40) || 'Anonymous',
      content:      content.trim(),
      post_type:    ['general','question','tip','score_share'].includes(postType) ? postType : 'general',
      subject:      subject || null,
      score_data:   scoreData || null,
      device_hash:  deviceHash,
    })
    .select('id, room_id, display_name, content, post_type, score_data, upvotes, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: { ...data, replyCount: 0 } }, { status: 201 })
}
