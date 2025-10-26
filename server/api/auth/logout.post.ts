import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'
import { deleteCookie } from 'h3'

/**
 * POST /api/auth/logout
 *
 * Sign out user and clear authentication cookies
 *
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 *
 * Errors:
 * - 500: Logout failed
 */
export default defineEventHandler(async event => {
  try {
    const supabase = createSupabaseServerClient(event)

    await supabase.auth.signOut()

    // Manually delete Supabase auth cookie
    // The cookie name follows pattern: sb-{project-ref}-auth-token
    deleteCookie(event, 'sb-127-auth-token', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    })

    return {
      success: true,
      message: 'Logged out successfully',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during logout',
    })
  }
})
