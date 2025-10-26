import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'

/**
 * POST /api/auth/register
 *
 * Register new user with email and password using Supabase Auth
 * Automatically logs in the user after successful registration
 * Sets httpOnly cookies for session management
 *
 * Request body:
 * {
 *   email: string
 *   password: string
 *   confirmPassword: string
 * }
 *
 * Response:
 * {
 *   user: {
 *     id: string
 *     email: string
 *     ...
 *   }
 *   session: {
 *     access_token: string
 *     refresh_token: string
 *     ...
 *   }
 * }
 *
 * Errors:
 * - 400: Missing fields, invalid format, or password mismatch
 * - 409: Email already exists
 * - 500: Internal server error
 */
export default defineEventHandler(async event => {
  try {
    // Parse request body
    const body = await readBody(event)
    const { email, password, confirmPassword } = body

    // Validate request body - all fields required
    if (!email || !password || !confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, password and confirm password are required',
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format',
      })
    }

    // Validate password length (minimum 6 characters per auth-spec.md)
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters',
      })
    }

    // Validate password confirmation match
    if (password !== confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Passwords do not match',
      })
    }

    // Create Supabase server client
    const supabase = createSupabaseServerClient(event)

    // Attempt to sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Email confirmation can be configured in Supabase dashboard
        // For MVP, we'll auto-confirm (set in Supabase settings)
        emailRedirectTo: undefined,
      },
    })

    // Handle registration error
    if (error) {
      console.error('Supabase registration error:', error)

      // Check for network/connection errors first
      const errorMessage = error.message?.toLowerCase() || ''
      if (
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('timeout')
      ) {
        throw createError({
          statusCode: 503,
          statusMessage: 'Service temporarily unavailable. Please try again later',
        })
      }

      // SECURITY: User enumeration prevention
      // If user already exists, return success without session to prevent
      // attackers from discovering which emails are registered
      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      ) {
        return {
          user: null,
          session: null,
        }
      }

      if (error.message.includes('weak') || error.message.includes('password')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Password is too weak. Use at least 6 characters',
        })
      }

      // Generic error
      throw createError({
        statusCode: 400,
        statusMessage: error.message || 'Failed to create account',
      })
    }

    // Check if user was created
    if (!data.user) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create account. Please try again',
      })
    }

    // Return user data and session
    // Cookies are set automatically by @supabase/ssr
    // Session is returned so client can set it in browser
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
    console.error('Unexpected registration error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during registration',
    })
  }
})
