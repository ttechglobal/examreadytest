import { NextResponse } from 'next/server'

export async function POST() {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = NextResponse.redirect(new URL('/admin', url))
  response.cookies.set('admin_token', '', { httpOnly: true, maxAge: 0, path: '/' })
  return response
}
