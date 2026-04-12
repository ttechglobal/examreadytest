import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = () => new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)

// Pages that are publicly accessible under /admin
const PUBLIC_ADMIN_PATHS = ['/admin', '/admin/']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Allow the login page and all API routes through unconditionally
  if (PUBLIC_ADMIN_PATHS.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Protect every other /admin/* route
  if (pathname.startsWith('/admin/')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      const loginUrl = new URL('/admin', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      await jwtVerify(token, secret())
    } catch {
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // Match /admin and all sub-paths, but skip static files and _next
  matcher: ['/admin', '/admin/:path*'],
}