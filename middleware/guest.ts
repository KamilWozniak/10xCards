/**
 * Guest middleware
 *
 * Protects authentication pages (login, register) from authenticated users
 * If user is already logged in, redirect them to /generate
 * If user is not logged in, allow access to auth pages
 *
 * According to auth-spec.md section 3.4.2:
 * - Checks if user is authenticated via useSupabase composable
 * - Redirects authenticated users to /generate
 * - Allows unauthenticated users to proceed
 */
export default defineNuxtRouteMiddleware(async () => {
  // Only run on client-side (needs localStorage access)
  if (import.meta.server) {
    return
  }

  try {
    const supabase = useSupabase()

    if (!supabase?.supabase) {
      console.error('[Guest Middleware] Supabase client not available')
      // If Supabase not available, allow access (fail open for guest pages)
      return
    }

    // Get user session from localStorage
    const {
      data: { user },
    } = await supabase.supabase.auth.getUser()

    console.log('[Guest Middleware] Auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
    })

    // If user IS authenticated, redirect to main app
    if (user) {
      console.log('[Guest Middleware] User authenticated, redirecting to /generate')
      return navigateTo('/generate', { external: true })
    }

    // User is NOT authenticated, allow access to auth pages
    console.log('[Guest Middleware] User not authenticated, allowing access to auth page')
    return
  } catch (error) {
    console.error('[Guest Middleware] Error checking authentication:', error)
    // On error, allow access to auth pages (fail open)
    return
  }
})
