import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signInstitutionJWT } from '@/lib/auth/jwt'
import { pbkdf2Sync, timingSafeEqual } from 'crypto'

function verifyPassword(password, stored) {
  const [salt, storedHash] = stored.split(':')
  if (!salt || !storedHash) return false
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
  } catch {
    return false
  }
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

  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const { data: institution, error: dbError } = await supabase
    .from('institutions')
    .select('id, name, type, contact_email, password_hash')
    .eq('contact_email', email.toLowerCase().trim())
    .maybeSingle()

  if (dbError) {
    return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
  }

  if (!institution) {
    return NextResponse.json({ error: 'No account found with this email.' }, { status: 401 })
  }

  const valid = verifyPassword(password, institution.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  const token = await signInstitutionJWT({
    institutionId: institution.id,
    name:          institution.name,
    type:          institution.type,
  })

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