import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SignJWT } from 'jose'
import { pbkdf2Sync, randomBytes } from 'crypto'

// ── Helpers ───────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function hashPassword(password) {
  const salt = randomBytes(32).toString('hex')
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
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

  const { name, type, country, city, contactName, contactEmail, contactPhone, password } = body

  // Validate required fields
  if (!name?.trim())          return NextResponse.json({ error: 'Institution name is required.' }, { status: 400 })
  if (!type)                  return NextResponse.json({ error: 'Institution type is required.' }, { status: 400 })
  if (!contactName?.trim())   return NextResponse.json({ error: 'Contact name is required.' }, { status: 400 })
  if (!contactEmail?.trim())  return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
  if (!password)              return NextResponse.json({ error: 'Password is required.' }, { status: 400 })
  if (password.length < 8)   return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })

  const supabase    = getSupabase()
  const cleanEmail  = contactEmail.toLowerCase().trim()

  // Check if email already exists
  const { data: existing } = await supabase
    .from('institutions')
    .select('id')
    .eq('contact_email', cleanEmail)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists. Please log in instead.' }, { status: 409 })
  }

  // Create institution
  const { data: institution, error: insertError } = await supabase
    .from('institutions')
    .insert({
      name:          name.trim(),
      type,
      country:       country || 'NG',
      city:          city?.trim() || null,
      contact_name:  contactName.trim(),
      contact_email: cleanEmail,
      contact_phone: contactPhone?.trim() || null,
      password_hash: hashPassword(password),
    })
    .select('id, name, type, contact_email')
    .single()

  if (insertError) {
    console.error('Register error:', insertError)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
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
