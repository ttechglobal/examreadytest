import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signInstitutionJWT } from '@/lib/auth/jwt'
import { pbkdf2Sync, randomBytes } from 'crypto'

function hashPassword(password) {
  const salt = randomBytes(32).toString('hex')
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { name, type, country, city, contactName, contactEmail, contactPhone, password } = body

  if (!name || !type || !contactName || !contactEmail || !password) {
    return NextResponse.json({ error: 'All required fields must be filled in.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('institutions')
    .select('id')
    .eq('contact_email', contactEmail.toLowerCase().trim())
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 })
  }

  const passwordHash = hashPassword(password)

  const { data: institution, error } = await supabase
    .from('institutions')
    .insert({
      name:          name.trim(),
      type:          type,
      country:       country || 'NG',
      city:          city?.trim() || null,
      contact_name:  contactName.trim(),
      contact_email: contactEmail.toLowerCase().trim(),
      contact_phone: contactPhone?.trim() || null,
      password_hash: passwordHash,
    })
    .select('id, name, type, contact_email')
    .single()

  if (error) {
    return NextResponse.json({ error: `Registration failed: ${error.message}` }, { status: 500 })
  }

  const token = await signInstitutionJWT({
    institutionId: institution.id,
    name:          institution.name,
    type:          institution.type,
  })

  const response = NextResponse.json({ success: true, institution })
  response.cookies.set('institution_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 12,
    path:     '/',
  })
  return response
}