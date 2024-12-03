import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Skip rate limiting in test environment
const isTest = process.env.NODE_ENV === 'test'

const redis = isTest ? null : new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a mock rate limiter for test environment
const createTestRatelimit = () => ({
  limit: async () => ({ success: true, limit: 10, reset: Date.now() + 10000, remaining: 9 })
})

// Different rate limits for different endpoints and methods
const rateLimiters = isTest ? {
  default: createTestRatelimit(),
  auth: createTestRatelimit(),
  medications: {
    read: createTestRatelimit(),
    write: createTestRatelimit(),
  },
  history: {
    read: createTestRatelimit(),
    export: createTestRatelimit(),
  },
  stats: createTestRatelimit(),
} : {
  default: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
  }),
  auth: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
  }),
  medications: {
    read: new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(30, '10 s'),
      analytics: true,
    }),
    write: new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    }),
  },
  history: {
    read: new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(20, '10 s'),
      analytics: true,
    }),
    export: new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(2, '60 s'),
      analytics: true,
    }),
  },
  stats: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(15, '10 s'),
    analytics: true,
  }),
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1'
    const method = request.method
    
    // Select appropriate rate limiter based on endpoint and method
    let ratelimit = rateLimiters.default
    
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      ratelimit = rateLimiters.auth
    } 
    else if (request.nextUrl.pathname.startsWith('/api/medications')) {
      ratelimit = method === 'GET' 
        ? rateLimiters.medications.read 
        : rateLimiters.medications.write
    }
    else if (request.nextUrl.pathname.startsWith('/api/history')) {
      ratelimit = request.nextUrl.pathname.includes('/export')
        ? rateLimiters.history.export
        : rateLimiters.history.read
    }
    else if (request.nextUrl.pathname.startsWith('/api/stats')) {
      ratelimit = rateLimiters.stats
    }

    const key = `${ip}:${request.nextUrl.pathname}:${method}`
    const { success, limit, reset, remaining } = await ratelimit.limit(key)

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.floor((reset - Date.now()) / 1000).toString(),
        },
      })
    }

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}