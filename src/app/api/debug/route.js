import { NextResponse } from 'next/server'

// TEMPORARY debug route — DELETE before deploying to production
export async function GET() {
  return NextResponse.json({
    ADMIN_EMAIL_set:    !!process.env.ADMIN_EMAIL,
    ADMIN_EMAIL_value:  process.env.ADMIN_EMAIL ?? 'NOT SET',
    ADMIN_PASSWORD_set: !!process.env.ADMIN_PASSWORD,
    ADMIN_PASSWORD_len: process.env.ADMIN_PASSWORD?.length ?? 0,
    ADMIN_JWT_set:      !!process.env.ADMIN_JWT_SECRET,
    NODE_ENV:           process.env.NODE_ENV,
  })
}
