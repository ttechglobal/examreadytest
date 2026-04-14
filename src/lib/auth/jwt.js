import { SignJWT, jwtVerify } from 'jose'

const secret = () => {
  const s = process.env.ADMIN_JWT_SECRET
  if (!s) throw new Error('Missing ADMIN_JWT_SECRET')
  return new TextEncoder().encode(s)
}

// ── Admin JWT ─────────────────────────────────────────────────

export async function signAdminJWT(payload) {
  return new SignJWT({ ...payload, type: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret())
}

export async function verifyAdminJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload
  } catch {
    return null
  }
}

// ── Institution JWT ──────────────────────────────────────────

export async function signInstitutionJWT(payload) {
  return new SignJWT({ ...payload, type: 'institution' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret())
}

export async function verifyInstitutionJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secret())
    if (payload.type !== 'institution') return null
    return payload
  } catch {
    return null
  }
}

// ── Generic verify (for middleware) ─────────────────────────

export async function verifyAnyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload
  } catch {
    return null
  }
}
