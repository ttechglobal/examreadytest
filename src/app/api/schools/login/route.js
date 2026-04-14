import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SignJWT } from 'jose'
import { pbkdf2Sync, timingSafeEqual } from 'crypto'

// ── Helpers ───────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function verifyPassword(password, stored) {
  try {
    const [salt, storedHash] = stored.split(':')
    if (!salt || !storedHash) return false
    const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
  } catch {
    return false
  }
}

async function signToken(payload) {
  const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
  return new SignJWT({ ...payload, type: 'institution' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret)
}

// ── Route ─────────────────────────────────────────────────────

export async function POST(request) {
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { email, password } = body

  if (!email?.trim())  return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  if (!password)       return NextResponse.json({ error: 'Password is required.' }, { status: 400 })

  const supabase   = getSupabase()
  const cleanEmail = email.toLowerCase().trim()

  const { data: institution, error: dbError } = await supabase
    .from('institutions')
    .select('id, name, type, contact_email, password_hash')
    .eq('contact_email', cleanEmail)
    .maybeSingle()

  if (dbError) {
    console.error('Login DB error:', dbError)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  // Same error for both "not found" and "wrong password" — don't leak which
  if (!institution || !verifyPassword(password, institution.password_hash)) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 })
  }

  // Sign JWT and set cookie on response — same pattern as working admin login
  const token    = await signToken({ institutionId: institution.id, name: institution.name, type: institution.type })
  const response = NextResponse.json({ success: true })
  response.cookies.set('institution_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 12,
    path:     '/',
  })
  return response
}
