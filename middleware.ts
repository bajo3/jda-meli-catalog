import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function unauthorized() {
  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin"',
    },
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protegemos todo /admin (panel interno)
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASS

  // Si no están seteadas, no abrimos el panel
  if (!user || !pass) return unauthorized()

  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Basic ')) return unauthorized()

  try {
    const b64 = auth.slice('Basic '.length).trim()
    const decoded = atob(b64)
    const [u, p] = decoded.split(':')
    if (u === user && p === pass) return NextResponse.next()
    return unauthorized()
  } catch {
    return unauthorized()
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
