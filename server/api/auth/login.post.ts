import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'

/**
 * POST /api/auth/login
 *
 * Authenticate user with email and password using Supabase Auth
 * Sets httpOnly cookies for session management
 *
 * Request body:
 * {
 *   email: string
 *   password: string
 * }
 *
 * Response:
 * {
 *   user: {
 *     id: string
 *     email: string
 *     ...
 *   }
 * }
 *
 * Errors:
 * - 400: Missing or invalid credentials
 * - 401: Invalid email or password
 */
export default defineEventHandler(async event => {
  try {
    // Parse request body
    const body = await readBody(event)
    const { email, password } = body

    // Validate request body
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email i hasło są wymagane',
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nieprawidłowy format email',
      })
    }

    // Validate password (minimum 1 character)
    if (password.length < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hasło jest wymagane',
      })
    }

    // Create Supabase server client
    const supabase = createSupabaseServerClient(event)

    // Attempt to sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    // Handle authentication error
    if (error) {
      console.error('Supabase auth error:', error)

      throw createError({
        statusCode: 401,
        statusMessage: error.message || 'Nieprawidłowy email lub hasło',
      })
    }

    // Return user data and session (cookies are set automatically by @supabase/ssr)
    // Also return session so client can set it in browser
    return {
      user: data.user,
      session: data.session,
    }
  } catch (error: any) {
    // Re-throw H3 errors (already formatted)
    if (error.statusCode) {
      throw error
    }

    // Handle unexpected errors
    console.error('Unexpected login error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Wystąpił błąd podczas logowania',
    })
  }
})
