import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr'
import { getHeader, setCookie, type H3Event } from 'h3'
import type { Database } from '~/types/database/database.types'

/**
 * Cookie options for Supabase auth cookies
 */
export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax',
}

/**
 * Parse cookie header string into array of name-value pairs
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) {
    return []
  }

  return cookieHeader.split(';').map(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    return { name, value: rest.join('=') }
  })
}

/**
 * Create Supabase server client with SSR support
 * Uses cookies for session management (httpOnly, secure)
 *
 * @param event - H3 event object from Nuxt server context
 * @returns Supabase client instance configured for server-side use
 */
export const createSupabaseServerClient = (event: H3Event) => {
  const config = useRuntimeConfig()

  const supabase = createServerClient<Database>(
    config.public.supabaseUrl as string,
    config.public.supabaseKey as string,
    {
      cookieOptions,
      cookies: {
        getAll() {
          const cookieHeader = getHeader(event, 'cookie')
          return parseCookieHeader(cookieHeader ?? '')
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(event, name, value, options)
          })
        },
      },
    }
  )

  return supabase
}
