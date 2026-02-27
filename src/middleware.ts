import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  
  // Redirect apex domain to www
  if (host === 'mymedvisit.app') {
    const url = request.nextUrl.clone()
    url.host = 'www.mymedvisit.app'
    return NextResponse.redirect(url, 301)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
