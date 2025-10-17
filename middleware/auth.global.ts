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
export default defineNuxtRouteMiddleware(async (to) => {
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
  if (process.server) {
    const event = useRequestEvent()

    if (!event) {
      console.error('No request event available in middleware')
      // On server, we can't navigate, so just return and let client handle it
      return
    }

    try {
      const supabase = createSupabaseServerClient(event)

      // Get user session from cookies
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      // If no user or error on server, let it pass and client will handle redirect
      // Server-side we can't use navigateTo(), so we just check and move on
      if (error || !user) {
        console.log('No authenticated user on server, will redirect on client')
        return
      }

      // User is authenticated, allow access
      return
    } catch (error: any) {
      console.error('Server-side auth middleware error:', error)
      // Let client handle the redirect
      return
    }
  }

  // CLIENT-SIDE AUTH CHECK
  if (process.client) {
    try {
      const supabase = useSupabase()

      if (!supabase?.supabase) {
        console.error('[Middleware] Supabase client not available')
        return navigateTo('/auth/login')
      }

      // Get user session from localStorage
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser()

      console.log('[Middleware] Client-side auth check:', {
        path: to.path,
        hasUser: !!user,
        userEmail: user?.email,
      })

      // If no user, redirect to login with external redirect (full page reload)
      if (!user) {
        console.log('[Middleware] No user found, redirecting to login')
        return navigateTo('/auth/login', { external: true })
      }

      // User is authenticated, allow access
      console.log('[Middleware] User authenticated, allowing access')
      return
    } catch (error) {
      console.error('[Middleware] Client-side auth middleware error:', error)
      return navigateTo('/auth/login')
    }
  }
})
