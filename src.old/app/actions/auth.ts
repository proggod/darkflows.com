'use server'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import { cache } from 'react'

export const verifySession = cache(async () => {
  const cookieStore = cookies()
  const token = await cookieStore.get('session')?.value

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

export async function login(formData: FormData) {
  // ... rest of login function
} 