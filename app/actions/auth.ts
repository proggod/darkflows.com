'use server'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import { cache } from 'react'

// Helper function to set session cookie
async function setSessionCookie(token: string) {
  'use server'
  const cookieStore = await cookies()
  await cookieStore.set({
    name: 'session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
}

export const getSession = cache(async () => {
  const cookieStore = await cookies()
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
    const payload = verified.payload as {
      id: string;
      email: string;
      name: string;
      role: string;
    };
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

// Define our state type
interface LoginState {
  error?: string;
  success: boolean;
  redirectTo?: string;
}

export async function login(
  state: LoginState,
  formData?: FormData
): Promise<LoginState> {
  if (!formData) return state;
  
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

export async function logout() {
  'use server'
  const cookieStore = await cookies()
  await cookieStore.delete('session')
  redirect('/login')
} 