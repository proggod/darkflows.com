import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { use } from 'react'

// Helper function to get token
const getSessionToken = cache(async () => {
  'use server'
  const cookieStore = cookies()
  const sessionCookie = await Promise.resolve(cookieStore)
  const token = sessionCookie.get('session')
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

// For client components
export function useSession() {
  return use(verifySession())
} 