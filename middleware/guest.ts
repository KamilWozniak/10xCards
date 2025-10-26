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
  if (import.meta.server) {
    return
  }

  try {
    const supabase = useSupabase()

    if (!supabase?.supabase) {
      return
    }

    const {
      data: { user },
    } = await supabase.supabase.auth.getUser()

    if (user) {
      return navigateTo('/generate', { external: true })
    }

    return
  } catch (error) {
    return
  }
})
