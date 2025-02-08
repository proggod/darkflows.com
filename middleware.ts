import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export const runtime = 'nodejs';

// List of paths that require authentication
const protectedPaths = [
  '/admin',
  '/blog/new',
  '/blog/edit',
  '/api/admin/:path*',
  '/api/upload'
];

export async function middleware(request: NextRequest) {
  // Skip auth check for reset endpoint
  if (request.nextUrl.pathname === '/api/admin/reset') {
    return NextResponse.next();
  }

  console.log('Environment:', process.env.NODE_ENV);
  
  // List of public paths that don't need auth
  const publicPaths = ['/blog', '/api/posts'];
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the current path requires authentication
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If it's not a protected path, allow access
  if (!isProtectedPath) {
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

// Configure which paths should be processed by the middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/blog/new',
    '/blog/edit/:path*',
    '/api/admin/:path*',
    '/api/upload'
  ]
}; 