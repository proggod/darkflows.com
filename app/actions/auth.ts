'use server'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import { cache } from 'react'

interface Session {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

// Helper function to set session cookie
async function setSessionCookie(token: string) {
  'use server'
  const cookieStore = cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
}

export const getSession = cache(async () => {
  const cookieStore = cookies()
  const token = cookieStore.get('session')
  return token?.value
})

export const verifySession = cache(async () => {
  const token = await getSession()

  if (!token) {
    redirect('/login')
  }

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
      {
        algorithms: ['HS256']
      }
    )

    // Ensure we only return serializable data
    const payload = verified.payload as any
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role) as 'user' | 'admin'
    }
  } catch {
    redirect('/login')
  }
})

export async function login(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    await connectDB()
    const user = await User.findOne({ email })
    
    if (!user || !user.approved) {
      return { error: 'Invalid credentials' }
    }

    const isValid = await user.comparePassword(password)
    if (!isValid) {
      return { error: 'Invalid credentials' }
    }

    // Create session token with only serializable data
    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    await setSessionCookie(token)
    return { success: true, redirectTo: '/admin' }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Authentication failed' }
  }
} 