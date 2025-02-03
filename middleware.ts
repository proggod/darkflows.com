import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export const runtime = 'nodejs';

export async function middleware(request: Request) {
  const token = await getToken({ req: request })
  const isLoggedIn = !!token
  const protectedPaths = ['/blog/new', '/blog/edit']
  const path = new URL(request.url).pathname

  if (protectedPaths.some(prefix => path.startsWith(prefix)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/blog/:path*']
} 