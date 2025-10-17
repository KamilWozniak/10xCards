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
export default defineEventHandler(async (event) => {
  try {
    // Create Supabase server client
    const supabase = createSupabaseServerClient(event)

    // Sign out - this will clear the auth cookies
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase logout error:', error)
    }

    // Manually delete Supabase auth cookie
    // The cookie name follows pattern: sb-{project-ref}-auth-token
    deleteCookie(event, 'sb-127-auth-token', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    })

    // Return success
    return {
      success: true,
      message: 'Wylogowano pomyślnie',
    }
  } catch (error: any) {
    // Re-throw H3 errors (already formatted)
    if (error.statusCode) {
      throw error
    }

    // Handle unexpected errors
    console.error('Unexpected logout error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Wystąpił błąd podczas wylogowania',
    })
  }
})
