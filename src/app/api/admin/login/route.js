import { NextResponse } from 'next/server'
import { signAdminJWT } from '@/lib/auth/jwt'

export async function POST(request) {
  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ message: 'Invalid request' }, { status: 400 }) }

  const { email, password } = body

  const configuredEmail    = process.env.ADMIN_EMAIL
  const configuredPassword = process.env.ADMIN_PASSWORD

  // Env vars missing entirely
  if (!configuredEmail || !configuredPassword) {
    return NextResponse.json({
      message: 'Server misconfiguration: ADMIN_EMAIL or ADMIN_PASSWORD env var is missing. Check your .env.local and restart the server.',
    }, { status: 500 })
  }

  const emailMatch    = email?.trim().toLowerCase() === configuredEmail.trim().toLowerCase()
  const passwordMatch = password === configuredPassword

  if (!emailMatch || !passwordMatch) {
    // In dev only, surface which field is wrong
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        message: `Invalid credentials. Email match: ${emailMatch}, Password match: ${passwordMatch}`,
      }, { status: 401 })
    }
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signAdminJWT({ role: 'admin', email: email.trim().toLowerCase() })
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 8,
    path:     '/',
  })
  return response
}
