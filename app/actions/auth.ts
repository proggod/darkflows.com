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
  const cookieStore = cookies()
  await Promise.resolve(cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }))
}

// Helper function to get session token
const getSessionToken = cache(async () => {
  'use server'
  const cookieStore = cookies()
  const token = await Promise.resolve(cookieStore.get('session'))
  return token?.value
})

export const verifySession = cache(async () => {
  const token = await getSessionToken()

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

    return verified.payload as {
      id: string
      email: string
      role: string
      approved: boolean
    }
  } catch {
    redirect('/login')
  }
})

export async function login(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('Attempting login for:', email);

    await connectDB()
    const user = await User.findOne({ email })
    
    if (!user) {
      console.log('User not found:', email);
      return { error: 'Invalid credentials' }
    }

    if (!user.approved) {
      console.log('User not approved:', email);
      return { error: 'Account not approved' }
    }

    // Check if user has comparePassword method
    if (!user.comparePassword) {
      console.error('comparePassword method not found on user model');
      return { error: 'Authentication failed' }
    }

    const isValid = await user.comparePassword(password)
    console.log('Password validation:', isValid);
    
    if (!isValid) {
      return { error: 'Invalid credentials' }
    }

    // Create session token
    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      approved: user.approved
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    console.log('Token created, setting cookie...');

    // Set cookie and wait for it to complete
    await setSessionCookie(token)

    console.log('Login successful, redirecting...');

    // Return success instead of redirecting
    return { success: true, redirectTo: '/admin' }
  } catch (error) {
    console.error('Login error:', error);
    return { error: error instanceof Error ? error.message : 'Authentication failed' }
  }
} 