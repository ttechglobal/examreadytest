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
function hasProfanity(t) { return PROFANITY.some(w => t.toLowerCase().includes(w)) }

export async function GET(request, { params }) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('community_replies')
    .select('id, post_id, display_name, content, created_at')
    .eq('post_id', params.postId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ replies: data || [] })
}

export async function POST(request, { params }) {
  const deviceHash = getDeviceHash(request)
  const supabase   = createServerClient()

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { displayName, content } = body

  if (!content?.trim() || content.trim().length < 2)
    return NextResponse.json({ error: 'Reply must be at least 2 characters.' }, { status: 400 })
  if (content.trim().length > 200)
    return NextResponse.json({ error: 'Reply cannot exceed 200 characters.' }, { status: 400 })
  if (hasProfanity(content))
    return NextResponse.json({ error: 'Please keep replies respectful.' }, { status: 400 })

  // Rate limit: 10 replies per device per hour
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const { count } = await supabase
    .from('community_replies')
    .select('*', { count: 'exact', head: true })
    .eq('device_hash', deviceHash)
    .gte('created_at', oneHourAgo)

  if ((count || 0) >= 10) {
    return NextResponse.json({ error: 'Too many replies this hour. Please wait before replying again.' }, { status: 429 })
  }

  const { data, error } = await supabase
    .from('community_replies')
    .insert({
      post_id:      params.postId,
      display_name: displayName?.trim().slice(0, 40) || 'Anonymous',
      content:      content.trim(),
      device_hash:  deviceHash,
    })
    .select('id, post_id, display_name, content, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reply: data }, { status: 201 })
}
