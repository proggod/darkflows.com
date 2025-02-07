import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nextauth_url: process.env.NEXTAUTH_URL,
    nextauth_secret: process.env.NEXTAUTH_SECRET?.slice(0, 5) + '...',
    node_env: process.env.NODE_ENV,
    mongodb_uri: process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':***@'),
  });
} 