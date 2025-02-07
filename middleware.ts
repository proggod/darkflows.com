import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export const runtime = 'nodejs';

// List of paths that should be accessible without authentication
const publicPaths = [
  '/login',
  '/setup',
  '/reset567',
  '/api/reset',
  '/api/admin/reset',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/debug'
];

export async function middleware(request: NextRequest) {
  console.log('Environment:', process.env.NODE_ENV);
  
  // Skip auth check in development for testing
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
      {
        algorithms: ['HS256']
      }
    );
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|assets).*)',
    '/api/:path*'
  ],
}; 