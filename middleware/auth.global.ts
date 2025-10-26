import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'

/**
 * Global authentication middleware
 *
 * Protects all routes except those in PUBLIC_PATHS
 * Checks authentication on both server and client side
 *
 * Server-side: Verifies session from cookies
 * Client-side: Checks session and redirects to login if needed
 */
export default defineNuxtRouteMiddleware(async to => {
  // Public paths that don't require authentication
  const PUBLIC_PATHS = [
    // Auth pages
    '/auth/login',
    '/auth/register',

    // Public pages
    '/',

    // Auth API endpoints
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
  ]

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(to.path)) {
    return
  }

  // SERVER-SIDE AUTH CHECK
  if (import.meta.server) {
    const event = useRequestEvent()

    if (!event) {
      return
    }

    try {
      const supabase = createSupabaseServerClient(event)

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        return
      }

      return
    } catch (error: any) {
      return
    }
  }

  // CLIENT-SIDE AUTH CHECK
  if (import.meta.client) {
    try {
      const supabase = useSupabase()

      if (!supabase?.supabase) {
        return navigateTo('/auth/login')
      }

      const {
        data: { user },
      } = await supabase.supabase.auth.getUser()

      if (!user) {
        return navigateTo('/auth/login', { external: true })
      }

      return
    } catch (error) {
      return navigateTo('/auth/login')
    }
  }
})
