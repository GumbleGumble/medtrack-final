import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  
  // Rate limiting only for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_${ip}`
    )
    
    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': reset.toString(),
        },
      })
    }
  }

  // Security headers
  const headers = new Headers(request.headers)
  headers.set('X-DNS-Prefetch-Control', 'on')
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  headers.set('X-Frame-Options', 'SAMEORIGIN')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'origin-when-cross-origin')
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; font-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  )

  const response = NextResponse.next({
    request: {
      headers,
    },
  })

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}