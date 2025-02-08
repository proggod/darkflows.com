import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    node_env: process.env.NODE_ENV,
    mongodb_uri: process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':***@'),
    jwt_secret: process.env.JWT_SECRET?.slice(0, 5) + '...',
  });
} 